import { useRef, useEffect, useCallback } from 'react';
import { X, ArrowLeft, ExternalLink } from 'lucide-react';
import gsap from 'gsap';

interface AboutPageProps {
  onClose: () => void;
  shopLink: string;
  gumroadLink: string;
}

export default function AboutPage({ onClose, shopLink, gumroadLink }: AboutPageProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo(contentRef.current, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 });
  }, []);

  const handleClose = useCallback(() => {
    if (!overlayRef.current || !contentRef.current) { onClose(); return; }
    gsap.to(contentRef.current, { opacity: 0, y: 20, scale: 0.95, duration: 0.3, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, delay: 0.1, ease: 'power2.in', onComplete: onClose });
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(5, 11, 20, 0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', zIndex: 100, opacity: 0 }}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-lg"
        style={{
          opacity: 0,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(32px) saturate(130%)',
          WebkitBackdropFilter: 'blur(32px) saturate(130%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.04), 0 40px 100px rgba(0, 0, 0, 0.5)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200 hover:opacity-70"
            style={{ fontFamily: '"Inter", "Noto Sans SC", sans-serif', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.05em' }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <button onClick={handleClose} className="cursor-pointer hover:opacity-80 transition-opacity">
            <X size={18} color="rgba(255, 255, 255, 0.4)" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src="/images/SDlogo.png"
              alt="Studio Sarah Digital"
              style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }}
            />
          </div>

          {/* Welcome */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif', fontSize: '18px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.88)', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Welcome to Studiosarahdigital
            </div>
            <div style={{ width: '30px', height: '1px', background: 'rgba(196, 149, 106, 0.4)', margin: '10px auto' }} />
          </div>

          {/* Story sections */}
          <div className="space-y-5">

            {/* Section 1: Tasmania */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(196, 149, 106, 0.6)' }} />
                <span style={{ fontFamily: '"Inter", "Noto Sans SC", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(196, 149, 106, 0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Our Home
                </span>
              </div>
              <p style={{ fontFamily: '"Lora", serif', fontSize: '13px', lineHeight: 1.85, color: 'rgba(255, 255, 255, 0.55)', paddingLeft: '13px' }}>
                We live in Tasmania, a vast island at the edge of the world, where days move as slowly as the moss growing on wild stones.
              </p>
            </div>

            {/* Section 2: Healing Journey */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(147, 197, 253, 0.6)' }} />
                <span style={{ fontFamily: '"Inter", "Noto Sans SC", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(147, 197, 253, 0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  A Journey of Healing
                </span>
              </div>
              <p style={{ fontFamily: '"Lora", serif', fontSize: '13px', lineHeight: 1.85, color: 'rgba(255, 255, 255, 0.55)', paddingLeft: '13px' }}>
                Not long ago, I underwent a major DBS (Deep Brain Stimulation) surgery, which beautifully helped me reclaim my body's balance and sense of control. This journey of healing taught me to look at life with absolute sincerity. Today, I am finally able to sit quietly by the window again, keeping my daughter company and embracing this hard-won peace of mind.
              </p>
            </div>

            {/* Section 3: Daughter */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(167, 243, 208, 0.6)' }} />
                <span style={{ fontFamily: '"Inter", "Noto Sans SC", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(167, 243, 208, 0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Her Hands, Her Soul
                </span>
              </div>
              <p style={{ fontFamily: '"Lora", serif', fontSize: '13px', lineHeight: 1.85, color: 'rgba(255, 255, 255, 0.55)', paddingLeft: '13px' }}>
                My daughter is a stubborn yet incredibly gentle soul. In a world that constantly rushes forward, she chooses to spend hours feeling the temperament of linen fabrics, or bending her back to polish a tiny piece of jewelry. The clothes and accessories shaped by her hands carry the honesty of Tasmanian soil and the freedom of its sea breeze. They feel alive.
              </p>
            </div>

            {/* Section 4: Digital Design */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255, 215, 0, 0.5)' }} />
                <span style={{ fontFamily: '"Inter", "Noto Sans SC", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(255, 215, 0, 0.65)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Digital Creations
                </span>
              </div>
              <p style={{ fontFamily: '"Lora", serif', fontSize: '13px', lineHeight: 1.85, color: 'rgba(255, 255, 255, 0.55)', paddingLeft: '13px' }}>
                As for me, I pour the joy of my recovery and my reflections on life into the clean lines of digital design. The templates I create are lightweight, eco-friendly gifts sent across the web to help you keep your daily life beautifully organized. To me, this is more than just design — it is a window through which I step back into the world and connect with you.
              </p>
            </div>

            {/* Closing */}
            <div style={{ textAlign: 'center', padding: '16px 20px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(196, 149, 106, 0.1)', marginTop: '8px' }}>
              <p style={{ fontFamily: '"Lora", serif', fontSize: '13px', lineHeight: 1.8, color: 'rgba(196, 149, 106, 0.7)', fontStyle: 'italic' }}>
                "Thank you for passing by our little world. May you find a pocket of peace right here."
              </p>
            </div>

          </div>

          {/* Shop Links */}
          <div className="mt-7 pt-5 flex items-center justify-center gap-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <a
              href={gumroadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 cursor-pointer transition-all duration-300"
              style={{ padding: '7px 16px', borderRadius: '18px', background: 'rgba(196, 149, 106, 0.1)', border: '1px solid rgba(196, 149, 106, 0.22)', fontFamily: '"Inter", sans-serif', fontSize: '11px', fontWeight: 500, color: 'rgba(212, 184, 150, 0.8)', letterSpacing: '0.04em', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196, 149, 106, 0.18)'; e.currentTarget.style.borderColor = 'rgba(196, 149, 106, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(196, 149, 106, 0.1)'; e.currentTarget.style.borderColor = 'rgba(196, 149, 106, 0.22)'; }}
            >
              30天挑战
              <ExternalLink size={10} />
            </a>
            <a
              href={shopLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 cursor-pointer transition-all duration-300"
              style={{ padding: '7px 16px', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: '"Inter", sans-serif', fontSize: '11px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.04em', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'; }}
            >
              Etsy Shop
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
