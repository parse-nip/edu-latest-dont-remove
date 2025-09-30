'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { classNames } from '@/utils/classNames';
import type { FileMap } from '@/lib/stores/files';

interface FileTreeProps {
  files?: FileMap;
  hideRoot?: boolean;
  unsavedFiles?: Set<string>;
  rootFolder?: string;
  selectedFile?: string;
  onFileSelect?: (filePath: string) => void;
  className?: string;
}

interface FileNode {
  kind: 'file' | 'folder';
  name: string;
  fullPath: string;
  depth: number;
  id: number;
}

export const FileTree = ({
  files = {},
  hideRoot = false,
  unsavedFiles = new Set(),
  rootFolder = '/',
  selectedFile,
  onFileSelect,
  className,
}: FileTreeProps) => {
  const fileList = useMemo(() => {
    return buildFileList(files, rootFolder, hideRoot, ['.git', 'node_modules']);
  }, [files, rootFolder, hideRoot]);

  return (
    <div className={classNames('overflow-auto', className)}>
      {fileList.map((node) => (
        <div
          key={node.id}
          className={classNames(
            'flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-muted/50',
            {
              'bg-muted': selectedFile === node.fullPath,
            }
          )}
          style={{ paddingLeft: `${node.depth * 12 + 8}px` }}
          onClick={() => {
            if (node.kind === 'file') {
              onFileSelect?.(node.fullPath);
            }
          }}
        >
          <span className="text-muted-foreground">
            {node.kind === 'folder' ? '📁' : '📄'}
          </span>
          <span className={classNames(
            'truncate',
            {
              'text-foreground': selectedFile === node.fullPath,
              'text-muted-foreground': selectedFile !== node.fullPath,
            }
          )}>
            {node.name}
          </span>
          {unsavedFiles.has(node.fullPath) && (
            <span className="text-orange-500 text-xs">●</span>
          )}
        </div>
      ))}
    </div>
  );
};

function buildFileList(
  files: FileMap,
  rootFolder = '/',
  hideRoot: boolean,
  hiddenFiles: Array<string | RegExp>,
): FileNode[] {
  const folderPaths = new Set<string>();
  const fileList: FileNode[] = [];

  let defaultDepth = 0;

  if (rootFolder === '/' && !hideRoot) {
    defaultDepth = 1;
    fileList.push({ kind: 'folder', name: '/', depth: 0, id: 0, fullPath: '/' });
  }

  for (const [filePath, dirent] of Object.entries(files)) {
    const segments = filePath.split('/').filter((segment) => segment);
    const fileName = segments.at(-1);

    if (!fileName || isHiddenFile(filePath, fileName, hiddenFiles)) {
      continue;
    }

    let currentPath = '';

    let i = 0;
    let depth = 0;

    while (i < segments.length) {
      const name = segments[i];
      const fullPath = (currentPath += `/${name}`);

      if (!fullPath.startsWith(rootFolder) || (hideRoot && fullPath === rootFolder)) {
        i++;
        continue;
      }

      if (i === segments.length - 1 && dirent?.type === 'file') {
        fileList.push({
          kind: 'file',
          id: fileList.length,
          name,
          fullPath,
          depth: depth + defaultDepth,
        });
      } else if (!folderPaths.has(fullPath)) {
        folderPaths.add(fullPath);

        fileList.push({
          kind: 'folder',
          id: fileList.length,
          name,
          fullPath,
          depth: depth + defaultDepth,
        });
      }

      i++;
      depth++;
    }
  }

  return sortFileList(rootFolder, fileList, hideRoot);
}

function isHiddenFile(filePath: string, fileName: string, hiddenFiles: Array<string | RegExp>) {
  return hiddenFiles.some((pattern) => {
    if (typeof pattern === 'string') {
      return fileName === pattern || filePath.includes(pattern);
    }
    return pattern.test(fileName) || pattern.test(filePath);
  });
}

function sortFileList(rootFolder: string, fileList: FileNode[], hideRoot: boolean) {
  return fileList.sort((a, b) => {
    // Folders first
    if (a.kind !== b.kind) {
      return a.kind === 'folder' ? -1 : 1;
    }

    // Then alphabetically
    return a.name.localeCompare(b.name);
  });
}
