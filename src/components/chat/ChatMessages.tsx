"use client";

import React from "react";
import { Message } from "./Message";
import { TextShimmer } from "@/components/ui/text-shimmer";

export function ChatMessages({ messages, isLoading }: { messages: Message[]; isLoading?: boolean }) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    if (autoScroll) {
      viewport.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, autoScroll]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <p className="text-lg font-medium">No messages yet</p>
        <p className="text-sm">Start a conversation by sending a message.</p>
      </div>
    );
  }

  return (
    <div 
      ref={viewportRef} 
      className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent" 
      style={{ 
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      <div className="p-4 space-y-6 pb-20">
        {messages.map((msg, index) => (
          <Message key={msg.id || index} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[95%] space-y-4">
              <TextShimmer className="text-sm">Processing your request...</TextShimmer>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}