'use client';

import { classNames } from '@/utils/classNames';

interface PanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const PanelHeader = ({ children, className }: PanelHeaderProps) => {
  return (
    <div className={classNames(
      'flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border',
      className
    )}>
      {children}
    </div>
  );
};
