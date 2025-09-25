"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterProps {
  text: string;
  className?: string;
  delay?: number;
  cursor?: boolean;
}

export function Typewriter({
  text,
  className,
  delay = 100,
  cursor = true,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <span>{displayedText}</span>
      {cursor && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
}