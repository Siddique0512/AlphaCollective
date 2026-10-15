import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { AlphaShieldLogo } from './AlphaShieldLogo';

interface HeroProps {
  onJoinClick: () => void;
  onExploreClick: () => void;
  onCommunityClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onJoinClick,
  onExploreClick,
}) => {
  // Interactive 3D tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 140 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 140 });

  const rotateX = useTransform(smoothY, [-300, 300], [10, -10]);
  const rotateY = useTransform(smoothX, [-400, 400], [-12, 12]);
  const glowX = useTransform(smoothX, [-400, 400], [-60, 60]);
  const glowY = useTransform(smoothY, [-300, 300], [-40, 40]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="hero-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-carbon-hero text-[#F5F5F3] pt-14 pb-20 sm:pt-20 sm:pb-28 overflow-hidden text-center select-none"
    >
      {/* Dynamic Cursor-Following Silver Radial Ambient Core */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[850px] h-[350px] sm:h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(168,168,165,0.11)_0%,rgba(11,11,12,0)_70%)] pointer-events-none -z-0"
      />
      
      {/* Concentric Subtle Orbit Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-white/[0.03] pointer-events-none -z-0 animate-[spin_90s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-dashed border-white/[0.018] pointer-events-none -z-0 animate-[spin_120s_linear_infinite_reverse]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        {/* Prominent Alpha Collective Shield Logo with 3D Interactive Tilt */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            rotateX,
            rotateY,
            transformPerspective: 900,
          }}
          className="mb-8 cursor-grab active:cursor-grabbing"
        >
          <AlphaShieldLogo variant="icon" size="xl" />
        </motion.div>

        {/* Clean, Refined Hero Title: ALPHA COLLECTIV3 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full flex flex-col items-center justify-center font-sans tracking-wide uppercase"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.95] text-[#F5F5F3] select-none">
            ALPHA
          </h1>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light leading-[0.95] text-[#A8A8A5] select-none mt-1 sm:mt-2">
            COLLECTIV3
          </h1>
        </motion.div>

        {/* Supporting Hero Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="max-w-2xl mx-auto mt-8 sm:mt-10 mb-10 sm:mb-12 px-4"
        >
          <p className="text-base sm:text-xl md:text-2xl font-sans font-medium sm:font-semibold tracking-normal text-[#F5F5F3] uppercase leading-snug">
            COME FOR THE ALPHA. <span className="text-[#A8A8A5] font-normal">STAY FOR THE PEOPLE.</span>
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {/* Primary Button: Restrained Crimson */}
          <button
            onClick={onJoinClick}
            id="hero-join-cta"
            className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-sm bg-[#D71920] hover:bg-[#B8151B] text-white text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(215,25,32,0.25)] flex items-center gap-2 cursor-pointer hover:translate-y-[-1px]"
          >
            <span>JOIN ALPHA</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          {/* Secondary Button: Silver Border / Graphite */}
          <button
            onClick={onExploreClick}
            id="hero-explore-cta"
            className="px-7 py-3.5 sm:px-9 sm:py-4 rounded-sm bg-[#141416] hover:bg-[#1E1E22] border border-[#29292B] hover:border-[#A8A8A5] text-[#F5F5F3] text-xs sm:text-sm font-sans font-medium uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>EXPLORE COLLABS</span>
            <ArrowUpRight className="w-4 h-4 text-[#A8A8A5]" />
          </button>
        </motion.div>



      </div>
    </section>
  );
};
