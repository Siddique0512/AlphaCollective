import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpRight,
  Ticket,
  TrendingUp,
  Gamepad2,
  Gift,
  Sparkles,
  CheckCircle2,
  Flame,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Trophy,
  Radio,
  Activity,
  Zap,
  Users
} from 'lucide-react';
import { COMMUNITY_WINS_DATA, OFFICIAL_LINKS } from '../content/ecosystem';
import { CommunityWin } from '../types';
import { PillarDetailModal, PillarType } from './PillarDetailModal';
import { useDiscordSync } from '../hooks/useDiscordSync';
import { useTesseraRaffles } from '../hooks/useTesseraRaffles';
import { useDiscordAirdrops } from '../hooks/useDiscordAirdrops';
import { useDiscordTrends } from '../hooks/useDiscordTrends';

interface WhatWeDoProps {
  openRafflesSignal?: number;
}

export const WhatWeDo: React.FC<WhatWeDoProps> = ({
  openRafflesSignal = 0,
}) => {
  const discord = useDiscordSync(OFFICIAL_LINKS.discordGuildId, OFFICIAL_LINKS.discordInvitePlaceholder);
  const tessera = useTesseraRaffles();
  const airdropData = useDiscordAirdrops();
  const trendsData = useDiscordTrends();
  const [activeScreenshotWin, setActiveScreenshotWin] = useState<CommunityWin | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activePillarModal, setActivePillarModal] = useState<PillarType | null>(null);

  useEffect(() => {
    if (openRafflesSignal > 0) {
      setActivePillarModal('raffles');
    }
  }, [openRafflesSignal]);
  const handlePrevScreenshot = useCallback(() => {
    if (!activeScreenshotWin) return;
    const currentIndex = COMMUNITY_WINS_DATA.findIndex((w) => w.id === activeScreenshotWin.id);
    const prevIndex = (currentIndex - 1 + COMMUNITY_WINS_DATA.length) % COMMUNITY_WINS_DATA.length;
    setActiveScreenshotWin(COMMUNITY_WINS_DATA[prevIndex]);
    setZoomLevel(1);
  }, [activeScreenshotWin]);

  const handleNextScreenshot = useCallback(() => {
    if (!activeScreenshotWin) return;
    const currentIndex = COMMUNITY_WINS_DATA.findIndex((w) => w.id === activeScreenshotWin.id);
    const nextIndex = (currentIndex + 1) % COMMUNITY_WINS_DATA.length;
    setActiveScreenshotWin(COMMUNITY_WINS_DATA[nextIndex]);
    setZoomLevel(1);
  }, [activeScreenshotWin]);

  // Keyboard controls for 4K lightbox
  useEffect(() => {
    if (!activeScreenshotWin) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveScreenshotWin(null);
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft') {
        handlePrevScreenshot();
      } else if (e.key === 'ArrowRight') {
        handleNextScreenshot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreenshotWin, handlePrevScreenshot, handleNextScreenshot]);

  return (
    <section
      id="what-we-do-section"
      className="bg-[#0B0B0C] text-[#F5F5F3] py-24 sm:py-32 border-b border-[#29292B] relative select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold text-white uppercase tracking-tight">
              WHAT WE <span className="text-[#A8A8A5] font-light">DO</span>
            </h2>
          </div>
        </div>

        {/* 4 Large Enhanced Interactive Experience Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-24">
          
          {/* ============================================================== */}
          {/* PILLAR 1: RAFFLES                                              */}
          {/* ============================================================== */}
          <div
            id="pillar-card-raffles"
            onClick={() => setActivePillarModal('raffles')}
            className="group relative bg-[#141416] border border-[#26262B] hover:border-[#10B981]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[460px] transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(16,185,129,0.12)] cursor-pointer overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            
            {/* Large Watermark Number */}
            <div className="absolute -bottom-6 -right-4 font-sans font-bold text-8xl sm:text-9xl text-[#1A1A1E] select-none pointer-events-none group-hover:text-[#1F2321] transition-colors duration-300">
              01
            </div>

            {/* Top Row: Identifier, Status & Badge */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-mono font-medium text-[#888885] tracking-wider uppercase">
                01 / RAFFLES
              </span>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/25 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  {tessera.stats.activeCount} LIVE ON DISCORD
                </span>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0B0C] border border-[#29292B] text-[10px] font-sans font-medium text-[#A8A8A5] uppercase tracking-wider">
                  <Ticket className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>TESSERA</span>
                </div>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1.5 relative z-10 mt-5">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl sm:text-3xl font-sans font-bold text-white uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">
                  RAFFLES
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#34D399] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                  500+ DRAWN
                </span>
              </div>
              <p className="text-sm sm:text-base font-sans font-medium text-[#C8C8C5] tracking-wide">
                Good projects. Good people.
              </p>
              <p className="text-xs font-sans text-[#888885] leading-relaxed">
                Live Discord allowlist raffles powered by <span className="text-[#F5F5F3] font-medium">Tessera</span> alongside <span className="text-[#F5F5F3] font-medium">500+ verified draws</span> and daily flash-giveaways.
              </p>
            </div>

            {/* Dynamic Live Tessera Micro-Widget */}
            <div className="bg-[#0B0B0C] border border-[#1F1F24] rounded-xl p-3.5 my-4 space-y-2.5 relative z-10 group-hover:border-[#10B981]/30 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1A1A1F] pb-2">
                <span className="text-white font-semibold flex items-center gap-1.5 truncate pr-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span className="truncate">
                    {tessera.activeRaffles.length > 0
                      ? `Active: ${tessera.activeRaffles.map((r) => r.title).join(' & ')}`
                      : 'Tessera Discord Raffles Synced'}
                  </span>
                </span>
                <span className="text-[10px] text-[#34D399] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20 shrink-0">
                  TESSERA LIVE
                </span>
              </div>

              {/* Active Raffles Preview Rows */}
              {tessera.activeRaffles.length > 0 ? (
                <div className="space-y-1.5">
                  {tessera.activeRaffles.slice(0, 2).map((r) => (
                    <div
                      key={r.raffleId}
                      className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded bg-[#141416] border border-[#222226] text-[10px] font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={r.image}
                          alt={r.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg';
                          }}
                          className="w-5 h-5 rounded object-cover border border-[#2C2C32] shrink-0"
                        />
                        <span className="text-white font-bold truncate">{r.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[#34D399] font-bold">{r.winnerCount} WL</span>
                        <span className="text-[#888885]">•</span>
                        <span className="text-[#A8A8A5]">{r.entryCount} Entries</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] font-mono py-1 px-1.5 rounded bg-[#141416] border border-[#222226]">
                  <div>
                    <span className="text-[#888885] text-[9px] block">TOTAL RAFFLES</span>
                    <span className="text-[#34D399] font-bold">500+ Raffles</span>
                  </div>
                  <div>
                    <span className="text-[#888885] text-[9px] block">FLASH DROPS</span>
                    <span className="text-[#F59E0B] font-bold">Daily Discord</span>
                  </div>
                </div>
              )}

              {/* 3 Live Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 rounded bg-[#141416] border border-[#222226]">
                  <span className="text-[#888885] text-[9px] block">ACTIVE NOW</span>
                  <span className="text-[#34D399] font-bold">
                    {tessera.stats.activeCount} {tessera.stats.activeCount === 1 ? 'Raffle' : 'Raffles'}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#141416] border border-[#222226]">
                  <span className="text-[#888885] text-[9px] block">LIVE SLOTS</span>
                  <span className="text-white font-bold">{tessera.stats.totalActiveWinners} Winners</span>
                </div>
                <div className="p-2 rounded bg-[#141416] border border-[#222226]">
                  <span className="text-[#888885] text-[9px] block">ENTRANTS</span>
                  <span className="text-[#38BDF8] font-bold">{tessera.stats.totalActiveEntries} Joined</span>
                </div>
              </div>

              {/* Interactive Modal Trigger */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#888885]">
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  <span>Synced with Discord & Tessera</span>
                </div>
                <span className="px-2 py-1 rounded bg-[#1A1A1E] text-[10px] font-mono text-[#34D399] font-semibold border border-[#26262B] group-hover:bg-[#10B981] group-hover:text-black transition-colors flex items-center gap-1">
                  <Ticket className="w-3 h-3" />
                  ACTIVE RAFFLES
                </span>
              </div>
            </div>

            {/* Bottom Status Line */}
            <div className="pt-3 border-t border-[#222225] flex items-center justify-between relative z-10 text-[11px] font-sans font-medium text-[#777775]">
              <span>ALPHA COLLECTIV3 × TESSERA</span>
              <span className="group-hover:text-white transition-colors flex items-center gap-1 font-mono">
                VIEW ACTIVE RAFFLES <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PILLAR 2: AIRDROPS                                             */}
          {/* ============================================================== */}
          <div
            id="pillar-card-airdrops"
            onClick={() => setActivePillarModal('airdrops')}
            className="group relative bg-[#141416] border border-[#26262B] hover:border-[#38BDF8]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[460px] transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(56,189,248,0.12)] cursor-pointer overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08)_0%,transparent_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            
            {/* Large Watermark Number */}
            <div className="absolute -bottom-6 -right-4 font-sans font-bold text-8xl sm:text-9xl text-[#1A1A1E] select-none pointer-events-none group-hover:text-[#18232E] transition-colors duration-300">
              02
            </div>

            {/* Top Row: Identifier, Status & Badge */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-mono font-medium text-[#888885] tracking-wider uppercase">
                02 / AIRDROPS
              </span>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/25 text-[10px] font-mono">
                  <Sparkles className="w-3 h-3 text-[#38BDF8] animate-pulse" />
                  +{airdropData.airdrops.length} ACTIVE INTEL
                </span>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0B0C] border border-[#29292B] text-[10px] font-sans font-medium text-[#A8A8A5] uppercase tracking-wider">
                  <Gift className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>HUNTER FEED</span>
                </div>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1.5 relative z-10 mt-5">
              <h3 className="text-2xl sm:text-3xl font-sans font-bold text-white uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">
                AIRDROPS
              </h3>
              <p className="text-sm sm:text-base font-sans font-medium text-[#C8C8C5] tracking-wide">
                Never miss a generational allocation.
              </p>
              <p className="text-xs font-sans text-[#888885] leading-relaxed">
                Curated testnets, volume farming, node setups, and verified checklists sourced directly from Discord and led by Finisher.
              </p>
            </div>

            {/* Dynamic Interactive Micro-Widget */}
            <div className="bg-[#0B0B0C] border border-[#1F1F24] rounded-xl p-3.5 my-4 space-y-2.5 relative z-10 group-hover:border-[#38BDF8]/30 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1A1A1F] pb-2">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Discord Feed: #{airdropData.channel.channelName.replace('#', '')}
                </span>
                <span className="text-[10px] text-[#34D399] flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SYNCED LIVE
                </span>
              </div>

              {/* 2 Live Airdrop Previews */}
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex items-center justify-between bg-[#141416] p-2 rounded-lg border border-[#222226]">
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold text-xs truncate">Monad Testnet Phase 2</span>
                      <span className="text-[#38BDF8] font-bold text-[10px]">HOT</span>
                    </div>
                    <div className="text-[10px] text-[#888885]">
                      Devnet / Public Testnet • Parallel EVM
                    </div>
                  </div>
                  <span className="text-[#34D399] font-bold shrink-0">$3K - $12K+</span>
                </div>

                <div className="flex items-center justify-between bg-[#141416] p-2 rounded-lg border border-[#222226]">
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold text-xs truncate">Berachain bArtio & Boyco</span>
                      <span className="text-[#A78BFA] font-bold text-[10px]">CONFIRMED</span>
                    </div>
                    <div className="text-[10px] text-[#888885]">
                      Proof-of-Liquidity • Final V2 Testnet
                    </div>
                  </div>
                  <span className="text-[#34D399] font-bold shrink-0">$2.5K - $8.5K+</span>
                </div>
              </div>

              {/* Hunter Lead Attribution */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                <span className="text-[#888885] flex items-center gap-1">
                  Lead Hunter: <strong className="text-white">@Finisher</strong> (Alpha Collectiv3 Dev)
                </span>
                <span className="text-[#38BDF8] font-semibold">
                  STEP-BY-STEP GUIDES
                </span>
              </div>
            </div>

            {/* Bottom Status Line */}
            <div className="pt-3 border-t border-[#222225] flex items-center justify-between relative z-10 text-[11px] font-sans font-medium text-[#777775]">
              <span>ALPHA AIRDROP RADAR</span>
              <span className="group-hover:text-white transition-colors flex items-center gap-1 font-mono">
                EXPLORE AIRDROP GUIDE <ArrowUpRight className="w-3 h-3 text-[#38BDF8]" />
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PILLAR 3: TRENDS (Previously 02, now 03)                       */}
          {/* ============================================================== */}
          <div
            id="pillar-card-trends"
            onClick={() => setActivePillarModal('trends')}
            className="group relative bg-[#141416] border border-[#26262B] hover:border-[#D71920]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[460px] transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(215,25,32,0.12)] cursor-pointer overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(215,25,32,0.08)_0%,transparent_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            
            {/* Large Watermark Number */}
            <div className="absolute -bottom-6 -right-4 font-sans font-bold text-8xl sm:text-9xl text-[#1A1A1E] select-none pointer-events-none group-hover:text-[#231E1F] transition-colors duration-300">
              03
            </div>

            {/* Top Row: Identifier, Status & Badge */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-mono font-medium text-[#888885] tracking-wider uppercase">
                03 / TRENDS
              </span>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D71920]/10 text-[#EF4444] border border-[#D71920]/25 text-[10px] font-mono font-bold">
                  <Flame className="w-3 h-3 text-[#D71920] animate-pulse" />
                  {trendsData.telemetry.topCall || '+403% TOP CALL'}
                </span>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0B0C] border border-[#29292B] text-[10px] font-sans font-medium text-[#A8A8A5] uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>MARKET INTEL</span>
                </div>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1.5 relative z-10 mt-5">
              <h3 className="text-2xl sm:text-3xl font-sans font-bold text-white uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">
                TRENDS
              </h3>
              <p className="text-sm sm:text-base font-sans font-medium text-[#C8C8C5] tracking-wide">
                Find something worth talking about.
              </p>
              <p className="text-xs font-sans text-[#888885] leading-relaxed">
                Curated signals, on-chain movements, and early insights sourced live via Discord UGC webhook.
              </p>
            </div>

            {/* Dynamic Interactive Micro-Widget */}
            <div className="bg-[#0B0B0C] border border-[#1F1F24] rounded-xl p-3.5 my-4 space-y-2.5 relative z-10 group-hover:border-[#D71920]/30 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1A1A1F] pb-2">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#EF4444]" />
                  Discord Feed: #{trendsData.channel.channelName.replace('#', '')}
                </span>
                <span className="text-[10px] text-[#34D399] flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SYNCED LIVE
                </span>
              </div>

              {/* Sparkline Curve + Top Signal from Webhook */}
              {(() => {
                const topSig = trendsData.telemetry.topCallItem || trendsData.trends[0];
                return (
                  <div className="flex items-center justify-between gap-3 bg-[#141416] p-2 rounded-lg border border-[#222226]">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-xs truncate">
                          {topSig?.title || 'Cloud Quest Pass'}
                        </span>
                        <span className="text-[#34D399] font-mono text-[10px] font-bold">
                          {topSig?.badge || '▲ +403%'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#888885] font-mono truncate">
                        {topSig?.detail || 'Floor $4.37 ➔ $22.01 • @NFTGuro'}
                      </div>
                    </div>

                    {/* Mini SVG Sparkline */}
                    <div className="w-20 h-9 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#D71920" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#D71920" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 35 Q 25 32 45 22 T 80 12 L 100 4 L 100 40 L 0 40 Z"
                          fill="url(#trendGrad)"
                        />
                        <path
                          d="M 0 35 Q 25 32 45 22 T 80 12 L 100 4"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="100" cy="4" r="3.5" fill="#EF4444" className="animate-pulse" />
                      </svg>
                    </div>
                  </div>
                );
              })()}

              {/* Whale Tracking Metric */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                <span className="text-[#888885] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#F59E0B]" />
                  Whale Net Flow: <strong className="text-white font-semibold">{trendsData.telemetry.whaleFlow || '+84.2 ETH (24H)'}</strong>
                </span>
                <span className="text-[#EF4444] font-semibold">
                  HIGH CONVICTION
                </span>
              </div>
            </div>

            {/* Bottom Status Line */}
            <div className="pt-3 border-t border-[#222225] flex items-center justify-between relative z-10 text-[11px] font-sans font-medium text-[#777775]">
              <span>ALPHA NETWORK ACCESS</span>
              <span className="group-hover:text-white transition-colors flex items-center gap-1 font-mono">
                EXPLORE INTEL FEED <ArrowUpRight className="w-3 h-3 text-[#D71920]" />
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PILLAR 4: GAMES (Previously 03, now 04)                        */}
          {/* ============================================================== */}
          <div
            id="pillar-card-games"
            onClick={() => setActivePillarModal('games')}
            className="group relative bg-[#141416] border border-[#26262B] hover:border-[#8B5CF6]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[460px] transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(139,92,246,0.12)] cursor-pointer overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            
            {/* Large Watermark Number */}
            <div className="absolute -bottom-6 -right-4 font-sans font-bold text-8xl sm:text-9xl text-[#1A1A1E] select-none pointer-events-none group-hover:text-[#211F25] transition-colors duration-300">
              04
            </div>

            {/* Top Row: Identifier, Status & Badge */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-mono font-medium text-[#888885] tracking-wider uppercase">
                04 / GAMES
              </span>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/25 text-[10px] font-mono">
                  <Trophy className="w-3 h-3 text-[#F59E0B]" />
                  2.5 ETH POT
                </span>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0B0C] border border-[#29292B] text-[10px] font-sans font-medium text-[#A8A8A5] uppercase tracking-wider">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>TOURNAMENTS</span>
                </div>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1.5 relative z-10 mt-5">
              <h3 className="text-2xl sm:text-3xl font-sans font-bold text-white uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">
                GAMES
              </h3>
              <p className="text-sm sm:text-base font-sans font-medium text-[#C8C8C5] tracking-wide">
                Because Discord isn't just for alpha.
              </p>
              <p className="text-xs font-sans text-[#888885] leading-relaxed">
                Weekly poker series, esports brackets, and direct crypto prize pool distributions.
              </p>
            </div>

            {/* Dynamic Interactive Micro-Widget */}
            <div className="bg-[#0B0B0C] border border-[#1F1F24] rounded-xl p-3.5 my-4 space-y-2.5 relative z-10 group-hover:border-[#8B5CF6]/30 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1A1A1F] pb-2">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Alpha Poker Invitational #24
                </span>
                <span className="text-[10px] text-[#A78BFA] bg-[#8B5CF6]/15 px-1.5 py-0.5 rounded border border-[#8B5CF6]/25 font-bold">
                  2.5 ETH PRIZE
                </span>
              </div>

              {/* Mini Podium Ranking */}
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex items-center justify-between bg-[#141416] px-2.5 py-1.5 rounded border border-[#222226]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F59E0B] font-bold">🥇 1st</span>
                    <span className="text-white font-semibold">Ironlady</span>
                  </div>
                  <span className="text-[#A8A8A5]">480 PTS • 3x Trophy</span>
                </div>
                <div className="flex items-center justify-between bg-[#141416] px-2.5 py-1.5 rounded border border-[#222226]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A8A8A5] font-bold">🥈 2nd</span>
                    <span className="text-white font-semibold">rtcj14</span>
                  </div>
                  <span className="text-[#A8A8A5]">415 PTS • 2x Trophy</span>
                </div>
              </div>

              {/* Seats Status */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                <span className="text-[#888885]">
                  48 / 64 Seats Filled • Free For Members
                </span>
                <span className="text-[#A78BFA] font-bold">
                  SUNDAY 8 PM UTC
                </span>
              </div>
            </div>

            {/* Bottom Status Line */}
            <div className="pt-3 border-t border-[#222225] flex items-center justify-between relative z-10 text-[11px] font-sans font-medium text-[#777775]">
              <span>ALPHA NETWORK ACCESS</span>
              <span className="group-hover:text-white transition-colors flex items-center gap-1 font-mono">
                EXPLORE TOURNAMENTS <ArrowUpRight className="w-3 h-3 text-[#8B5CF6]" />
              </span>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* SUBSECTION: COMMUNITY WINS                                     */}
        {/* ============================================================== */}
        <div className="pt-12 border-t border-[#1C1C20]">
          
          {/* Wins Header */}
          <div className="mb-8">
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-sans font-bold text-white uppercase tracking-tight">
              COMMUNITY <span className="text-[#A8A8A5] font-light">WINS</span>
            </h3>
          </div>

          {/* Clean Screenshot Gallery Grid: Just Images Only */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMUNITY_WINS_DATA.map((win) => (
              <div
                key={win.id}
                id={`screenshot-card-${win.id}`}
                onClick={() => {
                  setActiveScreenshotWin(win);
                  setZoomLevel(1);
                }}
                className="bg-[#121215] border border-[#222226] hover:border-[#44444C] rounded-xl overflow-hidden transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.8)]"
              >
                <div className="w-full bg-[#0B0B0C] flex items-center justify-center overflow-hidden">
                  <img
                    src={win.screenshotUrl}
                    alt={win.project}
                    className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* SCREENSHOT LIGHTBOX VIEWER                                     */}
      {/* ============================================================== */}
      {activeScreenshotWin && (
        <div
          id="screenshot-lightbox"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => {
            setActiveScreenshotWin(null);
            setZoomLevel(1);
          }}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-6xl flex items-center justify-between py-2 border-b border-[#2B2D31] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-mono text-[#A8A8A5]">
              {COMMUNITY_WINS_DATA.findIndex((w) => w.id === activeScreenshotWin.id) + 1} / {COMMUNITY_WINS_DATA.length}
            </div>

            {/* Lightbox Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                className="p-1.5 rounded bg-[#1E1F22] hover:bg-[#2B2D31] border border-[#2B2D31] text-[#949BA4] hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded bg-[#1E1F22] hover:bg-[#2B2D31] border border-[#2B2D31] text-xs font-mono text-[#949BA4] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{Math.round(zoomLevel * 100)}%</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1.5 rounded bg-[#1E1F22] hover:bg-[#2B2D31] border border-[#2B2D31] text-[#949BA4] hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-[#2B2D31] mx-1" />
              <button
                type="button"
                onClick={() => {
                  setActiveScreenshotWin(null);
                  setZoomLevel(1);
                }}
                className="p-1.5 rounded bg-[#222226] hover:bg-[#D71920] border border-[#2B2D31] hover:border-[#D71920] text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image View Area */}
          <div
            className="relative w-full max-w-6xl flex-1 my-4 flex items-center justify-center overflow-auto scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrevScreenshot}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white transition-all hover:scale-110 shadow-lg cursor-pointer"
              title="Previous Screenshot"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* The Screenshot Image */}
            <div
              style={{ transform: `scale(${zoomLevel})` }}
              className="transition-transform duration-200 ease-out max-h-full max-w-full flex items-center justify-center p-2"
            >
              <img
                src={activeScreenshotWin.screenshotUrl}
                alt={activeScreenshotWin.project}
                className="max-h-[80vh] w-auto max-w-full rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-[#2B2D31]"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextScreenshot}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white transition-all hover:scale-110 shadow-lg cursor-pointer"
              title="Next Screenshot"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Pillar Detail Modal */}
      <PillarDetailModal
        pillar={activePillarModal}
        onClose={() => setActivePillarModal(null)}
      />
    </section>
  );
};

