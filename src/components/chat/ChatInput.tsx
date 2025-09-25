"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export function ChatInput({ onSend, disabled = false }: { onSend: (content: string) => void; disabled?: boolean }) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSubmitting && !disabled) {
      setIsSubmitting(true);
      onSend(input);
      setInput("");
      // Reset after a short delay to allow the message to process
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isSubmitting && !disabled) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-4 bg-background">
      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Processing..." : "Type your message..."}
          className="min-h-[44px] pr-10 resize-none"
          rows={1}
          disabled={isSubmitting || disabled}
        />
        <Button
          type="submit"
          size="sm"
          className="absolute bottom-3 right-3 h-6 w-6 p-0"
          disabled={!input.trim() || isSubmitting || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}