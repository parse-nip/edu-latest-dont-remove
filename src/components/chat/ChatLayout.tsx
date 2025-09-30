"use client";

import React from "react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ExternalLink } from "lucide-react";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { ProjectImporter } from "@/components/project/ProjectImporter";
import dynamic from "next/dynamic";
import { ErrorBubble } from "@/components/ui/ErrorBubble";
import { BuildStatus } from "./BuildStatus";

// Dynamically import components to avoid SSR issues
const EmbeddedWorkbench = dynamic(() => import("./EmbeddedWorkbench").then(mod => ({ default: mod.EmbeddedWorkbench })), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center p-4 text-muted-foreground text-center">
      <div>
        <h3 className="text-lg font-medium mb-2">Loading Workbench...</h3>
        <p>Initializing development environment...</p>
      </div>
    </div>
  )
});

const SimplePreview = dynamic(() => import("./SimplePreview").then(mod => ({ default: mod.SimplePreview })), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center p-4 text-muted-foreground text-center">
      <div>
        <h3 className="text-lg font-medium mb-2">Loading Preview...</h3>
        <p>Initializing preview environment...</p>
      </div>
    </div>
  )
});

interface ChatLayoutProps {
  initialPrompt?: string;
  children?: ReactNode;
}

export function ChatLayout({ initialPrompt, children }: { initialPrompt?: string; children?: ReactNode }) {
  const [selectedModel, setSelectedModel] = React.useState<string>('x-ai/grok-4-fast:free'); // Default to Grok 4 Fast Free
  const { messages, addMessage, isLoading, isInitialLoading, previewUrl, lastError, forceCompleteLoading, buildStatus, currentBuildFile, buildFileProgress, installMessage } = useChat(initialPrompt, selectedModel);
  const [showImporter, setShowImporter] = React.useState(false);

  // Initialize OpenRouter on component mount
  React.useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (apiKey) {
      import('@/lib/openrouter').then(({ initializeOpenRouter }) => {
        initializeOpenRouter(apiKey);
        console.log('🔑 OpenRouter initialized with API key');
      });
    }
  }, []);

  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  // Resizable splitter state
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [leftPct, setLeftPct] = React.useState(40); // chat width %
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(20, Math.min(80, (x / rect.width) * 100));
      setLeftPct(pct);
    };
    const stop = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [dragging]);

  // Get the latest AI response to show generated files
  const latestAIResponse = messages
    .filter(msg => msg.role === 'assistant' && typeof msg.content !== 'string')
    .pop()?.content as any;

  // Debug preview URL
  React.useEffect(() => {
    console.log('🔍 ChatLayout - previewUrl changed:', previewUrl);
  }, [previewUrl]);

  return (
    <div ref={containerRef} className="flex h-full bg-background overflow-hidden">
      {/* Left: Chat (messages + widgets + input) */}
      <div
        className="min-w-[360px] border-r border-border flex flex-col h-full"
        style={{ width: `${leftPct}%` }}
      >
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="text-sm font-medium">Chat</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImporter(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatMessages messages={messages} isLoading={isLoading} />
            
            {/* Build Status - show between messages and input */}
            {buildStatus && (
              <BuildStatus 
                status={buildStatus}
                currentFile={currentBuildFile}
                totalFiles={buildFileProgress.total}
                currentFileIndex={buildFileProgress.current}
                installMessage={installMessage}
              />
            )}
            
            <div className="flex-none">
              <ChatInput
                onSend={(content) =>
                  addMessage({ role: "user", content })
                }
                disabled={isLoading || isInitialLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Draggable vertical splitter */}
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={() => setDragging(true)}
        className={`w-[3px] cursor-col-resize bg-border hover:bg-foreground/20 ${dragging ? "bg-foreground/30" : ""}`}
      />

      {/* Right: App area with tabs - NO scrollbar */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 border-b border-border px-4 py-2 flex items-center gap-2">
          <button
            onClick={() => setTab("preview")}
            className={`${
              tab === "preview"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            } px-3 py-1.5 text-sm rounded-md`}
          >
            Preview
          </button>
          <button
            onClick={() => setTab("code")}
            className={`${
              tab === "code"
                ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
            } px-3 py-1.5 text-sm rounded-md`}
          >
            Code
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
            {tab === "preview" ? (
              isInitialLoading ? (
                <div className="h-full flex flex-col items-center justify-center p-4 space-y-8 text-foreground">
                  <TypewriterEffectSmooth 
                    words={[
                      { text: "Building" },
                      { text: "your" },
                      { text: "app..." }
                    ]} 
                    className="text-2xl font-medium" 
                  />
                  <div className="text-sm text-muted-foreground">
                    This may take a moment...
                  </div>
                  <button 
                    onClick={forceCompleteLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Force Complete (Debug)
                  </button>
                </div>
              ) : latestAIResponse?.generatedFiles ? (
                <SimplePreview 
                  files={latestAIResponse.generatedFiles.reduce((acc: any, file: any) => {
                    acc[file.path] = { type: 'file', content: file.content };
                    return acc;
                  }, {})}
                  isStreaming={isLoading}
                  previewUrl={previewUrl}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-4 text-muted-foreground text-center">
                  <div>
                    <h3 className="text-lg font-medium mb-2">No app yet</h3>
                    <p>Send a message to generate an app.</p>
                    {lastError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{lastError}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="h-full">
                {latestAIResponse?.generatedFiles ? (
                  <EmbeddedWorkbench 
                    files={latestAIResponse.generatedFiles.reduce((acc: any, file: any) => {
                      acc[file.path] = { type: 'file', content: file.content };
                      return acc;
                    }, {})}
                    selectedFile={latestAIResponse.generatedFiles[0]?.path}
                    isStreaming={isLoading}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-4 text-muted-foreground text-center">
                    <div>
                      <h3 className="text-lg font-medium mb-2">No code yet</h3>
                      <p>Send a message to generate code for your app.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
      </div>
      
      {/* Project Import Modal */}
      {showImporter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <ProjectImporter 
            onImportComplete={() => setShowImporter(false)}
            onCancel={() => setShowImporter(false)}
          />
        </div>
      )}

      {lastError && (
        <ErrorBubble 
          message={lastError}
          onFixWithAI={(prompt) => addMessage({ role: 'user', content: prompt })}
        />
      )}
    </div>
  );
}