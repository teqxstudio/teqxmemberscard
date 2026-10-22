import React, { useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, HelpCircle, AlertTriangle } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  filename: string;
  onDownloadDirect: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  filename,
  onDownloadDirect,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageSrc) return null;

  const handleCopy = async () => {
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        alert('Clipboard image copy not supported on this browser. Please right-click the card and choose "Save image as...".');
      }
    } catch (err) {
      console.warn('Copy error:', err);
      alert('Please right-click or long-press the image to save.');
    }
  };

  const handleOpenInNewTab = () => {
    const w = window.open();
    if (w) {
      w.document.write(`<title>${filename}</title><body style="margin:0;background:#0E1118;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${imageSrc}" style="max-height:96vh;max-width:96vw;box-shadow:0 20px 40px rgba(0,0,0,0.5);border-radius:12px;" /></body>`);
    } else {
      alert('Popup was blocked by your browser. You can right-click the image below and select "Save image as...".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="export-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Export Founder Card (1080 × 1350)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {filename}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice for iframe / sandbox environments */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <HelpCircle className="w-4 h-4 text-[#0B63CE] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Save Tip: </span>
            If automatic download is blocked by the preview sandbox, simply <strong className="underline">right-click (or press & hold on mobile)</strong> the image below and choose <span className="font-semibold">"Save image as..."</span>.
          </div>
        </div>

        {/* Scrollable Image Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50">
          <img
            src={imageSrc}
            alt="Teqx Studio Founder Card Preview"
            className="max-h-[52vh] w-auto rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 select-all"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open full image in new browser tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Tab</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Done
            </button>

            <button
              type="button"
              onClick={onDownloadDirect}
              className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B63CE] hover:bg-[#063A82] shadow-md shadow-[#0B63CE]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
