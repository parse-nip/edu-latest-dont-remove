'use client';

import { classNames } from '@/utils/classNames';

interface UserMessageProps {
  message: {
    id: string;
    role: 'user';
    content: string;
  };
}

export const UserMessage = ({ message }: UserMessageProps) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-2">
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};
