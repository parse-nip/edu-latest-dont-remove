'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { classNames } from '@/utils/classNames';

export interface EditorDocument {
  value: string;
  isBinary: boolean;
  filePath: string;
  scroll?: ScrollPosition;
}

export interface EditorSettings {
  fontSize?: string;
  gutterFontSize?: string;
  tabSize?: number;
}

export interface ScrollPosition {
  top: number;
  left: number;
}

export interface EditorUpdate {
  selection: any;
  content: string;
}

export type OnChangeCallback = (update: EditorUpdate) => void;
export type OnScrollCallback = (position: ScrollPosition) => void;
export type OnSaveCallback = () => void;

interface Props {
  theme?: 'light' | 'dark';
  id?: unknown;
  doc?: EditorDocument;
  editable?: boolean;
  debounceChange?: number;
  debounceScroll?: number;
  autoFocusOnDocumentChange?: boolean;
  onChange?: OnChangeCallback;
  onScroll?: OnScrollCallback;
  onSave?: OnSaveCallback;
  className?: string;
  settings?: EditorSettings;
}

export const CodeMirrorEditor = memo(({
  theme = 'dark',
  doc,
  editable = true,
  onChange,
  onScroll,
  className,
  settings = {},
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(doc?.value || '');

  useEffect(() => {
    if (doc?.value !== undefined && doc.value !== content) {
      setContent(doc.value);
    }
  }, [doc?.value, content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (onChange) {
      onChange({
        selection: { anchor: e.target.selectionStart, head: e.target.selectionEnd },
        content: newContent,
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (onScroll) {
      onScroll({
        top: e.currentTarget.scrollTop,
        left: e.currentTarget.scrollLeft,
      });
    }
  };

  if (doc?.isBinary) {
    return (
      <div className={classNames('p-4 text-center text-muted-foreground', className)}>
        Binary file - cannot be displayed in editor
      </div>
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      onScroll={handleScroll}
      readOnly={!editable}
      className={classNames(
        'w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed',
        'bg-background text-foreground',
        'p-4',
        className
      )}
      style={{
        fontSize: settings.fontSize || '14px',
        tabSize: settings.tabSize || 2,
      }}
      spellCheck={false}
    />
  );
});

CodeMirrorEditor.displayName = 'CodeMirrorEditor';
