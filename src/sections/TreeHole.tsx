import { useEffect, useRef, useCallback } from 'react';
import { X, Lightbulb, ChevronRight, Info } from 'lucide-react';
import gsap from 'gsap';

interface TreeHoleProps {
  onClose: () => void;
  onPromptSelect: (prompt: string) => void;
  onAboutOpen?: () => void;
  shopLink?: string;
  gumroadLink?: string;
}

interface TemplateCategory {
  label: string;
  color: string;
  borderColor: string;
  hoverBg: string;
  templates: string[];
}

const templateData: TemplateCategory[] = [
  {
    label: 'Release & Vent',
    color: 'rgba(248, 113, 113, 0.8)',
    borderColor: 'rgba(220, 38, 38, 0.15)',
    hoverBg: 'rgba(220, 38, 38, 0.08)',
    templates: [
      'The thing that has been making me angry lately is...',
      'I am so tired of always...',
      'The person I cannot forgive is...',
      'The stone weighing on my chest is...',
      'If I could tear up one memory, it would be...',
      'What I most want to say "no" to is...',
    ],
  },
  {
    label: 'Longing & Goodbye',
    color: 'rgba(147, 197, 253, 0.8)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
    hoverBg: 'rgba(59, 130, 246, 0.08)',
    templates: [
      'What I want to say to you, far away, is...',
      'If we could meet one more time, I would tell you...',
      'That season reminds me of...',
      'What I cannot let go of is not the person, but...',
      'After saying goodbye, I finally understood...',
      'If I could send a letter to the past, I would write...',
    ],
  },
  {
    label: 'Wishes & Hopes',
    color: 'rgba(255, 215, 0, 0.85)',
    borderColor: 'rgba(255, 215, 0, 0.15)',
    hoverBg: 'rgba(255, 215, 0, 0.08)',
    templates: [
      'What I most hope comes true is...',
      'If I could make one wish, I would wish for...',
      'To myself one year from now, I want to say...',
      'What makes a warm light glow in my heart is...',
      'After letting go, I want to go to...',
      'The gentlest thought in my heart is...',
    ],
  },
  {
    label: 'Self Reflection',
    color: 'rgba(196, 181, 253, 0.8)',
    borderColor: 'rgba(139, 92, 246, 0.15)',
    hoverBg: 'rgba(139, 92, 246, 0.08)',
    templates: [
      'Something I am proud of myself for today is...',
      'If I could give one person a hug, I would choose...',
      'The first word that floats into my mind right now is...',
      'I want to be kinder to myself, starting with...',
      'This year I have learned that...',
      'When the whole world is quiet, I hear my heart say...',
    ],
  },
];

export default function TreeHole({ onClose, onPromptSelect, onAboutOpen, shopLink, gumroadLink }: TreeHoleProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  const handleClose = useCallback(() => {
    if (!overlayRef.current || !contentRef.current) {
      onClose();
      return;
    }
    gsap.to(contentRef.current, { opacity: 0, y: 20, scale: 0.95, duration: 0.3, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.4, delay: 0.1, ease: 'power2.in', onComplete: onClose,
    });
  }, [onClose]);

  const handleSelect = useCallback((text: string) => {
    onPromptSelect(text);
    handleClose();
  }, [onPromptSelect, handleClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background: 'rgba(5, 11, 20, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        zIndex: 100,
        opacity: 0,
      }}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-xl"
        style={{
          opacity: 0,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(32px) saturate(130%)',
          WebkitBackdropFilter: 'blur(32px) saturate(130%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.04), 0 40px 100px rgba(0, 0, 0, 0.5)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(255, 215, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Lightbulb size={14} color="rgba(255, 215, 0, 0.7)" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: '"Inter", "Noto Sans SC", sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.8)',
                  letterSpacing: '0.05em',
                }}
              >
                Writing Prompts
              </div>
              <div
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  letterSpacing: '0.05em',
                  marginTop: '1px',
                }}
              >
                Pick a beginning. Let the words flow.
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
          >
            <X size={18} color="rgba(255, 255, 255, 0.4)" />
          </button>
        </div>

        {/* Template categories */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {templateData.map((category, catIdx) => (
              <div key={catIdx}>
                {/* Category label */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: category.color,
                      opacity: 0.7,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: '"Inter", "Noto Sans SC", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: category.color,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {category.label}
                  </span>
                </div>

                {/* Template chips */}
                <div className="flex flex-wrap gap-2">
                  {category.templates.map((tpl, tplIdx) => (
                    <button
                      key={tplIdx}
                      onClick={() => handleSelect(tpl)}
                      className="cursor-pointer transition-all duration-250 text-left"
                      style={{
                        padding: '7px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${category.borderColor}`,
                        fontFamily: '"Lora", "Noto Serif SC", serif',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = category.hoverBg;
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                        e.currentTarget.style.borderColor = category.color.replace('0.8', '0.3').replace('0.85', '0.3');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.borderColor = category.borderColor;
                      }}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Shop links */}
          {(shopLink || gumroadLink) && (
            <div
              className="mt-6 pt-4"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.25)',
                  letterSpacing: '0.05em',
                  marginBottom: '10px',
                }}
              >
                After writing, explore something to comfort your soul
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {gumroadLink && (
                  <a
                    href={gumroadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 cursor-pointer transition-all duration-300"
                    style={{
                      padding: '5px 14px',
                      borderRadius: '16px',
                      background: 'rgba(255, 215, 0, 0.06)',
                      border: '1px solid rgba(255, 215, 0, 0.15)',
                      fontFamily: '"Inter", "Noto Sans SC", sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'rgba(255, 215, 0, 0.6)',
                      letterSpacing: '0.05em',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 215, 0, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                      e.currentTarget.style.color = 'rgba(255, 215, 0, 0.85)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 215, 0, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.15)';
                      e.currentTarget.style.color = 'rgba(255, 215, 0, 0.6)';
                    }}
                  >
                    30-Day Challenge
                    <ChevronRight size={12} />
                  </a>
                )}
                {onAboutOpen && (
                  <button
                    onClick={onAboutOpen}
                    className="flex items-center gap-1 cursor-pointer transition-all duration-300"
                    style={{
                      padding: '5px 14px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontFamily: '"Inter", "Noto Sans SC", sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.4)',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                    }}
                  >
                    <Info size={11} />
                    About Us
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
