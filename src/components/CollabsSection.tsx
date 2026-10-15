import React, { useState, useMemo } from 'react';
import { COLLABS_DATA, CollabProject } from '../content/collabs';
import { ArrowUpRight } from 'lucide-react';
import { AlphaShieldLogo } from './AlphaShieldLogo';

interface CollabsSectionProps {
  onOpenCollabProposal?: () => void;
}

// Generate dynamic network connections between adjacent constellation nodes
const getNetworkEdges = (totalCount: number): [number, number][] => {
  const edges: [number, number][] = [];
  for (let i = 0; i < totalCount; i++) {
    const col = i % 5;
    // Horizontal edge to right neighbor
    if (col < 4 && i + 1 < totalCount) {
      edges.push([i, i + 1]);
    }
    // Vertical edge to bottom neighbor
    if (i + 5 < totalCount) {
      edges.push([i, i + 5]);
    }
    // Diagonal accents to create organic constellation mesh
    if (i % 2 === 0 && col < 4 && i + 6 < totalCount) {
      edges.push([i, i + 6]);
    }
  }
  return edges;
};

// Motion variations for the nodes (6-14s durations)
const MOTION_CONFIGS = [
  { anim: 'animate-drift-v', duration: '9s', delay: '0s', offset: 'sm:translate-y-1' },
  { anim: 'animate-drift-h', duration: '12s', delay: '1s', offset: 'sm:-translate-y-2' },
  { anim: 'animate-drift-diag', duration: '10s', delay: '0.5s', offset: 'sm:translate-y-2' },
  { anim: 'animate-drift-pulse', duration: '8s', delay: '1.5s', offset: 'sm:-translate-y-1' },
  { anim: 'animate-drift-v', duration: '11s', delay: '2s', offset: 'sm:translate-y-0' },
  { anim: 'animate-drift-h', duration: '13s', delay: '0.8s', offset: 'sm:-translate-y-2' },
  { anim: 'animate-drift-diag', duration: '9.5s', delay: '1.2s', offset: 'sm:translate-y-1' },
  { anim: 'animate-drift-v', duration: '8.5s', delay: '0.3s', offset: 'sm:-translate-y-1' },
  { anim: 'animate-drift-pulse', duration: '14s', delay: '1.8s', offset: 'sm:translate-y-2' },
  { anim: 'animate-drift-h', duration: '10.5s', delay: '0.6s', offset: 'sm:-translate-y-0' },
  { anim: 'animate-drift-v', duration: '11.5s', delay: '1.4s', offset: 'sm:translate-y-1' },
  { anim: 'animate-drift-diag', duration: '12.5s', delay: '0.2s', offset: 'sm:-translate-y-2' },
  { anim: 'animate-drift-pulse', duration: '9s', delay: '2.2s', offset: 'sm:translate-y-0' },
  { anim: 'animate-drift-h', duration: '10s', delay: '1.1s', offset: 'sm:-translate-y-1' },
  { anim: 'animate-drift-v', duration: '13.5s', delay: '0.7s', offset: 'sm:translate-y-2' },
  { anim: 'animate-drift-diag', duration: '8s', delay: '1.9s', offset: 'sm:-translate-y-0' },
  { anim: 'animate-drift-pulse', duration: '11s', delay: '0.4s', offset: 'sm:translate-y-1' },
  { anim: 'animate-drift-v', duration: '9.8s', delay: '1.6s', offset: 'sm:-translate-y-2' },
  { anim: 'animate-drift-h', duration: '12.2s', delay: '0.9s', offset: 'sm:translate-y-0' },
  { anim: 'animate-drift-diag', duration: '10.8s', delay: '2.1s', offset: 'sm:-translate-y-1' },
];

export const CollabsSection: React.FC<CollabsSectionProps> = ({
  onOpenCollabProposal,
}) => {
  const [hoveredProject, setHoveredProject] = useState<CollabProject | null>(null);
  const [featuredId, setFeaturedId] = useState<number>(1);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (id: number) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const networkEdges = useMemo(() => getNetworkEdges(COLLABS_DATA.length), []);
  const totalRows = Math.ceil(COLLABS_DATA.length / 5);

  // Connected node IDs for the currently hovered project
  const connectedNodeIds = useMemo(() => {
    if (!hoveredProject) return new Set<number>();
    const index = COLLABS_DATA.findIndex((p) => p.id === hoveredProject.id);
    if (index === -1) return new Set<number>();

    const connected = new Set<number>([hoveredProject.id]);
    networkEdges.forEach(([from, to]) => {
      if (from === index && COLLABS_DATA[to]) connected.add(COLLABS_DATA[to].id);
      if (to === index && COLLABS_DATA[from]) connected.add(COLLABS_DATA[from].id);
    });
    return connected;
  }, [hoveredProject, networkEdges]);

  return (
    <section
      id="collabs-section"
      className="relative bg-[#0B0B0C] text-[#F5F5F3] py-24 sm:py-32 border-t border-b border-[#222226] overflow-hidden select-none"
    >
      {/* Background Atmosphere: Faint Alpha Shield Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] pointer-events-none -z-0 scale-150 sm:scale-125">
        <AlphaShieldLogo variant="icon" size="hero" />
      </div>

      {/* Ambient Lighting & Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] sm:h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,rgba(11,11,12,0)_70%)] pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(215,25,32,0.03)_0%,transparent_70%)] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold text-[#F5F5F3] uppercase tracking-tight leading-none mb-2">
              BUILT <span className="text-[#A8A8A5] font-light">TOGETHER.</span>
            </h2>

            <p className="text-xs sm:text-sm font-sans font-normal text-[#888885] uppercase tracking-wider">
              {COLLABS_DATA.length} featured spotlights across 700+ ecosystem collaborations.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#D71920]/15 text-white border border-[#D71920]/30 text-xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] animate-pulse" />
                700+ COLLABORATIONS
              </span>
            </div>
          </div>

          {/* Action Button */}
          {onOpenCollabProposal && (
            <button
              onClick={onOpenCollabProposal}
              className="px-5 py-2.5 bg-[#141416] hover:bg-[#1C1C20] border border-[#29292B] hover:border-[#A8A8A5] text-[#F5F5F3] text-xs font-sans font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer rounded-sm group self-start md:self-auto"
            >
              <span>PROPOSE COLLABORATION</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D71920] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Constellation Canvas / Grid Area */}
        <div className="relative py-8 sm:py-12">
          
          {/* Subtle Network Constellation Connection Grid (Desktop SVG Layer) */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="netLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.12)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                </linearGradient>
                <linearGradient id="netLineGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(215,25,32,0.3)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="100%" stopColor="rgba(215,25,32,0.3)" />
                </linearGradient>
              </defs>

              {networkEdges.map(([fromIdx, toIdx], edgeIdx) => {
                // Precise 5 cols x totalRows node coordinates in percentages
                const fromCol = fromIdx % 5;
                const fromRow = Math.floor(fromIdx / 5);
                const toCol = toIdx % 5;
                const toRow = Math.floor(toIdx / 5);

                const x1 = `${10 + fromCol * 20}%`;
                const y1 = `${((fromRow + 0.5) / totalRows) * 100}%`;
                const x2 = `${10 + toCol * 20}%`;
                const y2 = `${((toRow + 0.5) / totalRows) * 100}%`;

                const isConnected =
                  hoveredProject &&
                  (COLLABS_DATA[fromIdx]?.id === hoveredProject.id ||
                   COLLABS_DATA[toIdx]?.id === hoveredProject.id);

                return (
                  <line
                    key={`edge-${edgeIdx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isConnected ? 'url(#netLineGradActive)' : 'url(#netLineGrad)'}
                    strokeWidth={isConnected ? '1.5' : '1'}
                    strokeDasharray={isConnected ? 'none' : '4 6'}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
          </div>

          {/* Constellation Nodes Grid: 5 Cols on Desktop (5x4 = 20), 4 Cols on Tablet, 2 Cols on Mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 relative z-10">
            {COLLABS_DATA.map((project, idx) => {
              const motionCfg = MOTION_CONFIGS[idx % MOTION_CONFIGS.length];
              const isHovered = hoveredProject?.id === project.id;
              const isConnected = connectedNodeIds.has(project.id);
              const isDimmed = hoveredProject !== null && !isConnected;
              const isFeatured = featuredId === project.id;

              return (
                <div
                  key={project.id}
                  className={`flex flex-col items-center justify-center relative group ${motionCfg.offset}`}
                  onMouseEnter={() => {
                    setHoveredProject(project);
                    setFeaturedId(project.id);
                  }}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  {/* Floating Node Container */}
                  <div
                    className={`relative transition-all duration-300 ${
                      isDimmed ? 'opacity-35 scale-95' : 'opacity-100'
                    }`}
                  >
                    {/* Organic Independent Floating Motion Wrapper */}
                    <div
                      className={`${motionCfg.anim} flex flex-col items-center`}
                      style={{
                        animationDuration: motionCfg.duration,
                        animationDelay: motionCfg.delay,
                      }}
                    >
                      {/* Ambient Silver Halo behind node */}
                      <div
                        className={`absolute -inset-2.5 rounded-full transition-all duration-500 pointer-events-none ${
                          isHovered
                            ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_70%)] blur-md'
                            : isFeatured
                            ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] blur-sm'
                            : 'bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]'
                        }`}
                      />

                      {/* Featured Project Outer Ring Indicator */}
                      {isFeatured && (
                        <div className="absolute -inset-1.5 rounded-full border border-[#A8A8A5]/40 animate-pulse pointer-events-none" />
                      )}

                      {/* Central Floating Logo Node (Graphite / Silver Micro-Platform) */}
                      <div
                        className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
                          isFeatured
                            ? 'w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-b from-[#222226] via-[#141416] to-[#0D0D0F] border border-[#A8A8A5]/60 shadow-[0_8px_24px_rgba(0,0,0,0.8)]'
                            : 'w-16 h-16 sm:w-17 sm:h-17 bg-gradient-to-b from-[#1A1A1E] via-[#121214] to-[#0B0B0C] border border-[#2E2E33] group-hover:border-[#A8A8A5] shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.9)]'
                        } ${isHovered ? 'scale-110 !border-white' : ''}`}
                      >
                        {/* Top Rim Metallic Sheen */}
                        <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />

                        {/* Project Logo Image Only */}
                        {!imgErrors[project.id] ? (
                          <img
                            src={project.logo}
                            alt={project.name}
                            onError={() => handleImageError(project.id)}
                            className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#18181B] border border-[#2E2E33] flex items-center justify-center font-sans font-bold text-xs text-[#E5E5E2] tracking-wider">
                            {project.id <= 9 ? `0${project.id}` : project.id}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
