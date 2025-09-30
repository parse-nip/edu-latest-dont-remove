'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '@/lib/stores/workbench';
import { classNames } from '@/utils/classNames';
import { Messages } from './Messages';
import { ChatInput } from './ChatInput';
import { Workbench } from '../workbench/Workbench';

interface BoltChatProps {
  className?: string;
}

const EXAMPLE_PROMPTS = [
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
  { text: 'Make a space invaders game' },
  { text: 'How do I center a div?' },
];

export const BoltChat = ({ className }: BoltChatProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [promptEnhanced, setPromptEnhanced] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const showWorkbench = useStore(workbenchStore.showWorkbench);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async (event: React.UIEvent, messageInput?: string) => {
    const message = messageInput || input;
    if (!message.trim() || isStreaming) return;

    setChatStarted(true);
    setInput('');
    setIsStreaming(true);

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
    };
    setMessages(prev => [...prev, userMessage]);

    // Show workbench
    workbenchStore.setShowWorkbench(true);

    try {
      // Simulate AI response for now
      // In a real implementation, this would call your AI API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `I'll help you build: "${message}". Let me create the necessary files and structure for your project.`,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    setIsStreaming(false);
  };

  const enhancePrompt = async () => {
    if (!input.trim() || enhancingPrompt) return;
    
    setEnhancingPrompt(true);
    try {
      // Simulate prompt enhancement
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInput(prev => prev + ' with modern UI and best practices');
      setPromptEnhanced(true);
    } finally {
      setEnhancingPrompt(false);
    }
  };

  return (
    <div className={classNames('relative flex h-full w-full overflow-hidden', className)}>
      <div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
        <div className="flex flex-col flex-grow min-w-[400px] h-full">
          {!chatStarted && (
            <div className="mt-[26vh] max-w-2xl mx-auto px-6">
              <h1 className="text-5xl text-center font-bold text-foreground mb-2">
                Where ideas begin
              </h1>
              <p className="mb-8 text-center text-muted-foreground">
                Bring ideas to life in seconds or get help on existing projects.
              </p>
              
              <div className="grid gap-3 max-w-xl mx-auto">
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(prompt.text);
                      sendMessage({} as React.UIEvent, prompt.text);
                    }}
                    className="p-3 text-left text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className={classNames('pt-6 px-6', {
            'h-full flex flex-col': chatStarted,
          })}>
            {chatStarted && (
              <Messages
                ref={messageRef}
                className="flex flex-col w-full flex-1 max-w-2xl px-4 pb-6 mx-auto"
                messages={messages}
                isStreaming={isStreaming}
              />
            )}
            
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
              <ChatInput
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onSend={sendMessage}
                onStop={handleStop}
                onEnhance={enhancePrompt}
                isStreaming={isStreaming}
                enhancingPrompt={enhancingPrompt}
                promptEnhanced={promptEnhanced}
                disabled={isStreaming}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />
    </div>
  );
};
