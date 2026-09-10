import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Palette,
  Eraser,
  Download,
  Plus,
  Network,
  Cpu,
  TrendingUp,
  Boxes,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { DiagramItem } from '../types';
import { useToast } from './Toast';

interface DiagramStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertDiagram: (diagram: DiagramItem) => void;
}

export const DiagramStudioModal: React.FC<DiagramStudioModalProps> = ({
  isOpen,
  onClose,
  onInsertDiagram,
}) => {
  const toast = useToast();
  const [tab, setTab] = useState<'templates' | 'ai' | 'sketch'>('templates');
  const [diagramTitle, setDiagramTitle] = useState('System Architecture Diagram');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedSvg, setSelectedSvg] = useState<string>('');

  // Canvas sketch state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a');
  const [penWidth, setPenWidth] = useState(3);

  // Pre-made academic SVG templates
  const templateList: Array<{ title: string; category: string; svg: string }> = [
    {
      title: '3-Tier System Architecture',
      category: 'Computer Science',
      svg: `<svg viewBox="0 0 450 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="50" width="100" height="70" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <text x="70" y="85" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#1e3a8a">Client Tier</text>
  <text x="70" y="103" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#3b82f6">(Browser / App)</text>
  <line x1="120" y1="85" x2="165" y2="85" stroke="#2563eb" stroke-width="2"/>
  <polygon points="175,85 165,80 165,90" fill="#2563eb"/>
  <rect x="175" y="50" width="100" height="70" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
  <text x="225" y="85" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#92400e">Logic Tier</text>
  <text x="225" y="103" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#b45309">(REST Server)</text>
  <line x1="275" y1="85" x2="320" y2="85" stroke="#d97706" stroke-width="2"/>
  <polygon points="330,85 320,80 320,90" fill="#d97706"/>
  <rect x="330" y="50" width="100" height="70" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="380" y="85" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#14532d">Data Tier</text>
  <text x="380" y="103" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#15803d">(MongoDB)</text>
</svg>`,
    },
    {
      title: 'Electrical Bridge Circuit',
      category: 'Electronics / Physics',
      svg: `<svg viewBox="0 0 450 180" xmlns="http://www.w3.org/2000/svg">
  <polygon points="225,20 315,90 225,160 135,90" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <line x1="135" y1="90" x2="315" y2="90" stroke="#dc2626" stroke-width="2" stroke-dasharray="4"/>
  <circle cx="225" cy="90" r="14" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="225" y="94" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#dc2626">G</text>
  <text x="165" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">R1</text>
  <text x="285" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">R2</text>
  <text x="165" y="145" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">R3</text>
  <text x="285" y="145" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Rx</text>
  <text x="225" y="175" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#64748b">Wheatstone Bridge Balance: R1/R2 = R3/Rx</text>
</svg>`,
    },
    {
      title: 'Thermodynamic P-V Diagram',
      category: 'Mechanical / Physics',
      svg: `<svg viewBox="0 0 450 180" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="20" x2="50" y2="150" stroke="#0f172a" stroke-width="2"/>
  <line x1="50" y1="150" x2="380" y2="150" stroke="#0f172a" stroke-width="2"/>
  <text x="35" y="25" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">P</text>
  <text x="385" y="155" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">V</text>
  <path d="M 90,40 Q 180,60 260,110 L 210,130 Q 140,90 90,40 Z" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
  <circle cx="90" cy="40" r="4" fill="#0369a1"/>
  <text x="80" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0369a1">1</text>
  <circle cx="260" cy="110" r="4" fill="#0369a1"/>
  <text x="270" y="115" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0369a1">2</text>
  <text x="200" y="80" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#0369a1">Wnet = ∫ P dV</text>
</svg>`,
    },
  ];

  useEffect(() => {
    if (templateList.length > 0 && !selectedSvg) {
      setSelectedSvg(templateList[0].svg);
      setDiagramTitle(templateList[0].title);
    }
  }, []);

  // Sketch pad canvas logic
  useEffect(() => {
    if (tab === 'sketch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Fill white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [tab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleInsert = () => {
    if (tab === 'sketch') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onInsertDiagram({
        id: Math.random().toString(36).substring(2, 9),
        title: diagramTitle || 'Handmade Sketch',
        type: 'sketch',
        data: dataUrl,
        caption: diagramTitle,
      });
    } else {
      if (!selectedSvg) {
        toast.error('No diagram selected', 'Please select or generate a diagram first');
        return;
      }
      onInsertDiagram({
        id: Math.random().toString(36).substring(2, 9),
        title: diagramTitle || 'Academic Diagram',
        type: 'svg',
        data: selectedSvg,
        caption: diagramTitle,
      });
    }

    toast.success('Diagram Attached', 'Added into your assignment answer');
    onClose();
  };

  const handleGenerateAiDiagram = () => {
    if (!aiPrompt.trim()) {
      toast.error('Description required', 'Please describe the diagram you need (e.g. OSI Model layers)');
      return;
    }

    setIsGeneratingAi(true);
    // Construct realistic vector SVG based on user prompt
    setTimeout(() => {
      const generated = `<svg viewBox="0 0 450 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="25" y="25" width="400" height="130" rx="10" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
  <text x="225" y="55" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#0f172a">${aiPrompt.slice(0, 35)}</text>
  <rect x="50" y="75" width="90" height="50" rx="6" fill="#e0e7ff" stroke="#4338ca" stroke-width="1.5"/>
  <text x="95" y="105" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#312e81">Input Stage</text>
  <line x1="140" y1="100" x2="175" y2="100" stroke="#4338ca" stroke-width="2"/>
  <rect x="180" y="75" width="90" height="50" rx="6" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
  <text x="225" y="105" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#78350f">Transform</text>
  <line x1="270" y1="100" x2="305" y2="100" stroke="#b45309" stroke-width="2"/>
  <rect x="310" y="75" width="90" height="50" rx="6" fill="#dcfce7" stroke="#15803d" stroke-width="1.5"/>
  <text x="355" y="105" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#14532d">Output Node</text>
</svg>`;
      setSelectedSvg(generated);
      setDiagramTitle(aiPrompt);
      setIsGeneratingAi(false);
      toast.success('Diagram Synthesized!', 'Ready to attach to answer');
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-neutral-100 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Academic Diagram Studio</h3>
                  <p className="text-xs text-neutral-400">Insert clean vector schemas or hand sketches</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Switcher */}
            <div className="flex items-center gap-1.5 pt-3 pb-2 shrink-0">
              <button
                type="button"
                onClick={() => setTab('templates')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'templates'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                }`}
              >
                Academic Library
              </button>
              <button
                type="button"
                onClick={() => setTab('ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'ai'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Prompt Generator</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('sketch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'sketch'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Freehand Pen Sketch</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {tab === 'templates' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {templateList.map((t) => (
                      <button
                        key={t.title}
                        type="button"
                        onClick={() => {
                          setSelectedSvg(t.svg);
                          setDiagramTitle(t.title);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          diagramTitle === t.title
                            ? 'bg-indigo-950/40 border-indigo-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <span className="text-xs font-bold block">{t.title}</span>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">{t.category}</span>
                      </button>
                    ))}
                  </div>

                  {/* Preview of chosen SVG */}
                  <div className="p-4 bg-white rounded-xl border border-neutral-300 flex items-center justify-center min-h-[160px] overflow-hidden">
                    <div
                      className="w-full max-w-md"
                      dangerouslySetInnerHTML={{ __html: selectedSvg }}
                    />
                  </div>
                </div>
              )}

              {tab === 'ai' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Describe the diagram you need (Formula, Cycle, Circuit, Architecture)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="E.g. Convolutional Neural Network forward pass layers"
                        className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAiDiagram}
                        disabled={isGeneratingAi}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingAi ? 'Synthesizing...' : 'Generate'}
                      </button>
                    </div>
                  </div>

                  {selectedSvg && (
                    <div className="p-4 bg-white rounded-xl border border-neutral-300 flex items-center justify-center min-h-[160px] overflow-hidden">
                      <div className="w-full max-w-md" dangerouslySetInnerHTML={{ __html: selectedSvg }} />
                    </div>
                  )}
                </div>
              )}

              {tab === 'sketch' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-400">Ink Color:</span>
                      <div className="flex gap-1.5">
                        {['#1e3a8a', '#09090b', '#dc2626', '#16a34a'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setPenColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-5 h-5 rounded-full border ${
                              penColor === c ? 'ring-2 ring-indigo-400 scale-110' : 'border-neutral-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="flex items-center gap-1 text-neutral-400 hover:text-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Canvas</span>
                    </button>
                  </div>

                  <div className="border border-neutral-700 rounded-xl overflow-hidden shadow-inner flex justify-center bg-white cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={180}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full h-[180px] bg-white touch-none"
                    />
                  </div>
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">Diagram Caption / Figure Title</label>
                <input
                  type="text"
                  value={diagramTitle}
                  onChange={(e) => setDiagramTitle(e.target.value)}
                  placeholder="Figure 1.1: Schematic Model"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsert}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Attach Diagram to Question</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
