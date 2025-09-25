"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { StructuredAIResponse } from "@/hooks/useChat";
import { AIResponse } from "./AIResponse";

export function Message({ role, content }: { role: "user" | "assistant"; content: string | StructuredAIResponse }) {
  const isUser = role === "user";
  if (isUser || typeof content === 'string') {
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted">
              <Bot className="h-4 w-4 text-foreground" />
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`max-w-[95%] px-4 py-2 rounded-lg border border-primary/30 ${
            isUser
              ? "bg-background text-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {typeof content === 'string' ? content : 'Structured content'}
        </div>
        {isUser && (
          <Avatar className="h-8 w-8 order-first">
            <AvatarFallback className="bg-muted">
              <User className="h-4 w-4 text-foreground" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  } else {
    // Render AIResponse for structured assistant messages
    return (
      <div className={`flex justify-start gap-2 border border-border rounded-lg p-2`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted">
            <Bot className="h-4 w-4 text-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="max-w-[95%]">
          <AIResponse 
            files={content.files} 
            explanation={content.explanation} 
            education={content.education} 
          />
        </div>
      </div>
    );
  }
}