'use client';

import { Button } from '@/components/ui/button';
import { classNames } from '@/utils/classNames';

interface PanelHeaderButtonProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export const PanelHeaderButton = ({ className, onClick, children }: PanelHeaderButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={classNames(
        'h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </Button>
  );
};
