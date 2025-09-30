'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  Trash2, 
  ExternalLink, 
  Plus, 
  RefreshCw,
  Folder,
  GitBranch,
  Monitor
} from 'lucide-react';
import { 
  getDaytonaClient, 
  initializeDaytona, 
  MockDaytonaClient,
  type DaytonaWorkspace,
  type DaytonaProject 
} from '@/lib/daytona/client';
import { toast } from 'sonner';

interface WorkspaceManagerProps {
  onWorkspaceSelect?: (workspace: DaytonaWorkspace) => void;
  selectedWorkspaceId?: string;
}

export function WorkspaceManager({ onWorkspaceSelect, selectedWorkspaceId }: WorkspaceManagerProps) {
  const [workspaces, setWorkspaces] = useState<DaytonaWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState<DaytonaProject>({
    name: '',
    repository: {
      url: '',
      branch: 'main'
    }
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [daytonaConfig, setDaytonaConfig] = useState({
    baseUrl: 'https://app.daytona.io/api',
    apiKey: 'dtn_8fb213550e216b5d43b649c1ba39d0e8f07d0e1c18040bd294cf987f39ed6fd6'
  });
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Always initialize with real Daytona client
    initializeDaytona(daytonaConfig);
    setIsConfigured(true);
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const client = getDaytonaClient();
      if (!client) {
        console.warn('Daytona client not initialized');
        return;
      }

      const data = await client.listWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!newProject.name || !newProject.repository.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      const client = getDaytonaClient();
      if (!client) {
        toast.error('Daytona client not configured');
        return;
      }

      const workspace = await client.createWorkspace(newProject);
      setWorkspaces(prev => [...prev, workspace]);
      setNewProject({
        name: '',
        repository: { url: '', branch: 'main' }
      });
      setShowCreateForm(false);
      toast.success(`Workspace "${workspace.name}" created successfully`);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast.error('Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const startWorkspace = async (id: string) => {
    try {
      const client = getDaytonaClient();
      if (!client) return;

      await client.startWorkspace(id);
      await loadWorkspaces();
      toast.success('Workspace started');
    } catch (error) {
      console.error('Failed to start workspace:', error);
      toast.error('Failed to start workspace');
    }
  };

  const stopSandbox = async (id: string) => {
    try {
      const client = getDaytonaClient();
      if (!client) return;

      await client.stopSandbox(id);
      await loadWorkspaces();
      toast.success('Sandbox stopped');
    } catch (error) {
      console.error('Failed to stop sandbox:', error);
      toast.error('Failed to stop sandbox');
    }
  };

  const deleteSandbox = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sandbox?')) return;

    try {
      const client = getDaytonaClient();
      if (!client) return;

      await client.deleteSandbox(id);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      toast.success('Sandbox deleted');
    } catch (error) {
      console.error('Failed to delete sandbox:', error);
      toast.error('Failed to delete sandbox');
    }
  };

  const getStatusColor = (status: DaytonaWorkspace['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-gray-500';
      case 'starting':
        return 'bg-yellow-500';
      case 'stopping':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configure Daytona</CardTitle>
          <CardDescription>
            Connect to your Daytona instance to manage cloud workspaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={daytonaConfig.baseUrl}
              onChange={(e) => setDaytonaConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="https://api.daytona.io"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={daytonaConfig.apiKey}
              onChange={(e) => setDaytonaConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Your Daytona API key"
            />
          </div>
          <Button 
            onClick={() => {
              initializeDaytona(daytonaConfig);
              setIsConfigured(true);
              loadWorkspaces();
            }}
            className="w-full"
          >
            Connect to Daytona
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daytona Workspaces</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadWorkspaces}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workspace</CardTitle>
            <CardDescription>
              Create a new cloud workspace from a Git repository
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="my-awesome-app"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={newProject.repository.branch}
                  onChange={(e) => setNewProject(prev => ({
                    ...prev,
                    repository: { ...prev.repository, branch: e.target.value }
                  }))}
                  placeholder="main"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                value={newProject.repository.url}
                onChange={(e) => setNewProject(prev => ({
                  ...prev,
                  repository: { ...prev.repository, url: e.target.value }
                }))}
                placeholder="https://github.com/user/repo"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createWorkspace}
                disabled={creating}
                className="flex-1"
              >
                {creating ? 'Creating...' : 'Create Workspace'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading workspaces...</p>
          </div>
        ) : workspaces.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No workspaces found</p>
              <p className="text-sm text-muted-foreground">Create your first workspace to get started</p>
            </CardContent>
          </Card>
        ) : (
          workspaces.map((workspace) => (
            <Card 
              key={workspace.id}
              className={`cursor-pointer transition-colors ${
                selectedWorkspaceId === workspace.id 
                  ? 'ring-2 ring-primary' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onWorkspaceSelect?.(workspace)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(workspace.status)}`} />
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {workspace.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {workspace.status === 'stopped' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          startWorkspace(workspace.id);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {workspace.status === 'running' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (workspace.ide.url) {
                              window.open(workspace.ide.url, '_blank');
                            }
                          }}
                          disabled={!workspace.ide.url}
                        >
                          <Monitor className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            stopSandbox(workspace.id);
                          }}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSandbox(workspace.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {workspace.repository && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <GitBranch className="h-4 w-4" />
                    <span>{workspace.repository.url}</span>
                    <span>({workspace.repository.branch})</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(workspace.createdAt).toLocaleDateString()}
                </div>
                {workspace.ide.url && workspace.status === 'running' && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(workspace.ide.url, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open IDE
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
