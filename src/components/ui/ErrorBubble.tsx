'use client';

import { useState } from 'react';
import { AlertCircle, Wand2 } from 'lucide-react';
import { Button } from './button';

interface ErrorBubbleProps {
  message: string;
  details?: string;
  onFixWithAI?: (prompt: string) => void;
}

export function ErrorBubble({ message, details, onFixWithAI }: ErrorBubbleProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  const prompt = `Fix this app error. Error: ${message}${details ? `\nDETAILS:\n${details}` : ''}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border border-destructive/30 bg-destructive/10 text-destructive rounded-lg p-3 backdrop-blur">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium">There was an error</div>
          <div className="text-sm text-foreground/80 mt-0.5 line-clamp-3" title={details || message}>
            {message}
          </div>
          <div className="mt-2 flex gap-2">
            {onFixWithAI && (
              <Button size="sm" variant="secondary" onClick={() => onFixWithAI(prompt)} className="h-8">
                <Wand2 className="h-4 w-4 mr-1" /> Fix with AI
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-8">Dismiss</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


