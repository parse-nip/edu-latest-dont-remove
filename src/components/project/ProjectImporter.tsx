'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Github, 
  Cloud, 
  CheckCircle, 
  XCircle, 
  FileText,
  Folder,
  Loader2
} from 'lucide-react';
import { projectImporter, type ImportSource, type ImportResult } from '@/lib/project/importer';
import { workbenchStore } from '@/lib/stores/workbench';
import { toast } from 'sonner';

interface ProjectImporterProps {
  onImportComplete?: (result: ImportResult) => void;
  onCancel?: () => void;
}

export function ProjectImporter({ onImportComplete, onCancel }: ProjectImporterProps) {
  const [activeTab, setActiveTab] = useState('github');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [githubUrl, setGithubUrl] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const importFromGitHub = async () => {
    const repoInfo = projectImporter.parseGitHubUrl(githubUrl);
    if (!repoInfo) {
      toast.error('Invalid GitHub URL');
      return;
    }

    const source: ImportSource = {
      type: 'github',
      github: repoInfo
    };

    await performImport(source);
  };

  const importFromDaytona = async () => {
    if (!workspaceId.trim()) {
      toast.error('Please enter a workspace ID');
      return;
    }

    const source: ImportSource = {
      type: 'daytona',
      daytonaWorkspaceId: workspaceId
    };

    await performImport(source);
  };

  const importFromLocal = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to import');
      return;
    }

    const source: ImportSource = {
      type: 'local',
      localFiles: selectedFiles
    };

    await performImport(source);
  };

  const performImport = async (source: ImportSource) => {
    try {
      setImporting(true);
      setImportProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await projectImporter.importProject(source);

      clearInterval(progressInterval);
      setImportProgress(100);

      setImportResult(result);

      if (result.success) {
        // Load files into workbench
        const fileMap: Record<string, { type: 'file'; content: string }> = {};
        result.files.forEach(file => {
          fileMap[file.path] = {
            type: 'file',
            content: file.content
          };
        });

        workbenchStore.setDocuments(fileMap);
        workbenchStore.setShowWorkbench(true);

        toast.success(`Successfully imported ${result.files.length} files`);
        onImportComplete?.(result);
      } else {
        toast.error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import project');
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const resetForm = () => {
    setGithubUrl('');
    setWorkspaceId('');
    setSelectedFiles([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (importResult) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {importResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <CardTitle>
              {importResult.success ? 'Import Successful' : 'Import Failed'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {importResult.success ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Files imported:</span>
                <Badge variant="secondary">{importResult.files.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Framework detected:</span>
                <Badge>{importResult.structure.framework}</Badge>
              </div>
              {importResult.structure.packageManager && (
                <div className="flex items-center justify-between">
                  <span>Package manager:</span>
                  <Badge variant="outline">{importResult.structure.packageManager}</Badge>
                </div>
              )}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Project Structure:</h4>
                <div className="text-sm space-y-1">
                  {importResult.files.slice(0, 10).map(file => (
                    <div key={file.path} className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span className="font-mono text-xs">{file.path}</span>
                    </div>
                  ))}
                  {importResult.files.length > 10 && (
                    <div className="text-muted-foreground text-xs">
                      ... and {importResult.files.length - 10} more files
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-500">
              {importResult.error}
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={resetForm} variant="outline" className="flex-1">
              Import Another Project
            </Button>
            <Button onClick={onCancel} className="flex-1">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Import Project</CardTitle>
        <CardDescription>
          Import an existing project from GitHub, Daytona workspace, or local files
        </CardDescription>
      </CardHeader>
      <CardContent>
        {importing && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Importing project...</span>
            </div>
            <Progress value={importProgress} className="w-full" />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="daytona" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Daytona
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Local Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-url">Repository URL</Label>
              <Input
                id="github-url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/user/repository"
                disabled={importing}
              />
              <p className="text-xs text-muted-foreground">
                Enter a GitHub repository URL to import the project
              </p>
            </div>
            <Button 
              onClick={importFromGitHub} 
              disabled={importing || !githubUrl.trim()}
              className="w-full"
            >
              <Github className="h-4 w-4 mr-2" />
              Import from GitHub
            </Button>
          </TabsContent>

          <TabsContent value="daytona" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-id">Workspace ID</Label>
              <Input
                id="workspace-id"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                placeholder="workspace-12345"
                disabled={importing}
              />
              <p className="text-xs text-muted-foreground">
                Enter the ID of a Daytona workspace to import
              </p>
            </div>
            <Button 
              onClick={importFromDaytona} 
              disabled={importing || !workspaceId.trim()}
              className="w-full"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Import from Daytona
            </Button>
          </TabsContent>

          <TabsContent value="local" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-input">Select Files</Label>
              <Input
                id="file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                webkitdirectory="true"
                disabled={importing}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Select a folder to import all files within it
              </p>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="h-4 w-4" />
                  <span className="font-medium">Selected Files ({selectedFiles.length})</span>
                </div>
                <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                  {selectedFiles.slice(0, 10).map((file, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span className="font-mono text-xs">
                        {file.webkitRelativePath || file.name}
                      </span>
                    </div>
                  ))}
                  {selectedFiles.length > 10 && (
                    <div className="text-muted-foreground text-xs">
                      ... and {selectedFiles.length - 10} more files
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button 
              onClick={importFromLocal} 
              disabled={importing || selectedFiles.length === 0}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Local Files
            </Button>
          </TabsContent>
        </Tabs>

        {onCancel && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={onCancel} 
              variant="outline" 
              disabled={importing}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
