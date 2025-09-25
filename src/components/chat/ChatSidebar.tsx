"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

interface ChatSidebarProps {
  conversations: Array<{ id: string; title: string }>;
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

export function ChatSidebar({ 
  conversations, 
  currentConversationId, 
  onNewChat,
  onSelectConversation
}: ChatSidebarProps) {
  return (
    <div className="w-80 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <Button 
          onClick={onNewChat} 
          className="w-full justify-start gap-2"
          variant="secondary"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conv) => (
            <Button
              key={conv.id}
              variant={currentConversationId === conv.id ? "secondary" : "ghost"}
              className="w-full justify-start h-12"
              onClick={() => onSelectConversation(conv.id)}
            >
              {conv.title}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}