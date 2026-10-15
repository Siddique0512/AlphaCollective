import React from 'react';
import { ArrowUpRight, Flame, Sparkles, Users } from 'lucide-react';
import { OFFICIAL_LINKS } from '../content/ecosystem';
import { useDiscordSync } from '../hooks/useDiscordSync';
import { AlphaShieldLogo } from './AlphaShieldLogo';

interface JoinSectionProps {
  onApplyClick?: () => void;
}

export const JoinSection: React.FC<JoinSectionProps> = ({ onApplyClick }) => {
  const DISCORD_URL = OFFICIAL_LINKS.discordInvitePlaceholder;
  const X_URL = OFFICIAL_LINKS.xTwitter;
  const discord = useDiscordSync(OFFICIAL_LINKS.discordGuildId, OFFICIAL_LINKS.discordInvitePlaceholder);

  const PERKS = [
    {
      num: '01',
      icon: Flame,
      channel: '#alpha-signals',
      accent: 'text-[#EF4444]',
      borderHover: 'hover:border-[#D71920]/50',
      glow: 'rgba(215,25,32,0.08)',
      title: 'Daily Alpha & Market Trends',
      desc: 'High-signal discussions covering emerging NFT collections, early mint dates, whale wallet movements, and curated on-chain intelligence.',
    },
    {
      num: '02',
      icon: Sparkles,
      channel: '#allowlist-raffles',
      accent: 'text-[#34D399]',
      borderHover: 'hover:border-[#10B981]/50',
      glow: 'rgba(16,185,129,0.08)',
      title: 'Curated Allowlist Raffles',
      desc: 'Fair, transparent, bot-verified raffle allocations and daily flash giveaways from 700+ premier Web3, NFT, and gaming partners.',
    },
    {
      num: '03',
      icon: Users,
      channel: '#selective-circle',
      accent: 'text-[#FBBF24]',
      borderHover: 'hover:border-[#F59E0B]/50',
      glow: 'rgba(245,158,11,0.08)',
      title: 'Curated & Selective Alpha Circle',
      desc: 'Quality over noise. Apply for verified membership to gain access to late-night lo-fi voice stages, poker brackets, and high-signal research.',
    },
  ];

  return (
    <section
      id="join-section"
      className="bg-[#0B0B0C] text-[#F5F5F3] py-24 sm:py-32 border-b border-[#29292B] relative overflow-hidden select-none"
    >
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] sm:h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(215,25,32,0.08)_0%,rgba(168,168,165,0.03)_40%,transparent_75%)] pointer-events-none" />

      {/* Subtle Architectural Orbit Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-dashed border-white/[0.02] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centerpiece Invitation Portal Card */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#151519] via-[#111114] to-[#0D0D10] border border-[#29292F] p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)]">
          {/* Top Metallic Rim Highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D71920]/40 to-transparent pointer-events-none" />

          {/* Corner Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[radial-gradient(circle,rgba(215,25,32,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

          {/* Center Shield Emblem + Live Server Telemetry */}
          <div className="flex flex-col items-center justify-center mb-7">
            <div className="mb-5">
              <AlphaShieldLogo variant="icon" size="lg" />
            </div>

            {/* Live Discord Server Status Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 px-4 py-1.5 rounded-lg bg-[#0B0B0C]/90 border border-[#29292B] text-xs font-mono">
              <span className="inline-flex items-center gap-2 text-[#F5F5F3] font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
                </span>
                {discord.onlineCount} ONLINE
              </span>
              <span className="text-[#3A3A40]">·</span>
              <span className="text-[#A8A8A5]">{discord.totalMembers} MEMBERS</span>
            </div>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-sans font-bold text-[#F5F5F3] uppercase tracking-tight leading-none mb-4">
            APPLY TO <span className="text-[#A8A8A5] font-light">JOIN.</span>
          </h2>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base font-sans text-[#A8A8A5] max-w-xl mx-auto leading-relaxed mb-9">
            Selective admission for dedicated Web3 traders, developers, and alpha hunters. Fill out the membership form to receive your verified Discord access pass.
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onApplyClick}
              className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-4 rounded-sm bg-[#D71920] hover:bg-[#B8151B] text-white text-xs sm:text-sm font-sans font-semibold tracking-wider uppercase transition-all shadow-[0_6px_28px_rgba(215,25,32,0.35)] hover:-translate-y-0.5 cursor-pointer"
            >
              <span>APPLY TO JOIN ALPHA</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 sm:px-8 py-4 rounded-sm bg-[#141418] hover:bg-[#1C1C22] border border-[#2E2E36] hover:border-[#A8A8A5] text-[#F5F5F3] text-xs sm:text-sm font-sans font-semibold tracking-wider uppercase transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>FOLLOW ON X</span>
              <ArrowUpRight className="w-4 h-4 text-[#A8A8A5]" />
            </a>
          </div>
        </div>

        {/* 3 Elevated Community Highlights Grid (Non-link display cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-6">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.num}
                className={`group relative p-6 sm:p-7 bg-[#131317] border border-[#26262C] ${perk.borderHover} rounded-2xl transition-all duration-300 shadow-[0_12px_35px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden text-left`}
              >
                {/* Subtle Top-Right Radial Glow */}
                <div
                  className="absolute top-0 right-0 w-44 h-44 pointer-events-none transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `radial-gradient(circle at top right, ${perk.glow} 0%, transparent 70%)`,
                  }}
                />

                <div>
                  {/* Top Row: Icon Medallion + Channel Tag */}
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-[#0B0B0C] border border-[#29292B] group-hover:border-white/30 flex items-center justify-center transition-colors">
                      <Icon className={`w-4 h-4 ${perk.accent}`} />
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-[#888885] group-hover:text-[#F5F5F3] transition-colors">
                      {perk.channel}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-sans font-bold text-base sm:text-lg text-[#F5F5F3] uppercase tracking-tight mb-2">
                    {perk.title}
                  </h4>
                  <p className="text-xs sm:text-[13px] font-sans text-[#9A9A96] leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
