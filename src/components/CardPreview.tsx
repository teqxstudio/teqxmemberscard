import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CardData } from '../types';
import { renderFounderCard, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/canvasRenderer';
import { Download, Share2, Move, ZoomIn, ZoomOut, RotateCcw, Copy, Check, Eye } from 'lucide-react';

interface CardPreviewProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
  onOpenExportModal: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  data,
  onChange,
  onOpenExportModal,
  onDownload,
  isDownloading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initOffsetX: number; initOffsetY: number }>({
    startX: 0,
    startY: 0,
    initOffsetX: 0,
    initOffsetY: 0,
  });
  const [copied, setCopied] = useState(false);

  // Redraw canvas whenever data changes
  const render = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderFounderCard(canvasRef.current, data);
  }, [data]);

  useEffect(() => {
    render();
  }, [render]);

  // Pointer drag events for moving the photo on the card
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!data.photoUrl) return; // Only allow drag if a photo is uploaded
    const canvas = canvasRef.current;
    if (!canvas) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffsetX: data.offsetX || 0,
      initOffsetY: data.offsetY || 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Scale delta according to the ratio between canvas actual pixels (1080) and screen CSS width
    const scaleFactor = CANVAS_WIDTH / (rect.width || 1);

    const deltaX = (e.clientX - dragStartRef.current.startX) * scaleFactor;
    const deltaY = (e.clientY - dragStartRef.current.startY) * scaleFactor;

    onChange({
      offsetX: Math.round(dragStartRef.current.initOffsetX + deltaX),
      offsetY: Math.round(dragStartRef.current.initOffsetY + deltaY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture fallback
      }
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } else {
          onOpenExportModal();
        }
      }, 'image/png');
    } catch {
      onOpenExportModal();
    }
  };

  return (
    <div className="flex flex-col items-center w-full" ref={containerRef}>
      {/* Canvas Wrapper */}
      <div className="relative w-full max-w-[480px] group rounded-2xl p-2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition-colors shadow-xl">
        {/* Floating Tag */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
          <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-[#231F20]/90 text-white backdrop-blur-md rounded-md shadow-md border border-white/10">
            1080 × 1350 · 4:5
          </span>
          {data.photoUrl && (
            <span className="px-2.5 py-1 text-[11px] font-medium bg-[#0B63CE]/90 text-white backdrop-blur-md rounded-md shadow-md flex items-center gap-1.5 animate-in fade-in">
              <Move className="w-3 h-3" />
              <span>Drag to move photo</span>
            </span>
          )}
        </div>

        {/* Live Canvas */}
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 dark:ring-white/10 relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`w-full h-auto block select-none touch-none ${
              data.photoUrl
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-default'
            }`}
            style={{
              aspectRatio: '4 / 5',
              transform: 'translateZ(0)',
            }}
            title={data.photoUrl ? 'Click & drag to reposition photo' : 'Teqx Studio Founder Card'}
          />

          {/* Dragging Active Overlay Indicator */}
          {isDragging && (
            <div className="absolute inset-0 pointer-events-none border-2 border-[#0B63CE] rounded-xl flex items-center justify-center bg-[#0B63CE]/5">
              <span className="bg-[#231F20]/80 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 animate-spin" />
                Adjusting photo position
              </span>
            </div>
          )}
        </div>

        {/* Quick controls bar below canvas */}
        {data.photoUrl && (
          <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Move className="w-3.5 h-3.5 text-[#0B63CE]" />
              X: {data.offsetX}px · Y: {data.offsetY}px · {data.zoom.toFixed(2)}x
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange({ zoom: Math.max(1, +(data.zoom - 0.1).toFixed(2)) })}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Zoom out"
                aria-label="Zoom out photo"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ zoom: Math.min(3, +(data.zoom + 0.1).toFixed(2)) })}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Zoom in"
                aria-label="Zoom in photo"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ zoom: 1, offsetX: 0, offsetY: 0 })}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Reset photo position"
                aria-label="Reset photo position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons Bar */}
      <div className="w-full max-w-[480px] mt-4 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="flex-1 min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-[#0B63CE] hover:bg-[#063A82] active:scale-[0.98] transition-all shadow-md shadow-[#0B63CE]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Preparing High-Res PNG...' : 'Download / Share PNG'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            title="Copy high-res image to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            title="View full resolution & manual save options"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
