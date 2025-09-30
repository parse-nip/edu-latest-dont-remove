export interface DaytonaWorkspace {
  id: string;
  name: string;
  repository?: {
    url: string;
    branch: string;
  };
  status: 'running' | 'stopped' | 'starting' | 'stopping';
  ide: {
    url?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DaytonaProject {
  name: string;
  repository: {
    url: string;
    branch?: string;
  };
  devcontainer?: {
    path?: string;
  };
  env?: Record<string, string>;
}

export interface DaytonaApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

class DaytonaClient {
  private config: DaytonaApiConfig;

  constructor(config: DaytonaApiConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Route all requests through Next.js API to avoid CORS and keep API key server-side
    const apiEndpoint = `/api/daytona${endpoint}`;
    const url = `${window.location.origin}${apiEndpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers,
      // same-origin call; no credentials needed
      signal: AbortSignal.timeout(this.config.timeout!)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Daytona API error (${response.status}): ${errorText}`);
    }

    return response.json() as T;
  }

  async listSandboxes(): Promise<any[]> {
    return this.makeRequest<any[]>('/sandbox');
  }

  async getSandbox(id: string): Promise<any> {
    return this.makeRequest<any>(`/sandbox/${id}`);
  }

  async createSandbox(config: any): Promise<any> {
    return this.makeRequest<any>('/sandbox', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async startSandbox(id: string): Promise<void> {
    await this.makeRequest(`/sandbox/${id}/start`, {
      method: 'POST'
    });
  }

  async stopSandbox(id: string): Promise<void> {
    await this.makeRequest(`/sandbox/${id}/stop`, {
      method: 'POST'
    });
  }

  async deleteSandbox(id: string): Promise<void> {
    await this.makeRequest(`/sandbox/${id}`, {
      method: 'DELETE'
    });
  }

  async getSandboxFiles(id: string, path = '/'): Promise<any[]> {
    return this.makeRequest<any[]>(`/toolbox/${id}/toolbox/files?path=${encodeURIComponent(path)}`);
  }

  async readSandboxFile(id: string, filePath: string): Promise<string> {
    return this.makeRequest<string>(`/toolbox/${id}/toolbox/files/download?path=${encodeURIComponent(filePath)}`);
  }

  async writeSandboxFile(id: string, filePath: string, content: string): Promise<void> {
    console.log('📝 writeSandboxFile called');
    console.log('📝 Sandbox ID:', id);
    console.log('📝 Path:', filePath);
    console.log('📝 Content length:', content.length);
    
    try {
      // Try using the workspace API first, then fallback to toolbox
      try {
        await this.makeRequest(`/workspaces/${id}/files`, {
          method: 'POST',
          body: JSON.stringify({
            path: filePath,
            content
          })
        });
        console.log('✅ File written successfully via workspace API:', filePath);
      } catch (workspaceError) {
        console.log('📝 Workspace API failed, trying toolbox API...');
        await this.makeRequest(`/toolbox/${id}/toolbox/files/upload`, {
          method: 'POST',
          body: JSON.stringify({
            path: filePath,
            content
          })
        });
        console.log('✅ File written successfully via toolbox API:', filePath);
      }
    } catch (error) {
      console.error('❌ Failed to write file:', filePath, error);
      throw error;
    }
  }


  async getSandboxPreviewUrl(id: string, port = 3000): Promise<string | null> {
    console.log('🌐 getSandboxPreviewUrl called');
    console.log('🌐 Sandbox ID:', id);
    console.log('🌐 Port:', port);
    
    try {
      console.log('🌐 Getting sandbox preview URL...');
      const result = await this.makeRequest(`/sandbox/${id}/ports/${port}/preview-url`);
      console.log('🌐 Preview URL result:', result);
      return result.url || result.previewUrl || null;
    } catch (error) {
      console.error('❌ Failed to get preview URL:', error);
      return null;
    }
  }

  async executeCommand(id: string, command: string, workingDir?: string): Promise<{
    commandId: string;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
  }> {
    console.log('⚡ executeCommand called');
    console.log('⚡ Sandbox ID:', id);
    console.log('⚡ Command:', command);
    console.log('⚡ Working Dir:', workingDir);
    
    try {
      const result = await this.makeRequest(`/toolbox/${id}/toolbox/process/execute`, {
        method: 'POST',
        body: JSON.stringify({
          command,
          workingDir: workingDir || '/home/daytona'
        })
      });
      console.log('⚡ Command execution result:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to execute command:', error);
      throw error;
    }
  }

  // Alias methods for backward compatibility
  async listWorkspaces(): Promise<any[]> {
    return this.listSandboxes();
  }

  async createWorkspace(config: any): Promise<any> {
    return this.createSandbox(config);
  }

  async startWorkspace(id: string): Promise<void> {
    return this.startSandbox(id);
  }
}

// Singleton instance
let daytonaClient: DaytonaClient | null = null;

export function initializeDaytona(config: DaytonaApiConfig): DaytonaClient {
  daytonaClient = new DaytonaClient(config);
  return daytonaClient;
}

export function getDaytonaClient(): DaytonaClient | null {
  return daytonaClient;
}

// Mock implementation for development/testing
export class MockDaytonaClient extends DaytonaClient {
  private mockWorkspaces: DaytonaWorkspace[] = [
    {
      id: 'workspace-1',
      name: 'React Todo App',
      repository: {
        url: 'https://github.com/user/react-todo',
        branch: 'main'
      },
      status: 'running',
      ide: {
        url: 'https://workspace-1.daytona.io/ide'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  async listWorkspaces(): Promise<DaytonaWorkspace[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return this.mockWorkspaces;
  }

  async getWorkspace(id: string): Promise<DaytonaWorkspace> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const workspace = this.mockWorkspaces.find(w => w.id === id);
    if (!workspace) {
      throw new Error(`Workspace ${id} not found`);
    }
    return workspace;
  }

  async createWorkspace(project: DaytonaProject): Promise<DaytonaWorkspace> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate creation delay
    
    const newWorkspace: DaytonaWorkspace = {
      id: `workspace-${Date.now()}`,
      name: project.name,
      repository: project.repository,
      status: 'starting',
      ide: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockWorkspaces.push(newWorkspace);
    
    // Simulate workspace starting up
    setTimeout(() => {
      newWorkspace.status = 'running';
      newWorkspace.ide.url = `https://${newWorkspace.id}.daytona.io/ide`;
    }, 3000);

    return newWorkspace;
  }

  async getSandboxPreviewUrl(id: string, port = 3000): Promise<string | null> {
    const workspace = await this.getWorkspace(id);
    if (workspace.status === 'running') {
      return `https://${id}.daytona.io/preview/${port}`;
    }
    return null;
  }

  async executeCommand(id: string, command: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock different command responses
    if (command.includes('npm start') || command.includes('yarn start')) {
      return {
        stdout: 'Development server started on port 3000',
        stderr: '',
        exitCode: 0
      };
    }
    
    if (command.includes('npm install') || command.includes('yarn install')) {
      return {
        stdout: 'Dependencies installed successfully',
        stderr: '',
        exitCode: 0
      };
    }

    return {
      stdout: `Command executed: ${command}`,
      stderr: '',
      exitCode: 0
    };
  }
}
