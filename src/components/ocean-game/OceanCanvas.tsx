'use client';

import { useEffect, useRef } from 'react';

interface Props {
  stormActive?: boolean;
  goldenActive?: boolean;
}

export function OceanCanvas({ stormActive = false, goldenActive = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Particle system ────────────────────────────────────────────────────
    interface Particle { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; color: string; }
    const particles: Particle[] = [];

    function spawnParticle() {
      if (particles.length > 80) return;
      const isGold = goldenActive;
      particles.push({
        x: Math.random() * canvas!.width,
        y: canvas!.height * (0.35 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.4 - Math.random() * 0.8,
        size: 1 + Math.random() * 2.5,
        life: 0,
        maxLife: 60 + Math.random() * 80,
        color: isGold
          ? `rgba(255,${180 + Math.floor(Math.random() * 60)},0,`
          : stormActive
          ? `rgba(100,120,${150 + Math.floor(Math.random() * 60)},`
          : `rgba(180,210,${230 + Math.floor(Math.random() * 25)},`,
      });
    }

    // ── Rain drops (storm) ─────────────────────────────────────────────────
    interface Rain { x: number; y: number; speed: number; len: number; }
    const raindrops: Rain[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 1000,
      speed: 8 + Math.random() * 6,
      len: 12 + Math.random() * 18,
    }));

    // ── Stars ─────────────────────────────────────────────────────────────
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.45,
      r: Math.random() * 1.2,
      twinkle: Math.random() * Math.PI * 2,
      speed:   0.02 + Math.random() * 0.04,
    }));

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      const t = (tRef.current += 0.012);

      // ── Sky gradient ─────────────────────────────────────────────────────
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
      if (stormActive) {
        sky.addColorStop(0,    '#050508');
        sky.addColorStop(0.5,  '#0a0c14');
        sky.addColorStop(1,    '#0e1020');
      } else if (goldenActive) {
        sky.addColorStop(0,    '#0a0612');
        sky.addColorStop(0.45, '#1a1008');
        sky.addColorStop(1,    '#2a1a0a');
      } else {
        sky.addColorStop(0,    '#020408');
        sky.addColorStop(0.4,  '#060910');
        sky.addColorStop(1,    '#0a1420');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // ── Stars ────────────────────────────────────────────────────────────
      if (!stormActive) {
        stars.forEach((s) => {
          const flicker = 0.5 + 0.5 * Math.sin(s.twinkle + t * s.speed * 3);
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r * flicker, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220,230,255,${0.3 + 0.5 * flicker})`;
          ctx.fill();
        });
      }

      // ── Horizon glow ─────────────────────────────────────────────────────
      const horizonY = H * 0.48;
      const hGlow = ctx.createRadialGradient(W / 2, horizonY, 0, W / 2, horizonY, W * 0.7);
      if (goldenActive) {
        hGlow.addColorStop(0,   'rgba(200,120,20,0.18)');
        hGlow.addColorStop(0.4, 'rgba(150,80,10,0.08)');
        hGlow.addColorStop(1,   'transparent');
      } else if (stormActive) {
        hGlow.addColorStop(0,   'rgba(30,40,80,0.25)');
        hGlow.addColorStop(1,   'transparent');
      } else {
        hGlow.addColorStop(0,   'rgba(28,60,100,0.18)');
        hGlow.addColorStop(0.5, 'rgba(14,30,58,0.08)');
        hGlow.addColorStop(1,   'transparent');
      }
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, 0, W, H);

      // ── God ray (storm only: lightning flash) ─────────────────────────────
      if (stormActive && Math.sin(t * 7.3) > 0.97) {
        const lx = W * (0.2 + Math.random() * 0.6);
        ctx.strokeStyle = 'rgba(180,200,255,0.7)';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        let ly = 0;
        while (ly < H * 0.55) {
          ly += 20 + Math.random() * 40;
          ctx.lineTo(lx + (Math.random() - 0.5) * 30, ly);
        }
        ctx.stroke();
      }

      // ── Ocean waves (5 layers) ─────────────────────────────────────────────
      const waveLayers = [
        { yFrac: 0.44, amp: stormActive ? 22 : 12, freq: 0.008, spd: 0.4, color: stormActive ? 'rgba(20,30,60,0.90)' : goldenActive ? 'rgba(30,20,10,0.90)' : 'rgba(14,26,50,0.90)' },
        { yFrac: 0.50, amp: stormActive ? 18 : 10, freq: 0.011, spd: 0.6, color: stormActive ? 'rgba(15,22,48,0.92)' : goldenActive ? 'rgba(22,14,6,0.92)' : 'rgba(10,18,36,0.92)' },
        { yFrac: 0.56, amp: stormActive ? 14 : 7,  freq: 0.015, spd: 0.9, color: stormActive ? 'rgba(10,16,36,0.95)' : goldenActive ? 'rgba(16,10,4,0.95)' : 'rgba(8,14,28,0.95)'  },
        { yFrac: 0.62, amp: stormActive ? 10 : 5,  freq: 0.020, spd: 1.2, color: stormActive ? 'rgba(8,12,26,0.97)'  : goldenActive ? 'rgba(12,8,3,0.97)'   : 'rgba(6,10,20,0.97)'  },
        { yFrac: 0.70, amp: stormActive ? 6  : 3,  freq: 0.028, spd: 1.5, color: '#060910' },
      ];

      waveLayers.forEach(({ yFrac, amp, freq, spd, color }) => {
        const baseY = H * yFrac;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          const y = baseY
            + Math.sin(x * freq + t * spd) * amp
            + Math.sin(x * freq * 1.7 + t * spd * 0.8) * amp * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Foam crest
        const foamAlpha = stormActive ? 0.06 : 0.025;
        ctx.strokeStyle = `rgba(200,220,255,${foamAlpha})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      });

      // ── Rain ──────────────────────────────────────────────────────────────
      if (stormActive) {
        ctx.strokeStyle = 'rgba(140,170,220,0.15)';
        ctx.lineWidth   = 0.8;
        raindrops.forEach((r) => {
          r.y += r.speed;
          if (r.y > H) { r.y = -r.len; r.x = Math.random() * W; }
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + 2, r.y + r.len);
          ctx.stroke();
        });
      }

      // ── Ocean surface shimmer ─────────────────────────────────────────────
      if (goldenActive) {
        for (let i = 0; i < 6; i++) {
          const sx = (W * 0.1 + i * W * 0.16 + Math.sin(t * 0.5 + i) * 30);
          const sy = H * (0.55 + i * 0.04);
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 60);
          grd.addColorStop(0, 'rgba(255,180,40,0.06)');
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.fillRect(sx - 60, sy - 60, 120, 120);
        }
      }

      // ── Particles ────────────────────────────────────────────────────────
      if (Math.random() < 0.3) spawnParticle();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.life++;
        if (p.life > p.maxLife) { particles.splice(i, 1); continue; }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ')';
        ctx.fill();
      }

      // ── Storm fog vignette ───────────────────────────────────────────────
      if (stormActive) {
        const fog = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, W * 0.7);
        fog.addColorStop(0, 'transparent');
        fog.addColorStop(1, 'rgba(5,8,20,0.55)');
        ctx.fillStyle = fog;
        ctx.fillRect(0, 0, W, H);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [stormActive, goldenActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ display: 'block' }}
      aria-hidden
    />
  );
}
