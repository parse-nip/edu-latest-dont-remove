'use client';

import { Button } from '@/components/ui/button';
import { classNames } from '@/utils/classNames';

interface FileBreadcrumbProps {
  filePath?: string;
  onFileSelect?: (filePath: string) => void;
}

export const FileBreadcrumb = ({ filePath, onFileSelect }: FileBreadcrumbProps) => {
  if (!filePath) {
    return (
      <div className="text-sm text-muted-foreground">
        No file selected
      </div>
    );
  }

  const segments = filePath.split('/').filter(Boolean);
  const fileName = segments[segments.length - 1];

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-muted-foreground">📁</span>
      <span className="text-muted-foreground">/</span>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const path = '/' + segments.slice(0, index + 1).join('/');
        
        return (
          <div key={index} className="flex items-center gap-1">
            {isLast ? (
              <span className="font-medium text-foreground">{segment}</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileSelect?.(path)}
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                {segment}
              </Button>
            )}
            {!isLast && <span className="text-muted-foreground">/</span>}
          </div>
        );
      })}
    </div>
  );
};
