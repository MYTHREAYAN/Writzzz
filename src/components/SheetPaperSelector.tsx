import React from 'react';
import { SheetStyle, BlueInkNuance, HandwritingStyle } from '../types';
import { SHEET_TEMPLATES, BLUE_INK_PALETTES } from '../lib/handwritingEngine';
import { FileText, Sliders, Palette, Check } from 'lucide-react';

interface SheetPaperSelectorProps {
  style: HandwritingStyle;
  onChange: (updatedStyle: HandwritingStyle) => void;
  compact?: boolean;
}

export const SheetPaperSelector: React.FC<SheetPaperSelectorProps> = ({
  style,
  onChange,
  compact = false,
}) => {
  const currentSheetStyle: SheetStyle =
    style.sheetStyle ||
    (style.paperType === 'blank'
      ? 'plain-white'
      : style.paperType === 'graph'
      ? 'graph'
      : 'single-rule');

  const currentNuance: BlueInkNuance = style.blueInkNuance || 'natural-ballpoint';

  const handleSelectSheet = (sheetId: SheetStyle) => {
    onChange({
      ...style,
      sheetStyle: sheetId,
      // Keep paperType in sync for any legacy consumer
      paperType:
        sheetId === 'plain-white' || sheetId === 'blank-margin'
          ? 'blank'
          : sheetId === 'graph'
          ? 'graph'
          : 'ruled',
    });
  };

  const handleSelectNuance = (nuance: BlueInkNuance) => {
    onChange({
      ...style,
      blueInkNuance: nuance,
      inkType: 'ballpoint-blue', // ensures blue ink mode is selected
    });
  };

  const handleNumericChange = (key: keyof HandwritingStyle, val: number) => {
    onChange({
      ...style,
      [key]: val,
    });
  };

  const sheetKeys = Object.keys(SHEET_TEMPLATES) as SheetStyle[];

  return (
    <div className="space-y-5">
      {/* 1. Paper / Sheet Style Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Paper / Sheet Style</span>
          </label>
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
            {SHEET_TEMPLATES[currentSheetStyle]?.label || 'Single Rule'}
          </span>
        </div>

        <div
          className={`grid ${
            compact ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          } gap-2.5`}
        >
          {sheetKeys.map((key) => {
            const config = SHEET_TEMPLATES[key];
            const isSelected = currentSheetStyle === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectSheet(key)}
                className={`relative flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/30'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                {/* Mini Paper Swatch Preview */}
                <div
                  className="w-full h-12 rounded-lg border border-neutral-300 relative overflow-hidden mb-2 shadow-inner"
                  style={{ backgroundColor: config.backgroundColor }}
                >
                  {/* Plain White: completely empty */}
                  {key === 'plain-white' && null}

                  {/* Blank with margin: red line only */}
                  {key === 'blank-margin' && (
                    <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-rose-400" />
                  )}

                  {/* Ruled Lines */}
                  {config.hasHorizontalRules && !config.isDoubleRule && (
                    <>
                      {config.hasMarginLine && (
                        <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-rose-400" />
                      )}
                      <div className="absolute inset-0 flex flex-col justify-around py-1 pl-4">
                        <div className="h-[1px] bg-slate-300 w-full" />
                        <div className="h-[1px] bg-slate-300 w-full" />
                        <div className="h-[1px] bg-slate-300 w-full" />
                      </div>
                    </>
                  )}

                  {/* Double Rule */}
                  {config.isDoubleRule && (
                    <>
                      <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-rose-400" />
                      <div className="absolute inset-0 flex flex-col justify-around py-1 pl-4">
                        <div className="space-y-0.5">
                          <div className="h-[1px] bg-slate-400 w-full" />
                          <div className="h-[1px] bg-slate-300 w-full border-b border-dashed border-slate-300" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="h-[1px] bg-slate-400 w-full" />
                          <div className="h-[1px] bg-slate-300 w-full border-b border-dashed border-slate-300" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Graph */}
                  {config.isGrid && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)`,
                        backgroundSize: '8px 8px',
                      }}
                    />
                  )}

                  {/* Dotted */}
                  {config.isDotted && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `radial-gradient(circle, #94a3b8 0.8px, transparent 0.8px)`,
                        backgroundSize: '8px 8px',
                        backgroundPosition: '4px 4px',
                      }}
                    />
                  )}

                  {/* Custom Minimal */}
                  {key === 'custom-minimal' && (
                    <div className="w-full h-full relative p-1">
                      <div className="w-1.5 h-1.5 border-t border-l border-neutral-400" />
                      <div className="absolute right-1 top-1 w-1.5 h-1.5 border-t border-r border-neutral-400" />
                      <div className="absolute left-1 bottom-1 w-1.5 h-1.5 border-b border-l border-neutral-400" />
                      <div className="absolute right-1 bottom-1 w-1.5 h-1.5 border-b border-r border-neutral-400" />
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-200 group-hover:text-white truncate">
                    {config.label}
                  </span>
                </div>
                <span className="text-[9px] text-neutral-400 line-clamp-1 mt-0.5">
                  {config.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Realistic Blue Pen Ink Nuances */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span>Blue Pen Ink Variation (Controlled Ballpoint Palette)</span>
          </label>
          <span className="text-[11px] font-mono capitalize text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-md">
            {currentNuance.replace('-', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {(Object.keys(BLUE_INK_PALETTES) as BlueInkNuance[]).map((nuance) => {
            const pal = BLUE_INK_PALETTES[nuance];
            const isSelected = currentNuance === nuance && style.inkType !== 'ballpoint-black' && style.inkType !== 'gel-black';

            return (
              <button
                key={nuance}
                type="button"
                onClick={() => handleSelectNuance(nuance)}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/30'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow"
                  style={{ backgroundColor: pal.base }}
                />
                <span className="text-[10px] font-medium text-neutral-300 capitalize truncate">
                  {nuance.replace('-', ' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Handwriting Precision Controls */}
      <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Handwriting Scale & Spacing Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Size */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-neutral-400">Font Size</span>
              <span className="font-mono text-neutral-200 font-bold">{style.fontSize || 18}px</span>
            </div>
            <input
              type="range"
              min="15"
              max="24"
              step="1"
              value={style.fontSize || 18}
              onChange={(e) => handleNumericChange('fontSize', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Line Spacing */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-neutral-400">Line Spacing / Rule Height</span>
              <span className="font-mono text-neutral-200 font-bold">{style.lineSpacing || 32}px</span>
            </div>
            <input
              type="range"
              min="24"
              max="40"
              step="1"
              value={style.lineSpacing || 32}
              onChange={(e) => handleNumericChange('lineSpacing', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Letter Spacing */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-neutral-400">Letter Spacing</span>
              <span className="font-mono text-neutral-200 font-bold">{style.letterSpacing ?? 0.5}px</span>
            </div>
            <input
              type="range"
              min="-0.5"
              max="2.5"
              step="0.2"
              value={style.letterSpacing ?? 0.5}
              onChange={(e) => handleNumericChange('letterSpacing', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Word Spacing */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-neutral-400">Word Spacing</span>
              <span className="font-mono text-neutral-200 font-bold">{style.wordSpacing ?? 4}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={style.wordSpacing ?? 4}
              onChange={(e) => handleNumericChange('wordSpacing', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slant */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-neutral-400">Wrist Slant Angle</span>
              <span className="font-mono text-neutral-200 font-bold">{style.slant || 0}°</span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={style.slant || 0}
              onChange={(e) => handleNumericChange('slant', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Baseline Wander / Natural Jitter */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-neutral-400">Natural Baseline Wander</span>
              <span className="font-mono text-neutral-200 font-bold">{(style.baselineWander ?? 1).toFixed(1)}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.2"
              value={style.baselineWander ?? 1}
              onChange={(e) => handleNumericChange('baselineWander', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
