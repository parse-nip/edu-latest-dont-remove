"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { workbenchStore } from "@/lib/stores/workbench";
import { projectAnalyzer } from "@/lib/project/analyzer";
import { projectContentProvider } from "@/lib/project/content-provider";
import { universalRunner } from "@/lib/runners/universal-runner";

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
  
  // Build status tracking
  const [buildStatus, setBuildStatus] = useState<'writing' | 'installing' | 'starting' | 'ready' | null>(null);
  const [currentBuildFile, setCurrentBuildFile] = useState<string>('');
  const [buildFileProgress, setBuildFileProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  
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

  // Helper function to update live preview using WebContainer
  const updateLivePreview = async (files: Array<{ path: string; content: string }>) => {
    console.log('🔄 updateLivePreview called with', files.length, 'files');
    try {
      // Auto-run the app if it's a recognized framework
      const projectFiles = files.map(f => ({ path: f.path, content: f.content, type: 'file' as const }));
      const structure = projectAnalyzer.analyzeProject(projectFiles);
      console.log('📊 Project structure:', structure.framework);
      
      if (['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'vanilla'].includes(structure.framework)) {
        console.log('🚀 Auto-starting preview for', structure.framework, 'app using WebContainer...');
        
        // Set installing status
        setBuildStatus('installing');
        
        // Use WebContainer for running apps (no Daytona)
        console.log('📦 Starting installation and server...');
        
        // Listen for status changes in logs
        const originalRunApp = universalRunner.runApp.bind(universalRunner);
        const runResultPromise = originalRunApp(structure, {
          environment: 'webcontainer',
          port: 3000
        });
        
        // Check for starting status  
        setTimeout(() => {
          setBuildStatus('starting');
        }, 3000); // Assume we're starting after 3 seconds of installing
        
        const runResult = await runResultPromise;
        
        console.log('🔍 Run result details:', {
          success: runResult.success,
          hasPreviewUrl: !!runResult.previewUrl,
          previewUrl: runResult.previewUrl,
          logsCount: runResult.logs?.length || 0,
          error: runResult.error
        });
        
        console.log('🏃 WebContainer run result:', runResult);
        
        if (runResult.success && runResult.previewUrl) {
          setBuildStatus('ready');
          setPreviewUrl(runResult.previewUrl);
          console.log('✅ Preview started at:', runResult.previewUrl);
          
          // Clear status after 2 seconds
          setTimeout(() => setBuildStatus(null), 2000);
        } else {
          setBuildStatus(null);
          console.error('❌ Failed to start preview:', runResult.error);
          setLastError(`Failed to start preview: ${runResult.error}`);
        }
      }
    } catch (error) {
      setBuildStatus(null);
      console.error('❌ Failed to start live preview:', error);
      setLastError(error instanceof Error ? error.message : 'Failed to start live preview');
    }
  };

  const generateAppWithAI = async (prompt: string, existingProject?: any): Promise<StructuredAIResponse> => {
    // Check if OpenRouter API key is available
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    console.log('🔑 OpenRouter API Key available:', !!apiKey);
    console.log('📝 Generating app for prompt:', prompt);
    
    // Get existing project context - ALWAYS include current files
    let projectContext = '';
    const currentFiles = workbenchStore.files.get();
    
    if (Object.keys(currentFiles).length > 0) {
      console.log('📁 Found existing project with', Object.keys(currentFiles).length, 'files');
      
      // Build detailed context of ALL existing files
      projectContext = '=== EXISTING PROJECT FILES ===\n\n';
      
      for (const [filePath, fileData] of Object.entries(currentFiles)) {
        if (fileData && fileData.type === 'file' && 'content' in fileData) {
          projectContext += `FILE: ${filePath}\n`;
          projectContext += `CONTENT:\n${fileData.content}\n`;
          projectContext += `\n${'='.repeat(50)}\n\n`;
        }
      }
      
      projectContext += '\nIMPORTANT: The user is referring to THIS existing project. Only modify the specific files needed for their request. DO NOT recreate the entire app unless explicitly asked.\n\n';
      
      console.log('📊 Built context with', Object.keys(currentFiles).length, 'files');
    } else {
      console.log('📝 No existing files - creating new project');
      projectContext = 'No existing project. Create a new application from scratch.\n\n';
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
                content: `You are an AGENTIC AI developer that can create and modify web applications.

CAPABILITIES:
- Create new files
- Modify existing files
- Delete files (by setting "action": "delete")
- Work with any framework (React, Vue, Angular, Svelte, Vanilla JS)

RESPONSE FORMAT - Always respond with valid JSON:
{
  "explanation": "What you built/changed",
  "files": [
    {
      "path": "src/App.jsx",
      "content": "// file content",
      "action": "create" | "modify" | "delete"
    }
  ],
  "education": "What the user should learn from this",
  "framework": "react" | "vue" | "angular" | "svelte" | "vanilla"
}

CRITICAL RULES:
1. **EXISTING PROJECTS**: You will receive the FULL content of all existing files. When the user asks to change something (like "there are 2 equals signs"), they are referring to the EXISTING code. ONLY modify the specific files that need to change. DO NOT recreate the entire app.

2. **NEW PROJECTS**: Only create from scratch if there are NO existing files

3. **MODIFICATIONS**: 
   - Read the existing files carefully
   - Only include files you're changing with action: "modify"
   - Keep all other files unchanged
   - Understand the context (e.g., "2 equals signs" in a calculator means 2 "=" buttons in the UI)

4. **DELETIONS**: Include file path with action: "delete"

5. **File Contents**: Always provide complete, working file contents (no placeholders)

6. **Context Awareness**: If user says "change the button color", look at existing files to see which file has buttons

EXAMPLE - New Project:
{
  "explanation": "Created a calculator app with basic operations",
  "files": [
    {"path": "src/App.jsx", "content": "...", "action": "create"},
    {"path": "src/App.css", "content": "...", "action": "create"},
    {"path": "package.json", "content": "...", "action": "create"}
  ],
  "education": "This demonstrates state management and event handling",
  "framework": "react"
}

EXAMPLE - Modification:
{
  "explanation": "Changed button color to blue and added hover effect",
  "files": [
    {"path": "src/App.css", "content": "/* updated CSS */", "action": "modify"}
  ],
  "education": "CSS styling and hover effects",
  "framework": "react"
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
              
              // Populate workbench store with generated files - ONE BY ONE for animations
              if (parsed.files && Array.isArray(parsed.files)) {
                console.log('📁 Processing', parsed.files.length, 'generated files with animations');
                
                // Get existing files from workbench
                const existingFiles = workbenchStore.files.get();
                const fileMap = { ...existingFiles } as any;
                
                // Show workbench immediately
                workbenchStore.setShowWorkbench(true);
                
                // Set build status
                setBuildStatus('writing');
                setBuildFileProgress({ current: 0, total: parsed.files.length });
                
                // Process files one by one with animations
                for (let i = 0; i < parsed.files.length; i++) {
                  const file = parsed.files[i];
                  const action = file.action || 'create';
                  
                  // Update current file status
                  setCurrentBuildFile(file.path);
                  setBuildFileProgress({ current: i + 1, total: parsed.files.length });
                  
                  if (action === 'delete') {
                    // Delete file
                    console.log(`🗑️ Deleting file: ${file.path}`);
                    delete fileMap[file.path];
                  } else if (file.path && file.content) {
                    // Create or modify file
                    const actionLabel = action === 'modify' ? '✏️ Modifying' : '➕ Creating';
                    console.log(`${actionLabel} file ${i + 1}/${parsed.files.length}: ${file.path}`);
                    
                    fileMap[file.path] = {
                      type: 'file',
                      content: file.content
                    };
                  }
                  
                  // Update workbench store progressively for animation
                  workbenchStore.setDocuments({ ...fileMap });
                  
                  // Small delay for animation effect (100ms per file for better visibility)
                  if (i < parsed.files.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                }
                
                console.log('✨ All files animated');
                
                // Trigger live preview update after all files are added
                console.log('🔄 Triggering live preview update with', parsed.files.length, 'files');
                
                // Verify files before sending to preview
                const filesToPreview = parsed.files.map((f: any) => {
                  if (!f.content) {
                    console.warn(`⚠️ Empty content for file: ${f.path}`);
                  }
                  return { path: f.path, content: f.content || '' };
                });
                
                console.log('📋 Files to preview:', filesToPreview.map((f: any) => `${f.path} (${f.content.length} bytes)`).join(', '));
                
                await updateLivePreview(filesToPreview);
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
                    console.log('📁 Processing', parsed.files.length, 'generated files (extracted) with animations');
                    
                    const existingFiles = workbenchStore.files.get();
                    const fileMap = { ...existingFiles } as any;
                    
                    workbenchStore.setShowWorkbench(true);
                    
                    for (let i = 0; i < parsed.files.length; i++) {
                      const file = parsed.files[i];
                      const action = file.action || 'create';
                      
                      if (action === 'delete') {
                        console.log(`🗑️ Deleting file: ${file.path}`);
                        delete fileMap[file.path];
                      } else if (file.path && file.content) {
                        const actionLabel = action === 'modify' ? '✏️ Modifying' : '➕ Creating';
                        console.log(`${actionLabel} file ${i + 1}/${parsed.files.length}: ${file.path}`);
                        
                        fileMap[file.path] = {
                          type: 'file',
                          content: file.content
                        };
                      }
                      
                      workbenchStore.setDocuments({ ...fileMap });
                      
                      if (i < parsed.files.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                      }
                    }
                    
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

    // Populate workbench store with fallback files - animated
    console.log('📁 Processing', fallbackFiles.length, 'fallback files with animations');
    const fileMap = {} as any;
    
    workbenchStore.setShowWorkbench(true);
    
    for (let i = 0; i < fallbackFiles.length; i++) {
      const file = fallbackFiles[i];
      fileMap[file.path] = {
        type: 'file',
        content: file.content
      };
      
      console.log(`✨ Animating fallback file ${i + 1}/${fallbackFiles.length}: ${file.path}`);
      workbenchStore.setDocuments({ ...fileMap });
      
      if (i < fallbackFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
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
    forceCompleteLoading,
    buildStatus,
    currentBuildFile,
    buildFileProgress
  };
}