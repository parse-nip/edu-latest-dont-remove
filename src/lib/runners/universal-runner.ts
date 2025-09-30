import { WebContainer } from '@webcontainer/api';
import { projectAnalyzer, type ProjectStructure } from '../project/analyzer';
import { webcontainer } from '../webcontainer';

export interface RunnerConfig {
  environment: 'webcontainer';
  port?: number;
}

export interface RunResult {
  success: boolean;
  previewUrl?: string;
  logs: string[];
  error?: string;
  onInstallProgress?: (message: string, packageName?: string) => void;
}

export type InstallProgressCallback = (message: string, packageName?: string) => void;

export interface InstallResult {
  success: boolean;
  logs: string[];
  error?: string;
}

class UniversalAppRunner {
  private webcontainer: Promise<WebContainer> | null = null;

  constructor(webcontainerPromise?: Promise<WebContainer>) {
    this.webcontainer = webcontainerPromise || null;
    console.log('🚀 UniversalAppRunner initialized with WebContainer:', !!this.webcontainer);
  }

  async installDependencies(
    projectStructure: ProjectStructure,
    config: RunnerConfig
  ): Promise<InstallResult> {
    // Always use WebContainer
    return this.installDependenciesWebContainer(projectStructure);
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


  async runApp(
    projectStructure: ProjectStructure,
    config: RunnerConfig,
    onInstallProgress?: InstallProgressCallback
  ): Promise<RunResult> {
    console.log('🚀 UniversalRunner.runApp called (WebContainer only)');
    console.log('📊 Project:', {
      framework: projectStructure.framework,
      packageManager: projectStructure.packageManager,
      buildTool: projectStructure.buildTool,
      fileCount: projectStructure.files.length
    });
    
    return this.runAppWebContainer(projectStructure, config.port, onInstallProgress);
  }

  private async runAppWebContainer(
    projectStructure: ProjectStructure,
    port = 3000,
    onInstallProgress?: InstallProgressCallback
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
      console.log('✅ WebContainer instance obtained');
      const logs: string[] = [];
      
      // Write all files to WebContainer first
      console.log('📁 Writing', projectStructure.files.length, 'files to WebContainer...');
      console.log('📁 Files to write:', projectStructure.files.map(f => f.path));
      
      let filesWritten = 0;
      for (const file of projectStructure.files) {
        if (file.type === 'file') {
          try {
            // Validate and fix JSON files before writing
            let contentToWrite = file.content;
            if (file.path.endsWith('.json')) {
              console.log(`🔍 Validating JSON file: ${file.path}`);
              try {
                // Try to parse to validate
                JSON.parse(file.content);
                console.log(`✅ Valid JSON: ${file.path}`);
              } catch (jsonError) {
                console.warn(`⚠️ Invalid JSON in ${file.path}, attempting to fix...`);
                console.log(`Original content preview:`, file.content.substring(0, 200));
                
                // Fix common JSON issues
                contentToWrite = file.content
                  // Fix escaped newlines that should be actual newlines in JSON
                  .replace(/\\n/g, '\n')
                  // Fix malformed array/object separators like ],n
                  .replace(/,\s*n\s+"/g, ',\n    "')
                  .replace(/]\s*n\s+"/g, '],\n    "')
                  // Remove trailing commas
                  .replace(/,(\s*[}\]])/g, '$1')
                  // Ensure proper quotes
                  .replace(/(\w+):/g, '"$1":');
                
                try {
                  JSON.parse(contentToWrite);
                  console.log(`✅ Fixed JSON: ${file.path}`);
                } catch (stillInvalid) {
                  console.error(`❌ Could not fix JSON in ${file.path}:`, stillInvalid);
                  // Try to pretty-print and re-parse what we can
                  try {
                    const partial = JSON.parse(file.content.substring(0, file.content.lastIndexOf('}') + 1));
                    contentToWrite = JSON.stringify(partial, null, 2);
                    console.log(`🔧 Used partial JSON for ${file.path}`);
                  } catch (e) {
                    console.error(`❌ Total JSON failure, using original`);
                  }
                }
              }
            }
            
            // Ensure directory exists before writing file
            const dirPath = file.path.split('/').slice(0, -1).join('/');
            if (dirPath) {
              console.log(`📂 Creating directory: ${dirPath}`);
              try {
                await webcontainer.fs.mkdir(dirPath, { recursive: true });
              } catch (mkdirError) {
                // Directory might already exist, that's OK
                console.log(`  (directory may already exist)`);
              }
            }
            
            console.log(`📝 Writing file: ${file.path} (${contentToWrite.length} bytes)`);
            await webcontainer.fs.writeFile(file.path, contentToWrite);
            filesWritten++;
            console.log(`✅ Wrote file: ${file.path}`);
            logs.push(`✅ Wrote ${file.path}`);
          } catch (error) {
            console.error(`❌ Failed to write file ${file.path}:`, error);
            logs.push(`❌ Error writing ${file.path}: ${error}`);
          }
        }
      }
      
      console.log(`📁 Wrote ${filesWritten} out of ${projectStructure.files.length} files`);
      
      // Verify files were written by reading package.json
      try {
        const packageJson = await webcontainer.fs.readFile('package.json', 'utf-8');
        console.log('✅ Verified package.json exists');
        console.log('📦 package.json content:', packageJson.substring(0, 200));
      } catch (error) {
        console.error('❌ Could not read package.json after writing:', error);
      }
      
      // Install dependencies with better error handling
      const installCommand = this.getInstallCommand(projectStructure);
      if (installCommand) {
        console.log('📦 Installing dependencies:', installCommand);
        logs.push(`📦 Installing dependencies...`);
        console.log('⏳ This may take a moment...');
        
        try {
          const installProcess = await webcontainer.spawn('jsh', ['-c', installCommand], {
            env: { 
              npm_config_yes: 'true',
              npm_config_prefer_offline: 'false',
              npm_config_audit: 'false',
              npm_config_fund: 'false'
            }
          });

          let installOutput = '';
          let lastPackage = '';
          installProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                installOutput += data;
                logs.push(data);
                console.log(data);
                
                // Parse package installation progress
                if (onInstallProgress) {
                  // Match patterns like "added 1324 packages" or package names being installed
                  const addedMatch = data.match(/added (\d+) packages?/);
                  const packageMatch = data.match(/(?:npm WARN|npm ERR!)?\s+([a-z0-9@\/-]+)@/);
                  
                  if (addedMatch) {
                    onInstallProgress(`Added ${addedMatch[1]} packages`);
                  } else if (packageMatch && packageMatch[1] !== lastPackage) {
                    lastPackage = packageMatch[1];
                    onInstallProgress(`Installing ${packageMatch[1]}...`, packageMatch[1]);
                  } else if (data.includes('Installing') || data.includes('Downloading')) {
                    onInstallProgress(data.trim().substring(0, 100));
                  }
                }
              }
            })
          );

          const installExitCode = await installProcess.exit;
          console.log('📦 Install exit code:', installExitCode);
          
          if (installExitCode !== 0) {
            console.error('📦 Install failed with output:', installOutput);
            logs.push(`⚠️ Install had warnings (code ${installExitCode})`);
            console.log('⚠️ Continuing anyway - some dependencies may have installed successfully');
            // Don't fail completely - continue and try to start anyway
          } else {
            console.log('✅ Dependencies installed successfully');
            logs.push(`✅ Dependencies installed successfully`);
          }
        } catch (installError) {
          console.error('❌ Install error:', installError);
          logs.push(`Install error: ${installError}`);
          // Continue anyway - some apps might work without install
        }
      }
      
      // Get the start command
      const startCommand = this.getStartCommand(projectStructure);
      
      if (!startCommand) {
        return {
          success: false,
          logs,
          error: 'No start command found for this project'
        };
      }

      console.log('🚀 Starting development server...');
      console.log('   Command:', startCommand);
      logs.push(`🚀 Starting dev server with: ${startCommand}`);
      console.log('⏳ Waiting for server to start...');
      
      // Start the dev server in background (don't await exit)
      const serverProcess = await webcontainer.spawn('jsh', ['-c', startCommand], {
        env: { 
          npm_config_yes: 'true',
          PORT: port.toString(),
          NODE_ENV: 'development'
        }
      });

      // Stream server output but don't wait for it to exit
      serverProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            logs.push(data);
            console.log('[Server]', data);
          }
        })
      ).catch(err => {
        console.warn('Output stream error:', err);
      });

      // Wait for the server to be ready
      console.log('⏳ Waiting for server to start...');
      
      // Get the preview URL from WebContainer (with server-ready event)
      const previewUrl = await this.getWebContainerPreviewUrl(webcontainer, port);
      console.log('✅ Preview URL:', previewUrl);
      
      if (!previewUrl) {
        console.error('❌ No preview URL available - server may not have started');
        return {
          success: false,
          previewUrl: undefined,
          logs,
          error: 'Server started but no preview URL available. Check console for errors.'
        };
      }
      
      return {
        success: true,
        previewUrl,
        logs
      };
    } catch (error) {
      console.error('❌ WebContainer run error:', error);
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
    const { scripts, framework, dependencies, devDependencies } = projectStructure;

    // Check if react-scripts is present (Create React App)
    const hasReactScripts = 'react-scripts' in dependencies || 'react-scripts' in devDependencies;
    
    // WebContainer-compatible commands - simpler is better
    switch (framework) {
      case 'react':
        // For React with react-scripts, use npm start
        if (hasReactScripts || scripts.start) {
          return `npm start`;
        }
        // For React without react-scripts, check for dev script (Vite)
        if (scripts.dev) {
          return `npm run dev`;
        }
        // Fallback to building and serving for React
        if (scripts.build) {
          return `npm run build && npx http-server build -p ${port}`;
        }
        // Last resort - serve source files (won't work for JSX, but better than nothing)
        return `npx http-server public -p ${port} || npx http-server -p ${port}`;
      case 'next':
        // For Next.js
        return `npm run dev`;
      case 'vue':
      case 'nuxt':
      case 'svelte':
        // For Vite-based frameworks
        return `npm run dev`;
      case 'angular':
        // For Angular
        return `npm start`;
      case 'vanilla':
        // For vanilla projects, use a simple http-server
        return `npx http-server -p ${port}`;
      default:
        // Check for common start scripts in order of preference
        if (scripts.dev) {
          return `npm run dev`;
        }
        if (scripts.start) {
          return `npm start`;
        }
        if (scripts.serve) {
          return `npm run serve`;
        }
        // If there's a build script but no start/dev, build and serve
        if (scripts.build) {
          return `npm run build && npx http-server dist -p ${port} || npx http-server build -p ${port}`;
        }
        // Ultimate fallback
        return `npx http-server -p ${port}`;
    }
  }

  private async getWebContainerPreviewUrl(
    webcontainer: WebContainer,
    port: number
  ): Promise<string | undefined> {
    return new Promise((resolve) => {
      let resolved = false;
      
      // Listen for server-ready event to get the actual preview URL
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('⏰ Timeout waiting for WebContainer server-ready event');
          console.warn('  Trying to get preview URL directly from WebContainer');
          
          // Try to construct the preview URL manually
          // WebContainer exposes servers on specific origins
          try {
            const previewOrigin = (webcontainer as any).previewOrigin;
            if (previewOrigin) {
              const url = `${previewOrigin}:${port}`;
              console.log('✅ Constructed preview URL:', url);
              resolve(url);
            } else {
              console.error('❌ Could not construct preview URL');
              resolve(undefined);
            }
          } catch (err) {
            console.error('❌ Error constructing preview URL:', err);
            resolve(undefined);
          }
        }
      }, 30000); // 30 second timeout
      
      webcontainer.on('server-ready', (serverPort, url) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.log('🌐 WebContainer server ready!');
          console.log('  Port:', serverPort);
          console.log('  URL:', url);
          resolve(url);
        }
      });
      
      console.log('👂 Listening for server-ready event on port', port);
    });
  }

  async updateFile(
    filePath: string,
    content: string,
    config: RunnerConfig
  ): Promise<boolean> {
    // Always use WebContainer
    return this.updateFileWebContainer(filePath, content);
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


  async getProjectFiles(config: RunnerConfig): Promise<any[]> {
    // Always use WebContainer
    return this.getProjectFilesWebContainer();
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

}

// Initialize the runner with the webcontainer promise
export const universalRunner = new UniversalAppRunner(webcontainer);
