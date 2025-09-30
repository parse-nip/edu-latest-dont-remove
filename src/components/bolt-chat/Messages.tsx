'use client';

import { forwardRef, useEffect } from 'react';
import { classNames } from '@/utils/classNames';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';

interface MessagesProps {
  messages: any[];
  isStreaming?: boolean;
  className?: string;
}

export const Messages = forwardRef<HTMLDivElement, MessagesProps>(
  ({ messages, isStreaming, className }, ref) => {
    useEffect(() => {
      // Auto-scroll to bottom when new messages arrive
      if (ref && 'current' in ref && ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, [messages, ref]);

    return (
      <div
        ref={ref}
        className={classNames('overflow-y-auto', className)}
      >
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            {message.role === 'user' ? (
              <UserMessage message={message} />
            ) : (
              <AssistantMessage 
                message={message} 
                isStreaming={isStreaming && message === messages[messages.length - 1]} 
              />
            )}
          </div>
        ))}
      </div>
    );
  }
);

Messages.displayName = 'Messages';
