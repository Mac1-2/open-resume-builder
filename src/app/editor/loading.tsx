import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function EditorLoading() {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header Skeleton */}
      <header className="flex items-center justify-between border-b px-4 py-3 h-[60px]">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24 rounded-md hidden sm:block" />
          <Skeleton className="h-4 w-20 rounded-md hidden sm:block" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-64 sm:w-72 border-r flex flex-col p-4 gap-4 hidden md:flex">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 mb-4" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="mt-auto space-y-2">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 flex flex-col bg-muted/5">
          <div className="px-8 py-6 border-b flex justify-between items-center bg-white">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <div className="flex-1 p-8 overflow-hidden">
            <div className="mx-auto max-w-4xl h-full">
              <Skeleton className="w-full h-full rounded-xl shadow-sm" />
            </div>
          </div>
        </main>

        {/* Right Panel Skeleton */}
        <aside className="w-[380px] sm:w-[540px] border-l flex flex-col hidden lg:flex">
          <div className="p-4 border-b flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-5 rounded-md" />
          </div>
          <div className="p-4 border-b">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="w-full h-full rounded-lg shadow-lg" />
          </div>
        </aside>
      </div>

      {/* Full screen overlay for initial generation */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-t-4 border-primary animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium animate-pulse">Initializing Editor...</p>
      </div>
    </div>
  );
}
