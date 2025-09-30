'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CodeMirrorEditor } from '@/components/editor/codemirror/CodeMirrorEditor';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Folder, FolderOpen, Save, RotateCcw } from 'lucide-react';

interface EmbeddedWorkbenchProps {
  files?: Record<string, { type: 'file'; content: string }>;
  selectedFile?: string;
  isStreaming?: boolean;
}

export const EmbeddedWorkbench = memo(({ files = {}, selectedFile, isStreaming }: EmbeddedWorkbenchProps) => {
  const [currentFile, setCurrentFile] = useState<string>(selectedFile || Object.keys(files)[0] || '');
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const contents: Record<string, string> = {};
    Object.entries(files).forEach(([path, file]) => {
      contents[path] = file.content;
    });
    return contents;
  });

  // Update file contents when files prop changes
  useEffect(() => {
    const contents: Record<string, string> = {};
    Object.entries(files).forEach(([path, file]) => {
      contents[path] = file.content;
    });
    setFileContents(contents);
    
    // Set first file as current if no file is selected
    if (!currentFile && Object.keys(files).length > 0) {
      setCurrentFile(Object.keys(files)[0]);
    }
  }, [files, currentFile]);

  const handleFileSelect = useCallback((filePath: string) => {
    setCurrentFile(filePath);
  }, []);

  const handleEditorChange = useCallback((content: string) => {
    setFileContents(prev => ({
      ...prev,
      [currentFile]: content
    }));
  }, [currentFile]);

  const handleSave = useCallback(() => {
    console.log('Saving file:', currentFile);
    // Here you would implement actual file saving logic
  }, [currentFile]);

  const handleReset = useCallback(() => {
    if (files[currentFile]) {
      setFileContents(prev => ({
        ...prev,
        [currentFile]: files[currentFile].content
      }));
    }
  }, [currentFile, files]);

  const getFileIcon = (filePath: string) => {
    if (filePath.includes('/')) {
      return <FolderOpen className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getFileExtension = (filePath: string) => {
    return filePath.split('.').pop()?.toLowerCase() || '';
  };

  const getLanguage = (filePath: string) => {
    const ext = getFileExtension(filePath);
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
    };
    return langMap[ext] || 'text';
  };

  return (
    <div className="h-full w-full flex flex-col bg-card border border-border shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Files</span>
          {currentFile && (
            <span className="text-xs text-muted-foreground">
              {currentFile}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-7 px-2"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* File Tree */}
          <Panel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col border-r border-border">
              <div className="px-3 py-2 border-b border-border bg-muted/30">
                <span className="text-sm font-medium">Files</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {Object.keys(files).length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      No files available
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {Object.keys(files).map((filePath) => (
                        <button
                          key={filePath}
                          onClick={() => handleFileSelect(filePath)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-left transition-colors ${
                            currentFile === filePath
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {getFileIcon(filePath)}
                          <span className="truncate">{filePath.split('/').pop()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-foreground/20" />

          {/* Editor */}
          <Panel defaultSize={75} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="px-3 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  {currentFile && getFileIcon(currentFile)}
                  <span className="text-sm font-medium">
                    {currentFile ? currentFile.split('/').pop() : 'No file selected'}
                  </span>
                  {currentFile && (
                    <span className="text-xs text-muted-foreground">
                      {getFileExtension(currentFile).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {currentFile && fileContents[currentFile] ? (
                  <CodeMirrorEditor
                    doc={{
                      value: fileContents[currentFile],
                      isBinary: false,
                      filePath: currentFile
                    }}
                    onChange={(update) => handleEditorChange(update.content)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-4 text-muted-foreground text-center">
                    <div>
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No file selected</h3>
                      <p className="text-sm">Select a file from the file tree to start editing.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
});