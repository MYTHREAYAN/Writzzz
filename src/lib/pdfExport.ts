import { Assignment, HandwritingStyle, PageContent } from '../types';
import {
  renderAllAssignmentPages,
  exportFinalRendersToPdf,
  ensureHandwritingFontsLoaded,
} from './assignmentRenderer';
import { getDefaultHeaderSettings } from './headerEngine';

export interface ExportProgress {
  currentPage: number;
  totalPages: number;
  status: 'preparing' | 'rendering' | 'adding-page' | 'saving' | 'complete';
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

/**
 * Exports the assignment pages to a true A4 PDF document.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * The PDF generator consumes the EXACT SAME final visual rendering
 * produced by the canonical assignment renderer (renderAllAssignmentPages).
 *
 * - ZERO PDF text re-rendering
 * - ZERO generic system font substitution (Times / Serif / Italic)
 * - Visual equation: Preview == PDF
 */
export async function exportAssignmentToPdf(
  assignment: Assignment,
  pages: PageContent[],
  onProgress?: ExportProgressCallback,
  cachedRenders?: string[]
): Promise<void> {
  if (!pages || pages.length === 0) {
    throw new Error('No pages available to export');
  }

  const totalPages = pages.length;

  onProgress?.({
    currentPage: 1,
    totalPages,
    status: 'preparing',
  });

  await ensureHandwritingFontsLoaded();

  // 1. If cached visual page renders are provided (from the frozen preview snapshot), use them directly!
  let pageRenders = cachedRenders;

  // 2. Otherwise render the authentic pages using the canonical visual renderer
  if (!pageRenders || pageRenders.length !== totalPages) {
    const style: HandwritingStyle = assignment.style || {
      profileName: 'Default',
      fontFamily: 'Caveat',
      slant: 0,
      fontSize: 18,
      lineSpacing: 32,
      letterSpacing: 0.5,
      wordSpacing: 4,
      jitter: 1,
      inkType: 'ballpoint-blue',
      paperType: 'ruled',
      sheetStyle: 'single-rule',
      blueInkNuance: 'natural-ballpoint',
      penPressure: 1,
      baselineWander: 1,
    };
    const headerSettings =
      assignment.headerSettings || getDefaultHeaderSettings(assignment);

    pageRenders = await renderAllAssignmentPages(
      pages,
      style,
      headerSettings,
      (renderProg) => {
        onProgress?.({
          currentPage: renderProg.currentPage,
          totalPages: renderProg.totalPages,
          status: 'rendering',
        });
      },
      Boolean(assignment.showMarks)
    );
  }

  // 3. Compile the exact visual renders into a true A4 PDF
  await exportFinalRendersToPdf(
    assignment.title || 'Writzz-Assignment',
    pageRenders,
    (current, total, status) => {
      onProgress?.({
        currentPage: current,
        totalPages: total,
        status: status.includes('Compiling')
          ? 'adding-page'
          : status.includes('Saving')
          ? 'saving'
          : 'rendering',
      });
    }
  );

  onProgress?.({
    currentPage: totalPages,
    totalPages,
    status: 'complete',
  });
}
