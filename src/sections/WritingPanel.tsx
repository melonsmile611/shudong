import { useState, useRef, useCallback, useEffect } from 'react';
import { Scissors, Send, RotateCcw, Download, Wand2 } from 'lucide-react';
import gsap from 'gsap';

interface WritingPanelProps {
  onShred: (text: string) => void;
  onRelease: (text: string) => void;
  onSave: (text: string) => void;
  onWritingStart: () => void;
  onReset: () => void;
  onTreeHoleOpen: () => void;
  isAnimating: boolean;
  initialText?: string;
}

export default function WritingPanel({
  onShred,
  onRelease,
  onSave,
  onWritingStart,
  onReset,
  onTreeHoleOpen,
  isAnimating,
  initialText,
}: WritingPanelProps) {
  const [text, setText] = useState(initialText || '');
  const [isFocused, setIsFocused] = useState(false);

  // Sync with initialText from tree hole
  useEffect(() => {
    if (initialText) {
      setText(initialText);
      // Trigger focus to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        const len = initialText.length;
        textareaRef.current?.setSelectionRange(len, len);
      }, 200);
    }
  }, [initialText]);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shredBtnRef = useRef<HTMLButtonElement>(null);
  const releaseBtnRef = useRef<HTMLButtonElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);
  const hasStartedWriting = useRef(false);

  const charCount = text.length;
  const hasText = charCount > 0;

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      if (!hasStartedWriting.current && e.target.value.length > 0) {
        hasStartedWriting.current = true;
        onWritingStart();
      }
    },
    [onWritingStart]
  );

  // Entrance animation
  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.3 }
    );

    const floatTween = gsap.to(panelRef.current, {
      y: -8,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    return () => {
      floatTween.kill();
    };
  }, []);

  const handleBtnMouseEnter = useCallback(
    (btnRef: React.RefObject<HTMLButtonElement | null>) => {
      if (!btnRef.current || isAnimating) return;
      gsap.to(btnRef.current, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
    },
    [isAnimating]
  );

  const handleBtnMouseLeave = useCallback(
    (btnRef: React.RefObject<HTMLButtonElement | null>) => {
      if (!btnRef.current) return;
      gsap.to(btnRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
    },
    []
  );

  const handleShred = useCallback(() => {
    if (!hasText || isAnimating) return;
    gsap.to(panelRef.current, {
      opacity: 0, scale: 0.9, duration: 0.5, ease: 'power2.in',
      onComplete: () => onShred(text),
    });
  }, [hasText, isAnimating, text, onShred]);

  const handleRelease = useCallback(() => {
    if (!hasText || isAnimating) return;
    gsap.to(panelRef.current, {
      opacity: 0, scale: 1.1, filter: 'blur(15px)', duration: 0.8, ease: 'power2.inOut',
      onComplete: () => onRelease(text),
    });
  }, [hasText, isAnimating, text, onRelease]);

  const handleSave = useCallback(() => {
    if (!hasText || isAnimating) return;
    onSave(text);
  }, [hasText, isAnimating, text, onSave]);

  const handleReset = useCallback(() => {
    setText('');
    hasStartedWriting.current = false;
    if (textareaRef.current) textareaRef.current.value = '';
    onReset();
    gsap.to(panelRef.current, {
      opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out',
    });
  }, [onReset]);

  return (
    <div ref={panelRef} className="relative w-full max-w-2xl mx-auto" style={{ opacity: 0, zIndex: 10 }}>
      {/* Tree Hole Entry */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={onTreeHoleOpen}
          className="flex items-center gap-2 cursor-pointer transition-all duration-300"
          style={{
            padding: '7px 18px',
            borderRadius: '20px',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.18)',
            fontFamily: '"Inter", "Noto Sans SC", sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: 'rgba(196, 181, 253, 0.65)',
            letterSpacing: '0.08em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
            e.currentTarget.style.color = 'rgba(196, 181, 253, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.18)';
            e.currentTarget.style.color = 'rgba(196, 181, 253, 0.65)';
          }}
        >
          <Wand2 size={13} />
          Not sure what to write? Pick a prompt
        </button>
      </div>

      {/* Liquid Glass Panel */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(24px) saturate(120%)',
          WebkitBackdropFilter: 'blur(24px) saturate(120%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05), 0 25px 80px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Inner highlight edge */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)',
          }}
        />

        {/* Textarea container */}
        <div className="relative p-8 pb-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isAnimating}
            placeholder="Write down whatever is on your heart — anger, regret, a secret wish..."
            className="w-full bg-transparent text-white resize-none outline-none placeholder-white/20 leading-relaxed"
            style={{
              fontFamily: '"Lora", "Noto Serif SC", serif',
              fontSize: '18px',
              lineHeight: '1.8',
              minHeight: '280px',
              caretColor: '#FFD700',
            }}
          />

          {/* Focus glow indicator */}
          <div
            className="absolute left-6 top-8 bottom-8 w-px transition-opacity duration-500"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.4), transparent)',
              opacity: isFocused ? 1 : 0,
            }}
          />
        </div>

        {/* Bottom bar */}
        <div className="relative flex items-center justify-between px-8 pb-6">
          {/* Character count */}
          <span
            className="text-white/40 select-none"
            style={{
              fontFamily: '"Playfair Display", "Noto Serif SC", serif',
              fontSize: '14px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {charCount} chars
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            {isAnimating ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontFamily: '"Inter", "Noto Sans SC", sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3 })}
              >
                <RotateCcw size={15} />
                Write Again
              </button>
            ) : (
              <>
                {/* Shred button */}
                <button
                  ref={shredBtnRef}
                  onClick={handleShred}
                  disabled={!hasText}
                  onMouseEnter={() => handleBtnMouseEnter(shredBtnRef)}
                  onMouseLeave={() => handleBtnMouseLeave(shredBtnRef)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: hasText ? 'rgba(139, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: hasText ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: '"Inter", "Noto Sans SC", sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: hasText ? 'rgba(248, 113, 113, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Scissors size={14} />
                  Shred
                </button>

                {/* Release button */}
                <button
                  ref={releaseBtnRef}
                  onClick={handleRelease}
                  disabled={!hasText}
                  onMouseEnter={() => handleBtnMouseEnter(releaseBtnRef)}
                  onMouseLeave={() => handleBtnMouseLeave(releaseBtnRef)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: hasText ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                    border: hasText ? '1px solid rgba(255, 215, 0, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: '"Inter", "Noto Sans SC", sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: hasText ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Send size={14} />
                  Release
                </button>

                {/* Save button */}
                <button
                  ref={saveBtnRef}
                  onClick={handleSave}
                  disabled={!hasText}
                  onMouseEnter={() => handleBtnMouseEnter(saveBtnRef)}
                  onMouseLeave={() => handleBtnMouseLeave(saveBtnRef)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: hasText ? 'rgba(100, 149, 237, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: hasText ? '1px solid rgba(100, 149, 237, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: '"Inter", "Noto Sans SC", sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: hasText ? 'rgba(135, 180, 255, 0.95)' : 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Download size={14} />
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
