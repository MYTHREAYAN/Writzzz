import { jsPDF } from 'jspdf';
import {
  Assignment,
  HandwritingStyle,
  HeaderFieldsConfig,
  HeaderSettings,
  PageContent,
  PageItem,
} from '../types';
import {
  computeGlyphTransform,
  getEffectiveSheetConfig,
  getFontFamilyCss,
  BLUE_INK_PALETTES,
} from './handwritingEngine';
import { calculateHeaderDimensions, formatDate, formatPageNumber } from './headerEngine';

export interface RenderProgress {
  currentPage: number;
  totalPages: number;
  status: 'preparing' | 'rendering' | 'complete';
}

export type RenderProgressCallback = (progress: RenderProgress) => void;

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const DEFAULT_SCALE = 2; // 2x gives 1588 x 2246 px (sharp print quality)

/**
 * Pre-loads Google Handwriting and body fonts into the browser's active font cache.
 */
export async function ensureHandwritingFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) {
    return;
  }
  try {
    const fontsToLoad = [
      '18px Caveat',
      'bold 18px Caveat',
      '600 18px Caveat',
      '500 18px Caveat',
      '18px Kalam',
      'bold 18px Kalam',
      '18px "Homemade Apple"',
      '18px "Cedarville Cursive"',
      '18px "Indie Flower"',
      '18px "Architects Daughter"',
      '18px "Shadows Into Light"',
      '18px "Plus Jakarta Sans"',
      'bold 18px "Plus Jakarta Sans"',
      '18px Outfit',
      'bold 18px Outfit',
    ];
    await Promise.allSettled(fontsToLoad.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  } catch (err) {
    console.warn('[Fonts] Preload notice:', err);
  }
}

/**
 * Draws the paper background, margins, ruled lines, double rules, grid, or dots.
 */
function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  style: HandwritingStyle
): void {
  const sheetConfig = getEffectiveSheetConfig(style);

  // 1. Base paper fill
  ctx.fillStyle = sheetConfig.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

  // 2. Horizontal ruled lines
  if (sheetConfig.hasHorizontalRules) {
    const lineSpacing = sheetConfig.ruleSpacing || style.lineSpacing || 32;
    const ruleColor = sheetConfig.ruleColor || '#cbd5e1';

    ctx.save();
    ctx.strokeStyle = ruleColor;
    ctx.lineWidth = 1;

    for (let y = 80; y <= A4_HEIGHT - 30; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(A4_WIDTH, y);
      ctx.stroke();

      // Double-rule guide line
      if (sheetConfig.isDoubleRule) {
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.globalAlpha = 0.4;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y + (sheetConfig.doubleRuleGap || 8));
        ctx.lineTo(A4_WIDTH, y + (sheetConfig.doubleRuleGap || 8));
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // 3. Grid / Graph pattern
  if (sheetConfig.isGrid) {
    const size = sheetConfig.gridSize || 24;
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.75;

    for (let x = size; x < A4_WIDTH; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, A4_HEIGHT);
      ctx.stroke();
    }
    for (let y = size; y < A4_HEIGHT; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(A4_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. Dot matrix pattern
  if (sheetConfig.isDotted) {
    const spacing = sheetConfig.dotSpacing || 24;
    const dotSize = sheetConfig.dotSize || 1;
    ctx.save();
    ctx.fillStyle = '#94a3b8';

    for (let x = spacing; x < A4_WIDTH; x += spacing) {
      for (let y = spacing; y < A4_HEIGHT; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 5. Left margin line
  if (sheetConfig.hasMarginLine) {
    const marginX = sheetConfig.marginLineX || 64;
    ctx.save();
    ctx.strokeStyle = sheetConfig.marginLineColor || '#f87171';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginX, 0);
    ctx.lineTo(marginX, A4_HEIGHT);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Draws the assignment header onto the canvas if enabled.
 */
function drawHeader(
  ctx: CanvasRenderingContext2D,
  headerSettings: HeaderSettings,
  style: HandwritingStyle,
  currentPage: number,
  totalPages: number,
  isFirstPage: boolean
): number {
  if (!headerSettings || !headerSettings.enabled || headerSettings.style === 'none') {
    return 45; // Default top offset when no header
  }

  if (headerSettings.firstPageOnly && !isFirstPage) {
    return 45;
  }

  const dims = calculateHeaderDimensions(headerSettings);
  const headerHeight = Math.max(dims.headerHeightPx, 50);
  const topY = 16;
  const bottomY = topY + headerHeight;
  const fields = (headerSettings.fields || {}) as Partial<HeaderFieldsConfig>;
  const handwritten = !!headerSettings.handwrittenFields;

  const hwFont = style.fontFamily || 'Caveat';
  const blueNuance = style.blueInkNuance || 'natural-ballpoint';
  const isBlackInk = style.inkType ? style.inkType.includes('black') : false;
  const inkColor = isBlackInk
    ? '#171717'
    : BLUE_INK_PALETTES[blueNuance]?.base || '#1d4ed8';

  ctx.save();

  // Draw header enclosure / borders according to style
  if (headerSettings.style === 'academic') {
    ctx.fillStyle = 'rgba(248, 250, 252, 0.7)';
    ctx.fillRect(16, topY, A4_WIDTH - 32, headerHeight);
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, topY, A4_WIDTH - 32, headerHeight);
  } else if (headerSettings.style === 'classic') {
    ctx.strokeStyle = '#525252';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, bottomY);
    ctx.lineTo(A4_WIDTH - 20, bottomY);
    ctx.stroke();
    // Double line accent
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(20, bottomY + 3);
    ctx.lineTo(A4_WIDTH - 20, bottomY + 3);
    ctx.stroke();
  } else if (headerSettings.style === 'notebook') {
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, bottomY);
    ctx.lineTo(A4_WIDTH - 16, bottomY);
    ctx.stroke();
  } else if (headerSettings.style === 'minimal') {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, bottomY);
    ctx.lineTo(A4_WIDTH - 20, bottomY);
    ctx.stroke();
  }

  // Collect left items and right items
  const leftItems: Array<{ label: string; value: string; isTitle?: boolean }> = [];
  const rightItems: Array<{ label: string; value: string }> = [];

  if (fields.subject?.enabled && fields.subject.value) {
    leftItems.push({ label: 'Subject', value: fields.subject.value });
  }
  if (fields.assignmentTitle?.enabled && fields.assignmentTitle.value) {
    leftItems.push({
      label: 'Title',
      value: fields.assignmentTitle.value,
      isTitle: true,
    });
  }
  if (fields.collegeName?.enabled && fields.collegeName.value) {
    leftItems.push({ label: 'Institution', value: fields.collegeName.value });
  }
  if (fields.department?.enabled && fields.department.value) {
    leftItems.push({ label: 'Dept', value: fields.department.value });
  }

  if (fields.studentName?.enabled && fields.studentName.value) {
    rightItems.push({ label: 'Name', value: fields.studentName.value });
  }
  if (fields.rollNumber?.enabled && fields.rollNumber.value) {
    rightItems.push({ label: 'Roll No', value: fields.rollNumber.value });
  }
  if (fields.registerNumber?.enabled && fields.registerNumber.value) {
    rightItems.push({ label: 'Reg No', value: fields.registerNumber.value });
  }
  if (fields.date?.enabled && fields.date.value) {
    rightItems.push({
      label: 'Date',
      value: formatDate(fields.date.value, fields.date.format),
    });
  }

  // Draw Left Column items
  let leftY = topY + 18;
  for (const item of leftItems) {
    if (leftY > bottomY - 6) break;

    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${item.label.toUpperCase()}:`, 28, leftY);

    const labelWidth = ctx.measureText(`${item.label.toUpperCase()}:`).width;

    if (handwritten) {
      ctx.font = `600 15px "${hwFont}", cursive, sans-serif`;
      ctx.fillStyle = inkColor;
      ctx.fillText(item.value, 28 + labelWidth + 6, leftY);
    } else {
      ctx.font = item.isTitle
        ? 'bold 12px "Plus Jakarta Sans", sans-serif'
        : '500 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(item.value, 28 + labelWidth + 6, leftY);
    }

    leftY += 16;
  }

  // Draw Right Column items
  let rightY = topY + 18;
  for (const item of rightItems) {
    if (rightY > bottomY - 6) break;

    const fullValText = item.value;
    const fullLabelText = `${item.label.toUpperCase()}: `;

    ctx.font = handwritten
      ? `600 15px "${hwFont}", cursive, sans-serif`
      : '600 11px "Plus Jakarta Sans", sans-serif';
    const valWidth = ctx.measureText(fullValText).width;

    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    const lblWidth = ctx.measureText(fullLabelText).width;

    const startX = A4_WIDTH - 28 - valWidth - lblWidth;

    ctx.fillStyle = '#64748b';
    ctx.fillText(fullLabelText, startX, rightY);

    if (handwritten) {
      ctx.font = `600 15px "${hwFont}", cursive, sans-serif`;
      ctx.fillStyle = inkColor;
      ctx.fillText(fullValText, startX + lblWidth, rightY);
    } else {
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(fullValText, startX + lblWidth, rightY);
    }

    rightY += 16;
  }

  // Draw top page number if configured
  if (
    fields.pageNumber?.enabled &&
    fields.pageNumber.position?.startsWith('top')
  ) {
    const pageText = formatPageNumber(
      currentPage,
      totalPages,
      fields.pageNumber.format
    );
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#475569';
    const tw = ctx.measureText(pageText).width;
    ctx.fillText(pageText, A4_WIDTH - 28 - tw, bottomY - 8);
  }

  ctx.restore();
  return bottomY + 24;
}

/**
 * Draws bottom page number if enabled and positioned at bottom.
 */
function drawBottomPageNumber(
  ctx: CanvasRenderingContext2D,
  headerSettings: HeaderSettings,
  currentPage: number,
  totalPages: number
): void {
  const pField = headerSettings?.fields?.pageNumber;
  if (!pField || !pField.enabled) return;

  const pos = pField.position || 'bottom-right';
  if (!pos.startsWith('bottom')) return;

  const text = formatPageNumber(currentPage, totalPages, pField.format);

  ctx.save();
  ctx.font = '600 11px "Plus Jakarta Sans", monospace';
  ctx.fillStyle = '#64748b';

  const textWidth = ctx.measureText(text).width;
  const y = A4_HEIGHT - 22;

  let x = A4_WIDTH - 40 - textWidth; // bottom-right default
  if (pos === 'bottom-center') {
    x = (A4_WIDTH - textWidth) / 2;
  } else if (pos === 'bottom-left') {
    x = 84;
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Draws authentic handwritten text character by character on the canvas,
 * applying the exact slant, wrist rotation, micro-jitter, baseline wander,
 * and blue ink variations computed by the handwriting engine.
 */
function drawHandwrittenTextLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  startX: number,
  baselineY: number,
  style: HandwritingStyle,
  lineIndex: number,
  isBold: boolean = false,
  forceBlackInk: boolean = false
): void {
  const fontFamily = style.fontFamily || 'Caveat';
  const fontSize = (style.fontSize || 18) + (isBold ? 1 : 0);
  const slantDeg = style.slant || 0;
  const slantRad = (-slantDeg * Math.PI) / 180;
  const letterSpacing = style.letterSpacing || 0.5;
  const wordSpacing = style.wordSpacing || 4;

  let currentX = startX;
  const words = text.split(' ');
  let charGlobalIndex = 0;

  for (let w = 0; w < words.length; w++) {
    const word = words[w];

    for (let c = 0; c < word.length; c++) {
      const char = word[c];
      const transform = computeGlyphTransform(
        char,
        charGlobalIndex++,
        w,
        lineIndex,
        style,
        forceBlackInk
      );

      ctx.save();

      // Configure font with weight and size
      const weight = isBold ? 'bold' : transform.fontWeight || 'normal';
      ctx.font = `${weight} ${fontSize}px "${fontFamily}", cursive, sans-serif`;
      ctx.fillStyle = transform.color;
      ctx.globalAlpha = transform.opacity;

      // Positioning with baseline wander and horizontal jitter
      const charX = currentX + transform.translateX;
      const charY = baselineY + transform.translateY;

      ctx.translate(charX, charY);

      // Apply handwriting slant
      if (slantDeg !== 0) {
        ctx.transform(1, 0, Math.tan(slantRad), 1, 0, 0);
      }

      // Apply subtle character rotation
      if (transform.rotate !== 0) {
        ctx.rotate((transform.rotate * Math.PI) / 180);
      }

      // Apply pen pressure scale variation
      if (transform.scale !== 1) {
        ctx.scale(transform.scale, transform.scale);
      }

      // Draw glyph
      ctx.fillText(char, 0, 0);

      ctx.restore();

      // Measure standard character width in this font
      ctx.font = `${weight} ${fontSize}px "${fontFamily}", cursive, sans-serif`;
      const charWidth = ctx.measureText(char).width;

      currentX += charWidth + letterSpacing + transform.letterSpacingExtra;
    }

    // Space between words
    currentX += wordSpacing + 3;
  }
}

/**
 * Splits text into wrapped lines that fit within maxWidth when measured in the handwriting font.
 */
function wrapHandwrittenText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontFamily: string,
  fontSize: number,
  isBold: boolean = false
): string[] {
  ctx.save();
  ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSize}px "${fontFamily}", cursive, sans-serif`;

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  ctx.restore();
  return lines;
}

/**
 * Renders a single A4 assignment page into a crystal-clear high-resolution PNG dataURL.
 *
 * THIS IS THE SINGLE CANONICAL RENDERER FOR BOTH PREVIEW AND PDF EXPORT.
 */
export async function renderFinalAssignmentPage(
  page: PageContent,
  style: HandwritingStyle,
  headerSettings: HeaderSettings,
  totalPages: number,
  isFirstPage: boolean = true,
  scale: number = DEFAULT_SCALE,
  showMarks: boolean = false
): Promise<string> {
  await ensureHandwritingFontsLoaded();

  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH * scale;
  canvas.height = A4_HEIGHT * scale;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // Scale up for high-DPI retina sharpness
  ctx.scale(scale, scale);
  ctx.textBaseline = 'alphabetic';

  // 1. Draw sheet / paper background
  drawPaperBackground(ctx, style);

  // 2. Draw academic header
  const contentStartY = drawHeader(
    ctx,
    headerSettings,
    style,
    page.pageNumber,
    totalPages,
    isFirstPage
  );

  // 3. Draw bottom page number
  drawBottomPageNumber(ctx, headerSettings, page.pageNumber, totalPages);

  // 4. Content layout
  const sheetConfig = getEffectiveSheetConfig(style);
  const marginLineX = sheetConfig.hasMarginLine ? sheetConfig.marginLineX || 64 : 48;
  const contentX = marginLineX + 18;
  const maxWidth = A4_WIDTH - contentX - 36;
  const lineSpacing = style.lineSpacing || 32;
  const fontFamily = style.fontFamily || 'Caveat';
  const fontSize = style.fontSize || 18;

  let currentY = contentStartY + 14;
  let lineCounter = 0;

  for (const item of page.items || []) {
    if (currentY > A4_HEIGHT - 60) break;

    if (item.type === 'question') {
      const qNumText = item.qNum ? `Q${item.qNum}.` : 'Q.';

      // Draw question number in the margin gutter in Black Ink
      const marginLabelX = Math.max(12, marginLineX - 44);
      drawHandwrittenTextLine(
        ctx,
        qNumText,
        marginLabelX,
        currentY,
        style,
        lineCounter++,
        true,
        true // forceBlackInk
      );

      // Question statement: only append marks if explicitly enabled by user via showMarks
      let displayQuestionText = item.text || '';
      if (showMarks && item.marks !== undefined && item.marks !== null) {
        displayQuestionText += `  [${item.marks} Marks]`;
      }

      // Wrap and draw question text in Black Ink
      const qLines = wrapHandwrittenText(
        ctx,
        displayQuestionText,
        maxWidth,
        fontFamily,
        fontSize + 1,
        true
      );

      for (const qLine of qLines) {
        if (currentY > A4_HEIGHT - 60) break;
        drawHandwrittenTextLine(
          ctx,
          qLine,
          contentX,
          currentY,
          style,
          lineCounter++,
          true,
          true // forceBlackInk
        );
        currentY += lineSpacing;
      }

      currentY += 6; // Small gap after question
    } else if (item.type === 'heading') {
      // Side headings in authentic Black ink, bold, distinct
      const hLines = wrapHandwrittenText(
        ctx,
        item.text || '',
        maxWidth,
        fontFamily,
        fontSize + 1.5,
        true
      );

      currentY += 4; // Spacing before heading

      for (const hLine of hLines) {
        if (currentY > A4_HEIGHT - 60) break;
        drawHandwrittenTextLine(
          ctx,
          hLine,
          contentX,
          currentY,
          style,
          lineCounter++,
          true,
          true // forceBlackInk
        );

        // Draw natural subtle underline under side heading
        ctx.save();
        ctx.font = `bold ${fontSize + 1.5}px "${fontFamily}", cursive, sans-serif`;
        const textW = ctx.measureText(hLine).width;
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(contentX, currentY + 3);
        ctx.lineTo(contentX + Math.min(textW, maxWidth), currentY + 3);
        ctx.stroke();
        ctx.restore();

        currentY += lineSpacing;
      }

      currentY += 4; // Spacing after heading before paragraphs
    } else if (item.type === 'paragraph') {
      const pLines = wrapHandwrittenText(
        ctx,
        item.text || '',
        maxWidth,
        fontFamily,
        fontSize,
        false
      );

      for (const pLine of pLines) {
        if (currentY > A4_HEIGHT - 60) break;
        drawHandwrittenTextLine(
          ctx,
          pLine,
          contentX,
          currentY,
          style,
          lineCounter++,
          false,
          false // blue / regular ink
        );
        currentY += lineSpacing;
      }

      currentY += 8; // Small paragraph spacing
    } else if (item.type === 'diagram') {
      const diagramBoxWidth = Math.min(maxWidth, 500);
      const diagramBoxHeight = 160;
      const diagramX = contentX + (maxWidth - diagramBoxWidth) / 2;

      ctx.save();
      // Diagram box frame
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(diagramX, currentY, diagramBoxWidth, diagramBoxHeight);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(diagramX, currentY, diagramBoxWidth, diagramBoxHeight);

      // Diagram title banner
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(diagramX + 1, currentY + 1, diagramBoxWidth - 2, 26);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(diagramX + 1, currentY + 1, diagramBoxWidth - 2, 26);

      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(
        item.diagram?.title || 'Academic Diagram',
        diagramX + 12,
        currentY + 17
      );

      // Render diagram SVG or placeholder graphic
      if (item.diagram?.data && typeof item.diagram.data === 'string') {
        try {
          const img = new Image();
          const blob = new Blob([item.diagram.data], {
            type: 'image/svg+xml;charset=utf-8',
          });
          const blobUrl = URL.createObjectURL(blob);

          await new Promise((resolve) => {
            img.onload = () => {
              ctx.drawImage(
                img,
                diagramX + 10,
                currentY + 32,
                diagramBoxWidth - 20,
                diagramBoxHeight - 40
              );
              URL.revokeObjectURL(blobUrl);
              resolve(true);
            };
            img.onerror = () => {
              URL.revokeObjectURL(blobUrl);
              resolve(false);
            };
            img.src = blobUrl;
          });
        } catch {
          // Fallback diagram vector lines
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2;
          ctx.strokeRect(diagramX + 30, currentY + 45, 100, 60);
          ctx.strokeRect(diagramX + 180, currentY + 45, 100, 60);
          ctx.beginPath();
          ctx.moveTo(diagramX + 130, currentY + 75);
          ctx.lineTo(diagramX + 180, currentY + 75);
          ctx.stroke();
        }
      }

      ctx.restore();

      currentY += diagramBoxHeight + 12;

      // Diagram caption in handwriting font
      if (item.diagram?.caption) {
        drawHandwrittenTextLine(
          ctx,
          `Fig: ${item.diagram.caption}`,
          contentX + 20,
          currentY,
          style,
          lineCounter++,
          false
        );
        currentY += lineSpacing;
      }
    }
  }

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Renders all assignment pages into an array of high-resolution PNG dataURLs.
 *
 * This produces the immutable final visual snapshot:
 * FinalAssignmentDocument -> finalPageRenders[]
 */
export async function renderAllAssignmentPages(
  pages: PageContent[],
  style: HandwritingStyle,
  headerSettings: HeaderSettings,
  onProgress?: RenderProgressCallback,
  showMarks: boolean = false
): Promise<string[]> {
  await ensureHandwritingFontsLoaded();

  const totalPages = pages.length;
  const renders: string[] = [];

  for (let i = 0; i < totalPages; i++) {
    onProgress?.({
      currentPage: i + 1,
      totalPages,
      status: 'rendering',
    });

    const pageDataUrl = await renderFinalAssignmentPage(
      pages[i],
      style,
      headerSettings,
      totalPages,
      i === 0,
      DEFAULT_SCALE,
      showMarks
    );

    renders.push(pageDataUrl);
  }

  onProgress?.({
    currentPage: totalPages,
    totalPages,
    status: 'complete',
  });

  return renders;
}

/**
 * Exports pre-rendered immutable page snapshots directly to a standard A4 PDF document.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * The PDF generator consumes the EXACT SAME final page renders that were displayed
 * in the A4 preview. There is zero PDF text regeneration, zero generic font substitution,
 * and zero DOM-scraping.
 */
export async function exportFinalRendersToPdf(
  assignmentTitle: string,
  finalPageRenders: string[],
  onProgress?: (current: number, total: number, status: string) => void
): Promise<void> {
  if (!finalPageRenders || finalPageRenders.length === 0) {
    throw new Error('No rendered pages available to export');
  }

  const totalPages = finalPageRenders.length;
  onProgress?.(1, totalPages, 'Initializing PDF document...');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210mm x 297mm
    compress: true,
  });

  for (let i = 0; i < totalPages; i++) {
    onProgress?.(i + 1, totalPages, `Compiling Page ${i + 1} of ${totalPages}...`);

    if (i > 0) {
      doc.addPage('a4', 'portrait');
    }

    // Place the exact 2x rendered image spanning full A4 page: 210mm x 297mm
    doc.addImage(finalPageRenders[i], 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  }

  onProgress?.(totalPages, totalPages, 'Saving PDF...');

  const sanitizedTitle = (assignmentTitle || 'Writzz-Assignment')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');

  doc.save(`${sanitizedTitle}.pdf`);
}
