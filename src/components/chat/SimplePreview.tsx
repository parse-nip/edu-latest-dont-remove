'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Square, RotateCcw, ExternalLink, AlertCircle } from 'lucide-react';

interface SimplePreviewProps {
  files?: Record<string, { type: 'file'; content: string }>;
  isStreaming?: boolean;
  previewUrl?: string | null;
}

interface FileInfo {
  path: string;
  content: string;
  extension: string;
}

export const SimplePreview = memo(({ files = {}, isStreaming, previewUrl: externalPreviewUrl }: SimplePreviewProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Helper function to get file extension
  const getFileExtension = (filePath: string): string => {
    return filePath.split('.').pop()?.toLowerCase() || '';
  };

  // Helper function to find main component files
  const findMainComponent = (files: Record<string, { type: 'file'; content: string }>): FileInfo | null => {
    const fileList: FileInfo[] = Object.entries(files)
      .filter(([_, file]) => file.type === 'file')
      .map(([path, file]) => ({
        path,
        content: file.content,
        extension: getFileExtension(path)
      }));

    // Priority order for finding main component
    const priorityPaths = [
      'src/App.jsx',
      'src/App.js',
      'src/App.tsx',
      'src/App.ts',
      'App.jsx',
      'App.jsx',
      'App.js',
      'App.tsx',
      'App.ts'
    ];

    // First, try to find by priority paths
    for (const priorityPath of priorityPaths) {
      const file = fileList.find(f => f.path === priorityPath);
      if (file && file.content.trim()) {
        return file;
      }
    }

    // Then try to find any JSX/TSX file that exports a component
    const componentFiles = fileList.filter(f => 
      ['jsx', 'tsx', 'js', 'ts'].includes(f.extension) && 
      f.content.trim() &&
      (f.content.includes('export default') || f.content.includes('function ') || f.content.includes('const ') || f.content.includes('class '))
    );

    if (componentFiles.length > 0) {
      return componentFiles[0];
    }

    // Finally, try any JSX/TSX file
    const jsxFiles = fileList.filter(f => ['jsx', 'tsx'].includes(f.extension) && f.content.trim());
    if (jsxFiles.length > 0) {
      return jsxFiles[0];
    }

    return null;
  };

  // Helper function to extract CSS from files
  const extractCSS = (files: Record<string, { type: 'file'; content: string }>): string => {
    const cssFiles = Object.entries(files)
      .filter(([_, file]) => file.type === 'file')
      .filter(([path, _]) => getFileExtension(path) === 'css')
      .map(([_, file]) => file.content)
      .join('\n\n');

    return cssFiles;
  };

  // Helper function to clean and prepare React component
  const prepareComponent = (content: string, filePath: string): string => {
    let cleaned = content;

    // Remove import statements that won't work in the browser
    cleaned = cleaned.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '');
    cleaned = cleaned.replace(/import\s+{[^}]*}\s+from\s+['"][^'"]*['"];?\s*/g, '');
    cleaned = cleaned.replace(/import\s+['"][^'"]*['"];?\s*/g, '');

    // Handle different export patterns
    if (cleaned.includes('export default')) {
      // Remove export default and just keep the component
      cleaned = cleaned.replace(/export\s+default\s+/, '');
    } else if (cleaned.includes('export {')) {
      // Handle named exports - try to extract the main component
      const exportMatch = cleaned.match(/export\s+{\s*([^}]+)\s*}/);
      if (exportMatch) {
        const exports = exportMatch[1].split(',').map(e => e.trim());
        const mainExport = exports.find(e => e.toLowerCase().includes('app') || e.toLowerCase().includes('main'));
        if (mainExport) {
          // Try to find the component definition
          const componentName = mainExport.split(' ').pop() || 'App';
          const componentMatch = cleaned.match(new RegExp(`(?:function|const|class)\\s+${componentName}\\s*[({][\\s\\S]*?(?=export|$)`));
          if (componentMatch) {
            cleaned = componentMatch[0];
          }
        }
      }
    }

    // Ensure the component is properly defined
    if (!cleaned.includes('function ') && !cleaned.includes('const ') && !cleaned.includes('class ')) {
      // Wrap in a function if it's just JSX
      if (cleaned.includes('<') && cleaned.includes('>')) {
        cleaned = `function App() {\n  return (\n    ${cleaned}\n  );\n}`;
      }
    }

    // Add React import if not present
    if (!cleaned.includes('React') && (cleaned.includes('jsx') || cleaned.includes('JSX'))) {
      cleaned = `const React = window.React;\n${cleaned}`;
    }

    return cleaned;
  };

  // Generate a comprehensive HTML preview from the files
  const generatePreview = useCallback(() => {
    try {
      setDebugInfo('Starting preview generation...');
      
      if (Object.keys(files).length === 0) {
        setError('No files available for preview');
        return;
      }

      const mainComponent = findMainComponent(files);
      
      if (!mainComponent) {
        setError('No valid React component found. Please ensure you have a .jsx, .tsx, .js, or .ts file with JSX content.');
        setDebugInfo(`Available files: ${Object.keys(files).join(', ')}`);
        return;
      }

      setDebugInfo(`Found main component: ${mainComponent.path}`);

      const cssContent = extractCSS(files);
      const preparedComponent = prepareComponent(mainComponent.content, mainComponent.path);

      setDebugInfo(`Prepared component (${preparedComponent.length} chars), CSS (${cssContent.length} chars)`);

      // Create a comprehensive HTML file with the React component
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App Preview</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: #f5f5f5;
            line-height: 1.6;
        }
        #root {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
            min-height: 400px;
        }
        .error-boundary {
            padding: 20px;
            text-align: center;
            color: #e74c3c;
            background: #fdf2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            margin: 20px;
        }
        ${cssContent}
    </style>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root">
        <div class="error-boundary">
            <h3>Loading your app...</h3>
            <p>Please wait while we prepare the preview.</p>
        </div>
    </div>
    <script type="text/babel">
        const { useState, useEffect, useCallback, useMemo, useRef } = React;
        
        // Error boundary component
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            
            static getDerivedStateFromError(error) {
                return { hasError: true, error };
            }
            
            componentDidCatch(error, errorInfo) {
                console.error('React Error:', error, errorInfo);
            }
            
            render() {
                if (this.state.hasError) {
                    return React.createElement('div', { className: 'error-boundary' },
                        React.createElement('h3', null, 'Something went wrong'),
                        React.createElement('p', null, this.state.error?.message || 'An error occurred'),
                        React.createElement('button', { 
                            onClick: () => this.setState({ hasError: false, error: null }) 
                        }, 'Try Again')
                    );
                }
                
                return this.props.children;
            }
        }
        
        // Main component
        ${preparedComponent}
        
        // Render the app
        try {
        const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(
                React.createElement(ErrorBoundary, null,
                    React.createElement(App)
                )
            );
        } catch (error) {
            console.error('Render error:', error);
            document.getElementById('root').innerHTML = \`
                <div class="error-boundary">
                    <h3>Render Error</h3>
                    <p>\${error.message}</p>
                    <p>Check the console for more details.</p>
                </div>
            \`;
        }
    </script>
</body>
</html>`;

      // Create a blob URL for the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setError(null);
      setDebugInfo('Preview generated successfully');
    } catch (err) {
      console.error('Preview generation error:', err);
      setError(`Preview generation failed: ${err instanceof Error ? err.message : String(err)}`);
      setDebugInfo(`Error: ${err}`);
    }
  }, [files]);

  const handleRun = () => {
    setIsRunning(true);
    setError(null);
    setDebugInfo('');
    generatePreview();
    setTimeout(() => setIsRunning(false), 1000);
  };

  const handleStop = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setIsRunning(false);
    setError(null);
    setDebugInfo('');
  };

  const handleReset = () => {
    handleStop();
    setTimeout(() => {
      handleRun();
    }, 100);
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  // Use WebContainer preview URL directly
  useEffect(() => {
    console.log('🔍 SimplePreview useEffect triggered');
    console.log('  - externalPreviewUrl:', externalPreviewUrl);
    console.log('  - files count:', Object.keys(files).length);
    console.log('  - files:', Object.keys(files));
    console.log('  - isStreaming:', isStreaming);
    
    // ONLY use the preview URL if it's provided and not our own app's URL
    if (externalPreviewUrl && !externalPreviewUrl.includes('localhost:3000/')) {
      console.log('✅ Using WebContainer preview URL:', externalPreviewUrl);
      setPreviewUrl(externalPreviewUrl);
      setIsRunning(true);
      setError(null);
      setDebugInfo(`Using WebContainer preview: ${externalPreviewUrl}`);
    } else if (Object.keys(files).length === 0) {
      console.log('⚠️ No files available for preview');
      setDebugInfo('No files available');
      setPreviewUrl(null);
      setIsRunning(false);
    } else if (isStreaming) {
      console.log('🔍 Streaming in progress, waiting...');
      setDebugInfo('Waiting for generation to complete...');
      setPreviewUrl(null);
      setIsRunning(false);
    } else {
      console.log('⚠️ No preview URL available yet, app may still be starting...');
      console.log('⚠️ externalPreviewUrl was:', externalPreviewUrl);
      setDebugInfo('Waiting for preview to start...');
      setPreviewUrl(null);
      setIsRunning(false);
    }
  }, [externalPreviewUrl, files, isStreaming]);

  return (
    <div className="h-full w-full flex flex-col bg-card border border-border shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Preview</span>
          {isRunning && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              Running...
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              Error
            </div>
          )}
        </div>
        {previewUrl && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="h-7 px-2"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
          </div>
        )}
      </div>

      {/* Debug Info (only show if there's debug info) */}
      {debugInfo && (
        <div className="px-3 py-1 bg-muted/30 border-b border-border">
          <div className="text-xs text-muted-foreground font-mono">
            {debugInfo}
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="h-full flex items-center justify-center p-4 text-center">
            <div className="max-w-md">
              <div className="text-red-500 text-lg font-medium mb-2 flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Preview Error
              </div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
              <Button onClick={handleRun} size="sm">
                Try Again
              </Button>
                <Button onClick={handleStop} variant="outline" size="sm">
                  Clear
                </Button>
              </div>
            </div>
          </div>
        ) : previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Generated App Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            onLoad={() => {
              setDebugInfo('Preview loaded successfully');
              console.log('✅ Preview iframe loaded:', previewUrl);
            }}
            onError={(e) => {
              setError('Failed to load preview iframe');
              console.error('❌ Preview iframe error:', e);
            }}
            allow="cross-origin-isolated"
          />
        ) : Object.keys(files).length === 0 ? (
          <div className="h-full flex items-center justify-center p-4 text-center bg-gradient-to-br from-background via-muted/20 to-background">
            <div className="max-w-md">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
              <div className="text-foreground text-xl font-semibold mb-2">No app yet</div>
              <p className="text-sm text-muted-foreground">Send a message to generate an app.</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-4 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <div className="max-w-md">
              <div className="mb-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-foreground text-xl font-semibold mb-3">Setting up your app...</div>
              <p className="text-sm text-muted-foreground mb-4">Installing dependencies and starting the dev server</p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
