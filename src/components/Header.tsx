import React from 'react';
import { Sun, Moon, Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onDownload: () => void;
  onScrollToForm: () => void;
  onScrollToPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onDownload,
  onScrollToForm,
  onScrollToPreview,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0E1118]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark in display font) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="font-archivo italic text-2xl font-black text-[#0B63CE] tracking-tight">
              TEQX.
            </span>
            <span className="font-manrope text-base font-extrabold text-[#231F20] dark:text-white tracking-tight">
              Studio
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-[#0B63CE]/10 text-[#0B63CE] dark:text-[#5AA2F0]">
              Founder Card Maker
            </span>
          </div>
        </div>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={onScrollToForm}
            className="hover:text-[#0B63CE] dark:hover:text-[#5AA2F0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Editor Fields
          </button>
          <button
            type="button"
            onClick={onScrollToPreview}
            className="hover:text-[#0B63CE] dark:hover:text-[#5AA2F0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Live Canvas
          </button>
          <a
            href="/assets/aistudio/TEQX_Brand_Guidelines_ad199af0.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0B63CE] dark:hover:text-[#5AA2F0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Brand Guidelines
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action + Theme switch */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={onDownload}
            className="min-h-[40px] px-4 py-2 text-xs font-bold text-white bg-[#0B63CE] hover:bg-[#063A82] rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </header>
  );
};
