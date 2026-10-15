import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div
      id="app-loading-skeleton"
      className="min-h-screen bg-[#09090B] text-[#F4F3EF] flex flex-col font-sans animate-pulse"
      aria-label="Loading Alpha Collectiv3..."
    >
      <header className="sticky top-0 z-40 bg-[#09090B] border-b border-white/[0.07] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#141418] border border-white/[0.08]" />
            <div className="h-4 w-36 bg-[#141418] rounded-sm" />
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="h-3 w-16 bg-[#141418] rounded-sm" />
            <div className="h-3 w-16 bg-[#141418] rounded-sm" />
            <div className="h-3 w-16 bg-[#141418] rounded-sm" />
            <div className="h-8 w-28 bg-[#F4F3EF]/20 rounded-lg" />
          </div>

          <div className="md:hidden w-8 h-8 bg-[#141418] rounded-lg" />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#141418] mb-8" />
        <div className="h-4 w-48 bg-[#141418] rounded-sm mb-6" />
        <div className="h-16 sm:h-20 w-2/3 bg-[#141418] rounded-lg mb-6" />
        <div className="h-4 w-1/2 bg-[#141418] rounded-sm mb-10" />
        <div className="flex gap-4">
          <div className="h-11 w-40 bg-[#F4F3EF]/20 rounded-lg" />
          <div className="h-11 w-40 bg-[#141418] border border-white/[0.08] rounded-lg" />
        </div>
      </main>
    </div>
  );
};
