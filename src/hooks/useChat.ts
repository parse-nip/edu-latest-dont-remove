"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { workbenchStore } from "@/lib/stores/workbench";
import { projectAnalyzer } from "@/lib/project/analyzer";
import { projectContentProvider } from "@/lib/project/content-provider";
import { universalRunner } from "@/lib/runners/universal-runner";
import { ensureDaytonaInitialized, getOrCreateDefaultSandbox } from "@/lib/daytona/auto-init";

export interface StructuredAIResponse {
  type: "aiResponse";
  files: string[];
  explanation: string;
  education: string;
  generatedFiles?: Array<{ path: string; content: string }>;
  previewUrl?: string;
}

export interface Message {
  role: "user" | "assistant";
  id: string;
  content: string | StructuredAIResponse;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export function useChat(initialPrompt?: string, selectedModel?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([
    { 
      id: "1", 
      title: "New Chat", 
      messages: [],
      createdAt: Date.now() 
    }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Debug function to force complete loading
  const forceCompleteLoading = () => {
    console.log('🔧 Force completing loading states');
    setIsLoading(false);
    setIsInitialLoading(false);
    hasPendingUserMessage.current = false;
  };
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const hasAddedInitial = useRef(false);
  const hasPendingUserMessage = useRef(false);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentConversation = useMemo(() => 
    conversations.find(c => c.id === currentConversationId) || { messages: [] as Message[] },
    [conversations, currentConversationId]
  );
  const messages = currentConversation.messages;

  // Helper to check if last message matches
  const isDuplicateMessage = (newMessage: Message) => {
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    return lastMsg.role === newMessage.role && 
           (typeof lastMsg.content === 'string' && typeof newMessage.content === 'string' 
            ? lastMsg.content === newMessage.content 
            : JSON.stringify(lastMsg.content) === JSON.stringify(newMessage.content));
  };

  // Helper function to update live preview
  const updateLivePreview = async (files: Array<{ path: string; content: string }>) => {
    console.log('🔄 updateLivePreview called with', files.length, 'files');
    try {
      // Auto-run the app if it's a recognized framework
      const projectFiles = files.map(f => ({ path: f.path, content: f.content, type: 'file' as const }));
      const structure = projectAnalyzer.analyzeProject(projectFiles);
      console.log('📊 Project structure:', structure.framework);
      
      if (['react', 'vue', 'angular', 'svelte', 'next', 'nuxt'].includes(structure.framework)) {
        console.log('🚀 Auto-starting preview for', structure.framework, 'app...');
        
        // Ensure Daytona is initialized and get workspace
        console.log('🔧 Ensuring Daytona is initialized...');
        const daytonaReady = await ensureDaytonaInitialized();
        console.log('🔧 Daytona ready:', daytonaReady);
        
        const sandboxId = await getOrCreateDefaultSandbox();
        console.log('🏗️ Sandbox ID:', sandboxId);
        
        if (sandboxId) {
          // Always use Daytona for running apps
          console.log('🚀 Running app on Daytona...');
          const runResult = await universalRunner.runApp(structure, {
            environment: 'daytona',
            workspaceId: sandboxId,
            port: 3000
          });
          
          console.log('🏃 Run result:', runResult);
          
          if (runResult.success && runResult.previewUrl) {
            setPreviewUrl(runResult.previewUrl);
            console.log('✅ Preview started at:', runResult.previewUrl);
          } else {
            console.error('❌ Failed to start preview:', runResult.error);
            setLastError(`Failed to start preview: ${runResult.error}`);
          }
        } else {
          console.error('❌ Could not get Daytona workspace');
          setLastError('Could not connect to Daytona workspace. Using local preview instead.');
        }
      }
    } catch (error) {
      console.warn('Failed to start live preview:', error);
      setLastError(error instanceof Error ? error.message : 'Failed to start live preview');
    }
  };

  const generateAppWithAI = async (prompt: string, existingProject?: any): Promise<StructuredAIResponse> => {
    // Check if OpenRouter API key is available
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    console.log('🔑 OpenRouter API Key available:', !!apiKey);
    console.log('📝 Generating app for prompt:', prompt);
    
    // Get existing project context if available
    let projectContext = '';
    if (!existingProject) {
      const currentFiles = workbenchStore.files.get();
      if (Object.keys(currentFiles).length > 0) {
        console.log('📁 Found existing project files, analyzing...');
        
        const projectContent = await projectContentProvider.getProjectContent('workbench');
        if (projectContent) {
          projectContext = projectContentProvider.getCondensedContext(projectContent);
          console.log('📊 Project analysis complete:', projectContent.structure.framework);
        }
      }
    }
    
    // Initialize OpenRouter if API key is available
    if (apiKey) {
      const { initializeOpenRouter } = await import('@/lib/openrouter');
      initializeOpenRouter(apiKey);
    }
    
    if (apiKey) {
      try {
        console.log('🚀 Calling OpenRouter API...');
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Edu App Builder'
          },
          body: JSON.stringify({
            model: selectedModel || 'x-ai/grok-4-fast:free',
            messages: [
              {
                role: 'system',
                content: `You are an expert full-stack developer capable of working with any web framework (React, Vue, Angular, Svelte, Vanilla JS, etc.). 

When given a prompt to build or edit an app, analyze the request and:

1. If building NEW: Generate a complete, runnable web application in the most appropriate framework
2. If editing EXISTING: Modify only the necessary files while maintaining the existing structure and framework

ALWAYS respond with a JSON object containing:
- explanation: Brief description of what you built/changed
- files: Array of file objects with path and content (include ALL files for new apps, only changed files for edits)
- education: Learning notes about the implementation
- framework: The detected/chosen framework (react, vue, angular, svelte, vanilla, etc.)
- projectStructure: Brief description of the project organization

For EXISTING projects, you'll receive the current project structure and file contents. Only modify what's necessary.

Example response format:
{
  "explanation": "I built a timer app with start/pause/reset functionality",
  "files": [
    {
      "path": "src/App.jsx",
      "content": "import React, { useState, useEffect } from 'react';\\n// ... complete component code"
    },
    {
      "path": "src/App.css", 
      "content": ".app { /* ... complete styles */ }"
    },
    {
      "path": "package.json",
      "content": "{ \\"name\\": \\"timer-app\\", \\"dependencies\\": { \\"react\\": \\"^18.0.0\\" } }"
    }
  ],
  "education": "This app demonstrates React hooks, state management, and timer functionality",
  "framework": "react",
  "projectStructure": "Standard React app with src/ directory containing components and styles"
}`
              },
              {
                role: 'user',
                content: existingProject 
                  ? `${existingProject}\n\nUSER REQUEST: ${prompt}`
                  : projectContext 
                    ? `${projectContext}\n\nUSER REQUEST: ${prompt}`
                    : prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          })
        });

        console.log('📡 OpenRouter response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content;
          
          console.log('📄 OpenRouter response content length:', content?.length || 0);
          
          if (content) {
            try {
              // Clean the content by removing control characters that might cause JSON parsing issues
              const cleanedContent = content
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
                .replace(/\n/g, '\\n') // Escape newlines
                .replace(/\r/g, '\\r') // Escape carriage returns
                .replace(/\t/g, '\\t'); // Escape tabs
              
              const parsed = JSON.parse(cleanedContent);
              console.log('✅ Successfully parsed AI response:', parsed);
              
              // Populate workbench store with generated files
              if (parsed.files && Array.isArray(parsed.files)) {
                console.log('📁 Processing', parsed.files.length, 'generated files');
                
                const fileMap: Record<string, { type: 'file'; content: string }> = {};
                parsed.files.forEach((file: any, index: number) => {
                  if (file.path && file.content) {
                    fileMap[file.path] = {
                      type: 'file',
                      content: file.content
                    };
                    console.log(`📄 File ${index + 1}: ${file.path} (${file.content.length} chars)`);
                  }
                });
                
                // Update the files store with animation trigger
                console.log('🎬 Setting documents in workbench store...');
                workbenchStore.setDocuments(fileMap);
                workbenchStore.setShowWorkbench(true);
                
                // Trigger live preview update
                console.log('🔄 Triggering live preview update with', parsed.files.length, 'files');
                console.log('🔄 Files to preview:', parsed.files.map(f => f.path));
                await updateLivePreview(parsed.files);
                console.log('✅ Workbench store updated successfully');
              }
              
              return {
                type: "aiResponse",
                files: parsed.files.map((f: any) => f.path),
                explanation: parsed.explanation || 'App generated successfully',
                education: parsed.education || 'Generated with AI assistance',
                generatedFiles: parsed.files,
                previewUrl: undefined // Will be set by WebContainer if available
              };
            } catch (parseError) {
              console.warn('❌ Failed to parse AI response:', parseError);
              console.log('Raw content:', content);
              
              // Try to extract JSON from the content if it's wrapped in markdown or has extra text
              try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const jsonContent = jsonMatch[0];
                  const parsed = JSON.parse(jsonContent);
                  console.log('✅ Successfully parsed AI response (extracted):', parsed);
                  
                  // Process the extracted JSON the same way
                  if (parsed.files && Array.isArray(parsed.files)) {
                    console.log('📁 Processing', parsed.files.length, 'generated files (extracted)');
                    
                    const fileMap: Record<string, { type: 'file'; content: string }> = {};
                    parsed.files.forEach((file: any, index: number) => {
                      if (file.path && file.content) {
                        fileMap[file.path] = {
                          type: 'file',
                          content: file.content
                        };
                        console.log(`📄 File ${index + 1}: ${file.path} (${file.content.length} chars)`);
                      }
                    });
                    
                    console.log('🎬 Setting documents in workbench store (extracted)...');
                    workbenchStore.setDocuments(fileMap);
                    workbenchStore.setShowWorkbench(true);
                    console.log('✅ Workbench store updated successfully (extracted)');
                  }
                  
                  return {
                    type: "aiResponse",
                    files: parsed.files.map((f: any) => f.path),
                    explanation: parsed.explanation || 'App generated successfully',
                    education: parsed.education || 'Generated with AI assistance',
                    generatedFiles: parsed.files,
                    previewUrl: undefined
                  };
                }
              } catch (secondParseError) {
                console.error('❌ Second parse attempt failed:', secondParseError);
              }
            }
          } else {
            console.warn('❌ No content in OpenRouter response');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ OpenRouter API error:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ OpenRouter API error:', error);
        setLastError(error instanceof Error ? error.message : 'OpenRouter API error');
      }
    } else {
      console.log('⚠️ No OpenRouter API key found, using fallback');
    }

    // Fallback simulation for when OpenRouter is not available
    console.log('🔄 Using fallback simulation...');
    const fallbackFiles = [
      {
        path: 'src/App.jsx',
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Generated App</h1>
      <p>Request: ${prompt}</p>
      <p>This is a simulated response. Connect OpenRouter API for real AI generation.</p>
    </div>
  );
}

export default App;`
      },
      {
        path: 'src/App.css',
        content: `.app {
  text-align: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
  line-height: 1.6;
}`
      },
      {
        path: 'package.json',
        content: `{
  "name": "generated-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`
      }
    ];

    // Populate workbench store with fallback files
    console.log('📁 Processing', fallbackFiles.length, 'fallback files');
    const fileMap: Record<string, { type: 'file'; content: string }> = {};
    fallbackFiles.forEach((file, index) => {
      fileMap[file.path] = {
        type: 'file',
        content: file.content
      };
      console.log(`📄 Fallback file ${index + 1}: ${file.path} (${file.content.length} chars)`);
    });
    
    console.log('🎬 Setting fallback documents in workbench store...');
    workbenchStore.setDocuments(fileMap);
    workbenchStore.setShowWorkbench(true);
    
    // Trigger live preview update
    console.log('🔄 Triggering fallback live preview update with', fallbackFiles.length, 'files');
    console.log('🔄 Fallback files to preview:', fallbackFiles.map(f => f.path));
    await updateLivePreview(fallbackFiles);
    console.log('✅ Fallback workbench store updated successfully');

    return {
      type: "aiResponse",
      files: fallbackFiles.map(f => f.path),
      explanation: `Building your app based on: "${prompt}". ${apiKey ? 'AI generation failed, showing simulation.' : 'Connect OpenRouter API for real AI generation.'}`,
      education: "This shows sequential file processing. Integrate with OpenRouter API for dynamic processing.",
      generatedFiles: fallbackFiles
    };
  };

  useEffect(() => {
    if (!initialPrompt?.trim()) {
      setIsInitialLoading(false);
      return;
    }

    if (hasAddedInitial.current || hasPendingUserMessage.current) return;

    hasAddedInitial.current = true;

    // Immediately add user message for initial prompt
    const userMessage: Message = {
      role: "user",
      id: Date.now().toString(),
      content: initialPrompt
    };
    if (isDuplicateMessage(userMessage)) return; // Prevent duplicate

    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    // Generate app with AI
    setIsLoading(true);
    console.log('🚀 Starting AI generation for prompt:', initialPrompt);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⏰ AI generation timeout, forcing completion');
      setIsLoading(false);
      setIsInitialLoading(false);
      hasPendingUserMessage.current = false;
    }, 30000); // 30 second timeout
    
    generateAppWithAI(initialPrompt).then(aiResponse => {
      console.log('✅ AI generation completed:', aiResponse);
      
      const assistantMessage: Message = {
        role: "assistant",
        id: (Date.now() + 1).toString(),
        content: aiResponse
      };
      if (isDuplicateMessage(assistantMessage)) return; // Prevent duplicate

      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, assistantMessage] }
            : conv
        )
      );
      
      if (aiResponse.previewUrl) {
        console.log('🔗 Setting preview URL:', aiResponse.previewUrl);
        setPreviewUrl(aiResponse.previewUrl);
      }
      
      console.log('✅ Setting loading states to false');
      clearTimeout(timeoutId);
      setIsLoading(false);
      setIsInitialLoading(false);
      hasPendingUserMessage.current = false;
    }).catch(error => {
      console.error('❌ Failed to generate app:', error);
      clearTimeout(timeoutId);
      setLastError(error instanceof Error ? error.message : 'Failed to generate app');
      setIsLoading(false);
      setIsInitialLoading(false);
      hasPendingUserMessage.current = false;
    });
  }, [initialPrompt, currentConversationId]);

  const addMessage = (message: Omit<Message, "id">) => {
    if (message.role === "user" && (isLoading || hasPendingUserMessage.current)) {
      return; // Ignore duplicate user messages
    }

    const fullMessage: Message = { ...message, id: Date.now().toString() };
    if (isDuplicateMessage(fullMessage)) return; // Prevent any duplicates

    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, fullMessage] }
          : conv
      )
    );

    if (message.role === "user") {
      hasPendingUserMessage.current = true;
      setIsLoading(true);
      
      const userContent = typeof message.content === 'string' ? message.content : '';
      generateAppWithAI(userContent).then(aiResponse => {
        const assistantMessage: Message = {
          role: "assistant",
          id: (Date.now() + 1).toString(),
          content: aiResponse
        };
        if (isDuplicateMessage(assistantMessage)) return; // Prevent duplicate

        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, assistantMessage] }
              : conv
          )
        );
        
        if (aiResponse.previewUrl) {
          setPreviewUrl(aiResponse.previewUrl);
        }
        
        setIsLoading(false);
        hasPendingUserMessage.current = false;
      }).catch(error => {
        console.error('Failed to generate app:', error);
        setLastError(error instanceof Error ? error.message : 'Failed to generate app');
        setIsLoading(false);
        hasPendingUserMessage.current = false;
      });
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = { 
      id: newId, 
      title: "New Chat", 
      messages: [], 
      createdAt: Date.now()
    };
    setConversations(prev => [...prev, newConv]);
    setCurrentConversationId(newId);
    // Reset flags for new chat
    hasAddedInitial.current = false;
    hasPendingUserMessage.current = false;
    setIsInitialLoading(false);
    setPreviewUrl(null);
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current);
      initialTimeoutRef.current = null;
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    addMessage,
    createNewChat,
    isLoading,
    isInitialLoading,
    previewUrl,
    lastError,
    forceCompleteLoading
  };
}