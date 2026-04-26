import React from 'react';
import { Loader2, FileText } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute h-24 w-24 rounded-full border-4 border-primary/20" />
        <div className="absolute h-24 w-24 rounded-full border-t-4 border-primary animate-spin" />
        
        {/* Inner pulsing logo */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
          <FileText className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Open Resume Builder
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating your workspace...</span>
        </div>
      </div>
      
      {/* Decorative dots */}
      <div className="mt-12 flex gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" />
      </div>
    </div>
  );
}
