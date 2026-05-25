import { useState, useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import StarField from './sections/StarField';
import WritingPanel from './sections/WritingPanel';
import ShredEffect from './sections/ShredEffect';
import ReleaseEffect from './sections/ReleaseEffect';
import TreeHole from './sections/TreeHole';
import PdfPreview from './sections/PdfPreview';
import AboutPage from './sections/AboutPage';
import LofiLayer from './sections/LofiLayer';
import { useAudio } from './hooks/useAudio';

const SHOP_LINK = 'https://www.etsy.com/shop/StudioSarahDigital';
const GUMROAD_LINK = 'https://studiosarahdigital.gumroad.com/l/30days';

type AppState = 'writing' | 'shredding' | 'releasing' | 'message' | 'pdf-preview' | 'tree-hole' | 'about';
type MessageType = 'shred' | 'release' | null;

export default function App() {
  const [appState, setAppState] = useState<AppState>('writing');
  const [currentText, setCurrentText] = useState('');
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [isWritingActive, setIsWritingActive] = useState(false);
  const [treeHolePrompt, setTreeHolePrompt] = useState<string | undefined>(undefined);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const shopBarRef = useRef<HTMLDivElement>(null);
  const audio = useAudio();
  const hasInitAudio = useRef(false);

  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current || !introRef.current) return;
    gsap.fromTo(titleRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out', delay: 0.2 });
    gsap.fromTo(subtitleRef.current, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.6 });
    gsap.fromTo(introRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.9 });
    if (shopBarRef.current) {
      gsap.fromTo(shopBarRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 1.2 });
    }
  }, []);

  useEffect(() => {
    if (appState !== 'message' || !messageRef.current) return;
    gsap.fromTo(messageRef.current, { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out' });
    const timer = setTimeout(() => handleReset(), 6000);
    return () => clearTimeout(timer);
  }, [appState]);

  const initAudioOnce = useCallback(() => {
    if (!hasInitAudio.current) {
      hasInitAudio.current = true;
      audio.init();
    }
  }, [audio]);

  const handleWritingStart = useCallback(() => {
    setIsWritingActive(true);
    initAudioOnce();
  }, [initAudioOnce]);

  const handleShred = useCallback((text: string) => {
    setCurrentText(text);
    setAppState('shredding');
    audio.playShredSound();
  }, [audio]);

  const handleRelease = useCallback((text: string) => {
    setCurrentText(text);
    setAppState('releasing');
    audio.playReleaseSound();
  }, [audio]);

  const handleSave = useCallback((text: string) => {
    setCurrentText(text);
    setAppState('pdf-preview');
    initAudioOnce();
  }, [initAudioOnce]);

  const handleEffectComplete = useCallback((type: 'shred' | 'release') => {
    setMessageType(type);
    setAppState('message');
  }, []);

  const handleReset = useCallback(() => {
    setAppState('writing');
    setMessageType(null);
    setIsWritingActive(false);
    setCurrentText('');
    setTreeHolePrompt(undefined);
  }, []);

  const handleTreeHoleOpen = useCallback(() => {
    setAppState('tree-hole');
    initAudioOnce();
  }, [initAudioOnce]);

  const handleTreeHoleClose = useCallback(() => {
    setAppState('writing');
  }, []);

  const handleTreeHolePrompt = useCallback((prompt: string) => {
    setTreeHolePrompt(prompt);
    setAppState('writing');
    setTimeout(() => setTreeHolePrompt(undefined), 500);
  }, []);

  const handlePdfClose = useCallback(() => {
    setAppState('writing');
  }, []);

  const handleAboutOpen = useCallback(() => {
    setAppState('about');
  }, []);

  const handleAboutClose = useCallback(() => {
    setAppState('writing');
  }, []);

  const handleContainerClick = useCallback(() => {
    initAudioOnce();
  }, [initAudioOnce]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050B14 0%, #0A192F 100%)' }}
      onClick={handleContainerClick}
    >
      <StarField isWriting={isWritingActive} />
      <LofiLayer />

      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-12" style={{ zIndex: 10 }}>

        {appState === 'writing' && (
          <>
            {/* Title */}
            <div ref={titleRef} className="mb-2 text-center" style={{ opacity: 0 }}>
              <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, color: 'rgba(255, 255, 255, 0.92)', letterSpacing: '0.12em', textShadow: '0 0 40px rgba(255, 215, 0, 0.15)' }}>
                Flow &middot; Release
              </h1>
            </div>

            {/* Subtitle */}
            <div ref={subtitleRef} className="mb-4 text-center" style={{ opacity: 0, fontFamily: '"Lora", serif', fontSize: 'clamp(13px, 2vw, 16px)', color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.2em' }}>
              Write it down. Then let it go or keep it close.
            </div>

            {/* Short Introduction */}
            <div ref={introRef} className="mb-8 text-center" style={{ opacity: 0, maxWidth: '420px' }}>
              <p style={{ fontFamily: '"Lora", serif', fontSize: '13px', lineHeight: 1.8, color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.02em' }}>
                A quiet space at the edge of the universe. Pour out whatever weighs on your heart — anger, longing, a secret wish — then choose to shred it, release it to the stars, or save it as a beautiful PDF journal.
              </p>
            </div>
          </>
        )}

        {appState === 'writing' && (
          <WritingPanel
            onShred={handleShred}
            onRelease={handleRelease}
            onSave={handleSave}
            onWritingStart={handleWritingStart}
            onReset={handleReset}
            onTreeHoleOpen={handleTreeHoleOpen}
            isAnimating={false}
            initialText={treeHolePrompt}
          />
        )}

        {appState === 'shredding' && currentText && (
          <ShredEffect text={currentText} onComplete={() => handleEffectComplete('shred')} />
        )}

        {appState === 'releasing' && currentText && (
          <ReleaseEffect text={currentText} onComplete={() => handleEffectComplete('release')} />
        )}

        {appState === 'pdf-preview' && currentText && (
          <PdfPreview text={currentText} onClose={handlePdfClose} shopLink={SHOP_LINK} gumroadLink={GUMROAD_LINK} />
        )}

        {appState === 'tree-hole' && (
          <TreeHole
            onClose={handleTreeHoleClose}
            onPromptSelect={handleTreeHolePrompt}
            onAboutOpen={handleAboutOpen}
            shopLink={SHOP_LINK}
            gumroadLink={GUMROAD_LINK}
          />
        )}

        {appState === 'about' && (
          <AboutPage onClose={handleAboutClose} shopLink={SHOP_LINK} gumroadLink={GUMROAD_LINK} />
        )}

        {appState === 'message' && messageType && (
          <div ref={messageRef} className="flex flex-col items-center justify-center text-center px-6" style={{ opacity: 0, maxWidth: '480px' }}>
            <div className="mb-6 flex items-center justify-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: messageType === 'shred' ? 'rgba(139, 0, 0, 0.1)' : 'rgba(255, 215, 0, 0.1)', border: `1px solid ${messageType === 'shred' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(255, 215, 0, 0.2)'}` }}>
              {messageType === 'shred' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(248, 113, 113, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" /><circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 20 20" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 215, 0, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18" /><path d="m6 9 6-6 6 6" /><path d="m6 15 6 6 6-6" />
                </svg>
              )}
            </div>

            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 500, color: messageType === 'shred' ? 'rgba(248, 113, 113, 0.9)' : 'rgba(255, 215, 0, 0.95)', marginBottom: '16px', letterSpacing: '0.1em' }}>
              {messageType === 'shred' ? 'Shredded to Nothing' : 'Released to the Wind'}
            </h2>

            <p style={{ fontFamily: '"Lora", serif', fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.8, color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.05em' }}>
              {messageType === 'shred'
                ? 'These things no longer have the power to hurt me. They are gone.'
                : 'I handed these thoughts to the universe and the wind. I am at peace.'}
            </p>

            <p className="mt-8" style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'rgba(255, 255, 255, 0.2)', letterSpacing: '0.15em' }}>
              This page will refresh in a few seconds
            </p>
          </div>
        )}
      </div>

      {/* Shop Links Footer Bar */}
      <div ref={shopBarRef} className="fixed bottom-0 left-0 right-0 flex items-center justify-center py-3 px-4 gap-3" style={{ opacity: 0, background: 'linear-gradient(to top, rgba(5, 11, 20, 0.95), transparent)', zIndex: 20 }}>
        <a href={GUMROAD_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-all duration-300" style={{ padding: '5px 14px', borderRadius: '14px', background: 'rgba(196, 149, 106, 0.08)', border: '1px solid rgba(196, 149, 106, 0.18)', fontFamily: '"Inter", sans-serif', fontSize: '10px', fontWeight: 500, color: 'rgba(212, 184, 150, 0.6)', letterSpacing: '0.06em', textDecoration: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196, 149, 106, 0.15)'; e.currentTarget.style.borderColor = 'rgba(196, 149, 106, 0.35)'; e.currentTarget.style.color = 'rgba(212, 184, 150, 0.9)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(196, 149, 106, 0.08)'; e.currentTarget.style.borderColor = 'rgba(196, 149, 106, 0.18)'; e.currentTarget.style.color = 'rgba(212, 184, 150, 0.6)'; }}>
          30-Day Challenge
        </a>
        <span style={{ color: 'rgba(255, 255, 255, 0.1)', fontSize: '10px' }}>|</span>
        <button onClick={handleAboutOpen} className="flex items-center gap-1.5 transition-all duration-300 cursor-pointer" style={{ padding: '5px 14px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', fontFamily: '"Inter", sans-serif', fontSize: '10px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.3)', letterSpacing: '0.06em' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'; }}>
          About Us
        </button>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, #050B14, transparent)', pointerEvents: 'none', zIndex: 5 }} />
    </div>
  );
}
