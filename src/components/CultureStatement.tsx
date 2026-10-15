import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export const CultureStatement: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for fluid spotlight motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 120 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 120 });

  // 3D Parallax tilt for background Greek alpha symbol
  const alphaRotate = useTransform(smoothX, [-400, 400], [-12, 12]);
  const alphaY = useTransform(smoothY, [-300, 300], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const statements = [
    {
      id: 'people',
      left: 'PEOPLE',
      operator: '>',
      right: 'NUMBERS',
    },
    {
      id: 'community',
      left: 'COMMUNITY',
      operator: '>',
      right: 'HYPE',
    },
    {
      id: 'real',
      left: 'REAL',
      operator: '>',
      right: 'LOUD',
    },
  ];

  return (
    <section
      id="culture-section"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-[#0B0B0C] text-[#F5F5F3] py-28 sm:py-44 border-b border-[#29292B] relative overflow-hidden select-none"
    >
      {/* Dynamic Cursor Light Spotlight Beam */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          background: 'radial-gradient(circle, rgba(168,168,165,0.12) 0%, transparent 70%)',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none opacity-40 blur-[90px]"
      />

      {/* Kinetic Floating Greek Alpha "α" Watermark with 3D Tilt */}
      <motion.div
        style={{
          rotate: alphaRotate,
          y: alphaY,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans font-black text-[280px] sm:text-[420px] text-white/[0.018] pointer-events-none select-none leading-none z-0 transition-transform duration-300"
      >
        α
      </motion.div>

      {/* Subtle Scanline / Grid Ambient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,168,165,0.03)_0%,rgba(11,11,12,0.98)_80%)] pointer-events-none" />

      {/* Animated Subtle Floating Particle Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/5 w-72 h-[1px] bg-gradient-to-r from-transparent via-[#D71920]/40 to-transparent"
        />
        <motion.div
          animate={{
            y: [20, -20, 20],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/3 right-1/4 w-96 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* ============================================================== */}
        {/* 3 CORE STATEMENTS (PURE TEXT, NO LINKS/BUTTONS)                */}
        {/* ============================================================== */}
        <div className="space-y-6 sm:space-y-10 font-sans font-bold uppercase tracking-tight">
          {statements.map((stmt, idx) => (
            <motion.div
              key={stmt.id}
              id={`culture-statement-${stmt.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: idx * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative py-2 sm:py-3 select-none"
            >
              <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-nowrap whitespace-nowrap">
                {/* Left Word */}
                <span className="text-[clamp(1.5rem,5.2vw,4.5rem)] leading-none text-[#F5F5F3]">
                  {stmt.left}
                </span>

                {/* Operator Chevron */}
                <span
                  className={`text-[clamp(1.5rem,5.2vw,4.5rem)] font-light leading-none inline-block drop-shadow-sm ${
                    stmt.id === 'real' ? 'text-[#D71920]' : 'text-[#A8A8A5]'
                  }`}
                >
                  {stmt.operator}
                </span>

                {/* Right Word */}
                <span className="text-[clamp(1.5rem,5.2vw,4.5rem)] leading-none text-[#A8A8A5]">
                  {stmt.right}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
