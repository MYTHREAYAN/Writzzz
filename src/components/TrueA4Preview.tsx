import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  Settings2,
  Palette,
  Sliders,
  X,
  RotateCcw,
  Layout,
  Award,
} from 'lucide-react';
import { Assignment, HandwritingStyle, SheetStyle, BlueInkNuance, HeaderSettings, PageContent } from '../types';
import { exportAssignmentToPdf } from '../lib/pdfExport';
import { renderAllAssignmentPages } from '../lib/assignmentRenderer';
import { useToast } from './Toast';
import { HandwrittenA4Page } from './HandwrittenA4Page';
import { SheetPaperSelector } from './SheetPaperSelector';
import { PageHeaderSettingsPanel } from './PageHeaderSettingsPanel';
import { SHEET_TEMPLATES } from '../lib/handwritingEngine';
import { getDefaultHeaderSettings, calculateHeaderDimensions } from '../lib/headerEngine';
import { paginateAssignmentAnswers } from '../lib/pageCapacityEngine';

interface TrueA4PreviewProps {
  assignment: Assignment;
  activePage?: number;
  onPageChange?: (page: number) => void;
  onOpenSettings?: () => void;
  onUpdateStyle?: (updatedStyle: HandwritingStyle) => Promise<void> | void;
  onUpdateHeaderSettings?: (updatedHeader: HeaderSettings) => Promise<void> | void;
  onUpdateShowMarks?: (showMarks: boolean) => Promise<void> | void;
}

export const TrueA4Preview: React.FC<TrueA4PreviewProps> = ({
  assignment,
  activePage: externalPage,
  onPageChange,
  onOpenSettings,
  onUpdateStyle,
  onUpdateHeaderSettings,
  onUpdateShowMarks,
}) => {
  const toast = useToast();
  const [internalPage, setInternalPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showHeaderPanel, setShowHeaderPanel] = useState(false);
  const [showMarks, setShowMarks] = useState<boolean>(Boolean(assignment.showMarks));

  // Sync showMarks if assignment changes
  useEffect(() => {
    if (assignment.showMarks !== undefined) {
      setShowMarks(Boolean(assignment.showMarks));
    }
  }, [assignment.showMarks]);

  const handleToggleShowMarks = () => {
    const nextVal = !showMarks;
    setShowMarks(nextVal);
    if (onUpdateShowMarks) {
      onUpdateShowMarks(nextVal);
    }
    toast.info(nextVal ? 'Marks Display Enabled' : 'Marks Display Hidden', nextVal ? 'Question marks will be rendered on the assignment' : 'Marks are now completely hidden from the assignment output');
  };

  // Progressive rendering state simulation for preview flow
  const [renderState, setRenderState] = useState<'idle' | 'preparing' | 'rendering' | 'applying' | 'ready'>('idle');
  const [renderError, setRenderError] = useState<string | null>(null);

  const currentPage = externalPage ?? internalPage;

  // Local style state for instant interactive updates
  const [currentStyle, setCurrentStyle] = useState<HandwritingStyle>(() => {
    return (
      assignment.style || {
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
      }
    );
  });

  // Local header settings state for instant interactive updates
  const [currentHeaderSettings, setCurrentHeaderSettings] = useState<HeaderSettings>(() => {
    return assignment.headerSettings || getDefaultHeaderSettings(assignment);
  });

  // Sync if assignment.style changes externally
  useEffect(() => {
    if (assignment.style) {
      setCurrentStyle((prev) => ({
        ...prev,
        ...assignment.style,
        sheetStyle:
          assignment.style.sheetStyle ||
          (assignment.style.paperType === 'blank'
            ? 'plain-white'
            : assignment.style.paperType === 'graph'
            ? 'graph'
            : 'single-rule'),
      }));
    }
  }, [assignment.style]);

  // Sync if assignment.headerSettings changes externally
  useEffect(() => {
    if (assignment.headerSettings) {
      setCurrentHeaderSettings(assignment.headerSettings);
    }
  }, [assignment.headerSettings]);

  // Dynamic header dimensions calculation
  const headerDims = useMemo(() => {
    return calculateHeaderDimensions(currentHeaderSettings);
  }, [currentHeaderSettings]);

  // Trigger progressive rendering effect when style changes
  useEffect(() => {
    setRenderState('preparing');
    const t1 = setTimeout(() => setRenderState('rendering'), 80);
    const t2 = setTimeout(() => setRenderState('applying'), 160);
    const t3 = setTimeout(() => setRenderState('ready'), 240);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentStyle.sheetStyle, currentStyle.blueInkNuance, currentStyle.fontFamily, currentStyle.fontSize]);

  const handleStyleChange = (updated: HandwritingStyle) => {
    setCurrentStyle(updated);
    if (onUpdateStyle) {
      onUpdateStyle(updated);
    }
  };

  const handleHeaderChange = (updated: HeaderSettings) => {
    setCurrentHeaderSettings(updated);
    if (onUpdateHeaderSettings) {
      onUpdateHeaderSettings(updated);
    }
  };

  // -------------------------------------------------------------
  // True A4 Intelligent Pagination Engine
  // Powered by real handwriting capacity geometry & header metrics
  // -------------------------------------------------------------
  const pages: PageContent[] = useMemo(() => {
    return paginateAssignmentAnswers(
      assignment.answers || [],
      currentStyle,
      currentHeaderSettings
    );
  }, [assignment.answers, currentStyle, currentHeaderSettings]);

  const totalPages = pages.length;

  // Single Canonical Visual Pipeline: Rendered Page Snapshots
  const [renderedPages, setRenderedPages] = useState<string[]>([]);
  const [isRenderingSnapshot, setIsRenderingSnapshot] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function updateSnapshots() {
      setIsRenderingSnapshot(true);
      try {
        const renders = await renderAllAssignmentPages(
          pages,
          currentStyle,
          currentHeaderSettings
        );
        if (!isCancelled) {
          setRenderedPages(renders);
        }
      } catch (err) {
        console.warn('Canvas snapshot notice:', err);
      } finally {
        if (!isCancelled) {
          setIsRenderingSnapshot(false);
        }
      }
    }
    updateSnapshots();
    return () => {
      isCancelled = true;
    };
  }, [pages, currentStyle, currentHeaderSettings]);

  const goToPage = (p: number) => {
    const valid = Math.max(1, Math.min(totalPages, p));
    if (onPageChange) {
      onPageChange(valid);
    } else {
      setInternalPage(valid);
    }
  };

  const activePageContent = pages[currentPage - 1] || pages[0];

  // PDF Export
  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    setExportProgress({ current: 1, total: pages.length, stage: 'Preparing handwritten pages...' });
    try {
      // Merge latest currentStyle and currentHeaderSettings into assignment
      const assignmentWithStyle = {
        ...assignment,
        style: currentStyle,
        headerSettings: currentHeaderSettings,
      };

      // Pass the exact rendered page snapshots so PDF export uses the SAME visual renders
      await exportAssignmentToPdf(
        assignmentWithStyle,
        pages,
        (progress) => {
          setExportProgress({
            current: progress.currentPage,
            total: progress.totalPages,
            stage:
              progress.status === 'rendering'
                ? `Rendering authentic page ${progress.currentPage} of ${progress.totalPages}...`
                : progress.status === 'adding-page'
                ? `Compiling page ${progress.currentPage} into A4 document...`
                : progress.status === 'saving'
                ? 'Finalizing PDF download...'
                : 'Complete',
          });
        },
        renderedPages.length === pages.length ? renderedPages : undefined
      );
      setExportSuccess(true);
      toast.success('PDF Export Complete', `Generated ${totalPages} authentic handwritten A4 pages matching your preview`);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      toast.error('PDF Export Failed', err.message || 'Please try again');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const currentSheet =
    currentStyle.sheetStyle ||
    (currentStyle.paperType === 'blank'
      ? 'plain-white'
      : currentStyle.paperType === 'graph'
      ? 'graph'
      : 'single-rule');

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {/* Top Toolbar */}
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Pagination controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 py-1 bg-neutral-800 text-neutral-200 rounded-md select-none">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-xl border border-neutral-800 text-xs text-neutral-400 select-none">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center font-mono font-medium">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-1.5 py-0.5 rounded hover:bg-neutral-800 text-[10px] text-neutral-300 transition-colors"
          >
            Fit
          </button>
        </div>

        {/* Header & Sheet Tuning Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Header Settings Toggle */}
          <button
            onClick={() => {
              setShowHeaderPanel(!showHeaderPanel);
              if (showStylePanel) setShowStylePanel(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              showHeaderPanel
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200'
            }`}
            title="Configure Page Header, Metadata & Layout"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">Page Header</span>
            <Sliders className="w-3 h-3 text-neutral-400 ml-0.5" />
          </button>

          {/* Paper Style Quick Pill */}
          <button
            onClick={() => {
              setShowStylePanel(!showStylePanel);
              if (showHeaderPanel) setShowHeaderPanel(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              showStylePanel
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">{SHEET_TEMPLATES[currentSheet]?.label || 'Single Rule'}</span>
            <Sliders className="w-3 h-3 text-neutral-400 ml-0.5" />
          </button>

          {/* PDF Export Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPdf}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl shadow-lg transition-all cursor-pointer ${
              exportSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {exportProgress
                    ? `Rendering Page ${exportProgress.current}/${exportProgress.total}...`
                    : 'Generating PDF...'}
                </span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export True A4 PDF</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Expandable Page & Header Settings Drawer */}
      <AnimatePresence>
        {showHeaderPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-4xl flex justify-center overflow-hidden"
          >
            <PageHeaderSettingsPanel
              headerSettings={currentHeaderSettings}
              onChange={handleHeaderChange}
              assignment={assignment}
              onClose={() => setShowHeaderPanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Paper & Handwriting Quick Tuning Drawer */}
      <AnimatePresence>
        {showStylePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Live Sheet Style & Penmanship Settings</h3>
              </div>
              <button
                onClick={() => setShowStylePanel(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SheetPaperSelector
              style={currentStyle}
              onChange={handleStyleChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progressive Render Status Indicator */}
      {renderState !== 'ready' && renderState !== 'idle' && (
        <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-3 py-1 rounded-full animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>
            {renderState === 'preparing' && 'Preparing handwriting profile...'}
            {renderState === 'rendering' && 'Rendering page glyphs with natural human variation...'}
            {renderState === 'applying' && `Applying paper template (${SHEET_TEMPLATES[currentSheet]?.label})...`}
          </span>
        </div>
      )}

      {/* Render Error with Retry */}
      {renderError && (
        <div className="w-full max-w-xl p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
          <span>{renderError}</span>
          <button
            onClick={() => {
              setRenderError(null);
              setRenderState('preparing');
              setTimeout(() => setRenderState('ready'), 200);
            }}
            className="flex items-center gap-1 px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* A4 Sheet Viewport */}
      <div className="w-full flex justify-center overflow-x-auto py-2 px-1">
        <motion.div
          key={`${currentPage}-${currentSheet}-${currentStyle.blueInkNuance}`}
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: zoom, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ transformOrigin: 'top center' }}
          className="relative w-[794px] min-h-[1123px] rounded-sm shadow-2xl border border-neutral-300 text-neutral-900 overflow-hidden bg-white"
        >
          {renderedPages[currentPage - 1] ? (
            <div className="relative w-[794px] h-[1123px] bg-white overflow-hidden">
              <img
                src={renderedPages[currentPage - 1]}
                alt={`Writzz Handwritten Page ${currentPage}`}
                className="w-[794px] h-[1123px] object-contain block select-none pointer-events-none"
                draggable={false}
              />
            </div>
          ) : (
            <HandwrittenA4Page
              id={`writzz-preview-page-${currentPage}`}
              page={activePageContent}
              style={currentStyle}
              headerSettings={currentHeaderSettings}
              totalPages={pages.length}
              isFirstPage={currentPage === 1}
            />
          )}
        </motion.div>
      </div>

      {/* Dedicated PDF Export Stage containing all assignment pages identically rendered at (0,0) */}
      <div
        id="writzz-pdf-export-stage"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '794px',
          height: '1123px',
          pointerEvents: 'none',
          zIndex: -9999,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
        aria-hidden="true"
      >
        {pages.map((p) => (
          <div
            key={p.pageNumber}
            id={`writzz-pdf-page-container-${p.pageNumber}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '794px',
              height: '1123px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
            }}
          >
            <HandwrittenA4Page
              id={`writzz-pdf-page-${p.pageNumber}`}
              page={p}
              style={currentStyle}
              headerSettings={currentHeaderSettings}
              totalPages={pages.length}
              isFirstPage={p.pageNumber === 1}
              className="border-none shadow-none"
            />
          </div>
        ))}
      </div>

      {/* Bottom Thumbnail Strip for Multi-Page Jumping */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto max-w-xl">
          {pages.map((p) => (
            <button
              key={p.pageNumber}
              onClick={() => goToPage(p.pageNumber)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                currentPage === p.pageNumber
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              Page {p.pageNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
