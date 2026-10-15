import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TEAM_DATA } from '../content/ecosystem';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { AlphaShieldLogo } from './AlphaShieldLogo';

export const TeamSection: React.FC = () => {
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [profileIndex, setProfileIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Interactive mouse parallax state for constellation
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 16, y: y * 16 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setHoveredMemberId(null);
  };

  const openProfile = (index: number) => {
    setSlideDirection('right');
    setProfileIndex(index);
  };

  const handleNodeClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    openProfile(index);
  };

  const closeProfile = () => {
    setProfileIndex(null);
  };

  const nextProfile = useCallback(() => {
    if (profileIndex === null) return;
    setSlideDirection('right');
    setProfileIndex((prev) => (prev! + 1) % TEAM_DATA.length);
  }, [profileIndex]);

  const prevProfile = useCallback(() => {
    if (profileIndex === null) return;
    setSlideDirection('left');
    setProfileIndex((prev) => (prev! - 1 + TEAM_DATA.length) % TEAM_DATA.length);
  }, [profileIndex]);

  // Keyboard navigation for profile modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (profileIndex !== null) {
        if (e.key === 'Escape') closeProfile();
        if (e.key === 'ArrowRight') nextProfile();
        if (e.key === 'ArrowLeft') prevProfile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileIndex, nextProfile, prevProfile]);

  // Constellation Node Positions (percentage based relative to center for 7 team members)
  const nodeLayouts = [
    {
      id: 'team-1', // NFTGuroETH (Founder)
      xPercent: 50,
      yPercent: 16,
      cx: 500,
      cy: 90,
      floatDuration: 5.5,
      delay: 0,
    },
    {
      id: 'team-2', // Finisher (Developer, Content Creator & CM)
      xPercent: 82,
      yPercent: 24,
      cx: 820,
      cy: 135,
      floatDuration: 6.2,
      delay: 0.8,
    },
    {
      id: 'team-3', // Salman Ali (CM)
      xPercent: 88,
      yPercent: 62,
      cx: 880,
      cy: 340,
      floatDuration: 5.8,
      delay: 1.4,
    },
    {
      id: 'team-4', // Dex (CM)
      xPercent: 68,
      yPercent: 84,
      cx: 680,
      cy: 460,
      floatDuration: 6.6,
      delay: 0.4,
    },
    {
      id: 'team-5', // Rkaay (CM)
      xPercent: 32,
      yPercent: 84,
      cx: 320,
      cy: 460,
      floatDuration: 5.4,
      delay: 1.1,
    },
    {
      id: 'team-6', // Retinz (CM)
      xPercent: 12,
      yPercent: 62,
      cx: 120,
      cy: 340,
      floatDuration: 6.0,
      delay: 0.6,
    },
    {
      id: 'team-7', // Light (CM)
      xPercent: 18,
      yPercent: 24,
      cx: 180,
      cy: 135,
      floatDuration: 6.4,
      delay: 1.6,
    },
  ];

  const currentMember = profileIndex !== null ? TEAM_DATA[profileIndex] : null;
  const activeNodeId =
    hoveredMemberId ||
    (profileIndex !== null ? TEAM_DATA[profileIndex]?.id : null);
  const activeMemberObj = activeNodeId
    ? TEAM_DATA.find((m) => m.id === activeNodeId) || null
    : null;

  return (
    <section
      id="team-section"
      className="bg-[#0B0B0C] text-[#F5F5F3] py-24 sm:py-32 border-b border-[#29292B] relative overflow-hidden select-none"
    >
      {/* Background Subtle Silver Dust & Dark Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,22,0.6)_0%,rgba(11,11,12,0.98)_75%)] pointer-events-none" />

      {/* Subtle Graphite Orbit Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full border border-white/[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight uppercase text-[#F5F5F3] mb-3 whitespace-nowrap">
            THE PEOPLE BEHIND <span className="text-[#A8A8A5] font-light">ALPHA</span>
          </h2>
        </div>

        {/* Constellation Interactive Arena */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-[620px] sm:h-[680px] md:h-[720px] rounded-2xl bg-[#141416]/80 border border-[#29292B] backdrop-blur-md overflow-hidden flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Subtle Ambient Hover Glow */}
          <div
            className="absolute w-[420px] h-[420px] rounded-full bg-white/[0.025] blur-3xl pointer-events-none transition-all duration-700 ease-out"
            style={{
              transform: `translate(${mouseOffset.x * 2}px, ${mouseOffset.y * 2}px)`,
            }}
          />

          {/* SVG Animated Connecting Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1000 550"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="silverLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#29292B" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#A8A8A5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#29292B" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="activeSilverLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D71920" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#D71920" stopOpacity="0.85" />
              </linearGradient>

              <filter id="silverGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Peripheral Node Ring Edges (Highlight adjacent edges when a node is hovered/selected) */}
            {nodeLayouts.map((node, idx) => {
              const nextNode = nodeLayouts[(idx + 1) % nodeLayouts.length];
              const isEdgeActive =
                activeNodeId === node.id || activeNodeId === nextNode.id;
              return (
                <line
                  key={`ring-edge-${node.id}`}
                  x1={node.cx}
                  y1={node.cy}
                  x2={nextNode.cx}
                  y2={nextNode.cy}
                  stroke={isEdgeActive ? '#FFFFFF' : '#A8A8A5'}
                  strokeWidth={isEdgeActive ? '1.4' : '0.8'}
                  strokeDasharray={isEdgeActive ? '4 3' : '2 4'}
                  strokeOpacity={isEdgeActive ? '0.65' : '0.22'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Connection Lines from Center (500, 275) to each Node */}
            {nodeLayouts.map((node) => {
              const isActive = activeNodeId === node.id;
              const isDimmed = activeNodeId !== null && !isActive;
              return (
                <g
                  key={`line-${node.id}`}
                  style={{ opacity: isDimmed ? 0.35 : 1 }}
                  className="transition-opacity duration-300"
                >
                  <line
                    x1="500"
                    y1="275"
                    x2={node.cx}
                    y2={node.cy}
                    stroke={isActive ? 'url(#activeSilverLineGrad)' : 'url(#silverLineGrad)'}
                    strokeWidth={isActive ? '2.2' : '1'}
                    strokeDasharray={isActive ? 'none' : '3 3'}
                    filter={isActive ? 'url(#silverGlow)' : undefined}
                    className="transition-all duration-300"
                  />

                  {/* Traveling Pulse Particle */}
                  <circle
                    r={isActive ? 3.2 : 1.5}
                    fill={isActive ? '#D71920' : '#A8A8A5'}
                    className="transition-all duration-300"
                  >
                    <animateMotion
                      path={`M 500 275 L ${node.cx} ${node.cy}`}
                      dur={isActive ? '1.6s' : '4.5s'}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Central Visual Element — Official Alpha Collective Shield */}
          <motion.div
            style={{
              x: mouseOffset.x * 0.4,
              y: mouseOffset.y * 0.4,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-20 flex flex-col items-center justify-center cursor-default pointer-events-auto"
          >
            {/* Center Outer Orbit Rings */}
            <div
              className={`absolute w-36 sm:w-44 h-36 sm:h-44 rounded-full border transition-colors duration-300 animate-[spin_40s_linear_infinite] ${
                activeNodeId ? 'border-[#D71920]/30' : 'border-white/[0.06]'
              }`}
            />
            <div
              className={`absolute w-44 sm:w-56 h-44 sm:h-56 rounded-full border border-dashed transition-colors duration-300 animate-[spin_60s_linear_infinite_reverse] ${
                activeNodeId ? 'border-white/20' : 'border-white/[0.04]'
              }`}
            />

            {/* Central Alpha Shield Box */}
            <div
              className={`group transition-transform duration-300 ${
                activeNodeId ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <AlphaShieldLogo variant="icon" size="xl" />
            </div>

            <div className="mt-3 px-2.5 py-0.5 rounded-full bg-[#141416] border border-[#29292B] text-[9px] font-mono font-medium text-[#A8A8A5] uppercase tracking-wider transition-all">
              {activeMemberObj
                ? `${activeMemberObj.number?.split('/')[0].trim()} · ${activeMemberObj.name.toUpperCase()}`
                : 'CORE LEADERSHIP'}
            </div>
          </motion.div>

          {/* Surrounding Constellation Team Nodes */}
          {TEAM_DATA.map((member, index) => {
            const layout = nodeLayouts[index] || nodeLayouts[0];
            const isHovered = hoveredMemberId === member.id;
            const isSelected = profileIndex === index;
            const isActive = isHovered || isSelected;
            const isDimmed = activeNodeId !== null && !isActive;

            return (
              <motion.div
                key={member.id}
                id={`constellation-node-${member.id}`}
                style={{
                  left: `${layout.xPercent}%`,
                  top: `${layout.yPercent}%`,
                  x: mouseOffset.x * 0.8,
                  y: mouseOffset.y * 0.8,
                }}
                animate={{
                  y: isActive ? 0 : [-4, 4, -4],
                  scale: isActive ? 1.06 : isDimmed ? 0.94 : 1,
                }}
                transition={{
                  y: isActive
                    ? { duration: 0.2 }
                    : {
                        repeat: Infinity,
                        duration: layout.floatDuration,
                        ease: 'easeInOut',
                        delay: layout.delay,
                      },
                  scale: { duration: 0.25 },
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center transition-opacity duration-300 ${
                  isActive ? 'z-40 opacity-100' : isDimmed ? 'z-20 opacity-55' : 'z-30 opacity-100'
                }`}
                onMouseEnter={() => setHoveredMemberId(member.id)}
                onMouseLeave={() => setHoveredMemberId(null)}
                onClick={(e) => handleNodeClick(index, e)}
              >
                {/* Node Portrait Medallion */}
                <div className="relative group">
                  {/* Outer Pulsing Crimson/Silver Ring on Hover or Selection */}
                  <div
                    className={`absolute -inset-3 rounded-full border transition-all duration-500 pointer-events-none ${
                      isSelected
                        ? 'opacity-100 scale-110 border-[#D71920] shadow-[0_0_30px_rgba(215,25,32,0.45)]'
                        : isHovered
                        ? 'opacity-100 scale-105 border-white/70 shadow-[0_0_28px_rgba(255,255,255,0.3)]'
                        : 'opacity-0 scale-90 border-transparent'
                    }`}
                  />

                  {/* Secondary Inner Halo */}
                  <div
                    className={`absolute -inset-1.5 rounded-full border transition-all duration-300 pointer-events-none ${
                      isActive
                        ? 'opacity-100 border-[#D71920]/60 animate-pulse'
                        : 'opacity-0 border-transparent'
                    }`}
                  />

                  {/* Circular Avatar */}
                  <div
                    className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#141416] border-2 transition-all duration-300 overflow-hidden shadow-2xl relative ${
                      isSelected
                        ? 'border-[#D71920] scale-110 shadow-[0_0_32px_rgba(215,25,32,0.4)]'
                        : isHovered
                        ? 'border-white scale-110 shadow-[0_0_30px_rgba(255,255,255,0.28)]'
                        : 'border-[#29292B]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#141416] via-[#1C1C1F] to-[#252529] z-0" />
                    
                    {/* Centered Fallback Initials */}
                    <div className="absolute inset-0 flex items-center justify-center font-sans font-bold text-base sm:text-lg tracking-wider text-[#F5F5F3] select-none z-0">
                      {member.initials || member.name.slice(0, 2).toUpperCase()}
                    </div>

                    {member.image && (
                      <img
                        src={member.image}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center z-10"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}

                    <div className="absolute inset-1 rounded-full border border-white/[0.05] pointer-events-none z-20" />
                  </div>

                  {/* Node Index Marker Pill */}
                  <div
                    className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full border text-[8px] font-mono font-bold z-20 transition-colors ${
                      isActive
                        ? 'bg-[#D71920] border-[#D71920] text-white'
                        : 'bg-[#0B0B0C] border-[#29292B] text-[#A8A8A5]'
                    }`}
                  >
                    {member.number?.split('/')[0].trim() || `0${index + 1}`}
                  </div>
                </div>

                {/* Minimalist Floating Label + Hover Focus Preview */}
                <div
                  className={`mt-2.5 flex flex-col items-center text-center transition-all duration-300 pointer-events-none ${
                    isActive
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-85 translate-y-0.5'
                  }`}
                >
                  <span className="font-sans font-bold text-xs sm:text-sm text-[#F5F5F3] uppercase tracking-wide">
                    {member.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-sans font-medium text-[#888885] uppercase tracking-wider max-w-[140px] truncate">
                    {member.role}
                  </span>

                  {/* Hover Focus Area / Click Prompt */}
                  <div
                    className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0B0B0C]/90 border border-[#29292B] text-[8px] sm:text-[9px] font-mono font-semibold text-[#F5F5F3] uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'opacity-100 translate-y-0 shadow-md'
                        : 'opacity-0 -translate-y-1'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
                    <span>VIEW FULL PROFILE</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* =========================================================================
          PREMIUM PROFILE PANEL OVERLAY (EXPANDED VIEW)
          ========================================================================= */}
      <AnimatePresence>
        {profileIndex !== null && currentMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            
            <div
              className="absolute inset-0"
              onClick={closeProfile}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl rounded-xl bg-gradient-to-b from-[#18181B] to-[#0B0B0C] border border-[#29292B] text-[#F5F5F3] shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Silver Rim Top Line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#A8A8A5]/40 to-transparent pointer-events-none" />

              {/* Close Button Top-Right */}
              <button
                onClick={closeProfile}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-sm bg-[#141416] hover:bg-[#202024] text-[#A8A8A5] hover:text-white border border-[#29292B] transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono z-20"
                aria-label="Close profile modal"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 md:p-12 items-center">
                
                {/* Left Side: Large Portrait */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-[#141416] border-2 border-[#A8A8A5]/40 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#26262A_0%,#0B0B0C_70%)] z-0" />
                    
                    {/* Centered Fallback Initials */}
                    <div className="absolute inset-0 flex items-center justify-center font-sans font-bold text-4xl sm:text-6xl text-white tracking-wider select-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] z-0">
                      {currentMember.initials || currentMember.name.slice(0, 2).toUpperCase()}
                    </div>

                    {currentMember.image && (
                      <img
                        src={currentMember.image}
                        alt={currentMember.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center z-10"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}

                    <div className="absolute inset-2 rounded-full border border-white/[0.05] animate-[spin_40s_linear_infinite] pointer-events-none z-20" />
                  </div>

                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141416] border border-[#29292B] text-[10px] font-sans font-medium text-[#A8A8A5] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
                    <span>{currentMember.badge || 'VERIFIED OPERATOR'}</span>
                  </div>
                </div>

                {/* Right Side: Editorial Information */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                  
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentMember.id}
                      initial={{
                        opacity: 0,
                        x: slideDirection === 'right' ? 20 : -20,
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: slideDirection === 'right' ? -20 : 20,
                      }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      <div className="text-xs font-mono font-medium text-[#888885] tracking-wider uppercase">
                        {currentMember.number || `0${profileIndex + 1} / 0${TEAM_DATA.length}`}
                      </div>

                      <div>
                        <h3 className="font-sans font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight leading-none mb-1">
                          {currentMember.name}
                        </h3>
                        <p className="text-xs font-sans font-semibold text-[#A8A8A5] uppercase tracking-wider">
                          {currentMember.role}
                        </p>
                      </div>

                      {currentMember.quote && (
                        <p className="text-sm sm:text-base font-sans font-normal italic text-white/90 leading-relaxed border-l-2 border-[#A8A8A5]/40 pl-4 py-0.5">
                          "{currentMember.quote}"
                        </p>
                      )}

                      {currentMember.knownFor && (
                        <div className="text-xs font-sans font-normal text-[#CCCCCC] leading-relaxed">
                          <span className="text-[#888885] font-semibold uppercase tracking-wide">
                            KNOWN FOR:{' '}
                          </span>
                          {currentMember.knownFor}
                        </div>
                      )}

                      <p className="text-xs sm:text-sm font-sans font-normal text-[#888885] leading-relaxed">
                        {currentMember.bio}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-6">
                        <a
                          href={currentMember.xLink || `https://x.com/${currentMember.xHandle.replace('X:', '').replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-sans font-semibold text-white hover:text-[#D71920] uppercase tracking-[0.06em] transition-colors border-b border-white/25 pb-0.5"
                        >
                          <span>{currentMember.xHandle} ↗</span>
                        </a>

                        {currentMember.discordHandle && (
                          <a
                            href={currentMember.discordLink || 'https://discord.gg/awSJ7sRYMu'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-sans font-semibold text-white hover:text-[#D71920] uppercase tracking-[0.06em] transition-colors border-b border-white/25 pb-0.5"
                          >
                            <span>DC:@{currentMember.discordHandle.replace('@', '')} ↗</span>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="pt-6 border-t border-[#29292B] flex items-center justify-between">
                    <button
                      onClick={prevProfile}
                      className="px-3.5 py-2 rounded-sm bg-[#141416] hover:bg-[#202024] border border-[#29292B] text-xs font-sans font-medium uppercase tracking-wider transition-colors flex items-center gap-1.5 text-[#A8A8A5] hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>PREVIOUS</span>
                    </button>

                    <span className="text-xs font-mono font-medium text-[#888885] tracking-wider">
                      {currentMember.number || `0${profileIndex + 1} / 0${TEAM_DATA.length}`}
                    </span>

                    <button
                      onClick={nextProfile}
                      className="px-3.5 py-2 rounded-sm bg-[#141416] hover:bg-[#202024] border border-[#29292B] text-xs font-sans font-medium uppercase tracking-wider transition-colors flex items-center gap-1.5 text-[#A8A8A5] hover:text-white cursor-pointer"
                    >
                      <span>NEXT</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
