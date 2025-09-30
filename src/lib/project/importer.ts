import { getDaytonaClient } from '../daytona/client';
import { projectAnalyzer, type ProjectFile, type ProjectStructure } from './analyzer';

export interface GitHubRepo {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

export interface ImportSource {
  type: 'github' | 'daytona' | 'local';
  github?: GitHubRepo;
  daytonaWorkspaceId?: string;
  localFiles?: File[];
}

export interface ImportResult {
  success: boolean;
  files: ProjectFile[];
  structure: ProjectStructure;
  error?: string;
}

class ProjectImporter {
  async importProject(source: ImportSource): Promise<ImportResult> {
    try {
      let files: ProjectFile[] = [];

      switch (source.type) {
        case 'github':
          if (!source.github) {
            throw new Error('GitHub source configuration required');
          }
          files = await this.importFromGitHub(source.github);
          break;

        case 'daytona':
          if (!source.daytonaWorkspaceId) {
            throw new Error('Daytona workspace ID required');
          }
          files = await this.importFromDaytona(source.daytonaWorkspaceId);
          break;

        case 'local':
          if (!source.localFiles) {
            throw new Error('Local files required');
          }
          files = await this.importFromLocal(source.localFiles);
          break;

        default:
          throw new Error('Unknown import source type');
      }

      const structure = projectAnalyzer.analyzeProject(files);

      return {
        success: true,
        files,
        structure
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        structure: {
          files: [],
          framework: 'unknown',
          packageManager: null,
          buildTool: null,
          dependencies: {},
          devDependencies: {},
          scripts: {},
          entryPoint: null,
          publicDir: null,
          srcDir: null
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async importFromGitHub(repo: GitHubRepo): Promise<ProjectFile[]> {
    const { owner, repo: repoName, branch = 'main', path = '' } = repo;
    
    try {
      // Use GitHub API to get repository contents
      const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${branch}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const contents = await response.json();
      const files: ProjectFile[] = [];

      // Recursively fetch all files
      await this.fetchGitHubContents(contents, files, owner, repoName, branch);

      return files;
    } catch (error) {
      console.error('Failed to import from GitHub:', error);
      throw error;
    }
  }

  private async fetchGitHubContents(
    contents: any[],
    files: ProjectFile[],
    owner: string,
    repo: string,
    branch: string,
    basePath = ''
  ): Promise<void> {
    for (const item of contents) {
      const fullPath = basePath ? `${basePath}/${item.name}` : item.name;

      if (item.type === 'file') {
        try {
          // Fetch file content
          const contentResponse = await fetch(item.download_url);
          const content = await contentResponse.text();
          
          files.push({
            path: fullPath,
            content,
            type: 'file'
          });
        } catch (error) {
          console.warn(`Failed to fetch file ${fullPath}:`, error);
        }
      } else if (item.type === 'dir') {
        // Recursively fetch directory contents
        try {
          const dirResponse = await fetch(item.url);
          const dirContents = await dirResponse.json();
          await this.fetchGitHubContents(dirContents, files, owner, repo, branch, fullPath);
        } catch (error) {
          console.warn(`Failed to fetch directory ${fullPath}:`, error);
        }
      }
    }
  }

  private async importFromDaytona(workspaceId: string): Promise<ProjectFile[]> {
    const daytonaClient = getDaytonaClient();
    if (!daytonaClient) {
      throw new Error('Daytona client not initialized');
    }

    try {
      const files: ProjectFile[] = [];
      
      // Get workspace files recursively
      await this.fetchDaytonaFiles(daytonaClient, workspaceId, '/', files);

      return files;
    } catch (error) {
      console.error('Failed to import from Daytona:', error);
      throw error;
    }
  }

  private async fetchDaytonaFiles(
    client: any,
    workspaceId: string,
    path: string,
    files: ProjectFile[]
  ): Promise<void> {
    try {
      const items = await client.getSandboxFiles(workspaceId, path);
      
      for (const item of items) {
        const fullPath = path === '/' ? item.name : `${path}/${item.name}`;
        
        if (item.type === 'file') {
          try {
            const content = await client.readSandboxFile(workspaceId, fullPath);
            files.push({
              path: fullPath.startsWith('/') ? fullPath.slice(1) : fullPath,
              content,
              type: 'file'
            });
          } catch (error) {
            console.warn(`Failed to read file ${fullPath}:`, error);
          }
        } else if (item.type === 'directory') {
          // Recursively fetch directory contents
          await this.fetchDaytonaFiles(client, workspaceId, fullPath, files);
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch files from ${path}:`, error);
    }
  }

  private async importFromLocal(localFiles: File[]): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];

    for (const file of localFiles) {
      try {
        const content = await this.readFileAsText(file);
        files.push({
          path: file.webkitRelativePath || file.name,
          content,
          type: 'file'
        });
      } catch (error) {
        console.warn(`Failed to read file ${file.name}:`, error);
      }
    }

    return files;
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Utility method to parse GitHub URLs
  parseGitHubUrl(url: string): GitHubRepo | null {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname !== 'github.com') {
        return null;
      }

      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length < 2) {
        return null;
      }

      const owner = pathParts[0];
      const repo = pathParts[1];
      
      // Extract branch from tree URLs like /owner/repo/tree/branch-name
      let branch = 'main';
      if (pathParts[2] === 'tree' && pathParts[3]) {
        branch = pathParts[3];
      }

      return { owner, repo, branch };
    } catch (error) {
      return null;
    }
  }
}

export const projectImporter = new ProjectImporter();
