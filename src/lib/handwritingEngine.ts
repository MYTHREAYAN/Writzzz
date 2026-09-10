import { SheetStyle, BlueInkNuance, InkType, HandwritingStyle } from '../types';

export interface SheetStyleConfig {
  id: SheetStyle;
  label: string;
  description: string;
  backgroundColor: string;
  hasHorizontalRules: boolean;
  ruleSpacing: number; // in px
  ruleColor: string;
  hasMarginLine: boolean;
  marginLineX: number; // in px
  marginLineColor: string;
  isDoubleRule?: boolean;
  doubleRuleGap?: number;
  isGrid?: boolean;
  gridSize?: number;
  isDotted?: boolean;
  dotSize?: number;
  dotSpacing?: number;
}

export const SHEET_TEMPLATES: Record<SheetStyle, SheetStyleConfig> = {
  'plain-white': {
    id: 'plain-white',
    label: 'Plain White',
    description: 'Clean unruled white sheet with no guidelines',
    backgroundColor: '#ffffff',
    hasHorizontalRules: false,
    ruleSpacing: 32,
    ruleColor: 'transparent',
    hasMarginLine: false,
    marginLineX: 0,
    marginLineColor: 'transparent',
  },
  'single-rule': {
    id: 'single-rule',
    label: 'Single Rule',
    description: 'Standard single horizontal lines across the page',
    backgroundColor: '#fdfbf7',
    hasHorizontalRules: true,
    ruleSpacing: 32,
    ruleColor: '#e2e8f0',
    hasMarginLine: true,
    marginLineX: 64,
    marginLineColor: '#fca5a5',
  },
  'double-rule': {
    id: 'double-rule',
    label: 'Double Rule',
    description: 'Classic school notebook with paired guide rules',
    backgroundColor: '#fefdfa',
    hasHorizontalRules: true,
    ruleSpacing: 34,
    ruleColor: '#cbd5e1',
    hasMarginLine: true,
    marginLineX: 64,
    marginLineColor: '#f87171',
    isDoubleRule: true,
    doubleRuleGap: 8,
  },
  'college-rule': {
    id: 'college-rule',
    label: 'College Rule',
    description: 'Medium 28px spacing with left red margin line',
    backgroundColor: '#fdfcf9',
    hasHorizontalRules: true,
    ruleSpacing: 28,
    ruleColor: '#e2e8f0',
    hasMarginLine: true,
    marginLineX: 64,
    marginLineColor: '#f87171',
  },
  'narrow-rule': {
    id: 'narrow-rule',
    label: 'Narrow Rule',
    description: 'Dense 24px rule spacing for compact note-taking',
    backgroundColor: '#faf9f5',
    hasHorizontalRules: true,
    ruleSpacing: 24,
    ruleColor: '#e2e8f0',
    hasMarginLine: true,
    marginLineX: 64,
    marginLineColor: '#f87171',
  },
  'wide-rule': {
    id: 'wide-rule',
    label: 'Wide Rule',
    description: 'Spacious 36px rule lines for large handwriting',
    backgroundColor: '#fefefe',
    hasHorizontalRules: true,
    ruleSpacing: 36,
    ruleColor: '#e2e8f0',
    hasMarginLine: true,
    marginLineX: 64,
    marginLineColor: '#f87171',
  },
  'graph': {
    id: 'graph',
    label: 'Graph / Grid',
    description: '5mm / 24px precision engineering grid lines',
    backgroundColor: '#fcfcf9',
    hasHorizontalRules: false,
    ruleSpacing: 24,
    ruleColor: 'rgba(99, 102, 241, 0.09)',
    hasMarginLine: false,
    marginLineX: 0,
    marginLineColor: 'transparent',
    isGrid: true,
    gridSize: 24,
  },
  'dotted': {
    id: 'dotted',
    label: 'Dotted Grid',
    description: 'Minimal dot matrix for modern bullet-journal layout',
    backgroundColor: '#ffffff',
    hasHorizontalRules: false,
    ruleSpacing: 24,
    ruleColor: 'transparent',
    hasMarginLine: false,
    marginLineX: 0,
    marginLineColor: 'transparent',
    isDotted: true,
    dotSize: 1.5,
    dotSpacing: 24,
  },
  'blank-margin': {
    id: 'blank-margin',
    label: 'Blank with Margin',
    description: 'Plain paper with red vertical margin (no ruled lines)',
    backgroundColor: '#faf8f5',
    hasHorizontalRules: false,
    ruleSpacing: 32,
    ruleColor: 'transparent',
    hasMarginLine: true,
    marginLineX: 64,
    marginLineColor: '#fca5a5',
  },
  'custom-minimal': {
    id: 'custom-minimal',
    label: 'Custom / Minimal',
    description: 'Clean sheet with subtle corner crop indicators',
    backgroundColor: '#ffffff',
    hasHorizontalRules: false,
    ruleSpacing: 32,
    ruleColor: 'transparent',
    hasMarginLine: false,
    marginLineX: 0,
    marginLineColor: 'transparent',
  },
};

// -------------------------------------------------------------
// Controlled Blue Ink Palette (Subtle Natural Variations)
// -------------------------------------------------------------
export const BLUE_INK_PALETTES: Record<BlueInkNuance, { base: string; shades: string[]; rgb: [number, number, number] }> = {
  'natural-ballpoint': {
    base: '#1e3a8a',
    shades: ['#1e3a8a', '#1e377e', '#23439b', '#1a326b', '#2648a8', '#1b3472'],
    rgb: [30, 58, 138],
  },
  'deep-navy': {
    base: '#172554',
    shades: ['#172554', '#141f45', '#1a2b60', '#131e42', '#1d306b', '#121c3c'],
    rgb: [23, 37, 84],
  },
  'royal-blue': {
    base: '#1d4ed8',
    shades: ['#1d4ed8', '#1a46bf', '#2356e6', '#173db0', '#2a5df0', '#1942b8'],
    rgb: [29, 78, 216],
  },
  'medium-blue': {
    base: '#2563eb',
    shades: ['#2563eb', '#2057cd', '#2e6cf2', '#1c4eb8', '#3878f5', '#225bda'],
    rgb: [37, 99, 235],
  },
  'dark-blue': {
    base: '#1e40af',
    shades: ['#1e40af', '#1a3797', '#234bc6', '#173083', '#2854db', '#1c3c9e'],
    rgb: [30, 64, 175],
  },
  'light-blue': {
    base: '#3b82f6',
    shades: ['#3b82f6', '#3273db', '#488ef7', '#2a67cb', '#5296fa', '#357ae2'],
    rgb: [59, 130, 246],
  },
  'blue-gray': {
    base: '#334155',
    shades: ['#334155', '#2c384a', '#3c4d63', '#252f3f', '#44566f', '#2f3c4e'],
    rgb: [51, 65, 85],
  },
  'fountain-pen': {
    base: '#1e3a8a',
    shades: ['#1e3a8a', '#172554', '#1e40af', '#1d4ed8', '#1a367c', '#204394'],
    rgb: [30, 58, 138],
  },
  'vibrant-gel': {
    base: '#1d4ed8',
    shades: ['#1d4ed8', '#2563eb', '#1e40af', '#2a5ee8', '#1b44c2', '#2255dc'],
    rgb: [29, 78, 216],
  },
};

export const BLACK_INK_PALETTES = {
  'ballpoint-black': {
    base: '#18181b',
    shades: ['#18181b', '#202024', '#141416', '#27272a', '#17171a'],
    rgb: [24, 24, 27] as [number, number, number],
  },
  'gel-black': {
    base: '#09090b',
    shades: ['#09090b', '#0f0f12', '#050507', '#121216', '#08080a'],
    rgb: [9, 9, 11] as [number, number, number],
  },
};

// Deterministic pseudo-random generator based on seed
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// -------------------------------------------------------------
// Calculate Character-Level Micro-Transforms for Realism
// -------------------------------------------------------------
export interface GlyphTransform {
  color: string;
  translateY: number; // baseline wander in px
  translateX: number; // horizontal micro-jitter
  rotate: number; // wrist slant angle in deg
  scale: number; // slight scale fluctuation
  opacity: number; // subtle ink flow variation
  letterSpacingExtra: number; // subtle spacing variation
  fontWeight: number; // subtle pressure variation
}

export function computeGlyphTransform(
  char: string,
  charIndex: number,
  wordIndex: number,
  lineIndex: number,
  style: HandwritingStyle,
  forceBlackInk: boolean = false
): GlyphTransform {
  // Compute deterministic seed from indices & char code
  const charCode = char.charCodeAt(0);
  const seed = charCode * 31 + charIndex * 17 + wordIndex * 53 + lineIndex * 101;

  const r1 = pseudoRandom(seed);
  const r2 = pseudoRandom(seed + 1);
  const r3 = pseudoRandom(seed + 2);
  const r4 = pseudoRandom(seed + 3);
  const r5 = pseudoRandom(seed + 4);

  // 1. Ink Color Selection
  let color = '#1e3a8a';
  if (forceBlackInk || style.inkType === 'ballpoint-black' || style.inkType === 'gel-black') {
    const pal = BLACK_INK_PALETTES[style.inkType === 'gel-black' ? 'gel-black' : 'ballpoint-black'];
    const shadeIdx = Math.floor(r1 * pal.shades.length);
    color = pal.shades[shadeIdx];
  } else {
    // Blue ink nuance or custom ink selection
    let nuance = style.blueInkNuance || 'natural-ballpoint';
    if (style.inkType === 'fountain-blue') nuance = 'fountain-pen';
    else if (style.inkType === 'royal-blue') nuance = 'royal-blue';
    else if (style.inkType === 'dark-blue') nuance = 'dark-blue';
    else if (style.inkType === 'gel-blue') nuance = 'vibrant-gel';

    const pal = BLUE_INK_PALETTES[nuance] || BLUE_INK_PALETTES['natural-ballpoint'];
    const shadeIdx = Math.floor(r1 * pal.shades.length);
    color = pal.shades[shadeIdx];
  }

  // 2. Baseline Wander (-1.2px to +1.2px modulated by baselineWander setting)
  const wanderIntensity = (style.baselineWander ?? 1) * 0.9;
  const translateY = (r2 - 0.5) * 2 * wanderIntensity;

  // 3. Subtle horizontal jitter
  const jitterIntensity = (style.jitter ?? 1) * 0.35;
  const translateX = (r3 - 0.5) * jitterIntensity;

  // 4. Subtle rotation (-1.2deg to +1.2deg)
  const rotate = (r4 - 0.5) * 2.2;

  // 5. Subtle scale (0.97 to 1.03)
  const scale = 0.97 + r5 * 0.06;

  // 6. Natural opacity (0.92 to 0.99)
  const opacity = 0.92 + r2 * 0.07;

  // 7. Letter spacing extra (-0.4px to +0.4px)
  const letterSpacingExtra = (r3 - 0.5) * 0.8;

  // 8. Pen pressure / weight variation
  const baseWeight = (style.penPressure ?? 1) > 1.15 ? 700 : (style.penPressure ?? 1) > 1 ? 500 : 400;
  const weightOffset = r4 > 0.7 ? 100 : r4 < 0.2 ? -50 : 0;
  const fontWeight = Math.max(300, Math.min(800, baseWeight + weightOffset));

  return {
    color,
    translateY,
    translateX,
    rotate,
    scale,
    opacity,
    letterSpacingExtra,
    fontWeight,
  };
}

// -------------------------------------------------------------
// Resolve effective sheet style config from assignment
// -------------------------------------------------------------
export function getEffectiveSheetConfig(style?: HandwritingStyle): SheetStyleConfig {
  if (!style) return SHEET_TEMPLATES['single-rule'];

  // If explicit sheetStyle is set, use it
  if (style.sheetStyle && SHEET_TEMPLATES[style.sheetStyle]) {
    return SHEET_TEMPLATES[style.sheetStyle];
  }

  // Backwards compatibility with paperType
  if (style.paperType === 'blank') {
    return SHEET_TEMPLATES['plain-white'];
  }
  if (style.paperType === 'graph') {
    return SHEET_TEMPLATES['graph'];
  }

  return SHEET_TEMPLATES['single-rule'];
}

export function getFontFamilyClass(family?: string): string {
  switch (family) {
    case 'Caveat':
      return 'font-caveat';
    case 'Kalam':
      return 'font-kalam';
    case 'Homemade Apple':
      return 'font-homemade';
    case 'Cedarville Cursive':
      return 'font-cursive';
    case 'Indie Flower':
      return 'font-indie';
    case 'Architects Daughter':
      return 'font-architects';
    case 'Shadows Into Light':
      return 'font-shadows';
    default:
      return 'font-caveat';
  }
}

export function getFontFamilyCss(family?: string): string {
  switch (family) {
    case 'Caveat':
      return "'Caveat', cursive, sans-serif";
    case 'Kalam':
      return "'Kalam', cursive, sans-serif";
    case 'Homemade Apple':
      return "'Homemade Apple', cursive, sans-serif";
    case 'Cedarville Cursive':
      return "'Cedarville Cursive', cursive, sans-serif";
    case 'Indie Flower':
      return "'Indie Flower', cursive, sans-serif";
    case 'Architects Daughter':
      return "'Architects Daughter', cursive, sans-serif";
    case 'Shadows Into Light':
      return "'Shadows Into Light', cursive, sans-serif";
    default:
      return "'Caveat', cursive, sans-serif";
  }
}

export function getInkClass(inkType?: InkType, blueInkNuance?: BlueInkNuance): string {
  if (inkType === 'ballpoint-black' || inkType === 'gel-black') {
    return 'text-neutral-900';
  }
  if (inkType === 'royal-blue') {
    return 'text-[#1d4ed8]';
  }
  if (inkType === 'dark-blue') {
    return 'text-[#1e40af]';
  }
  if (inkType === 'fountain-blue') {
    return 'text-[#1e3a8a]';
  }
  if (inkType === 'gel-blue') {
    return 'text-[#2563eb]';
  }
  switch (blueInkNuance) {
    case 'deep-navy':
      return 'text-[#172554]';
    case 'royal-blue':
      return 'text-[#1d4ed8]';
    case 'dark-blue':
      return 'text-[#1e40af]';
    case 'light-blue':
      return 'text-[#3b82f6]';
    case 'blue-gray':
      return 'text-[#334155]';
    case 'fountain-pen':
      return 'text-[#1e3a8a]';
    case 'vibrant-gel':
      return 'text-[#1d4ed8]';
    case 'natural-ballpoint':
    default:
      return 'text-[#1e3a8a]';
  }
}
