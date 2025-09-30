'use client';

import { Button } from '@/components/ui/button';
import { classNames } from '@/utils/classNames';

export interface SliderOption<T> {
  value: T;
  text: string;
}

export interface SliderOptions<T> {
  left: SliderOption<T>;
  right: SliderOption<T>;
}

interface SliderProps<T> {
  selected: T;
  options: SliderOptions<T>;
  setSelected: (value: T) => void;
}

export const Slider = <T,>({ selected, options, setSelected }: SliderProps<T>) => {
  return (
    <div className="flex items-center bg-muted rounded-md p-1">
      <Button
        variant={selected === options.left.value ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setSelected(options.left.value)}
        className={classNames(
          'h-6 px-2 text-xs font-medium transition-all',
          selected === options.left.value
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {options.left.text}
      </Button>
      <Button
        variant={selected === options.right.value ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setSelected(options.right.value)}
        className={classNames(
          'h-6 px-2 text-xs font-medium transition-all',
          selected === options.right.value
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {options.right.text}
      </Button>
    </div>
  );
};
