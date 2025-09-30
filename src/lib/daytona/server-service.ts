// Server-side only Daytona service
// This runs only on the server and handles all Daytona API calls

interface DaytonaWorkspace {
  id: string;
  name: string;
  status: string;
  ide: {
    url: string;
  };
}

interface DaytonaApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

class ServerDaytonaService {
  private config: DaytonaApiConfig;

  constructor(config: DaytonaApiConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    console.log('🔧 [Server] Making request to:', url);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Server] Daytona API error:', response.status, errorText);
      throw new Error(`Daytona API error (${response.status}): ${errorText}`);
    }

    // Handle empty responses or non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log('🔧 [Server] Non-JSON response, returning empty object');
      return {} as T;
    }

    const text = await response.text();
    if (!text.trim()) {
      console.log('🔧 [Server] Empty response, returning empty object');
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      console.error('❌ [Server] Failed to parse JSON response:', error);
      console.log('🔧 [Server] Response text:', text);
      return {} as T;
    }
  }

  async listSandboxes(): Promise<any[]> {
    console.log('🔧 [Server] Listing sandboxes...');
    return this.makeRequest<any[]>('/sandbox');
  }

  async createSandbox(name: string): Promise<any> {
    console.log('🔧 [Server] Creating sandbox:', name);
    return this.makeRequest<any>('/sandbox', {
      method: 'POST',
      body: JSON.stringify({ 
        name,
        template: 'node',
        // Use a basic Node.js template for now
        devcontainer: {
          image: 'node:18'
        }
      })
    });
  }

  async getSandbox(id: string): Promise<any> {
    console.log('🔧 [Server] Getting sandbox:', id);
    return this.makeRequest<any>(`/sandbox/${id}`);
  }

  async startSandbox(id: string): Promise<any> {
    console.log('🔧 [Server] Starting sandbox:', id);
    return this.makeRequest(`/sandbox/${id}/start`, {
      method: 'POST'
    });
  }


  async uploadFile(sandboxId: string, filePath: string, content: string): Promise<any> {
    console.log('🔧 [Server] Uploading file:', filePath, 'to sandbox:', sandboxId);
    return this.makeRequest(`/toolbox/${sandboxId}/toolbox/files/upload`, {
      method: 'POST',
      body: JSON.stringify({
        path: filePath,
        content: content
      })
    });
  }

  async executeCommand(sandboxId: string, command: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    console.log('🔧 [Server] Executing command:', command, 'in sandbox:', sandboxId);
    
    try {
      const result = await this.makeRequest(`/toolbox/${sandboxId}/toolbox/process/execute`, {
        method: 'POST',
        body: JSON.stringify({ command })
      });
      
      console.log('🔧 [Server] Command result:', result);
      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0
      };
    } catch (error) {
      console.error('❌ [Server] Command execution failed:', error);
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Command execution failed',
        exitCode: 1
      };
    }
  }

  async getSandboxPreviewUrl(sandboxId: string, port = 3000): Promise<string | null> {
    console.log('🔧 [Server] Getting preview URL for sandbox:', sandboxId, 'port:', port);
    
    try {
      const result = await this.makeRequest(`/sandbox/${sandboxId}/ports/${port}/preview-url`);
      console.log('🔧 [Server] Preview URL result:', result);
      return result.url || result.previewUrl || null;
    } catch (error) {
      console.error('❌ [Server] Failed to get preview URL:', error);
      return null;
    }
  }
}

// Server-side configuration
const SERVER_CONFIG: DaytonaApiConfig = {
  baseUrl: 'https://app.daytona.io/api',
  apiKey: process.env.DAYTONA_API_KEY || 'dtn_8fb213550e216b5d43b649c1ba39d0e8f07d0e1c18040bd294cf987f39ed6fd6',
  timeout: 30000
};

// Server-side singleton
let serverService: ServerDaytonaService | null = null;

export function getServerDaytonaService(): ServerDaytonaService {
  if (!serverService) {
    serverService = new ServerDaytonaService(SERVER_CONFIG);
  }
  return serverService;
}

export { ServerDaytonaService };
