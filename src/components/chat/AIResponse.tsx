"use client";

import React, { useMemo } from "react";
import FileChangeChecklist from "./FileChangeChecklist";

interface AIResponseProps {
  files: string[];
  explanation: string;
  education: string;
}

export function AIResponse({ files, explanation, education }: AIResponseProps) {
  const fileChangeItems = useMemo(() => files.map((path, index) => ({
    id: index.toString(),
    filename: path.split('/').pop() || 'file',
    path,
    status: 'pending' as const,
    type: 'modified' as const
  })), [files]);

  return (
    <div className="space-y-4 w-full">
      {/* Explanation */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Explanation:</p>
        <p className="text-sm">{explanation}</p>
      </div>

      {/* Sequential file changes under the explanation - inline, no outer card */}
      {files.length > 0 && (
        <FileChangeChecklist 
          files={fileChangeItems}
          autoPlay={true}
          interval={800}
        />
      )}

      {/* Education note */}
      {education && (
        <div className="bg-accent/10 p-3 rounded-md border border-accent/20">
          <p className="text-xs text-accent-foreground italic">{education}</p>
        </div>
      )}
    </div>
  );
}