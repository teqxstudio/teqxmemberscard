import React, { useState, useEffect, useRef } from 'react';
import { CardData } from './types';
import { SAMPLE_FOUNDERS } from './data/samplePresets';
import { Header } from './components/Header';
import { CardPreview } from './components/CardPreview';
import { CardForm } from './components/CardForm';
import { ExportModal } from './components/ExportModal';
import { CANVAS_WIDTH, CANVAS_HEIGHT, renderFounderCard } from './utils/canvasRenderer';
import { Check, ShieldCheck, Download, Sparkles, HelpCircle } from 'lucide-react';

const INITIAL_CARD_DATA: CardData = {
  name: 'Rahul Menon',
  role: 'CO-FOUNDER & CHIEF CREATIVE OFFICER',
  photoUrl: null,
  photoShape: 'portrait',
  zoom: 1.15,
  offsetX: 0,
  offsetY: 0,
  viewOnTeqx: 'Teqx Studio builds fast, fearless digital products that move companies forward before anyone else does. We treat speed as a feature and craft as a promise.',
  funFact: 'Has never used the phrase "synergy-driven" in a presentation and reads kernel commit messages for relaxation.',
};

export default function App() {
  const [data, setData] = useState<CardData>(() => {
    try {
      const saved = localStorage.getItem('teqx_founder_card_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_CARD_DATA;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('teqx_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportImageSrc, setExportImageSrc] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('teqx_theme', theme);
  }, [theme]);

  // Persist card edits
  useEffect(() => {
    try {
      localStorage.setItem('teqx_founder_card_data', JSON.stringify(data));
    } catch {
      // quota or private browsing
    }
  }, [data]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleUpdateData = (updates: Partial<CardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields to blank template?')) {
      setData({
        name: '',
        role: '',
        photoUrl: null,
        photoShape: 'portrait',
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        viewOnTeqx: '',
        funFact: '',
      });
      showToast('Form cleared');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Generate sanitized filename
  const getFilename = () => {
    const raw = (data.name || '').trim();
    const slug = raw
      ? raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'founder';
    return `${slug}-teqx-founder-card.png`;
  };

  // High-res offscreen rendering & download handler
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create offscreen canvas for pristine 1080x1350 output
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = CANVAS_WIDTH;
      offscreenCanvas.height = CANVAS_HEIGHT;
      await renderFounderCard(offscreenCanvas, data);

      const filename = getFilename();

      offscreenCanvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Canvas conversion failed');
        }

        const dataUrl = offscreenCanvas.toDataURL('image/png');
        setExportImageSrc(dataUrl);

        // Try Web Share API with file if supported on device (e.g. mobile)
        if (
          navigator.canShare &&
          navigator.canShare({
            files: [new File([blob], filename, { type: 'image/png' })],
          })
        ) {
          try {
            await navigator.share({
              title: `${data.name || 'Founder'} Teqx Founder Card`,
              text: 'Check out my Teqx Studio Founder Card!',
              files: [new File([blob], filename, { type: 'image/png' })],
            });
            showToast('Card shared successfully!');
            setIsDownloading(false);
            return;
          } catch (shareErr: any) {
            if (shareErr.name === 'AbortError') {
              setIsDownloading(false);
              return;
            }
            // Fall through to file download
          }
        }

        // Standard direct download attempt
        try {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          showToast(`Downloaded ${filename}`);
        } catch {
          // If browser sandbox prevents automatic file trigger, open the modal with guidance
          setExportModalOpen(true);
        }

        setIsDownloading(false);
      }, 'image/png');
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: open modal so user can save manually
      setExportModalOpen(true);
      setIsDownloading(false);
    }
  };

  const handleOpenExportModal = async () => {
    const offscreen = document.createElement('canvas');
    offscreen.width = CANVAS_WIDTH;
    offscreen.height = CANVAS_HEIGHT;
    await renderFounderCard(offscreen, data);
    setExportImageSrc(offscreen.toDataURL('image/png'));
    setExportModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0E1118] text-slate-900 dark:text-slate-100 font-manrope transition-colors duration-200">
      {/* Top Bar Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onDownload={handleDownload}
        onScrollToForm={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onScrollToPreview={() => previewSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Intro banner */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-6 bg-[#0B63CE] rounded-full inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B63CE] dark:text-[#5AA2F0]">
              Official Brand Generator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Your <span className="text-[#0B63CE]">Teqx Studio</span> Founder Card
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Design a pixel-perfect 1080×1350 Instagram portrait card with official brand typography, forward-slanted panels, customizable photo positioning, and instant high-res export.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6" ref={formSectionRef}>
            <CardForm
              data={data}
              onChange={handleUpdateData}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Live Card Preview & Actions (5 cols, sticky on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4" ref={previewSectionRef}>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Live Card Preview
              </span>
              <button
                type="button"
                onClick={handleOpenExportModal}
                className="text-xs text-[#0B63CE] dark:text-[#5AA2F0] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                Full Resolution View
              </button>
            </div>

            <CardPreview
              data={data}
              onChange={handleUpdateData}
              onOpenExportModal={handleOpenExportModal}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />

            {/* Quick specifications notice */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B63CE]" />
                Brand Specifications Enforced
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Colors: Teqx Blue <code className="text-[#0B63CE] font-bold">#0B63CE</code>, Ink <code className="font-bold">#231F20</code>, White background.</li>
                <li>Fonts: Archivo Black for Name, Manrope for Body & Roles.</li>
                <li>4:5 Aspect Ratio (1080×1350px) optimized for Instagram, LinkedIn & Twitter.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1118] py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-archivo italic font-black text-[#0B63CE] text-lg">TEQX.</span>
            <span className="font-extrabold text-[#231F20] dark:text-white">Studio</span>
            <span className="text-slate-400">· Founder Card Generator</span>
          </div>
          <div>
            Built strictly according to Teqx Studio Brand Guidelines 2026.
          </div>
        </div>
      </footer>

      {/* Export & Save Fallback Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        imageSrc={exportImageSrc}
        filename={getFilename()}
        onDownloadDirect={handleDownload}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#231F20] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/10 animate-in slide-in-from-bottom-2 fade-in">
          <Check className="w-4 h-4 text-[#5AA2F0]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
