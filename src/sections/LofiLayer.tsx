import { useEffect, useRef } from 'react';

export default function LofiLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Film grain animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    const drawGrain = () => {
      animId = requestAnimationFrame(drawGrain);
      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 16) {
        const v = Math.random() * 30;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v + 10;
        data[i + 3] = 12;
      }
      ctx.putImageData(imageData, 0, 0);
    };
    drawGrain();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      {/* Warm purple haze */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'lofiDrift1 20s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '55%',
          height: '55%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196, 149, 106, 0.1) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'lofiDrift2 25s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'lofiDrift3 18s ease-in-out infinite',
        }}
      />

      {/* Film grain canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 1,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5, 11, 20, 0.6) 100%)',
        }}
      />

      {/* Soft scanline */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          opacity: 0.4,
        }}
      />

      {/* CSS animations */}
      <style>{`
        @keyframes lofiDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes lofiDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.05); }
          66% { transform: translate(15px, -10px) scale(0.9); }
        }
        @keyframes lofiDrift3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-45%, -55%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
