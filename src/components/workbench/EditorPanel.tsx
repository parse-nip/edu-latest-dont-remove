'use client';

import { useStore } from '@nanostores/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import {
  CodeMirrorEditor,
  type EditorDocument,
  type EditorSettings,
  type OnChangeCallback as OnEditorChange,
  type OnSaveCallback as OnEditorSave,
  type OnScrollCallback as OnEditorScroll,
} from '@/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '@/components/ui/IconButton';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { PanelHeaderButton } from '@/components/ui/PanelHeaderButton';
import type { FileMap } from '@/lib/stores/files';
import { workbenchStore } from '@/lib/stores/workbench';
import { classNames } from '@/utils/classNames';
import { WORK_DIR } from '@/utils/constants';
import { renderLogger } from '@/utils/logger';
import { FileBreadcrumb } from './FileBreadcrumb';
import { FileTree } from './FileTree';
import { Terminal, type TerminalRef } from './terminal/Terminal';

interface EditorPanelProps {
  files?: FileMap;
  unsavedFiles?: Set<string>;
  editorDocument?: EditorDocument;
  selectedFile?: string | undefined;
  isStreaming?: boolean;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileSelect?: (value?: string) => void;
  onFileSave?: OnEditorSave;
  onFileReset?: () => void;
}

const MAX_TERMINALS = 3;
const DEFAULT_TERMINAL_SIZE = 25;
const DEFAULT_EDITOR_SIZE = 75;

export const EditorPanel = memo(
  ({
    files,
    unsavedFiles,
    editorDocument,
    selectedFile,
    isStreaming,
    onFileSelect,
    onEditorChange,
    onEditorScroll,
    onFileSave,
    onFileReset,
  }: EditorPanelProps) => {
    renderLogger.trace('EditorPanel');

    const showTerminal = useStore(workbenchStore.showTerminal);
    const [terminalCount, setTerminalCount] = useState(1);
    const [activeTerminal, setActiveTerminal] = useState(0);
    const terminalPanelRef = useRef<ImperativePanelHandle>(null);

    const editorSettings: EditorSettings = useMemo(
      () => ({
        fontSize: '14px',
        gutterFontSize: '12px',
        tabSize: 2,
      }),
      [],
    );

    useEffect(() => {
      const { current: terminal } = terminalPanelRef;

      if (!terminal) {
        return;
      }

      const isCollapsed = terminal.isCollapsed();

      if (!showTerminal && !isCollapsed) {
        terminal.collapse();
      } else if (showTerminal && isCollapsed) {
        terminal.resize(DEFAULT_TERMINAL_SIZE);
      }
    }, [showTerminal]);

    const addTerminal = () => {
      if (terminalCount < MAX_TERMINALS) {
        setTerminalCount(terminalCount + 1);
        setActiveTerminal(terminalCount);
      }
    };

    return (
      <PanelGroup direction="vertical">
        <Panel defaultSize={showTerminal ? DEFAULT_EDITOR_SIZE : 100} minSize={20}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={20} minSize={10} collapsible>
              <div className="flex flex-col border-r border-border h-full">
                <PanelHeader>
                  <div className="i-ph:tree-structure-duotone shrink-0" />
                  Files
                </PanelHeader>
                <FileTree
                  className="h-full"
                  files={files}
                  hideRoot
                  unsavedFiles={unsavedFiles}
                  rootFolder={WORK_DIR}
                  selectedFile={selectedFile}
                  onFileSelect={onFileSelect}
                />
              </div>
            </Panel>
            <PanelResizeHandle />
            <Panel className="flex flex-col">
              <div className="flex items-center px-3 py-2 border-b border-border">
                <FileBreadcrumb
                  filePath={selectedFile}
                  onFileSelect={onFileSelect}
                />
                <div className="ml-auto flex items-center gap-1">
                  {onFileSave && (
                    <PanelHeaderButton onClick={onFileSave}>
                      Save
                    </PanelHeaderButton>
                  )}
                  {onFileReset && (
                    <PanelHeaderButton onClick={onFileReset}>
                      Reset
                    </PanelHeaderButton>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeMirrorEditor
                  doc={editorDocument}
                  editable={!isStreaming}
                  onChange={onEditorChange}
                  onScroll={onEditorScroll}
                  className="h-full"
                  settings={editorSettings}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        {showTerminal && (
          <>
            <PanelResizeHandle />
            <Panel
              ref={terminalPanelRef}
              defaultSize={DEFAULT_TERMINAL_SIZE}
              minSize={15}
              collapsible
            >
              <Terminal
                onTerminalResize={(cols, rows) => {
                  workbenchStore.onTerminalResize(cols, rows);
                }}
              />
            </Panel>
          </>
        )}
      </PanelGroup>
    );
  }
);

EditorPanel.displayName = 'EditorPanel';
