'use client';

import { useStore } from '@nanostores/react';
import { memo } from 'react';
import { workbenchStore } from '@/lib/stores/workbench';
import { classNames } from '@/utils/classNames';

export const Preview = memo(() => {
  const previews = useStore(workbenchStore.previews);

  if (previews.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
          <p className="text-sm">
            Start building your app to see the preview here.
          </p>
        </div>
      </div>
    );
  }

  const activePreview = previews[0];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
        <span className="text-xs font-medium text-muted-foreground">
          Preview
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className={classNames(
            'w-2 h-2 rounded-full',
            activePreview.ready ? 'bg-green-500' : 'bg-yellow-500'
          )} />
          <span className="text-xs text-muted-foreground">
            Port {activePreview.port}
          </span>
        </div>
      </div>
      <div className="flex-1">
        {activePreview.ready ? (
          <iframe
            src={activePreview.baseUrl}
            className="w-full h-full border-0"
            title="App Preview"
          />
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm">Starting preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';
