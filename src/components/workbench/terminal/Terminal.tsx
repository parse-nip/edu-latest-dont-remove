'use client';

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { workbenchStore } from '@/lib/stores/workbench';
import type { ITerminal } from '@/types/terminal';

export interface TerminalRef {
  isCollapsed: () => boolean;
  resize: (size: number) => void;
  collapse: () => void;
}

export interface TerminalProps {
  onTerminalResize?: (cols: number, rows: number) => void;
}

export const Terminal = ({ onTerminalResize }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Create terminal interface for workbench
    const terminalInterface: ITerminal = {
      get cols() {
        return terminal.cols;
      },
      get rows() {
        return terminal.rows;
      },
      reset: () => {
        terminal.reset();
      },
      write: (data: string) => {
        terminal.write(data);
      },
      onData: (cb: (data: string) => void) => {
        terminal.onData(cb);
      },
    };

    // Attach terminal to workbench
    workbenchStore.attachTerminal(terminalInterface);

    // Handle resize
    const handleResize = () => {
      if (fitAddon) {
        fitAddon.fit();
        onTerminalResize?.(terminal.cols, terminal.rows);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [onTerminalResize]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
        <span className="text-xs font-medium text-muted-foreground">Terminal</span>
      </div>
      <div ref={terminalRef} className="flex-1" />
    </div>
  );
};
