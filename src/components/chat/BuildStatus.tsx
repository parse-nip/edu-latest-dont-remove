'use client';

import { useEffect, useState } from 'react';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Loader2, Package, Play, FileCode, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BuildStatusProps {
  status: 'writing' | 'installing' | 'starting' | 'ready' | null;
  currentFile?: string;
  totalFiles?: number;
  currentFileIndex?: number;
  installMessage?: string;
}

export function BuildStatus({ status, currentFile, totalFiles, currentFileIndex, installMessage }: BuildStatusProps) {
  const [installProgress, setInstallProgress] = useState(0);

  // Simulate installation progress
  useEffect(() => {
    if (status === 'installing') {
      setInstallProgress(0);
      const interval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      
      return () => clearInterval(interval);
    } else if (status === 'starting') {
      setInstallProgress(95);
    } else if (status === 'ready') {
      setInstallProgress(100);
    }
  }, [status]);

  if (!status) return null;

  const getStatusInfo = () => {
    switch (status) {
      case 'writing':
        return {
          icon: <FileCode className="h-4 w-4" />,
          text: currentFile 
            ? `Writing file ${currentFileIndex}/${totalFiles}: ${currentFile}`
            : 'Writing files...',
          color: 'text-blue-600',
          progress: totalFiles ? (currentFileIndex || 0) / totalFiles * 100 : 0,
          showProgress: true
        };
      case 'installing':
        return {
          icon: <Package className="h-4 w-4 animate-pulse" />,
          text: installMessage || 'Installing dependencies...',
          color: 'text-purple-600',
          progress: installProgress,
          showProgress: false  // Don't show fake progress, show real messages
        };
      case 'starting':
        return {
          icon: <Play className="h-4 w-4 animate-pulse" />,
          text: installMessage || 'Starting dev server...',
          color: 'text-green-600',
          progress: installProgress,
          showProgress: false  // Don't show fake progress
        };
      case 'ready':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'App is ready!',
          color: 'text-green-600',
          progress: 100,
          showProgress: false
        };
      default:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Building...',
          color: 'text-gray-600',
          progress: 0,
          showProgress: false
        };
    }
  };

  const { icon, text, color, progress, showProgress } = getStatusInfo();

  return (
    <div className="flex flex-col gap-2 px-4 py-3 bg-muted/30 border-y border-border">
      <div className="flex items-center gap-3">
        <div className={color}>
          {icon}
        </div>
        <TextShimmer className={`text-sm ${color} flex-1`} duration={2}>
          {text}
        </TextShimmer>
        {showProgress && (
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      {showProgress && (
        <Progress value={progress} className="h-1" />
      )}
    </div>
  );
}
