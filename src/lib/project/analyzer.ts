export interface ProjectFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

export interface ProjectStructure {
  files: ProjectFile[];
  framework: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | null;
  buildTool: string | null;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  entryPoint: string | null;
  publicDir: string | null;
  srcDir: string | null;
}

export interface FrameworkDetection {
  name: string;
  confidence: number;
  indicators: string[];
}

class ProjectAnalyzer {
  detectFramework(files: ProjectFile[]): FrameworkDetection {
    const packageJsonFile = files.find(f => f.path === 'package.json');
    let dependencies: Record<string, string> = {};
    let devDependencies: Record<string, string> = {};
    
    if (packageJsonFile) {
      try {
        const packageJson = JSON.parse(packageJsonFile.content);
        dependencies = packageJson.dependencies || {};
        devDependencies = packageJson.devDependencies || {};
      } catch (error) {
        console.warn('Could not parse package.json:', error);
      }
    }

    const allDeps = { ...dependencies, ...devDependencies };
    const fileList = files.map(f => f.path);

    // Framework detection rules
    const frameworks = [
      {
        name: 'react',
        confidence: 0,
        indicators: [] as string[]
      },
      {
        name: 'vue',
        confidence: 0,
        indicators: [] as string[]
      },
      {
        name: 'angular',
        confidence: 0,
        indicators: [] as string[]
      },
      {
        name: 'svelte',
        confidence: 0,
        indicators: [] as string[]
      },
      {
        name: 'next',
        confidence: 0,
        indicators: [] as string[]
      },
      {
        name: 'nuxt',
        confidence: 0,
        indicators: [] as string[]
      },
      {
        name: 'vanilla',
        confidence: 0,
        indicators: [] as string[]
      }
    ];

    // React detection
    if ('react' in allDeps) {
      frameworks[0].confidence += 50;
      frameworks[0].indicators.push('React dependency found');
    }
    if ('react-dom' in allDeps) {
      frameworks[0].confidence += 30;
      frameworks[0].indicators.push('React DOM dependency found');
    }
    if (fileList.some(f => f.includes('.jsx') || f.includes('.tsx'))) {
      frameworks[0].confidence += 20;
      frameworks[0].indicators.push('JSX/TSX files found');
    }

    // Next.js detection
    if ('next' in allDeps) {
      frameworks[4].confidence += 70;
      frameworks[4].indicators.push('Next.js dependency found');
    }
    if (fileList.includes('next.config.js') || fileList.includes('next.config.ts')) {
      frameworks[4].confidence += 30;
      frameworks[4].indicators.push('Next.js config found');
    }

    // Vue detection
    if ('vue' in allDeps) {
      frameworks[1].confidence += 50;
      frameworks[1].indicators.push('Vue dependency found');
    }
    if (fileList.some(f => f.includes('.vue'))) {
      frameworks[1].confidence += 40;
      frameworks[1].indicators.push('Vue SFC files found');
    }

    // Nuxt detection
    if ('nuxt' in allDeps || '@nuxt/kit' in allDeps) {
      frameworks[5].confidence += 70;
      frameworks[5].indicators.push('Nuxt dependency found');
    }
    if (fileList.includes('nuxt.config.js') || fileList.includes('nuxt.config.ts')) {
      frameworks[5].confidence += 30;
      frameworks[5].indicators.push('Nuxt config found');
    }

    // Angular detection
    if ('@angular/core' in allDeps) {
      frameworks[2].confidence += 50;
      frameworks[2].indicators.push('Angular core dependency found');
    }
    if (fileList.includes('angular.json')) {
      frameworks[2].confidence += 40;
      frameworks[2].indicators.push('Angular config found');
    }
    if (fileList.some(f => f.includes('.component.ts'))) {
      frameworks[2].confidence += 30;
      frameworks[2].indicators.push('Angular component files found');
    }

    // Svelte detection
    if ('svelte' in allDeps) {
      frameworks[3].confidence += 50;
      frameworks[3].indicators.push('Svelte dependency found');
    }
    if (fileList.some(f => f.includes('.svelte'))) {
      frameworks[3].confidence += 40;
      frameworks[3].indicators.push('Svelte component files found');
    }

    // Vanilla JS/HTML detection
    if (fileList.includes('index.html')) {
      frameworks[6].confidence += 20;
      frameworks[6].indicators.push('HTML entry point found');
    }
    if (!Object.keys(allDeps).some(dep => 
      ['react', 'vue', '@angular/core', 'svelte', 'next', 'nuxt'].includes(dep)
    )) {
      frameworks[6].confidence += 30;
      frameworks[6].indicators.push('No major framework dependencies found');
    }

    // Return the framework with highest confidence
    const bestMatch = frameworks.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );

    return bestMatch.confidence > 0 ? bestMatch : {
      name: 'unknown',
      confidence: 0,
      indicators: ['Could not detect framework']
    };
  }

  detectPackageManager(files: ProjectFile[]): 'npm' | 'yarn' | 'pnpm' | 'bun' | null {
    const fileList = files.map(f => f.path);
    
    if (fileList.includes('bun.lockb') || fileList.includes('bun.lock')) return 'bun';
    if (fileList.includes('pnpm-lock.yaml')) return 'pnpm';
    if (fileList.includes('yarn.lock')) return 'yarn';
    if (fileList.includes('package-lock.json')) return 'npm';
    
    return null;
  }

  detectBuildTool(files: ProjectFile[]): string | null {
    const fileList = files.map(f => f.path);
    const packageJsonFile = files.find(f => f.path === 'package.json');
    
    let devDependencies: Record<string, string> = {};
    if (packageJsonFile) {
      try {
        const packageJson = JSON.parse(packageJsonFile.content);
        devDependencies = packageJson.devDependencies || {};
      } catch (error) {
        console.warn('Could not parse package.json:', error);
      }
    }

    if (fileList.includes('vite.config.js') || fileList.includes('vite.config.ts') || 'vite' in devDependencies) {
      return 'vite';
    }
    if (fileList.includes('webpack.config.js') || 'webpack' in devDependencies) {
      return 'webpack';
    }
    if (fileList.includes('rollup.config.js') || 'rollup' in devDependencies) {
      return 'rollup';
    }
    if ('parcel' in devDependencies) {
      return 'parcel';
    }

    return null;
  }

  analyzeProject(files: ProjectFile[]): ProjectStructure {
    const framework = this.detectFramework(files);
    const packageManager = this.detectPackageManager(files);
    const buildTool = this.detectBuildTool(files);

    const packageJsonFile = files.find(f => f.path === 'package.json');
    let dependencies: Record<string, string> = {};
    let devDependencies: Record<string, string> = {};
    let scripts: Record<string, string> = {};

    if (packageJsonFile) {
      try {
        const packageJson = JSON.parse(packageJsonFile.content);
        dependencies = packageJson.dependencies || {};
        devDependencies = packageJson.devDependencies || {};
        scripts = packageJson.scripts || {};
      } catch (error) {
        console.warn('Could not parse package.json:', error);
      }
    }

    // Determine common directories
    const fileList = files.map(f => f.path);
    const srcDir = fileList.some(f => f.startsWith('src/')) ? 'src' : null;
    const publicDir = fileList.some(f => f.startsWith('public/')) ? 'public' : 
                     fileList.some(f => f.startsWith('static/')) ? 'static' : null;

    // Determine entry point
    let entryPoint = null;
    if (framework.name === 'react' || framework.name === 'next') {
      entryPoint = fileList.find(f => f === 'src/index.js' || f === 'src/index.tsx' || f === 'src/App.js' || f === 'src/App.jsx') || null;
    } else if (framework.name === 'vue') {
      entryPoint = fileList.find(f => f === 'src/main.js' || f === 'src/main.ts') || null;
    } else if (framework.name === 'angular') {
      entryPoint = fileList.find(f => f === 'src/main.ts') || null;
    } else if (framework.name === 'vanilla') {
      entryPoint = fileList.find(f => f === 'index.html' || f === 'src/index.html') || null;
    }

    return {
      files,
      framework: framework.name,
      packageManager,
      buildTool,
      dependencies,
      devDependencies,
      scripts,
      entryPoint,
      publicDir,
      srcDir
    };
  }

  generateProjectContext(structure: ProjectStructure): string {
    const { framework, files, dependencies, scripts, srcDir, publicDir, entryPoint } = structure;
    
    let context = `PROJECT CONTEXT:\n`;
    context += `Framework: ${framework}\n`;
    context += `Entry Point: ${entryPoint || 'Unknown'}\n`;
    context += `Source Directory: ${srcDir || 'Root'}\n`;
    context += `Public Directory: ${publicDir || 'None'}\n\n`;

    context += `DEPENDENCIES:\n`;
    Object.entries(dependencies).forEach(([dep, version]) => {
      context += `- ${dep}: ${version}\n`;
    });

    context += `\nAVAILABLE SCRIPTS:\n`;
    Object.entries(scripts).forEach(([script, command]) => {
      context += `- ${script}: ${command}\n`;
    });

    context += `\nPROJECT STRUCTURE:\n`;
    const sortedFiles = files
      .filter(f => f.type === 'file')
      .sort((a, b) => a.path.localeCompare(b.path));

    sortedFiles.forEach(file => {
      context += `${file.path}\n`;
    });

    context += `\nFILE CONTENTS:\n`;
    // Only include key files to avoid overwhelming the AI
    const keyFiles = sortedFiles.filter(file => {
      const path = file.path;
      return (
        path.includes('package.json') ||
        path.includes('config') ||
        path.includes('index') ||
        path.includes('App.') ||
        path.includes('main.') ||
        path.endsWith('.md') ||
        (path.includes('src/') && (path.endsWith('.js') || path.endsWith('.jsx') || path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.vue') || path.endsWith('.svelte')))
      );
    });

    keyFiles.forEach(file => {
      context += `\n--- ${file.path} ---\n`;
      context += file.content;
      context += `\n--- END ${file.path} ---\n`;
    });

    return context;
  }
}

export const projectAnalyzer = new ProjectAnalyzer();
