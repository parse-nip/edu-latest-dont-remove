// WebContainer integration for running generated apps
import { WebContainer } from '@webcontainer/api';

export interface GeneratedApp {
  id: string;
  title: string;
  files: Array<{ path: string; content: string }>;
  previewUrl?: string;
}

export class AppRunner {
  private webcontainer: WebContainer | null = null;
  private currentApp: GeneratedApp | null = null;
  private previewUrl: string | null = null;

  async initialize(): Promise<void> {
    try {
      this.webcontainer = await WebContainer.boot();
      console.log('WebContainer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error);
      throw error;
    }
  }

  async runApp(app: GeneratedApp): Promise<string> {
    if (!this.webcontainer) {
      await this.initialize();
    }

    try {
      // Write all files to WebContainer
      for (const file of app.files) {
        await this.webcontainer!.fs.writeFile(file.path, file.content);
      }

      // Install dependencies if package.json exists
      const packageJsonFile = app.files.find(f => f.path === 'package.json');
      if (packageJsonFile) {
        try {
          const installProcess = await this.webcontainer!.spawn('npm', ['install']);
          await installProcess.exit;
        } catch (error) {
          console.warn('Failed to install dependencies:', error);
        }
      }

      // Start the development server
      const devProcess = await this.webcontainer!.spawn('npm', ['start']);
      
      // Wait for server to start and get the URL
      this.webcontainer!.on('server-ready', (port, url) => {
        this.previewUrl = url;
        console.log(`App running at: ${url}`);
      });

      // For React apps, try to start the dev server
      if (packageJsonFile) {
        try {
          const startProcess = await this.webcontainer!.spawn('npm', ['start']);
          // Give it time to start
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.warn('Failed to start dev server:', error);
        }
      }

      this.currentApp = app;
      return this.previewUrl || 'http://localhost:3000';
    } catch (error) {
      console.error('Failed to run app:', error);
      throw error;
    }
  }

  getPreviewUrl(): string | null {
    return this.previewUrl;
  }

  getCurrentApp(): GeneratedApp | null {
    return this.currentApp;
  }

  async stopApp(): Promise<void> {
    // WebContainer doesn't have a direct stop method, but we can clear the files
    if (this.webcontainer) {
      try {
        // Clear the working directory
        const files = await this.webcontainer.fs.readdir('/');
        for (const file of files) {
          if (file.isFile()) {
            await this.webcontainer.fs.rm(`/${file.name}`);
          }
        }
      } catch (error) {
        console.warn('Failed to clear WebContainer files:', error);
      }
    }
    this.currentApp = null;
    this.previewUrl = null;
  }
}

// Singleton instance
let appRunner: AppRunner | null = null;

export function getAppRunner(): AppRunner {
  if (!appRunner) {
    appRunner = new AppRunner();
  }
  return appRunner;
}
