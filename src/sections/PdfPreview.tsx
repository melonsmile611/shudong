import { useRef, useEffect, useCallback } from 'react';
import { X, Download, BookOpen } from 'lucide-react';
import gsap from 'gsap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfPreviewProps {
  text: string;
  onClose: () => void;
  shopLink?: string;
  gumroadLink?: string;
}

export default function PdfPreview({ text, onClose, shopLink, gumroadLink }: PdfPreviewProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isGenerating = useRef(false);

  // Entrance animation
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

  const generatePDF = useCallback(async () => {
    if (isGenerating.current || !previewRef.current) return;
    isGenerating.current = true;
    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#FAF6F1', logging: false, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`Journal_${date}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      isGenerating.current = false;
    }
  }, []);

  // Format date
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dateStrEn = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const dayStr = days[now.getDay()];
  const dateStrCn = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Mocha color palette
  const C = {
    cream: '#FAF6F1',
    creamDark: '#F0EAE2',
    brown: '#3C2415',
    brownLight: '#5C4033',
    caramel: '#C4956A',
    caramelLight: '#D4B896',
    mocha: '#8B6F4E',
    creamText: '#7A6650',
    latte: '#E8DDD0',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(5, 11, 20, 0.9)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', zIndex: 100, opacity: 0 }}
    >
      <div ref={contentRef} className="relative w-full max-w-3xl flex flex-col" style={{ opacity: 0, maxHeight: '90vh' }}>
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.12)', borderBottom: 'none' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(196,149,106,0.15)', border: '1px solid rgba(196,149,106,0.25)' }}>
              <BookOpen size={14} color="rgba(196,149,106,0.9)" />
            </div>
            <span style={{ fontFamily: '"Inter", "Noto Sans SC", sans-serif', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>
              Preview & Download
            </span>
          </div>
          <button onClick={handleClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} color="rgba(255,255,255,0.4)" />
          </button>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
          {/* === MOCHA PDF TEMPLATE === */}
          <div ref={previewRef} style={{ padding: '50px 55px', background: C.cream, minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>

            {/* Outer fine border */}
            <div className="absolute pointer-events-none" style={{ top: '18px', left: '18px', right: '18px', bottom: '18px', border: `1px solid ${C.latte}` }} />

            {/* Corner ornaments */}
            <div className="absolute pointer-events-none" style={{ top: '22px', left: '22px', width: '35px', height: '35px', borderTop: `2.5px solid ${C.caramel}`, borderLeft: `2.5px solid ${C.caramel}` }} />
            <div className="absolute pointer-events-none" style={{ top: '22px', right: '22px', width: '35px', height: '35px', borderTop: `2.5px solid ${C.caramel}`, borderRight: `2.5px solid ${C.caramel}` }} />
            <div className="absolute pointer-events-none" style={{ bottom: '22px', left: '22px', width: '35px', height: '35px', borderBottom: `2.5px solid ${C.caramel}`, borderLeft: `2.5px solid ${C.caramel}` }} />
            <div className="absolute pointer-events-none" style={{ bottom: '22px', right: '22px', width: '35px', height: '35px', borderBottom: `2.5px solid ${C.caramel}`, borderRight: `2.5px solid ${C.caramel}` }} />

            {/* Top brand bar */}
            <div className="flex items-center justify-between" style={{ marginBottom: '45px', paddingBottom: '18px', borderBottom: `1px solid ${C.latte}` }}>
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '8px', color: C.caramel, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600 }}>
                Studio Sarah Digital
              </span>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.caramel }} />
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '8px', color: C.creamText, letterSpacing: '0.15em' }}>
                {dateStrCn}
              </span>
            </div>

            {/* Date block */}
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '38px', fontWeight: 600, color: C.brown, letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: '8px' }}>
                {now.getDate()}
              </div>
              <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '10px', color: C.creamText, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
                {dayStr}
              </div>
              <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '10px', color: C.caramel, letterSpacing: '0.15em' }}>
                {dateStrEn} &nbsp;|&nbsp; {timeStr}
              </div>
            </div>

            {/* Caramel divider */}
            <div className="flex items-center justify-center" style={{ marginBottom: '40px' }}>
              <div style={{ width: '40px', height: '1px', background: C.latte }} />
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.caramel, margin: '0 10px' }} />
              <div style={{ width: '40px', height: '1px', background: C.latte }} />
            </div>

            {/* Main content */}
            <div style={{ fontFamily: '"Lora", "Noto Serif SC", serif', fontSize: '13.5px', lineHeight: 2.4, color: C.brown, whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'justify', textAlignLast: 'left', minHeight: '400px', padding: '0 5px' }}>
              {text}
            </div>

            {/* Bottom decorative line */}
            <div className="flex items-center justify-center" style={{ marginTop: '50px', marginBottom: '20px' }}>
              <div style={{ width: '25px', height: '1px', background: C.latte }} />
              <div style={{ width: '4px', height: '4px', border: `1px solid ${C.caramel}`, transform: 'rotate(45deg)', margin: '0 8px' }} />
              <div style={{ width: '25px', height: '1px', background: C.latte }} />
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '0 30px' }}>
              <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '7.5px', color: C.creamText, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Created with 心流 · 释放
              </div>
              <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '7px', color: C.caramel, letterSpacing: '0.1em', lineHeight: 1.8 }}>
                {gumroadLink && <span>{gumroadLink}</span>}
                {gumroadLink && shopLink && <span style={{ color: C.latte, margin: '0 6px' }}>|</span>}
                {shopLink && <span>{shopLink}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', borderRadius: '0 0 20px 20px', border: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            {text.length} chars &middot; Mocha Journal &middot; A4
          </span>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 cursor-pointer transition-all duration-300"
            style={{ padding: '10px 24px', borderRadius: '24px', background: 'rgba(196,149,106,0.12)', border: '1px solid rgba(196,149,106,0.3)', fontFamily: '"Inter", "Noto Sans SC", sans-serif', fontSize: '13px', fontWeight: 500, color: 'rgba(212,184,150,0.95)', letterSpacing: '0.05em' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,149,106,0.2)'; e.currentTarget.style.borderColor = 'rgba(196,149,106,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(196,149,106,0.12)'; e.currentTarget.style.borderColor = 'rgba(196,149,106,0.3)'; }}
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
