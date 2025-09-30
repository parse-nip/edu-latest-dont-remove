'use client';

import { forwardRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { classNames } from '@/utils/classNames';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (event: React.UIEvent, messageInput?: string) => void;
  onStop: () => void;
  onEnhance: () => void;
  isStreaming?: boolean;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  disabled?: boolean;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ 
    value, 
    onChange, 
    onSend, 
    onStop, 
    onEnhance, 
    isStreaming, 
    enhancingPrompt, 
    promptEnhanced, 
    disabled 
  }, ref) => {
    const [isComposing, setIsComposing] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault();
        onSend(e);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend(e);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            ref={ref}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Describe what you want to build..."
            disabled={disabled}
            className="min-h-[76px] max-h-[200px] resize-none pr-12"
            rows={3}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {isStreaming ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onStop}
                className="h-8 px-3"
              >
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!value.trim() || disabled}
                className="h-8 px-3"
              >
                Send
              </Button>
            )}
          </div>
        </div>
        
        {value.trim() && !promptEnhanced && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEnhance}
              disabled={enhancingPrompt}
              className="h-6 px-2 text-xs"
            >
              {enhancingPrompt ? 'Enhancing...' : '✨ Enhance'}
            </Button>
          </div>
        )}
      </form>
    );
  }
);

ChatInput.displayName = 'ChatInput';
