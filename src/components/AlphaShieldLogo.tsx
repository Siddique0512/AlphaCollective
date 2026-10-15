import React, { useId } from 'react';

interface AlphaShieldLogoProps {
  variant?: 'icon' | 'badge';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}

export const AlphaShieldLogo: React.FC<AlphaShieldLogoProps> = ({
  variant = 'badge',
  className = '',
  size = 'md',
}) => {
  const uid = useId().replace(/:/g, '');

  // Dimension mappings
  const dimensions = {
    sm: { icon: 28, box: 'w-8 h-8', text: 'text-xs' },
    md: { icon: 36, box: 'w-10 h-10 sm:w-11 sm:h-11', text: 'text-sm sm:text-base' },
    lg: { icon: 54, box: 'w-14 h-14 sm:w-16 sm:h-16', text: 'text-lg sm:text-xl' },
    xl: { icon: 88, box: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-2xl sm:text-3xl' },
    hero: { icon: 124, box: 'w-32 h-32 sm:w-40 sm:h-40', text: 'text-4xl sm:text-5xl' },
  }[size];

  // Exact 3D Faceted Metallic Shield & Two-Piece Geometric "A" Monogram
  const ShieldVector = ({ width = 48, height = 48 }: { width?: number; height?: number }) => (
    <svg
      viewBox="0 0 1000 1000"
      width={width}
      height={height}
      className="drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)] transition-transform duration-300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main Brushed Steel Face Gradient (Top-Center Specular to Gunmetal Base) */}
        <linearGradient id={`steelFace-${uid}`} x1="35%" y1="5%" x2="65%" y2="95%">
          <stop offset="0%" stopColor="#F5F5F7" />
          <stop offset="18%" stopColor="#D2D2D6" />
          <stop offset="45%" stopColor="#8E8E93" />
          <stop offset="75%" stopColor="#68686D" />
          <stop offset="100%" stopColor="#4A4A4F" />
        </linearGradient>

        {/* Monogram "A" Brushed Silver Face Gradient */}
        <linearGradient id={`aFace-${uid}`} x1="30%" y1="15%" x2="70%" y2="85%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="22%" stopColor="#DADADE" />
          <stop offset="55%" stopColor="#96969B" />
          <stop offset="85%" stopColor="#747479" />
          <stop offset="100%" stopColor="#58585D" />
        </linearGradient>

        {/* Outer Shield Top Bevel (Bright Light Catch) */}
        <linearGradient id={`bevelTopLight-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9A9AA0" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#8A8A90" />
        </linearGradient>

        {/* Outer Left Bevel */}
        <linearGradient id={`bevelOuterLeft-${uid}`} x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#68686E" />
          <stop offset="50%" stopColor="#3A3A3F" />
          <stop offset="100%" stopColor="#222226" />
        </linearGradient>

        {/* Outer Right Bevel */}
        <linearGradient id={`bevelOuterRight-${uid}`} x1="100%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#525258" />
          <stop offset="50%" stopColor="#2C2C30" />
          <stop offset="100%" stopColor="#18181B" />
        </linearGradient>

        {/* Inner Shield Top Bevel (Dark Shadow Under Arch) */}
        <linearGradient id={`bevelInnerTop-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#252529" />
          <stop offset="50%" stopColor="#3E3E44" />
          <stop offset="100%" stopColor="#222226" />
        </linearGradient>

        {/* Inner Shield Left Bevel (Catches Lower Rim Light) */}
        <linearGradient id={`bevelInnerLeft-${uid}`} x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#48484E" />
          <stop offset="60%" stopColor="#9E9EA4" />
          <stop offset="100%" stopColor="#E4E4E8" />
        </linearGradient>

        {/* Inner Shield Right Bevel (Catches Lower Rim Light) */}
        <linearGradient id={`bevelInnerRight-${uid}`} x1="100%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#3A3A40" />
          <stop offset="60%" stopColor="#7E7E84" />
          <stop offset="100%" stopColor="#C4C4C8" />
        </linearGradient>

        {/* Left Hook Outer Left Bevel */}
        <linearGradient id={`hookLeftBevel-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F4F4F6" />
          <stop offset="50%" stopColor="#A6A6AC" />
          <stop offset="100%" stopColor="#6E6E74" />
        </linearGradient>

        {/* Right Leg Outer Right Bevel */}
        <linearGradient id={`legRightBevel-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E2E6" />
          <stop offset="50%" stopColor="#8E8E94" />
          <stop offset="100%" stopColor="#4E4E54" />
        </linearGradient>

        {/* Deep Shadow Filter for Shield & Monogram */}
        <filter id={`deepShadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000000" floodOpacity="0.85" />
        </filter>
      </defs>

      {/* =================================================================== */}
      {/* 1. 3D FACETED METALLIC SHIELD FRAME                                 */}
      {/* =================================================================== */}
      <g filter={`url(#deepShadow-${uid})`}>
        {/* Outer Bevel — Top Arch Facet */}
        <path
          d="M 146 228 C 270 140, 380 114, 500 114 C 620 114, 730 140, 854 228 L 830 242 C 714 160, 610 136, 500 136 C 390 136, 286 160, 170 242 Z"
          fill={`url(#bevelTopLight-${uid})`}
        />

        {/* Outer Bevel — Left Side Facet */}
        <path
          d="M 146 228 C 156 495, 265 725, 500 886 L 500 858 C 284 704, 180 486, 170 242 Z"
          fill={`url(#bevelOuterLeft-${uid})`}
        />

        {/* Outer Bevel — Right Side Facet */}
        <path
          d="M 854 228 C 844 495, 735 725, 500 886 L 500 858 C 716 704, 820 486, 830 242 Z"
          fill={`url(#bevelOuterRight-${uid})`}
        />

        {/* Main Flat Brushed-Steel Shield Face (EvenOdd Ring) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 170 242 C 286 160, 390 136, 500 136 C 610 136, 714 160, 830 242 C 820 486, 716 704, 500 858 C 284 704, 180 486, 170 242 Z M 206 262 C 310 190, 398 168, 500 168 C 602 168, 690 190, 794 262 C 784 474, 688 672, 500 812 C 312 672, 216 474, 206 262 Z"
          fill={`url(#steelFace-${uid})`}
        />

        {/* Inner Bevel — Top Arch Facet */}
        <path
          d="M 206 262 C 310 190, 398 168, 500 168 C 602 168, 690 190, 794 262 L 776 272 C 678 204, 596 184, 500 184 C 404 184, 322 204, 224 272 Z"
          fill={`url(#bevelInnerTop-${uid})`}
        />

        {/* Inner Bevel — Left Side Facet */}
        <path
          d="M 206 262 C 216 474, 312 672, 500 812 L 500 790 C 326 656, 234 468, 224 272 Z"
          fill={`url(#bevelInnerLeft-${uid})`}
        />

        {/* Inner Bevel — Right Side Facet */}
        <path
          d="M 794 262 C 784 474, 688 672, 500 812 L 500 790 C 674 656, 766 468, 776 272 Z"
          fill={`url(#bevelInnerRight-${uid})`}
        />

        {/* Corner Miter Lines & Specular Ridge Highlights */}
        <line x1="146" y1="228" x2="224" y2="272" stroke="#D4D4D8" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="854" y1="228" x2="776" y2="272" stroke="#A1A1AA" strokeWidth="2" strokeOpacity="0.5" />
        <line x1="500" y1="790" x2="500" y2="886" stroke="#D4D4D8" strokeWidth="2" strokeOpacity="0.55" />

        {/* Subtle Brushed Scratch Accents on Shield Rim */}
        <path
          d="M 170 242 C 286 160, 390 136, 500 136 C 610 136, 714 160, 830 242"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.55"
          fill="none"
        />
        <path
          d="M 224 272 C 234 468, 326 656, 500 790 C 674 656, 766 468, 776 272"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          fill="none"
        />
      </g>

      {/* =================================================================== */}
      {/* 2. STYLIZED TWO-PIECE 3D METALLIC "A" MONOGRAM                      */}
      {/* =================================================================== */}
      <g filter={`url(#deepShadow-${uid})`}>
        {/* ----------------------------------------------------------------- */}
        {/* PIECE 1: LEFT HOOK ("L" / OPEN TRIANGLE BASE)                     */}
        {/* ----------------------------------------------------------------- */}
        {/* Outer Left Bevel (A1 -> A2 -> B2 -> B1) */}
        <polygon
          points="455,298 304,646 330,628 454,340"
          fill={`url(#hookLeftBevel-${uid})`}
        />
        {/* Bottom Bevel (A2 -> A3 -> B3 -> B2) */}
        <polygon
          points="304,646 526,646 503,628 330,628"
          fill="#242428"
        />
        {/* Right Slanted End Bevel of Hook (A3 -> A4 -> B4 -> B3) */}
        <polygon
          points="526,646 495,564 482,580 503,628"
          fill="#525258"
        />
        {/* Inner Horizontal Top Bevel of Hook (A4 -> A5 -> B5 -> B4) */}
        <polygon
          points="495,564 420,564 396,580 482,580"
          fill="#E4E4E8"
        />
        {/* Inner Diagonal Cutout Bevel (A5 -> A6 -> B6 -> B5) */}
        <polygon
          points="420,564 493,394 476,396 396,580"
          fill="#2D2D32"
        />
        {/* Top Diagonal Gap Bevel (A6 -> A1 -> B1 -> B6) */}
        <polygon
          points="493,394 455,298 454,340 476,396"
          fill="#626268"
        />
        {/* Main Brushed Metal Flat Face of Left Hook (B1..B6) */}
        <polygon
          points="454,340 330,628 503,628 482,580 396,580 476,396"
          fill={`url(#aFace-${uid})`}
        />
        {/* Crisp Specular Edge Highlight on Left Hook */}
        <polyline
          points="454,340 330,628 503,628"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* ----------------------------------------------------------------- */}
        {/* PIECE 2: RIGHT DIAGONAL BAR                                       */}
        {/* ----------------------------------------------------------------- */}
        {/* Top Bevel (C1 -> C2 -> D2 -> D1) */}
        <polygon
          points="463,276 544,276 532,293 485,293"
          fill="#F4F4F6"
        />
        {/* Outer Right Bevel (C2 -> C3 -> D3 -> D2) */}
        <polygon
          points="544,276 694,646 669,628 532,293"
          fill={`url(#legRightBevel-${uid})`}
        />
        {/* Bottom Bevel (C3 -> C4 -> D4 -> D3) */}
        <polygon
          points="694,646 605,646 617,628 669,628"
          fill="#222226"
        />
        {/* Inner Left Bevel Facing the Diagonal Gap (C4 -> C1 -> D1 -> D4) */}
        <polygon
          points="605,646 463,276 485,293 617,628"
          fill="#323238"
        />
        {/* Main Brushed Metal Flat Face of Right Leg (D1..D4) */}
        <polygon
          points="485,293 532,293 669,628 617,628"
          fill={`url(#aFace-${uid})`}
        />
        {/* Crisp Specular Edge Highlight on Right Leg */}
        <polyline
          points="485,293 532,293 669,628"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeOpacity="0.55"
          fill="none"
        />
      </g>
    </svg>
  );

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className={`relative ${dimensions.box} rounded-xl bg-[#0B0B0D] border border-[#2C2C32] shadow-[0_6px_24px_rgba(0,0,0,0.85)] flex items-center justify-center overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(38,38,44,0.55)_0%,rgba(8,8,10,0.98)_80%)] pointer-events-none" />
        <div className="absolute inset-[1px] rounded-[10px] border border-white/[0.06] pointer-events-none" />

        <ShieldVector width={dimensions.icon} height={dimensions.icon} />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 font-sans leading-none tracking-wider">
            <span className={`font-bold text-[#F5F5F3] ${dimensions.text}`}>ALPHA</span>
            <span className={`font-light text-[#A8A8A5] ${dimensions.text}`}>COLLECTIV3</span>
          </div>
        </div>
      )}
    </div>
  );
};
