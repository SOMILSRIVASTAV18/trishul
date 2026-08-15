import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: () => void;
}

/**
 * Cinematic TRISHUL CRM opening sequence — hyper-realistic pass.
 *
 * Storyboard:
 * 0  Trishul appears (starlit void)
 * 1  Accelerates down (motion-blur streak + atmospheric ionization)
 * 2  Hits the ground (camera shake, dust plume, sparks, shockwave ring)
 * 3  Shatters the ground (radiating cracks, tumbling debris)
 * 4  Energy wave spreads (layered shockwave, heat-shimmer)
 * 5  Screen flashes (overexposed white flash + lens flare streaks)
 * 6  Trishul transforms (light-ray bloom, ember rise)
 * 7  CRM interface appears (glass sheen reveal)
 */
export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSfx = (type: 'hum' | 'whoosh' | 'impact' | 'rumble' | 'wave' | 'shimmer') => {
    if (!soundEnabled || typeof window === 'undefined') return;

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume();

      const now = ctx.currentTime;

      if (type === 'hum') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 1.8);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.2);
      }

      if (type === 'whoosh') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.65);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.14, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);

        // High-frequency ionization sizzle layered on top of the whoosh.
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 4000;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.05, now + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.55);
      }

      if (type === 'impact') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(24, now + 0.9);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1);

        // Sharp crack transient — filtered noise burst.
        const crackBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
        const crackData = crackBuffer.getChannelData(0);
        for (let i = 0; i < crackData.length; i++) {
          crackData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crackData.length, 2);
        }
        const crack = ctx.createBufferSource();
        crack.buffer = crackBuffer;
        const crackFilter = ctx.createBiquadFilter();
        crackFilter.type = 'bandpass';
        crackFilter.frequency.value = 1800;
        crackFilter.Q.value = 0.7;
        const crackGain = ctx.createGain();
        crackGain.gain.setValueAtTime(0.3, now);
        crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        crack.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(ctx.destination);
        crack.start(now);
      }

      if (type === 'rumble') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(38, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
      }

      if (type === 'wave') {
        [110, 220, 440].forEach((frequency, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(frequency, now + index * 0.04);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.07, now + 0.08 + index * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + index * 0.04);
          osc.stop(now + 1.1);
        });
      }

      if (type === 'shimmer') {
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + index * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(frequency, start);
          gain.gain.setValueAtTime(0.001, start);
          gain.gain.exponentialRampToValueAtTime(0.06, start + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 1.1);
        });
      }
    } catch {
      // Browsers may block Web Audio until the first user interaction.
    }
  };

  useEffect(() => {
    playSfx('hum');

    const timers = [
      window.setTimeout(() => {
        setPhase(1);
        playSfx('whoosh');
      }, 1050),

      window.setTimeout(() => {
        setPhase(2);
        playSfx('impact');
        playSfx('rumble');
      }, 2100),

      window.setTimeout(() => {
        setPhase(3);
      }, 2500),

      window.setTimeout(() => {
        setPhase(4);
        playSfx('wave');
      }, 3150),

      window.setTimeout(() => {
        setPhase(5);
        playSfx('shimmer');
      }, 4050),

      window.setTimeout(() => {
        setPhase(6);
      }, 4500),

      window.setTimeout(() => {
        setPhase(7);
      }, 5200),

      window.setTimeout(() => {
        onComplete();
      }, 7600),
    ];

    return () => timers.forEach(window.clearTimeout);
    // Intentionally run once: the sequence is a one-shot intro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isShaking = phase === 2 || phase === 3;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#02050b] text-white select-none">
      <CinematicBackground phase={phase} />
      <CinematicParticleField phase={phase} />
      <FilmGrain />

      {/* Deep cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(1,5,12,0.18)_38%,rgba(0,2,7,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#02050b]/60 via-transparent to-[#02050b]/92" />
      {/* Subtle top-down key light so the whole frame doesn't read flat */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,214,140,0.06),transparent_60%)]" />

      {/* Controls */}
      <div className="absolute right-5 top-5 z-[100] flex gap-2">
        <button
          type="button"
          onClick={() => setSoundEnabled((value) => !value)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-semibold tracking-wider text-white/70 backdrop-blur-xl transition hover:bg-white/10"
          aria-label="Toggle intro sound"
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {soundEnabled ? 'SOUND ON' : 'SOUND OFF'}
        </button>

        <button
          type="button"
          onClick={onComplete}
          className="rounded-full border border-amber-300/30 bg-black/40 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-amber-200 backdrop-blur-xl transition hover:bg-amber-300/10"
        >
          SKIP
        </button>
      </div>

      {/* Main cinematic stage — the whole stage shakes on impact, like a handheld camera. */}
      <motion.div
        className="relative z-20 flex h-full w-full items-center justify-center"
        animate={
          isShaking
            ? {
                x: [0, -10, 9, -7, 6, -4, 3, -2, 0],
                y: [0, 6, -5, 4, -3, 2, -1, 1, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <AnimatePresence mode="wait">
          {phase < 6 && (
            <motion.div
              key="trishul-stage"
              className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                scale: 1.6,
                filter: 'blur(16px)',
                transition: { duration: 0.45 },
              }}
            >
              <CinematicTrishul phase={phase} />

              {/* Ground plane, given a faint horizon-perspective gradient instead of a flat line */}
              <motion.div
                className="absolute left-1/2 bottom-[20%] h-px w-[62vw] max-w-[900px] -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-200/70 to-transparent"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                  opacity: phase >= 2 ? 1 : 0,
                  scaleX: phase >= 2 ? 1 : 0,
                }}
                transition={{ duration: 0.25 }}
              />
              <motion.div
                className="absolute left-1/2 bottom-[19.4%] h-16 w-[68vw] max-w-[1000px] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(120,80,20,0.35),transparent_75%)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* Ground glow */}
              <motion.div
                className="absolute left-1/2 bottom-[19.7%] h-20 w-[40vw] -translate-x-1/2 rounded-[50%] bg-amber-400/20 blur-3xl"
                animate={{
                  opacity: phase >= 2 ? [0.1, 0.9, 0.25] : 0,
                  scaleX: phase >= 3 ? 1.5 : 0.7,
                }}
                transition={{ duration: 0.8 }}
              />

              <ImpactDust phase={phase} />
              <ImpactSparks phase={phase} />
              <ShockwaveRing phase={phase} />
              <EnergyWave phase={phase} />
              <GroundShatter phase={phase} />
            </motion.div>
          )}

          {phase === 6 && <Transformation key="transformation" />}

          {phase >= 7 && <CRMInterface key="crm-interface" onContinue={onComplete} />}
        </AnimatePresence>
      </motion.div>

      {/* Overexposed flash + lens flare streaks, layered above everything for the "screen flashes" beat */}
      <ScreenFlash phase={phase} />

      {/* Story labels — deliberately minimal so the visual remains the hero */}
      <div className="pointer-events-none absolute bottom-7 left-1/2 z-50 -translate-x-1/2 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-[9px] font-semibold uppercase tracking-[0.38em] text-white/45"
          >
            {phase === 0 && 'TRISHUL APPEARS'}
            {phase === 1 && 'ACCELERATING DOWN'}
            {phase === 2 && 'IMPACT'}
            {phase === 3 && 'GROUND SHATTER'}
            {phase === 4 && 'ENERGY WAVE'}
            {phase === 5 && 'SYSTEM AWAKENING'}
            {phase === 6 && 'TRANSFORMING'}
            {phase >= 7 && 'TRISHUL CRM'}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Film grain — a tiny, near-static noise layer that sells the "shot on       */
/* camera" feeling. Cheap (one CSS filter primitive), and mix-blend-mode      */
/* keeps it from ever muddying the darks or blowing out the highlights.       */
/* -------------------------------------------------------------------------- */

const FilmGrain = () => (
  <svg className="pointer-events-none absolute inset-0 z-40 h-full w-full opacity-[0.05] mix-blend-overlay" aria-hidden="true">
    <filter id="grainFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grainFilter)" />
  </svg>
);

const CinematicBackground: React.FC<{ phase: number }> = ({ phase }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.8 + 0.25,
      alpha: Math.random() * 0.65 + 0.15,
      speed: Math.random() * 0.0007 + 0.00015,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Slow-drifting embers/dust motes that give the void depth even at rest.
    const motes = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.2 + 0.6,
      driftX: (Math.random() - 0.5) * 0.00012,
      driftY: -Math.random() * 0.00018 - 0.00004,
      alpha: Math.random() * 0.3 + 0.05,
    }));

    let t = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      width = window.innerWidth;
      height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.016;
      context.clearRect(0, 0, width, height);

      // Stars, with a gentle twinkle so the field doesn't feel like a static texture.
      for (const star of stars) {
        star.y += star.speed * (phase >= 1 ? 8 : 1);
        if (star.y > 1) star.y = 0;

        const twinkle = 0.75 + 0.25 * Math.sin(t * 2 + star.twinklePhase);
        context.beginPath();
        context.fillStyle = `rgba(255,248,220,${star.alpha * twinkle})`;
        context.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        context.fill();
      }

      // Ambient dust motes lit faintly amber, as if catching a distant light source.
      for (const mote of motes) {
        mote.x += mote.driftX;
        mote.y += mote.driftY;
        if (mote.y < -0.02) mote.y = 1.02;
        if (mote.x < -0.02) mote.x = 1.02;
        if (mote.x > 1.02) mote.x = -0.02;

        context.beginPath();
        context.fillStyle = `rgba(255,200,120,${mote.alpha})`;
        context.arc(mote.x * width, mote.y * height, mote.size, 0, Math.PI * 2);
        context.fill();
      }

      // Atmospheric vertical energy streaks during descent — longer + brighter
      // near the trishul's path to sell ionized-air friction.
      if (phase === 1 || phase === 2) {
        for (let i = 0; i < 26; i++) {
          const x = width * (0.5 + (Math.random() - 0.5) * 0.4);
          const distFromCenter = Math.abs(x - width * 0.5) / (width * 0.2);
          const length = (24 + Math.random() * 150) * (1 - distFromCenter * 0.4);
          const y = Math.random() * height * 0.85;

          const gradient = context.createLinearGradient(x, y, x, y + length);
          gradient.addColorStop(0, 'rgba(255,225,140,0)');
          gradient.addColorStop(0.4, `rgba(255,205,95,${0.4 - distFromCenter * 0.15})`);
          gradient.addColorStop(1, 'rgba(255,255,255,0)');

          context.strokeStyle = gradient;
          context.lineWidth = 1 + Math.random() * 1.6;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x, y + length);
          context.stroke();
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [phase]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
};

/**
 * Real-time particle pass for the physical beats in the storyboard.
 * Uses Canvas rather than dozens of DOM nodes so impact/shatter can be dense
 * without making React reconcile hundreds of elements.
 */
const CinematicParticleField: React.FC<{ phase: number }> = ({ phase }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let start = performance.now();

    const particles = Array.from({ length: 170 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 2.7,
      radius: 0.5 + Math.random() * 2.5,
      life: Math.random(),
      size: 0.7 + Math.random() * 2.1,
      drift: (Math.random() - 0.5) * 0.6,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawLightning = (cx: number, cy: number, length: number, alpha: number) => {
      for (let branch = 0; branch < 4; branch++) {
        const side = branch % 2 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx + side * (branch * 3), cy);
        let x = cx + side * (branch * 3);
        let y = cy;
        const segments = 6 + Math.floor(Math.random() * 3);
        for (let i = 0; i < segments; i++) {
          x += side * (length / segments) * (0.75 + Math.random() * 0.55);
          y += (Math.random() - 0.5) * 32;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255,225,145,${alpha * (0.65 + Math.random() * 0.35)})`;
        ctx.lineWidth = 0.7 + Math.random() * 1.3;
        ctx.shadowColor = "rgba(255,178,45,.9)";
        ctx.shadowBlur = 8;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };

    const draw = (now: number) => {
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const groundY = h * 0.80;

      // Floating embers / impact debris.
      if (phase >= 2 && phase < 6) {
        const intensity =
          phase === 2 ? 1 : phase === 3 ? 1.25 : phase === 4 ? 0.7 : 0.18;

        for (const p of particles) {
          const life = (p.life + elapsed * (0.18 + p.speed * 0.05)) % 1;
          const spread = (40 + life * 340) * intensity;
          const x =
            cx +
            Math.cos(p.angle) * spread +
            p.drift * Math.sin(elapsed * 2 + p.angle) * 20;
          const y =
            groundY -
            Math.abs(Math.sin(p.angle)) * spread * 0.34 -
            life * 110 +
            life * life * 170;
          const a = Math.sin(Math.PI * life) * (phase === 3 ? 0.95 : 0.65);

          ctx.beginPath();
          ctx.fillStyle = `rgba(255,${165 + Math.floor(Math.random() * 55)},${65 + Math.floor(Math.random() * 45)},${a})`;
          ctx.arc(x, y, p.size * (1 - life * 0.35), 0, Math.PI * 2);
          ctx.fill();

          if (phase === 2 && life < 0.55) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(p.angle) * 12, y - 5);
            ctx.strokeStyle = `rgba(255,220,150,${a * 0.65})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Electrical discharge around the trishul at the hit.
      if (phase === 2 || phase === 3) {
        const pulse = 0.55 + 0.45 * Math.sin(elapsed * 18);
        drawLightning(cx, h * 0.34, Math.min(w * 0.22, 210), 0.5 * pulse);
      }

      // Dense radial dust ring for the "shatters" frame.
      if (phase >= 3 && phase <= 4) {
        const ring = Math.min(1, Math.max(0, (elapsed - 2.3) / 1.0));
        ctx.beginPath();
        ctx.ellipse(cx, groundY, 30 + ring * w * 0.34, 8 + ring * 30, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,201,106,${0.45 * (1 - ring)})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "rgba(255,170,40,.9)";
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [phase]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[12] h-full w-full" aria-hidden="true" />;
};

const CinematicTrishul: React.FC<{ phase: number }> = ({ phase }) => {
  const isFalling = phase === 1;
  const isImpact = phase === 2;
  const isAfterImpact = phase >= 3 && phase < 6;

  return (
    <motion.div
      className="absolute left-1/2 top-[3%] z-20 flex -translate-x-1/2 justify-center"
      initial={{ y: -170, scale: 0.56, opacity: 0 }}
      animate={{
        y:
          phase === 0
            ? -18
            : phase === 1
              ? [ -18, 35, 125, 230, 300 ]
              : 300,
        scale: phase === 0 ? 0.72 : isFalling ? [0.72, 0.82, 0.95, 1.04] : isImpact ? 1.04 : 0.94,
        rotate: isFalling ? [0, -1.5, 1.5, -0.8, 0] : 0,
        opacity: phase >= 5 ? 0 : 1,
      }}
      transition={{
        duration: phase === 1 ? 1.02 : phase === 2 ? 0.18 : 0.55,
        ease: phase === 1 ? [0.68, 0.01, 0.92, 0.22] : phase === 2 ? [0.85, 0, 1, 1] : "easeOut",
        times: phase === 1 ? [0, 0.18, 0.42, 0.72, 1] : undefined,
      }}
    >
      {/* Hot ionized trail: narrow core + broad atmospheric bloom. */}
      {isFalling && (
        <>
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[62%] -z-10 h-[430px] w-[26px] -translate-x-1/2 rounded-full blur-[12px]"
            initial={{ opacity: 0, scaleY: 0.25 }}
            animate={{ opacity: [0, 0.95, 0.65, 0], scaleY: [0.25, 1.2, 1.8, 2.2] }}
            transition={{ duration: 0.95, ease: "easeIn" }}
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,193,55,.9) 18%, rgba(255,130,20,.28) 62%, transparent)",
            }}
          />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-[360px] w-[5px] -translate-x-1/2 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.82, ease: "easeIn" }}
            style={{
              boxShadow:
                "0 0 8px 3px rgba(255,255,255,.95), 0 0 28px 9px rgba(255,185,45,.9), 0 0 75px 18px rgba(255,95,10,.38)",
              background: "linear-gradient(to bottom, #fff, #ffd86c 30%, #ff8d18 75%, transparent)",
            }}
          />
        </>
      )}

      {/* The silhouette is deliberately long, narrow and spear-heavy like the reference. */}
      <motion.div
        animate={{
          filter:
            phase >= 1
              ? [
                  "drop-shadow(0 0 8px rgba(255,183,45,.55)) drop-shadow(0 0 2px rgba(255,255,255,.7))",
                  "drop-shadow(0 0 38px rgba(255,177,35,.95)) drop-shadow(0 0 6px rgba(255,255,255,.9))",
                  "drop-shadow(0 0 15px rgba(255,170,30,.72)) drop-shadow(0 0 2px rgba(255,255,255,.7))",
                ]
              : "drop-shadow(0 0 8px rgba(255,183,45,.48))",
          scale: isFalling ? [1, 1.025, 0.995, 1.02] : isImpact ? [1.02, 1.12, 1] : 1,
        }}
        transition={{ duration: isFalling ? 0.55 : 0.8, repeat: isFalling ? Infinity : 0 }}
      >
        <TrishulSVG />
      </motion.div>

      {/* Tiny rotating sparks cling to the weapon during descent. */}
      {isFalling &&
        Array.from({ length: 12 }).map((_, i) => (
          <motion.i
            key={i}
            className="pointer-events-none absolute left-1/2 top-[30%] h-[2px] w-[2px] rounded-full bg-amber-100"
            initial={{
              x: (Math.random() - 0.5) * 80,
              y: Math.random() * 60,
              opacity: 0,
            }}
            animate={{
              x: (Math.random() - 0.5) * 170,
              y: 100 + Math.random() * 180,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.45 + Math.random() * 0.35,
              repeat: 1,
              delay: Math.random() * 0.3,
              ease: "easeOut",
            }}
            style={{ boxShadow: "0 0 8px 2px rgba(255,195,70,.9)" }}
          />
        ))}

      {isAfterImpact && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.4, 1], opacity: [0, 0.65, 0] }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{
            background:
              "radial-gradient(circle, rgba(255,240,185,.95) 0%, rgba(255,175,45,.55) 20%, rgba(255,112,10,.16) 48%, transparent 72%)",
            filter: "blur(8px)",
          }}
        />
      )}
    </motion.div>
  );
};

/**
 * Reference-matched forged trishul.
 *
 * Geometry is intentionally simple and iconic:
 * - one tall central spearhead
 * - two outward-curving side blades with sharp triangular tips
 * - long straight shaft
 * - bright molten-gold edge + white-hot core
 *
 * Keeping this as SVG (instead of a font/icon) makes the silhouette deterministic
 * and crisp at every viewport size.
 */
const TrishulSVG = () => (
  <svg
    width="150"
    height="350"
    viewBox="0 0 150 350"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ overflow: "visible" }}
  >
    <defs>
      <linearGradient id="trishulMetal" x1="75" y1="0" x2="75" y2="350" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.08" stopColor="#FFF8D2" />
        <stop offset="0.22" stopColor="#FFD96B" />
        <stop offset="0.48" stopColor="#FFB72D" />
        <stop offset="0.72" stopColor="#C86B0C" />
        <stop offset="1" stopColor="#6A3004" />
      </linearGradient>

      <linearGradient id="bladeFace" x1="20" y1="30" x2="130" y2="170" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFDEB" />
        <stop offset="0.28" stopColor="#FFD86A" />
        <stop offset="0.62" stopColor="#E88918" />
        <stop offset="1" stopColor="#7C3905" />
      </linearGradient>

      <linearGradient id="edgeWhite" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="white" stopOpacity="0" />
        <stop offset="0.5" stopColor="#FFFDF0" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>

      <radialGradient id="junctionGlow">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.25" stopColor="#FFF0A4" />
        <stop offset="0.7" stopColor="#FFAD24" stopOpacity=".55" />
        <stop offset="1" stopColor="#FF8A00" stopOpacity="0" />
      </radialGradient>

      <filter id="trishulBlur" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="5.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="metalTexture" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.7" numOctaves="2" seed="19" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 .84  0 0 0 0 .36  0 0 0 .08 0" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </defs>

    <g filter="url(#trishulBlur)">
      {/* Central spear: the dominant shape in the reference. */}
      <path
        d="M75 5 L91 53 L83 82 L75 95 L67 82 L59 53 Z"
        fill="url(#bladeFace)"
      />
      <path d="M75 10 L80 51 L75 74 L70 51 Z" fill="#FFFBE7" opacity=".92" />
      <path d="M75 7 V94" stroke="url(#edgeWhite)" strokeWidth="1.7" strokeLinecap="round" />

      {/* Left curved blade. */}
      <path
        d="M73 143
           C57 139 39 129 29 111
           C17 89 20 61 30 37
           C31 56 41 76 54 88
           C62 95 69 104 74 118"
        stroke="url(#trishulMetal)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M71 137
           C54 132 39 120 32 105
           C24 87 25 65 30 49"
        stroke="#FFFBE6"
        strokeOpacity=".88"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      {/* Left arrowhead / spear tip. */}
      <path d="M30 37 L43 63 L18 60 Z" fill="url(#bladeFace)" />
      <path d="M30 41 L34 57 L26 55 Z" fill="#FFFBE6" opacity=".75" />

      {/* Right curved blade — mirrored. */}
      <path
        d="M77 143
           C93 139 111 129 121 111
           C133 89 130 61 120 37
           C119 56 109 76 96 88
           C88 95 81 104 76 118"
        stroke="url(#trishulMetal)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M79 137
           C96 132 111 120 118 105
           C126 87 125 65 120 49"
        stroke="#FFFBE6"
        strokeOpacity=".88"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path d="M120 37 L132 60 L107 63 Z" fill="url(#bladeFace)" />
      <path d="M120 41 L124 55 L116 57 Z" fill="#FFFBE6" opacity=".75" />

      {/* Forged central socket and hot impact core. */}
      <ellipse cx="75" cy="128" rx="29" ry="27" fill="url(#junctionGlow)" opacity=".55" />
      <circle cx="75" cy="132" r="13" fill="#1C1003" stroke="#FFD15A" strokeWidth="3.2" />
      <circle cx="75" cy="132" r="7.5" fill="url(#junctionGlow)" />
      <circle cx="75" cy="132" r="3" fill="white" />

      {/* Long shaft. */}
      <path d="M75 86 V337" stroke="url(#trishulMetal)" strokeWidth="9.5" strokeLinecap="round" />
      <path d="M72.5 90 V333" stroke="#FFF5B9" strokeOpacity=".82" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M77 90 V337" stroke="#8B4707" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />

      {/* Small lower metal collar, visible in the reference silhouette. */}
      <path d="M67 208 Q75 216 83 208" stroke="#FFD15A" strokeWidth="3" strokeLinecap="round" opacity=".85" />
      <circle cx="75" cy="211" r="5.5" fill="#FFE08A" />
      <circle cx="75" cy="211" r="2" fill="white" />

      {/* Butt cap. */}
      <path d="M65 337 L75 347 L85 337" stroke="#FFD15A" strokeWidth="4.5" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Ground-level dust plume — several softly-blurred, warm-toned blobs that
 * billow outward and upward on impact and slowly dissipate. This is the
 * single biggest lever for "hyper-realistic": raw shard/spark effects read
 * as a video-game particle system, but a dust plume reads as physical debris
 * being thrown into the air.
 */
const ImpactDust: React.FC<{ phase: number }> = ({ phase }) => {
  const puffs = useRef(
    Array.from({ length: 10 }, (_, index) => ({
      angle: (index / 10) * Math.PI - Math.PI / 2 - Math.PI / 2 + Math.random() * 0.4,
      distance: 40 + Math.random() * 90,
      size: 40 + Math.random() * 70,
      delay: Math.random() * 0.12,
    }))
  ).current;

  return (
    <AnimatePresence>
      {phase >= 2 && (
        <div className="absolute left-1/2 bottom-[19.5%] h-0 w-0 -translate-x-1/2">
          {puffs.map((puff, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full blur-2xl"
              style={{
                width: puff.size,
                height: puff.size * 0.7,
                background:
                  'radial-gradient(circle, rgba(210,160,90,0.55) 0%, rgba(120,80,40,0.28) 55%, transparent 80%)',
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
              animate={{
                x: Math.cos(puff.angle) * puff.distance,
                y: -Math.abs(Math.sin(puff.angle)) * puff.distance * 0.55 - 20,
                opacity: [0, 0.85, 0],
                scale: [0.3, 1.4, 1.9],
              }}
              transition={{ duration: 2.2, delay: puff.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

/**
 * Bright, ember-like sparks that fly out on impact and fall under a light
 * gravity curve rather than fading in place — real debris arcs and drops.
 */
const ImpactSparks: React.FC<{ phase: number }> = ({ phase }) => {
  const sparks = useRef(
    Array.from({ length: 22 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = 60 + Math.random() * 130;
      return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.2,
        delay: Math.random() * 0.05,
        duration: 0.7 + Math.random() * 0.5,
      };
    })
  ).current;

  return (
    <AnimatePresence>
      {phase >= 2 && phase < 5 && (
        <div className="absolute left-1/2 bottom-[19.7%] h-0 w-0 -translate-x-1/2">
          {sparks.map((spark, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full bg-amber-100 shadow-[0_0_6px_2px_rgba(255,200,90,.9)]"
              style={{ width: spark.size, height: spark.size }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: [0, spark.vx * 0.6, spark.vx],
                // A gentle parabola: rises, then gravity pulls it back down.
                y: [0, spark.vy - 70, spark.vy + 40],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: spark.duration, delay: spark.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

/** A flattened, ground-hugging shockwave ring — distinct from the vertical EnergyWave. */
const ShockwaveRing: React.FC<{ phase: number }> = ({ phase }) => (
  <AnimatePresence>
    {phase === 2 && (
      <motion.div
        className="absolute left-1/2 bottom-[19.6%] h-3 w-3 -translate-x-1/2 rounded-[50%] border-2 border-amber-100"
        style={{ transform: 'translate(-50%, 0) scaleY(0.32)' }}
        initial={{ scale: 0.5, opacity: 0.9 }}
        animate={{ scale: 40, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    )}
  </AnimatePresence>
);

const GroundShatter: React.FC<{ phase: number }> = ({ phase }) => {
  // Jagged crack lines radiating from the impact point, drawn on with a
  // stroke-dashoffset animation so they read as fracturing rather than
  // simply fading into view.
  const cracks = useRef(
    Array.from({ length: 9 }, (_, index) => {
      const baseAngle = (index / 9) * Math.PI * 2;
      const length = 60 + Math.random() * 70;
      const jitter = () => (Math.random() - 0.5) * 24;
      const midX = Math.cos(baseAngle) * length * 0.5 + jitter();
      const midY = Math.sin(baseAngle) * length * 0.28 + jitter() * 0.4;
      const endX = Math.cos(baseAngle) * length + jitter();
      const endY = Math.sin(baseAngle) * length * 0.32 + jitter() * 0.4;
      return { path: `M0 0 L${midX} ${midY} L${endX} ${endY}`, delay: (index % 5) * 0.03 };
    })
  ).current;

  const shards = useRef(
    Array.from({ length: 16 }, (_, index) => {
      const angle = (index / 16) * Math.PI * 2 + Math.random() * 0.3;
      return {
        angle,
        distance: 70 + Math.random() * 130,
        size: 6 + Math.random() * 10,
        rotate: Math.random() * 360,
        delay: (index % 4) * 0.03,
      };
    })
  ).current;

  return (
    <AnimatePresence>
      {phase >= 3 && (
        <motion.div
          className="absolute left-1/2 bottom-[18.6%] h-0 w-0 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Cracks */}
          <svg
            className="absolute left-0 top-0 overflow-visible"
            width="1"
            height="1"
            style={{ transform: 'scaleY(0.34)' }}
          >
            {cracks.map((crack, index) => (
              <motion.path
                key={index}
                d={crack.path}
                fill="none"
                stroke="rgba(255,214,140,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 0.6] }}
                transition={{ duration: 0.5, delay: crack.delay, ease: 'easeOut' }}
              />
            ))}
          </svg>

          {/* Angular debris shards — clipped polygons instead of rounded bars
              so they read as broken rock/metal rather than light trails. */}
          {shards.map((shard, index) => (
            <motion.span
              key={index}
              className="absolute left-0 top-0 bg-gradient-to-br from-amber-100 via-amber-500 to-amber-800/70 shadow-[0_0_10px_rgba(255,190,60,.7)]"
              style={{
                width: shard.size,
                height: shard.size,
                clipPath: 'polygon(20% 0%, 100% 15%, 80% 100%, 0% 70%)',
              }}
              initial={{ x: 0, y: 0, rotate: shard.rotate, opacity: 1, scale: 0.4 }}
              animate={{
                x: Math.cos(shard.angle) * shard.distance,
                y: Math.sin(shard.angle) * shard.distance * 0.3 + Math.random() * 20,
                rotate: shard.rotate + (Math.random() > 0.5 ? 220 : -220),
                opacity: [1, 1, 0],
                scale: [0.4, 1, 0.8],
              }}
              transition={{ duration: 0.9 + (index % 4) * 0.08, delay: shard.delay, ease: 'easeOut' }}
            />
          ))}

          <motion.div
            className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_35px_15px_rgba(255,196,65,.8)]"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.8, 0.5], opacity: [1, 0.8, 0] }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EnergyWave: React.FC<{ phase: number }> = ({ phase }) => (
  <AnimatePresence>
    {phase >= 4 && (
      <div className="absolute left-1/2 bottom-[18%] -translate-x-1/2">
        {[0, 1, 2, 3, 4].map((ring) => (
          <motion.div
            key={ring}
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              border: `2px solid ${ring % 2 === 0 ? "rgba(93,181,255,.9)" : "rgba(255,218,145,.9)"}`,
              boxShadow:
                ring % 2 === 0
                  ? "0 0 34px rgba(38,130,255,.75)"
                  : "0 0 28px rgba(255,191,60,.72)",
            }}
            initial={{ scale: 0.12, opacity: 0.95 }}
            animate={{ scale: 8 + ring * 2.25, opacity: 0 }}
            transition={{
              duration: 1.5,
              delay: ring * 0.13,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Bright blue-white pulse, like a real expanding electromagnetic shock front. */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, white 0%, rgba(143,211,255,.95) 8%, rgba(35,125,255,.55) 28%, rgba(20,80,255,.1) 58%, transparent 72%)",
            filter: "blur(1px)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2.6, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />

        {/* Heat shimmer from the displaced air. */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,210,140,.32), rgba(45,135,255,.12) 42%, transparent 70%)",
          }}
          initial={{ scale: 0.25, opacity: 0 }}
          animate={{ scale: [0.25, 3.6], opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.35, ease: "easeOut" }}
        />
      </div>
    )}
  </AnimatePresence>
);

/**
 * Full-frame overexposed flash with a couple of quick lens-flare streaks —
 * the beat that sells a camera actually being blown out by light, rather
 * than a plain opacity fade.
 */
const ScreenFlash: React.FC<{ phase: number }> = ({ phase }) => (
  <AnimatePresence>
    {phase === 5 && (
      <motion.div
        className="pointer-events-none absolute inset-0 z-[80]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.3, 0.9, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, times: [0, 0.15, 0.3, 0.45, 1], ease: 'easeOut' }}
        style={{ background: 'radial-gradient(circle at 50% 55%, #fffef2 0%, #fff2c4 35%, #ffffff 100%)' }}
      >
        {[0, 1, 2].map((streak) => (
          <motion.div
            key={streak}
            className="absolute left-1/2 top-1/2 h-[2px] w-[140vw] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{ rotate: streak * 55 - 55 }}
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: [0, 1, 0], scaleX: [0.3, 1.4, 1.4] }}
            transition={{ duration: 0.5, delay: 0.05 * streak, ease: 'easeOut' }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

const Transformation = () => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Blue-white energy sphere — matches the reference's "energy wave" visual language. */}
    <motion.div
      className="absolute h-[390px] w-[390px] rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(95,180,255,.5) 10%, rgba(20,105,255,.18) 38%, transparent 70%)",
        boxShadow:
          "0 0 80px 20px rgba(36,132,255,.25), inset 0 0 70px rgba(115,190,255,.35)",
      }}
      initial={{ scale: 0.25, opacity: 0 }}
      animate={{ scale: [0.25, 1, 1.5], opacity: [0, 1, 0] }}
      transition={{ duration: 1.25, ease: "easeOut" }}
    />

    {/* Rotating radial rays. */}
    <motion.div
      className="absolute h-[520px] w-[520px] rounded-full opacity-80"
      style={{
        background:
          "conic-gradient(from 0deg, transparent 0deg, rgba(120,200,255,.75) 7deg, transparent 18deg, transparent 58deg, rgba(255,218,140,.7) 66deg, transparent 79deg, transparent 142deg, rgba(90,165,255,.55) 150deg, transparent 164deg, transparent 235deg, rgba(255,215,130,.6) 243deg, transparent 256deg, transparent 310deg, rgba(80,160,255,.5) 318deg, transparent 332deg)",
      }}
      initial={{ rotate: 0, scale: 0.35, opacity: 0 }}
      animate={{ rotate: 220, scale: [0.35, 1.15, 1.65], opacity: [0, 0.95, 0] }}
      transition={{ duration: 1.3, ease: "easeOut" }}
    />

    {/* Side trishuls emerge before the main CRM reveal, matching the reference transform frame. */}
    {[-1, 1].map((side) => (
      <motion.div
        key={side}
        className="absolute"
        initial={{ x: side * 40, y: 80, scale: 0.08, opacity: 0, rotate: side * 18 }}
        animate={{
          x: side * 220,
          y: 20,
          scale: [0.08, 0.42, 0.28],
          opacity: [0, 1, 0],
          rotate: side * 6,
        }}
        transition={{ duration: 1.15, ease: "easeOut", delay: 0.12 }}
        style={{ transformOrigin: "center" }}
      >
        <TrishulSVG />
      </motion.div>
    ))}

    {/* Main trishul stays unmistakable at the center. */}
    <motion.div
      initial={{ scale: 0.18, opacity: 0, rotate: -10, filter: "blur(8px)" }}
      animate={{
        scale: [0.18, 0.88, 1.02, 0.72],
        opacity: [0, 1, 1, 0],
        rotate: [-10, 0, 4, 18],
        filter: ["blur(8px)", "blur(0px)", "blur(0px)", "blur(3px)"],
      }}
      transition={{ duration: 1.25, ease: "easeInOut" }}
    >
      <TrishulSVG />
    </motion.div>

    {/* Rising embers. */}
    {Array.from({ length: 22 }).map((_, index) => {
      const startX = (Math.random() - 0.5) * 300;
      return (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-amber-100"
          initial={{ x: startX, y: 90, opacity: 0 }}
          animate={{
            x: startX + (Math.random() - 0.5) * 100,
            y: -230 - Math.random() * 120,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.25 + Math.random() * 0.7,
            delay: 0.05 + Math.random() * 0.5,
            ease: "easeOut",
          }}
          style={{ boxShadow: "0 0 7px 2px rgba(255,198,95,.9)" }}
        />
      );
    })}

    <motion.p
      className="absolute bottom-[25%] text-[10px] font-bold uppercase tracking-[0.45em] text-amber-100/80"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: [0, 1, 0], y: [10, 0, -10] }}
      transition={{ duration: 1.1 }}
    >
      TRANSFORMING ENERGY
    </motion.p>
  </motion.div>
);

interface CRMInterfaceProps {
  onContinue: () => void;
}

const CRMInterface: React.FC<CRMInterfaceProps> = ({ onContinue }) => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center px-5 py-16"
    initial={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    transition={{ duration: 0.9, ease: 'easeOut' }}
  >
    <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-amber-200/20 bg-[#07101c]/95 shadow-[0_0_80px_rgba(255,185,55,.15)]">
      {/* A single diagonal glass-sheen sweep across the whole panel on reveal —
          the detail that makes a flat UI mock read as a lit physical screen. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{ width: '40%' }}
        initial={{ x: '-120%', skewX: -12 }}
        animate={{ x: '340%' }}
        transition={{ duration: 1.1, delay: 0.5, ease: 'easeInOut' }}
      />

      {/* Window header */}
      <div className="relative z-20 flex h-11 items-center gap-3 border-b border-white/10 bg-[#0a1522] px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="ml-2 text-[10px] font-semibold tracking-[0.18em] text-white/50">
          TRISHUL CRM • COMMAND CENTER
        </span>
      </div>

      <div className="relative z-20 flex min-h-[330px]">
        {/* Sidebar */}
        <aside className="hidden w-44 border-r border-white/10 bg-[#050c15] p-4 sm:block">
          <div className="mb-7 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-xs font-bold tracking-wider">TRISHUL</span>
          </div>

          {['Dashboard', 'Customers', 'Pipeline', 'Analytics', 'AI Assistant'].map((item, index) => (
            <div
              key={item}
              className={`mb-2 rounded-lg px-3 py-2 text-[10px] ${
                index === 0
                  ? 'bg-amber-400/10 font-semibold text-amber-200'
                  : 'text-white/40'
              }`}
            >
              {item}
            </div>
          ))}
        </aside>

        {/* Dashboard */}
        <main className="flex-1 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-amber-300/60">Enterprise workspace</p>
              <h2 className="mt-1 text-xl font-black tracking-wide text-white">CRM Dashboard</h2>
            </div>
            <button
              type="button"
              onClick={onContinue}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,185,55,.2)]"
            >
              Enter CRM
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['Revenue', '₹24.8L', '+18.4%'],
              ['Deals', '128', '+12.2%'],
              ['Customers', '1,842', '+8.7%'],
              ['Pipeline', '₹68.4L', '+24.1%'],
            ].map(([label, value, change]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <p className="text-[9px] text-white/35">{label}</p>
                <p className="mt-1 text-lg font-black text-white">{value}</p>
                <p className="mt-1 text-[8px] text-emerald-300">{change}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-white/70">Sales performance</span>
                <span className="text-[8px] text-white/30">LIVE</span>
              </div>
              <div className="flex h-28 items-end gap-2">
                {[35, 52, 45, 72, 58, 84, 67, 94, 76, 100, 86, 108].map((height, index) => (
                  <motion.div
                    key={index}
                    className="flex-1 rounded-t bg-gradient-to-t from-amber-700/50 via-amber-400 to-yellow-100"
                    initial={{ height: 0 }}
                    animate={{ height: `${height / 1.2}%` }}
                    transition={{ duration: 0.6, delay: index * 0.04 }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-[10px] font-semibold text-white/70">AI Assistant</p>
              <div className="mt-4 rounded-lg border border-amber-300/10 bg-amber-300/[0.03] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
                  <span className="text-[8px] uppercase tracking-wider text-amber-200/70">Online</span>
                </div>
                <p className="text-[9px] leading-5 text-white/45">
                  Pipeline analysis complete. 14 high-value opportunities need follow-up.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <motion.div
      className="absolute bottom-[7%] text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-amber-200/60">
        Welcome to TRISHUL CRM
      </p>
      <p className="mt-2 text-[8px] uppercase tracking-[0.32em] text-white/30">
        Innovate • Empower • Excel
      </p>
    </motion.div>
  </motion.div>
);