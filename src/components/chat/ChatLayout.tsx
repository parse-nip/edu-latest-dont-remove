"use client";

import React from "react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

interface ChatLayoutProps {
  initialPrompt?: string;
  children?: ReactNode;
}

export function ChatLayout({ initialPrompt, children }: { initialPrompt?: string; children?: ReactNode }) {
  const { messages, addMessage, isLoading, isInitialLoading } = useChat(initialPrompt);
  const router = useRouter();

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

  return (
    <div ref={containerRef} className="flex h-full bg-background overflow-hidden">
      {/* Left: Chat (messages + widgets + input) */}
      <div
        className="min-w-[360px] border-r border-border flex flex-col h-full"
        style={{ width: `${leftPct}%` }}
      >
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatMessages messages={messages} isLoading={isLoading} />
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

      {/* Draggable vertical splitter */}
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={() => setDragging(true)}
        className={`w-[3px] cursor-col-resize bg-border hover:bg-foreground/20 ${dragging ? "bg-foreground/30" : ""}`}
      />

      {/* Right: App area with tabs and info panel */}
      <div className="flex-1 h-full">
        <div className="h-full flex flex-col overflow-hidden">
          <div className="border-b border-border px-4 py-2 flex items-center gap-2">
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

          <div className="flex-1 overflow-auto p-6">
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
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-4 text-muted-foreground text-center">
                  Preview of your app will appear here. Connect to AI to generate content.
                </div>
              )
            ) : (
              <pre className="text-sm font-mono bg-muted/50 border border-border rounded-md p-4 overflow-auto h-full">{`// Example code view
export function ExampleComponent() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold">Hello from Code View</h1>
      <p className="text-sm text-muted-foreground">Swap tabs to see the preview again.</p>
    </div>
  );
}
`}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}