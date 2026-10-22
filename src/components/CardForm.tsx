import React, { useRef } from 'react';
import { CardData, PhotoShape } from '../types';
import { SAMPLE_FOUNDERS } from '../data/samplePresets';
import { 
  Upload, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  User, 
  Briefcase, 
  Quote, 
  Lightbulb, 
  Crop, 
  SlidersHorizontal 
} from 'lucide-react';

interface CardFormProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
  onReset: () => void;
}

export const CardForm: React.FC<CardFormProps> = ({ data, onChange, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onChange({
        photoUrl: result,
        zoom: 1.1,
        offsetX: 0,
        offsetY: 0,
      });
    };
    reader.readAsDataURL(file);
    // Clear input so same file can be reselected if needed
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    onChange({
      photoUrl: null,
      offsetX: 0,
      offsetY: 0,
      zoom: 1,
    });
  };

  const loadPreset = (preset: typeof SAMPLE_FOUNDERS[0]) => {
    onChange({
      name: preset.data.name,
      role: preset.data.role,
      viewOnTeqx: preset.data.viewOnTeqx,
      funFact: preset.data.funFact,
      photoShape: preset.data.photoShape,
      zoom: preset.data.zoom,
      offsetX: preset.data.offsetX,
      offsetY: preset.data.offsetY,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm transition-colors space-y-6">
      {/* Presets and Quick actions banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0B63CE]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Quick Fill Presets
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SAMPLE_FOUNDERS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#0B63CE]/10 hover:text-[#0B63CE] dark:hover:text-[#5AA2F0] font-medium transition-colors cursor-pointer"
            >
              {preset.label.split(' ')[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="text-xs px-2.5 py-1 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium flex items-center gap-1 cursor-pointer"
            title="Clear all fields"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Field 1: Name */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="founder-name" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#0B63CE]" />
            <span>Full Name</span>
          </label>
          <span className={`text-[11px] font-mono tabular-nums ${data.name.length >= 38 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
            {data.name.length} / 40
          </span>
        </div>
        <input
          id="founder-name"
          type="text"
          maxLength={40}
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Rahul Menon"
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:border-transparent transition-all"
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Rendered in bold brand typography with auto font-size scaling.
        </p>
      </div>

      {/* Field 2: Role */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="founder-role" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#0B63CE]" />
            <span>Role / Title</span>
          </label>
          <span className={`text-[11px] font-mono tabular-nums ${data.role.length >= 56 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
            {data.role.length} / 60
          </span>
        </div>
        <input
          id="founder-role"
          type="text"
          maxLength={60}
          value={data.role}
          onChange={(e) => onChange({ role: e.target.value })}
          placeholder="e.g. CO-FOUNDER & CHIEF CREATIVE OFFICER"
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:border-transparent transition-all"
        />
      </div>

      {/* Field 3: Photo Upload & Shape */}
      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Crop className="w-3.5 h-3.5 text-[#0B63CE]" />
            <span>Founder Photo</span>
          </span>
          {data.photoUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove Photo</span>
            </button>
          )}
        </div>

        {/* Upload dropzone */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="photo-upload"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            htmlFor="photo-upload"
            className="flex items-center justify-center gap-2.5 px-4 py-3 min-h-[48px] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0B63CE] dark:hover:border-[#0B63CE] bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <Upload className="w-4 h-4 text-[#0B63CE]" />
            <span>{data.photoUrl ? 'Replace Photo' : 'Upload Founder Photo'}</span>
          </label>

          {/* Shape selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {(['portrait', 'square', 'circle'] as PhotoShape[]).map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => onChange({ photoShape: shape })}
                className={`flex-1 min-h-[38px] py-1.5 text-xs font-semibold capitalize rounded-lg transition-all cursor-pointer ${
                  data.photoShape === shape
                    ? 'bg-white dark:bg-slate-700 text-[#0B63CE] dark:text-[#5AA2F0] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Sliders (Zoom, Left/Right, Up/Down) */}
        {data.photoUrl ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B63CE]" />
                Photo Adjustments
              </span>
              <button
                type="button"
                onClick={() => onChange({ zoom: 1, offsetX: 0, offsetY: 0 })}
                className="text-slate-500 hover:text-[#0B63CE] flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset zoom and position"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Hint */}
            <p className="text-[11px] text-[#0B63CE] dark:text-[#5AA2F0] bg-[#0B63CE]/10 dark:bg-[#0B63CE]/20 px-2.5 py-1.5 rounded-lg font-medium">
              💡 Tip: You can also drag directly on the preview card with mouse or finger to move the photo.
            </p>

            {/* Slider 1: Size (Zoom) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Size (Zoom)</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                  {data.zoom.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={data.zoom}
                onChange={(e) => onChange({ zoom: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 2: Left / Right (X offset) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Left / Right Position</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                  {data.offsetX > 0 ? `+${data.offsetX}` : data.offsetX}px
                </span>
              </div>
              <input
                type="range"
                min="-260"
                max="260"
                step="2"
                value={data.offsetX}
                onChange={(e) => onChange({ offsetX: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 3: Up / Down (Y offset) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Up / Down Position</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                  {data.offsetY > 0 ? `+${data.offsetY}` : data.offsetY}px
                </span>
              </div>
              <input
                type="range"
                min="-260"
                max="260"
                step="2"
                value={data.offsetY}
                onChange={(e) => onChange({ offsetY: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>No photo uploaded yet. Card will display a clean stylized placeholder.</span>
          </div>
        )}
      </div>

      {/* Field 4: View on Teqx Studio */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label htmlFor="view-teqx" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-[#0B63CE]" />
            <span>Your View on Teqx Studio</span>
          </label>
          <span className={`text-[11px] font-mono tabular-nums ${data.viewOnTeqx.length >= 300 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
            {data.viewOnTeqx.length} / 320
          </span>
        </div>
        <textarea
          id="view-teqx"
          maxLength={320}
          rows={3}
          value={data.viewOnTeqx}
          onChange={(e) => onChange({ viewOnTeqx: e.target.value })}
          placeholder="What makes Teqx Studio special? Your vision, momentum, or philosophy..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:border-transparent transition-all resize-y"
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Rendered under the "MY VIEW ON TEQX STUDIO" headline with auto line wrapping.
        </p>
      </div>

      {/* Field 5: Fun Fact */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label htmlFor="fun-fact" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#0B63CE]" />
            <span>A Fun Fact About You</span>
          </label>
          <span className={`text-[11px] font-mono tabular-nums ${data.funFact.length >= 150 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
            {data.funFact.length} / 160
          </span>
        </div>
        <textarea
          id="fun-fact"
          maxLength={160}
          rows={2}
          value={data.funFact}
          onChange={(e) => onChange({ funFact: e.target.value })}
          placeholder="A quirky habit, secret hobby, or personal quirk..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:border-transparent transition-all resize-y"
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Rendered inside the signature black box with the blue "FUN FACT" badge.
        </p>
      </div>
    </div>
  );
};
