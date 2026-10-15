import React, { useEffect, useRef, useState } from 'react';

export const MarqueeTicker: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isBoosted, setIsBoosted] = useState(false);
  const boostRef = useRef(false);
  const mouseYRef = useRef<number | null>(null);

  useEffect(() => {
    boostRef.current = isBoosted;
  }, [isBoosted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Parallax stars & warp streaks
    const stars = Array.from({ length: 85 }, () => ({
      x: Math.random() * 1600,
      y: Math.random() * 120,
      z: Math.random() * 2.5 + 0.5, // depth factor
      size: Math.random() * 1.4 + 0.4,
      isCrimson: Math.random() > 0.84,
      alpha: Math.random() * 0.65 + 0.25,
    }));

    //Exhaust particles emitted from the flagship engines
    interface ExhaustParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }
    const exhaust: ExhaustParticle[] = [];

    // Laser / plasma bolts
    interface LaserBolt {
      x: number;
      y: number;
      vx: number;
      length: number;
      alpha: number;
    }
    const lasers: LaserBolt[] = [];

    let tick = 0;
    let shipX = 0;
    let shipY = 56;
    let targetShipY = 56;
    let bankAngle = 0;
    let speedMultiplier = 1;

    const render = () => {
      tick++;
      const boosting = boostRef.current;
      const targetSpeed = boosting ? 3.4 : 1;
      speedMultiplier += (targetSpeed - speedMultiplier) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Subtle space nebula horizontal core glow
      const nebulaGrad = ctx.createLinearGradient(0, 0, width, 0);
      nebulaGrad.addColorStop(0, 'rgba(11, 11, 13, 0)');
      nebulaGrad.addColorStop(0.35, boosting ? 'rgba(215, 25, 32, 0.09)' : 'rgba(168, 168, 165, 0.04)');
      nebulaGrad.addColorStop(0.65, boosting ? 'rgba(56, 189, 248, 0.07)' : 'rgba(215, 25, 32, 0.05)');
      nebulaGrad.addColorStop(1, 'rgba(11, 11, 13, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Render Parallax Stars & Warp Streaks (Moving Right -> Left as ship flies Left -> Right)
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const vx = (s.z * 2.4 + 0.8) * speedMultiplier;
        s.x -= vx;
        if (s.x < -60) {
          s.x = width + Math.random() * 80;
          s.y = Math.random() * height;
        }

        const streakLen = boosting ? vx * 7.5 : vx * 1.8;
        ctx.save();
        ctx.strokeStyle = s.isCrimson
          ? `rgba(215, 25, 32, ${s.alpha})`
          : `rgba(240, 240, 245, ${s.alpha * 0.85})`;
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + streakLen, s.y);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Calculate Spaceship Position & Smooth Banking
      const baseShipX = width * 0.22 + Math.sin(tick * 0.018) * (width * 0.14) + (boosting ? 35 : 0);
      shipX += (baseShipX - shipX) * 0.08;

      if (mouseYRef.current !== null) {
        targetShipY = Math.max(22, Math.min(height - 22, mouseYRef.current));
      } else {
        targetShipY = height * 0.5 + Math.sin(tick * 0.04) * 14 + Math.cos(tick * 0.023) * 6;
      }

      const dy = targetShipY - shipY;
      shipY += dy * 0.09;
      bankAngle = Math.max(-0.28, Math.min(0.28, dy * 0.018));

      // Spawn engine exhaust particles from twin thrusters
      const emitCount = boosting ? 5 : 2;
      for (let i = 0; i < emitCount; i++) {
        const thrusterOffset = i % 2 === 0 ? -5 : 5;
        exhaust.push({
          x: shipX - 28,
          y: shipY + thrusterOffset + (Math.random() - 0.5) * 2.5,
          vx: -(Math.random() * 4.5 + 4.5) * speedMultiplier,
          vy: (Math.random() - 0.5) * 0.9 + dy * 0.02,
          life: 0,
          maxLife: boosting ? 34 : 24,
          size: boosting ? Math.random() * 2.8 + 1.6 : Math.random() * 2 + 1.1,
          color:
            Math.random() > 0.35
              ? '#D71920'
              : Math.random() > 0.5
              ? '#FF6B4A'
              : '#FFFFFF',
        });
      }

      // Periodically fire plasma bolts ahead
      if ((boosting && tick % 14 === 0) || (!boosting && tick % 75 === 0)) {
        lasers.push({
          x: shipX + 34,
          y: shipY + (tick % 28 === 0 ? -4 : 4),
          vx: 18 + speedMultiplier * 4,
          length: boosting ? 38 : 26,
          alpha: 1,
        });
      }

      // 3. Update & Draw Laser Bolts
      for (let i = lasers.length - 1; i >= 0; i--) {
        const b = lasers[i];
        b.x += b.vx;
        if (b.x > width + 100) {
          lasers.splice(i, 1);
          continue;
        }
        ctx.save();
        const grad = ctx.createLinearGradient(b.x - b.length, b.y, b.x, b.y);
        grad.addColorStop(0, 'rgba(215, 25, 32, 0)');
        grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.85)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#D71920';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(b.x - b.length, b.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Update & Draw Engine Exhaust Trail
      for (let i = exhaust.length - 1; i >= 0; i--) {
        const p = exhaust[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life >= p.maxLife) {
          exhaust.splice(i, 1);
          continue;
        }
        const ratio = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = ratio * 0.85;
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#D71920';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * ratio, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw Escort Wingman Drone (Flying slightly behind & above/below)
      const droneX = shipX - 95 + Math.cos(tick * 0.03) * 18;
      const droneY = height * 0.5 - (shipY - height * 0.5) * 0.55 + Math.sin(tick * 0.05) * 8;
      ctx.save();
      ctx.translate(droneX, droneY);
      // Drone engine flame
      const droneFlame = 10 + Math.sin(tick * 0.5) * 4 + (boosting ? 12 : 0);
      const dFlameGrad = ctx.createLinearGradient(-12 - droneFlame, 0, -8, 0);
      dFlameGrad.addColorStop(0, 'rgba(215, 25, 32, 0)');
      dFlameGrad.addColorStop(1, 'rgba(239, 68, 68, 0.9)');
      ctx.fillStyle = dFlameGrad;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(-12 - droneFlame, 0);
      ctx.lineTo(-8, 2);
      ctx.closePath();
      ctx.fill();

      // Drone sleek delta hull
      ctx.fillStyle = '#A8A8A5';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 6. Draw Flagship Alpha Interceptor Spaceship
      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(bankAngle);

      // Twin Afterburner Flame Cones
      const flameLen = (boosting ? 62 : 28) + Math.sin(tick * 0.6) * 6;
      [-5, 5].forEach((offsetY) => {
        const flameGrad = ctx.createLinearGradient(-24 - flameLen, offsetY, -22, offsetY);
        flameGrad.addColorStop(0, 'rgba(215, 25, 32, 0)');
        flameGrad.addColorStop(0.45, 'rgba(215, 25, 32, 0.75)');
        flameGrad.addColorStop(0.85, 'rgba(255, 160, 110, 0.95)');
        flameGrad.addColorStop(1, '#FFFFFF');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-22, offsetY - 3.2);
        ctx.lineTo(-24 - flameLen, offsetY);
        ctx.lineTo(-22, offsetY + 3.2);
        ctx.closePath();
        ctx.fill();
      });

      // Outer Swept Wings (Dark Gunmetal with Silver Edge)
      ctx.fillStyle = '#1E1E24';
      ctx.strokeStyle = '#8E8E95';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-20, -18);
      ctx.lineTo(-26, -15);
      ctx.lineTo(-16, -4);
      ctx.lineTo(-16, 4);
      ctx.lineTo(-26, 15);
      ctx.lineTo(-20, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crimson Wingtip Racing Stripes
      ctx.fillStyle = '#D71920';
      ctx.beginPath();
      ctx.moveTo(-8, -11);
      ctx.lineTo(-19, -17);
      ctx.lineTo(-23, -15);
      ctx.lineTo(-13, -9);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-8, 11);
      ctx.lineTo(-19, 17);
      ctx.lineTo(-23, 15);
      ctx.lineTo(-13, 9);
      ctx.closePath();
      ctx.fill();

      // Main Fuselage Body (Brushed Silver Metallic Gradient)
      const hullGrad = ctx.createLinearGradient(-24, -8, 32, 8);
      hullGrad.addColorStop(0, '#686870');
      hullGrad.addColorStop(0.5, '#E4E4E8');
      hullGrad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.moveTo(34, 0); // Sharp nose cone
      ctx.lineTo(4, -8);
      ctx.lineTo(-23, -6);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-23, 6);
      ctx.lineTo(4, 8);
      ctx.closePath();
      ctx.fill();

      // Cockpit Canopy (Glowing Obsidian / Crimson Visor)
      const canopyGrad = ctx.createLinearGradient(-4, -3, 16, 3);
      canopyGrad.addColorStop(0, '#0B0B0E');
      canopyGrad.addColorStop(0.7, '#D71920');
      canopyGrad.addColorStop(1, '#FF7A7E');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(3, -3.5);
      ctx.lineTo(-6, -2.5);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, 2.5);
      ctx.lineTo(3, 3.5);
      ctx.closePath();
      ctx.fill();

      // Nose & Wing Navigation Beacon Glow
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#D71920';
      ctx.shadowBlur = boosting ? 18 : 8;
      ctx.beginPath();
      ctx.arc(33, 0, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      onMouseEnter={() => setIsBoosted(true)}
      onMouseLeave={() => {
        setIsBoosted(false);
        mouseYRef.current = null;
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseYRef.current = e.clientY - rect.top;
      }}
      onClick={() => setIsBoosted((prev) => !prev)}
      className="w-full h-24 sm:h-28 bg-[#08080A] border-y border-[#222228] overflow-hidden select-none relative z-10 cursor-crosshair group"
      title="Move cursor to pilot spaceship • Hover or click for Hyperdrive Boost"
    >
      {/* Top & Bottom Metallic Hairline Highlights */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D71920]/40 to-transparent pointer-events-none z-20" />

      {/* Left & Right Edge Vignettes */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#0B0B0C] to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#0B0B0C] to-transparent z-20 pointer-events-none" />

      {/* Interactive Spaceship Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
