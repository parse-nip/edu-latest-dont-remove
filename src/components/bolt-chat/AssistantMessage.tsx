'use client';

import { classNames } from '@/utils/classNames';

interface AssistantMessageProps {
  message: {
    id: string;
    role: 'assistant';
    content: string;
  };
  isStreaming?: boolean;
}

export const AssistantMessage = ({ message, isStreaming }: AssistantMessageProps) => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] bg-muted rounded-lg px-4 py-2">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            AI
          </div>
          <div className="flex-1">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {isStreaming && (
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse delay-100" />
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse delay-200" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
