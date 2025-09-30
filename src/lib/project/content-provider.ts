import { workbenchStore } from '@/lib/stores/workbench';
import { getDaytonaClient } from '@/lib/daytona/client';
import { projectAnalyzer, type ProjectFile, type ProjectStructure } from './analyzer';

export interface ProjectContent {
  structure: ProjectStructure;
  context: string;
  summary: string;
  keyFiles: ProjectFile[];
  allFiles: ProjectFile[];
}

export interface ContentProviderConfig {
  includeAllFiles?: boolean;
  maxFileSize?: number;
  excludePatterns?: string[];
  priorityFiles?: string[];
}

class ProjectContentProvider {
  private defaultConfig: ContentProviderConfig = {
    includeAllFiles: false,
    maxFileSize: 50000, // 50KB max per file
    excludePatterns: [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      '.nuxt',
      'coverage',
      '.DS_Store',
      '*.log',
      '*.lock',
      '*.tmp'
    ],
    priorityFiles: [
      'package.json',
      'README.md',
      'tsconfig.json',
      'next.config.js',
      'next.config.ts',
      'vite.config.js',
      'vite.config.ts',
      'angular.json',
      'vue.config.js',
      'nuxt.config.js',
      'nuxt.config.ts',
      'svelte.config.js',
      'webpack.config.js',
      'rollup.config.js'
    ]
  };

  async getProjectContent(
    source: 'workbench' | 'daytona' = 'workbench',
    workspaceId?: string,
    config: Partial<ContentProviderConfig> = {}
  ): Promise<ProjectContent | null> {
    const finalConfig = { ...this.defaultConfig, ...config };

    try {
      let files: ProjectFile[] = [];

      if (source === 'workbench') {
        files = this.getWorkbenchFiles();
      } else if (source === 'daytona' && workspaceId) {
        files = await this.getDaytonaFiles(workspaceId);
      }

      if (files.length === 0) {
        return null;
      }

      // Filter and process files
      const filteredFiles = this.filterFiles(files, finalConfig);
      const structure = projectAnalyzer.analyzeProject(filteredFiles);
      const keyFiles = this.extractKeyFiles(filteredFiles, finalConfig);
      const context = this.generateDetailedContext(structure, keyFiles, filteredFiles);
      const summary = this.generateProjectSummary(structure, filteredFiles);

      return {
        structure,
        context,
        summary,
        keyFiles,
        allFiles: finalConfig.includeAllFiles ? filteredFiles : keyFiles
      };
    } catch (error) {
      console.error('Failed to get project content:', error);
      return null;
    }
  }

  private getWorkbenchFiles(): ProjectFile[] {
    const files = workbenchStore.files.get();
    return Object.entries(files).map(([path, file]) => ({
      path,
      content: file.content,
      type: 'file' as const
    }));
  }

  private async getDaytonaFiles(workspaceId: string): Promise<ProjectFile[]> {
    const daytonaClient = getDaytonaClient();
    if (!daytonaClient) {
      throw new Error('Daytona client not initialized');
    }

    const files: ProjectFile[] = [];
    await this.fetchDaytonaFilesRecursively(daytonaClient, workspaceId, '/', files);
    return files;
  }

  private async fetchDaytonaFilesRecursively(
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
          await this.fetchDaytonaFilesRecursively(client, workspaceId, fullPath, files);
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch files from ${path}:`, error);
    }
  }

  private filterFiles(files: ProjectFile[], config: ContentProviderConfig): ProjectFile[] {
    return files.filter(file => {
      // Check file size
      if (config.maxFileSize && file.content.length > config.maxFileSize) {
        return false;
      }

      // Check exclude patterns
      if (config.excludePatterns) {
        for (const pattern of config.excludePatterns) {
          if (this.matchesPattern(file.path, pattern)) {
            return false;
          }
        }
      }

      return true;
    });
  }

  private matchesPattern(path: string, pattern: string): boolean {
    // Simple pattern matching - could be enhanced with glob patterns
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(path);
    }
    return path.includes(pattern);
  }

  private extractKeyFiles(files: ProjectFile[], config: ContentProviderConfig): ProjectFile[] {
    const keyFiles: ProjectFile[] = [];
    const addedPaths = new Set<string>();

    // Add priority files first
    if (config.priorityFiles) {
      for (const priorityPattern of config.priorityFiles) {
        const matchingFiles = files.filter(file => 
          this.matchesPattern(file.path, priorityPattern) && !addedPaths.has(file.path)
        );
        for (const file of matchingFiles) {
          keyFiles.push(file);
          addedPaths.add(file.path);
        }
      }
    }

    // Add main source files
    const sourceFiles = files.filter(file => {
      if (addedPaths.has(file.path)) return false;
      
      const path = file.path.toLowerCase();
      return (
        path.includes('/src/') ||
        path.includes('/app/') ||
        path.includes('/components/') ||
        path.includes('/pages/') ||
        path.includes('/lib/') ||
        path.includes('/utils/') ||
        path.endsWith('.js') ||
        path.endsWith('.jsx') ||
        path.endsWith('.ts') ||
        path.endsWith('.tsx') ||
        path.endsWith('.vue') ||
        path.endsWith('.svelte') ||
        path.endsWith('.css') ||
        path.endsWith('.scss') ||
        path.endsWith('.html')
      );
    });

    // Limit source files to most important ones
    const sortedSourceFiles = sourceFiles.sort((a, b) => {
      // Prioritize by importance
      const aScore = this.getFileImportanceScore(a.path);
      const bScore = this.getFileImportanceScore(b.path);
      return bScore - aScore;
    }).slice(0, 20); // Limit to top 20 source files

    keyFiles.push(...sortedSourceFiles);

    return keyFiles;
  }

  private getFileImportanceScore(path: string): number {
    let score = 0;
    
    // Main application files
    if (path.includes('App.') || path.includes('main.') || path.includes('index.')) score += 10;
    
    // Component files
    if (path.includes('/components/')) score += 5;
    
    // Page files
    if (path.includes('/pages/') || path.includes('/app/')) score += 7;
    
    // Library/utility files
    if (path.includes('/lib/') || path.includes('/utils/')) score += 4;
    
    // Shorter paths (likely more important)
    score += Math.max(0, 10 - path.split('/').length);
    
    return score;
  }

  private generateDetailedContext(
    structure: ProjectStructure,
    keyFiles: ProjectFile[],
    allFiles: ProjectFile[]
  ): string {
    let context = `DETAILED PROJECT CONTEXT:\n\n`;
    
    // Project overview
    context += `Framework: ${structure.framework}\n`;
    context += `Package Manager: ${structure.packageManager || 'Unknown'}\n`;
    context += `Build Tool: ${structure.buildTool || 'Unknown'}\n`;
    context += `Entry Point: ${structure.entryPoint || 'Unknown'}\n`;
    context += `Source Directory: ${structure.srcDir || 'Root'}\n`;
    context += `Public Directory: ${structure.publicDir || 'None'}\n\n`;

    // Dependencies
    context += `DEPENDENCIES (${Object.keys(structure.dependencies).length}):\n`;
    Object.entries(structure.dependencies).forEach(([dep, version]) => {
      context += `- ${dep}: ${version}\n`;
    });
    
    if (Object.keys(structure.devDependencies).length > 0) {
      context += `\nDEV DEPENDENCIES (${Object.keys(structure.devDependencies).length}):\n`;
      Object.entries(structure.devDependencies).slice(0, 10).forEach(([dep, version]) => {
        context += `- ${dep}: ${version}\n`;
      });
    }

    // Scripts
    context += `\nAVAILABLE SCRIPTS:\n`;
    Object.entries(structure.scripts).forEach(([script, command]) => {
      context += `- ${script}: ${command}\n`;
    });

    // Project structure
    context += `\nPROJECT STRUCTURE (${allFiles.length} total files):\n`;
    const directories = this.buildDirectoryTree(allFiles);
    context += this.formatDirectoryTree(directories);

    // Key file contents
    context += `\nKEY FILE CONTENTS:\n`;
    keyFiles.forEach(file => {
      context += `\n${'='.repeat(50)}\n`;
      context += `FILE: ${file.path}\n`;
      context += `${'='.repeat(50)}\n`;
      context += file.content;
      context += `\n${'='.repeat(50)}\n`;
    });

    return context;
  }

  private buildDirectoryTree(files: ProjectFile[]): any {
    const tree: any = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = file;
    });
    
    return tree;
  }

  private formatDirectoryTree(tree: any, depth = 0, prefix = ''): string {
    let result = '';
    const entries = Object.entries(tree);
    
    entries.forEach(([name, value], index) => {
      const isLast = index === entries.length - 1;
      const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
      
      result += currentPrefix + name + '\n';
      
      if (typeof value === 'object' && !value.hasOwnProperty('content')) {
        const childPrefix = prefix + (isLast ? '    ' : '│   ');
        result += this.formatDirectoryTree(value, depth + 1, childPrefix);
      }
    });
    
    return result;
  }

  private generateProjectSummary(structure: ProjectStructure, files: ProjectFile[]): string {
    const { framework, dependencies } = structure;
    const fileCount = files.length;
    
    const mainFrameworks = Object.keys(dependencies).filter(dep => 
      ['react', 'vue', '@angular/core', 'svelte', 'next', 'nuxt'].includes(dep)
    );
    
    const uiLibraries = Object.keys(dependencies).filter(dep => 
      dep.includes('ui') || dep.includes('tailwind') || dep.includes('material') || dep.includes('antd')
    );
    
    const testingLibs = Object.keys(dependencies).filter(dep => 
      dep.includes('test') || dep.includes('jest') || dep.includes('vitest') || dep.includes('cypress')
    );

    let summary = `This is a ${framework} project with ${fileCount} files. `;
    
    if (mainFrameworks.length > 0) {
      summary += `It uses ${mainFrameworks.join(', ')} as the main framework${mainFrameworks.length > 1 ? 's' : ''}. `;
    }
    
    if (uiLibraries.length > 0) {
      summary += `UI libraries include ${uiLibraries.slice(0, 3).join(', ')}. `;
    }
    
    if (testingLibs.length > 0) {
      summary += `Testing is set up with ${testingLibs.slice(0, 2).join(', ')}. `;
    }

    const hasTypeScript = files.some(f => f.path.endsWith('.ts') || f.path.endsWith('.tsx'));
    if (hasTypeScript) {
      summary += 'The project uses TypeScript. ';
    }

    const hasApi = files.some(f => f.path.includes('/api/') || f.path.includes('server'));
    if (hasApi) {
      summary += 'It includes API/server-side functionality. ';
    }

    return summary;
  }

  // Utility method to get a condensed context for AI prompts
  getCondensedContext(projectContent: ProjectContent): string {
    const { structure, summary, keyFiles } = projectContent;
    
    let context = `PROJECT SUMMARY: ${summary}\n\n`;
    context += `FRAMEWORK: ${structure.framework}\n`;
    context += `KEY DEPENDENCIES: ${Object.keys(structure.dependencies).slice(0, 10).join(', ')}\n\n`;
    
    context += `KEY FILES:\n`;
    keyFiles.slice(0, 5).forEach(file => {
      context += `- ${file.path} (${file.content.length} chars)\n`;
    });
    
    return context;
  }
}

export const projectContentProvider = new ProjectContentProvider();
