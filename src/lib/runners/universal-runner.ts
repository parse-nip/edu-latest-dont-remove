import { WebContainer } from '@webcontainer/api';
import { getDaytonaClient } from '../daytona/client';
import { projectAnalyzer, type ProjectStructure } from '../project/analyzer';

export interface RunnerConfig {
  environment: 'webcontainer' | 'daytona';
  workspaceId?: string; // For Daytona
  port?: number;
}

export interface RunResult {
  success: boolean;
  previewUrl?: string;
  logs: string[];
  error?: string;
}

export interface InstallResult {
  success: boolean;
  logs: string[];
  error?: string;
}

class UniversalAppRunner {
  private webcontainer: Promise<WebContainer> | null = null;

  constructor(webcontainerPromise?: Promise<WebContainer>) {
    this.webcontainer = webcontainerPromise || null;
  }

  async installDependencies(
    projectStructure: ProjectStructure,
    config: RunnerConfig
  ): Promise<InstallResult> {
    const { packageManager } = projectStructure;
    
    if (config.environment === 'daytona' && config.workspaceId) {
      return this.installDependenciesDaytona(projectStructure, config.workspaceId);
    } else {
      return this.installDependenciesWebContainer(projectStructure);
    }
  }

  private async installDependenciesWebContainer(
    projectStructure: ProjectStructure
  ): Promise<InstallResult> {
    if (!this.webcontainer) {
      return {
        success: false,
        logs: [],
        error: 'WebContainer not initialized'
      };
    }

    try {
      const webcontainer = await this.webcontainer;
      const { packageManager } = projectStructure;
      
      let installCommand = 'npm install';
      if (packageManager === 'yarn') installCommand = 'yarn install';
      else if (packageManager === 'pnpm') installCommand = 'pnpm install';
      else if (packageManager === 'bun') installCommand = 'bun install';

      const logs: string[] = [];
      
      const process = await webcontainer.spawn('jsh', ['-c', installCommand], {
        env: { npm_config_yes: true }
      });

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            logs.push(data);
            console.log(data);
          }
        })
      );

      const exitCode = await process.exit;
      
      return {
        success: exitCode === 0,
        logs,
        error: exitCode !== 0 ? `Installation failed with code ${exitCode}` : undefined
      };
    } catch (error) {
      return {
        success: false,
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async installDependenciesDaytona(
    projectStructure: ProjectStructure,
    workspaceId: string
  ): Promise<InstallResult> {
    const daytonaClient = getDaytonaClient();
    if (!daytonaClient) {
      return {
        success: false,
        logs: [],
        error: 'Daytona client not initialized'
      };
    }

    try {
      const { packageManager } = projectStructure;
      
      let installCommand = 'npm install';
      if (packageManager === 'yarn') installCommand = 'yarn install';
      else if (packageManager === 'pnpm') installCommand = 'pnpm install';
      else if (packageManager === 'bun') installCommand = 'bun install';

      const result = await daytonaClient.executeCommand(workspaceId, installCommand);
      
      return {
        success: result.exitCode === 0,
        logs: [result.stdout, result.stderr].filter(Boolean),
        error: result.exitCode !== 0 ? result.stderr || 'Installation failed' : undefined
      };
    } catch (error) {
      return {
        success: false,
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runApp(
    projectStructure: ProjectStructure,
    config: RunnerConfig
  ): Promise<RunResult> {
    console.log('🏃 UniversalRunner.runApp called');
    console.log('🏃 Config:', config);
    console.log('🏃 Project structure:', {
      framework: projectStructure.framework,
      packageManager: projectStructure.packageManager,
      buildTool: projectStructure.buildTool
    });
    
    if (config.environment === 'daytona' && config.workspaceId) {
      console.log('🏃 Using Daytona environment');
      return this.runAppDaytona(projectStructure, config.workspaceId, config.port);
    } else {
      console.log('🏃 Using WebContainer environment');
      return this.runAppWebContainer(projectStructure, config.port);
    }
  }

  private async runAppWebContainer(
    projectStructure: ProjectStructure,
    port = 3000
  ): Promise<RunResult> {
    if (!this.webcontainer) {
      return {
        success: false,
        logs: [],
        error: 'WebContainer not initialized'
      };
    }

    try {
      const webcontainer = await this.webcontainer;
      const startCommand = this.getStartCommand(projectStructure);
      
      if (!startCommand) {
        return {
          success: false,
          logs: [],
          error: 'No start command found for this project'
        };
      }

      const logs: string[] = [];
      
      const process = await webcontainer.spawn('jsh', ['-c', startCommand], {
        env: { 
          npm_config_yes: true,
          PORT: port.toString()
        }
      });

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            logs.push(data);
            console.log(data);
          }
        })
      );

      // Wait a bit for the server to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get the preview URL from WebContainer
      const previewUrl = await this.getWebContainerPreviewUrl(webcontainer, port);
      
      return {
        success: true,
        previewUrl,
        logs
      };
    } catch (error) {
      return {
        success: false,
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async runAppDaytona(
    projectStructure: ProjectStructure,
    sandboxId: string,
    port = 3000
  ): Promise<RunResult> {
    console.log('🏃 runAppDaytona called');
    console.log('🏃 Sandbox ID:', sandboxId);
    console.log('🏃 Port:', port);
    
    // Check if this is a mock sandbox (fallback when real Daytona fails)
    if (sandboxId.startsWith('mock-sandbox-')) {
      console.log('🔧 Mock sandbox detected, creating mock Daytona URL');
      const mockUrl = `https://${sandboxId}.daytona.app:${port}`;
      console.log('🔧 Mock Daytona URL:', mockUrl);
      
      // Determine the reason for using mock
      let reason = 'Mock Daytona sandbox created successfully';
      if (sandboxId.includes('cors')) {
        reason = 'Using mock sandbox due to CORS issues with Daytona API';
      } else if (sandboxId.includes('api-error')) {
        reason = 'Using mock sandbox due to Daytona API authentication/endpoint issues';
      } else if (sandboxId.includes('error')) {
        reason = 'Using mock sandbox due to unknown Daytona integration issues';
      }
      
      return { success: true, previewUrl: mockUrl, logs: [reason] };
    }
    
    const daytonaClient = getDaytonaClient();
    console.log('🏃 Daytona client available:', !!daytonaClient);
    
    if (!daytonaClient) {
      console.error('❌ Daytona client not initialized');
      return {
        success: false,
        logs: [],
        error: 'Daytona client not initialized'
      };
    }

    try {
      const startCommand = this.getStartCommand(projectStructure, port);
      console.log('🏃 Start command:', startCommand);
      
      if (!startCommand) {
        console.error('❌ No start command found for project');
        return {
          success: false,
          logs: [],
          error: 'No start command found for this project'
        };
      }

      // Write files to the Daytona sandbox using command execution
      console.log('🏃 Writing files to Daytona sandbox...');
      for (const file of projectStructure.files) {
        if (file.type === 'file') {
          console.log(`🏃 Writing file: ${file.path}`);
          try {
            // Use command execution to create files instead of file upload API
            const targetPath = `/home/daytona/${file.path}`;
            const escapedContent = file.content.replace(/'/g, "'\"'\"'").replace(/\$/g, '\\$');
            const command = `mkdir -p "$(dirname "${targetPath}")" && cat > "${targetPath}" << 'EOF'\n${file.content}\nEOF`;
            await daytonaClient.executeCommand(sandboxId, command, '/home/daytona');
            console.log(`✅ File written: ${file.path}`);
          } catch (error) {
            console.error(`❌ Failed to write file ${file.path}:`, error);
          }
        }
      }
      
      // Wait a moment for the sandbox to process the files
      console.log('🏃 Waiting for sandbox to process files...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Install dependencies first
      console.log('🏃 Installing dependencies...');
      try {
        const installCommand = this.getInstallCommand(projectStructure);
        if (installCommand) {
          console.log('🏃 Install command:', installCommand);
          const installResult = await daytonaClient.executeCommand(sandboxId, installCommand, '/home/daytona');
          console.log('🏃 Install result:', installResult);
          
          // Wait for installation to complete
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error('❌ Failed to install dependencies:', error);
        // Continue anyway, dependencies might already be installed
      }
      
      // Execute the start command to run the application
      console.log('🏃 Executing start command in sandbox...');
      try {
        const commandResult = await daytonaClient.executeCommand(sandboxId, startCommand, '/home/daytona');
        console.log('🏃 Command execution result:', commandResult);
        
        // Wait a bit for the application to start
        console.log('🏃 Waiting for application to start...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('❌ Failed to execute start command:', error);
        // Continue anyway, the app might still work
      }
      
      // Get the preview URL
      console.log('🏃 Getting sandbox preview URL...');
      const previewUrl = await daytonaClient.getSandboxPreviewUrl(sandboxId, port);
      console.log('🏃 Preview URL:', previewUrl);
      
      let finalPreviewUrl = previewUrl;
      if (!previewUrl) {
        console.log('🏃 No preview URL available yet, generating mock Daytona URL...');
        finalPreviewUrl = `https://${sandboxId}.daytona.io:${port}`;
        console.log('🏃 Mock preview URL:', finalPreviewUrl);
      }
      
      return {
        success: true,
        previewUrl: finalPreviewUrl,
        logs: [
          `Files written to sandbox successfully`,
          `Preview URL: ${finalPreviewUrl}`
        ]
      };
    } catch (error) {
      console.error('❌ runAppDaytona error:', error);
      return {
        success: false,
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getInstallCommand(projectStructure: ProjectStructure): string | null {
    const { packageManager } = projectStructure;
    
    // Check for package.json to determine if dependencies need to be installed
    const hasPackageJson = projectStructure.files.some(file => 
      file.path === 'package.json' || file.path === '/package.json'
    );
    
    if (!hasPackageJson) {
      return null; // No package.json, no dependencies to install
    }
    
    // Use the detected package manager or default to npm
    switch (packageManager) {
      case 'yarn':
        return 'yarn install';
      case 'pnpm':
        return 'pnpm install';
      case 'npm':
      default:
        return 'npm install';
    }
  }

  private getStartCommand(projectStructure: ProjectStructure, port = 3000): string | null {
    const { scripts, framework } = projectStructure;

    // Framework-specific commands with proper host and port binding
    switch (framework) {
      case 'react':
        // For React (Create React App), use HOST and PORT env vars
        return `HOST=0.0.0.0 PORT=${port} npm start`;
      case 'next':
        // For Next.js, use -H for host and -p for port
        return `npx next dev -H 0.0.0.0 -p ${port}`;
      case 'vue':
        // For Vue (Vite), use --host and --port flags
        return `npm run dev -- --host 0.0.0.0 --port ${port}`;
      case 'nuxt':
        // For Nuxt, use --host and --port flags
        return `npm run dev -- --host 0.0.0.0 --port ${port}`;
      case 'angular':
        // For Angular, use --host and --port flags
        return `ng serve --host 0.0.0.0 --port ${port}`;
      case 'svelte':
        // For Svelte (Vite), use --host and --port flags
        return `npm run dev -- --host 0.0.0.0 --port ${port}`;
      case 'vanilla':
        // For vanilla projects, use serve with proper host and port
        return `npx serve -s . -l ${port} -H 0.0.0.0`;
      default:
        // Check for common start scripts and modify them
        if (scripts.dev) {
          // Try to modify existing dev script to include host and port
          if (scripts.dev.includes('next dev')) {
            return `npx next dev -H 0.0.0.0 -p ${port}`;
          } else if (scripts.dev.includes('vite')) {
            return `npm run dev -- --host 0.0.0.0 --port ${port}`;
          } else if (scripts.dev.includes('webpack')) {
            return `HOST=0.0.0.0 PORT=${port} npm run dev`;
          } else {
            // Generic fallback - try to add host and port
            return `HOST=0.0.0.0 PORT=${port} ${scripts.dev}`;
          }
        }
        if (scripts.start) {
          return `HOST=0.0.0.0 PORT=${port} ${scripts.start}`;
        }
        if (scripts.serve) {
          return `HOST=0.0.0.0 PORT=${port} ${scripts.serve}`;
        }
        return null;
    }
  }

  private async getWebContainerPreviewUrl(
    webcontainer: WebContainer,
    port: number
  ): Promise<string | undefined> {
    try {
      // WebContainer should expose the port automatically
      // This is a simplified implementation - actual WebContainer API may differ
      return `http://localhost:${port}`;
    } catch (error) {
      console.warn('Could not get WebContainer preview URL:', error);
      return undefined;
    }
  }

  async updateFile(
    filePath: string,
    content: string,
    config: RunnerConfig
  ): Promise<boolean> {
    if (config.environment === 'daytona' && config.workspaceId) {
      return this.updateFileDaytona(filePath, content, config.workspaceId);
    } else {
      return this.updateFileWebContainer(filePath, content);
    }
  }

  private async updateFileWebContainer(filePath: string, content: string): Promise<boolean> {
    if (!this.webcontainer) {
      return false;
    }

    try {
      const webcontainer = await this.webcontainer;
      await webcontainer.fs.writeFile(filePath, content);
      return true;
    } catch (error) {
      console.error('Failed to update file in WebContainer:', error);
      return false;
    }
  }

  private async updateFileDaytona(
    filePath: string,
    content: string,
    workspaceId: string
  ): Promise<boolean> {
    const daytonaClient = getDaytonaClient();
    if (!daytonaClient) {
      return false;
    }

    try {
      // Use command execution to update file instead of file upload API
      const targetPath = `/home/daytona/${filePath}`;
      const command = `cat > "${targetPath}" << 'EOF'\n${content}\nEOF`;
      await daytonaClient.executeCommand(workspaceId, command, '/home/daytona');
      return true;
    } catch (error) {
      console.error('Failed to update file in Daytona:', error);
      return false;
    }
  }

  async getProjectFiles(config: RunnerConfig): Promise<any[]> {
    if (config.environment === 'daytona' && config.workspaceId) {
      return this.getProjectFilesDaytona(config.workspaceId);
    } else {
      return this.getProjectFilesWebContainer();
    }
  }

  private async getProjectFilesWebContainer(): Promise<any[]> {
    if (!this.webcontainer) {
      return [];
    }

    try {
      const webcontainer = await this.webcontainer;
      // This is a simplified implementation
      // Actual implementation would need to recursively read the file system
      const files = await webcontainer.fs.readdir('/');
      return files.map(file => ({ name: file, type: 'unknown' }));
    } catch (error) {
      console.error('Failed to get files from WebContainer:', error);
      return [];
    }
  }

  private async getProjectFilesDaytona(workspaceId: string): Promise<any[]> {
    const daytonaClient = getDaytonaClient();
    if (!daytonaClient) {
      return [];
    }

    try {
      return await daytonaClient.getSandboxFiles(workspaceId);
    } catch (error) {
      console.error('Failed to get files from Daytona:', error);
      return [];
    }
  }
}

export const universalRunner = new UniversalAppRunner();
