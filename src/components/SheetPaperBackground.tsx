import React from 'react';
import { SheetStyle } from '../types';
import { SHEET_TEMPLATES, SheetStyleConfig } from '../lib/handwritingEngine';

interface SheetPaperBackgroundProps {
  sheetStyle: SheetStyle;
  lineSpacing?: number;
  width?: number; // 794px for A4
  height?: number; // 1123px for A4
  marginTop?: number;
  marginLeft?: number;
}

export const SheetPaperBackground: React.FC<SheetPaperBackgroundProps> = ({
  sheetStyle,
  lineSpacing = 32,
  width = 794,
  height = 1123,
  marginTop = 80,
  marginLeft = 64,
}) => {
  const config: SheetStyleConfig = SHEET_TEMPLATES[sheetStyle] || SHEET_TEMPLATES['single-rule'];
  const effectiveSpacing = lineSpacing || config.ruleSpacing || 32;

  // Generate lines or patterns
  const lines: number[] = [];
  if (config.hasHorizontalRules) {
    for (let y = marginTop; y <= height - 30; y += effectiveSpacing) {
      lines.push(y);
    }
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ backgroundColor: config.backgroundColor }}
    >
      {/* 1. PLAIN WHITE: Absolutely no lines or markers */}
      {sheetStyle === 'plain-white' && null}

      {/* 2. BLANK MARGIN: Only the left red vertical margin line, no horizontal rules */}
      {sheetStyle === 'blank-margin' && (
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-rose-400/80"
          style={{ left: `${marginLeft}px` }}
        />
      )}

      {/* 3. SINGLE RULE, COLLEGE RULE, NARROW RULE, WIDE RULE */}
      {config.hasHorizontalRules && !config.isDoubleRule && (
        <svg className="w-full h-full absolute inset-0">
          {/* Vertical Red Margin Line */}
          {config.hasMarginLine && (
            <line
              x1={marginLeft}
              y1={0}
              x2={marginLeft}
              y2={height}
              stroke={config.marginLineColor}
              strokeWidth="1.5"
            />
          )}

          {/* Horizontal Rule Lines */}
          {lines.map((y, idx) => (
            <line
              key={idx}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke={config.ruleColor}
              strokeWidth="1"
            />
          ))}
        </svg>
      )}

      {/* 4. DOUBLE RULE: Paired parallel guidelines */}
      {config.isDoubleRule && (
        <svg className="w-full h-full absolute inset-0">
          {config.hasMarginLine && (
            <line
              x1={marginLeft}
              y1={0}
              x2={marginLeft}
              y2={height}
              stroke={config.marginLineColor}
              strokeWidth="1.5"
            />
          )}
          {lines.map((y, idx) => (
            <g key={idx}>
              <line
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke={config.ruleColor}
                strokeWidth="1"
              />
              <line
                x1={0}
                y1={y + (config.doubleRuleGap || 8)}
                x2={width}
                y2={y + (config.doubleRuleGap || 8)}
                stroke="#e2e8f0"
                strokeWidth="0.8"
                strokeDasharray="4 2"
              />
            </g>
          ))}
        </svg>
      )}

      {/* 5. GRAPH / GRID */}
      {config.isGrid && (
        <div
          className="w-full h-full absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${config.ruleColor} 1px, transparent 1px), linear-gradient(to bottom, ${config.ruleColor} 1px, transparent 1px)`,
            backgroundSize: `${config.gridSize}px ${config.gridSize}px`,
          }}
        />
      )}

      {/* 6. DOTTED MATRIX */}
      {config.isDotted && (
        <div
          className="w-full h-full absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)`,
            backgroundSize: `${config.dotSpacing}px ${config.dotSpacing}px`,
            backgroundPosition: '12px 12px',
          }}
        />
      )}

      {/* 7. CUSTOM / MINIMAL: Elegant corner trim markers */}
      {sheetStyle === 'custom-minimal' && (
        <svg className="w-full h-full absolute inset-0 text-neutral-300">
          {/* Corner tick marks */}
          <path d="M 24 36 L 24 24 L 36 24" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M 770 36 L 770 24 L 758 24" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M 24 1099 L 24 1111 L 36 1111" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M 770 1099 L 770 1111 L 758 1111" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
};
