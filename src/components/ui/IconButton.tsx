'use client';

import { Button } from '@/components/ui/button';
import { classNames } from '@/utils/classNames';

interface IconButtonProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const IconButton = ({ icon, size = 'md', className, onClick, children }: IconButtonProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
    xl: 'h-12 w-12 text-lg',
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={classNames(
        'p-0 hover:bg-muted',
        sizeClasses[size],
        className
      )}
    >
      <div className={classNames(icon, 'w-full h-full flex items-center justify-center')} />
      {children}
    </Button>
  );
};
