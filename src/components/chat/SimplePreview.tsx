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

  // Use external preview URL if available, otherwise generate local preview
  useEffect(() => {
    console.log('🔍 SimplePreview - externalPreviewUrl:', externalPreviewUrl);
    console.log('🔍 SimplePreview - files count:', Object.keys(files).length);
    console.log('🔍 SimplePreview - isStreaming:', isStreaming);
    
    if (externalPreviewUrl) {
      setPreviewUrl(externalPreviewUrl);
      setIsRunning(true);
      setError(null);
      setDebugInfo(`Using Daytona preview URL: ${externalPreviewUrl}`);
      console.log('✅ Using Daytona preview URL:', externalPreviewUrl);
      
      // Test if the URL is accessible
      fetch(externalPreviewUrl, { method: 'HEAD' })
        .then(response => {
          console.log('🔍 Preview URL test result:', response.status, response.statusText);
          if (!response.ok) {
            setError(`Preview URL not accessible: ${response.status} ${response.statusText}`);
            setDebugInfo(`Preview URL test failed: ${response.status}`);
          }
        })
        .catch(error => {
          console.log('🔍 Preview URL test error:', error);
          setError(`Preview URL not accessible: ${error.message}`);
          setDebugInfo(`Preview URL test error: ${error.message}`);
        });
    } else if (Object.keys(files).length > 0 && !isStreaming) {
      // Fallback to local preview if no Daytona URL
      console.log('🔄 No Daytona URL, generating local preview...');
      setDebugInfo('No Daytona URL available, using local preview');
      generatePreview();
    } else {
      console.log('🔍 SimplePreview - No action taken:', {
        hasExternalUrl: !!externalPreviewUrl,
        hasFiles: Object.keys(files).length > 0,
        isStreaming
      });
    }
  }, [files, isStreaming, generatePreview, externalPreviewUrl]);

  return (
    <div className="h-full flex flex-col bg-card border border-border shadow-sm rounded-lg overflow-hidden">
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
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setDebugInfo('Preview loaded successfully')}
            onError={() => setError('Failed to load preview iframe')}
          />
        ) : Object.keys(files).length === 0 ? (
          <div className="h-full flex items-center justify-center p-4 text-center">
            <div>
              <div className="text-muted-foreground text-lg font-medium mb-2">No Preview Available</div>
              <p className="text-sm text-muted-foreground">Start building your app to see the preview here.</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-4 text-center">
            <div>
              <div className="text-muted-foreground text-lg font-medium mb-2">Generating Preview...</div>
              <p className="text-sm text-muted-foreground mb-4">Please wait while we prepare your app preview.</p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
