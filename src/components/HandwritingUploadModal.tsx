import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  X,
  RefreshCw,
  Sliders,
  FileImage,
  Eye,
  Save,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { HandwritingFont, HandwritingStyle, InkType, PaperType, SheetStyle, BlueInkNuance } from '../types';
import { api } from '../lib/api';
import { useToast } from './Toast';
import { SheetPaperSelector } from './SheetPaperSelector';
import { SheetPaperBackground } from './SheetPaperBackground';
import { RealisticHandwrittenText } from './RealisticHandwrittenText';

interface HandwritingUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated?: (profile: HandwritingStyle) => void;
  existingStyle?: HandwritingStyle;
}

export const HandwritingUploadModal: React.FC<HandwritingUploadModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
  existingStyle,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'customize'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<string>('');
  const [characteristics, setCharacteristics] = useState<string[]>([]);

  // Style state
  const [profileName, setProfileName] = useState(existingStyle?.profileName || 'My Cloned Handwriting');
  const [fontFamily, setFontFamily] = useState<HandwritingFont>(existingStyle?.fontFamily || 'Caveat');
  const [slant, setSlant] = useState<number>(existingStyle?.slant ?? 0);
  const [fontSize, setFontSize] = useState<number>(existingStyle?.fontSize ?? 19);
  const [lineSpacing, setLineSpacing] = useState<number>(existingStyle?.lineSpacing ?? 32);
  const [letterSpacing, setLetterSpacing] = useState<number>(existingStyle?.letterSpacing ?? 0.5);
  const [wordSpacing, setWordSpacing] = useState<number>(existingStyle?.wordSpacing ?? 4);
  const [jitter, setJitter] = useState<number>(existingStyle?.jitter ?? 1);
  const [inkType, setInkType] = useState<InkType>(existingStyle?.inkType || 'ballpoint-blue');
  const [paperType, setPaperType] = useState<PaperType>(existingStyle?.paperType || 'ruled');
  const [sheetStyle, setSheetStyle] = useState<SheetStyle>(existingStyle?.sheetStyle || 'single-rule');
  const [blueInkNuance, setBlueInkNuance] = useState<BlueInkNuance>(existingStyle?.blueInkNuance || 'natural-ballpoint');
  const [penPressure, setPenPressure] = useState<number>(existingStyle?.penPressure ?? 1);
  const [baselineWander, setBaselineWander] = useState<number>(existingStyle?.baselineWander ?? 1);
  const [isSaving, setIsSaving] = useState(false);

  // Preset styles
  const presets: Array<{ name: string; font: HandwritingFont; slant: number; ink: InkType; pressure: number }> = [
    { name: 'Neat Exam Cursive', font: 'Caveat', slant: 2, ink: 'ballpoint-blue', pressure: 1.0 },
    { name: 'Indian Student Script', font: 'Kalam', slant: 0, ink: 'ballpoint-black', pressure: 1.1 },
    { name: 'Quick Note-Taking', font: 'Homemade Apple', slant: -2, ink: 'gel-blue', pressure: 0.95 },
    { name: 'Elegant Connected', font: 'Cedarville Cursive', slant: 4, ink: 'ballpoint-blue', pressure: 1.05 },
  ];

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', 'Please upload a PNG, JPG, or JPEG image of handwriting');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const runGeminiAnalysis = async () => {
    if (!previewUrl) {
      toast.error('Sample required', 'Please upload a photo of your handwriting sample first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await api.analyzeHandwriting(previewUrl, selectedFile?.type || 'image/jpeg');
      if (res.success && res.analysis) {
        const { analysis } = res;
        setFontFamily(analysis.fontFamily);
        setSlant(analysis.slant);
        setPenPressure(analysis.penPressure);
        setLetterSpacing(analysis.letterSpacing);
        setLineSpacing(analysis.lineSpacing);
        setInkType(analysis.inkType);
        if (analysis.sheetStyle) setSheetStyle(analysis.sheetStyle);
        if (analysis.blueInkNuance) setBlueInkNuance(analysis.blueInkNuance);
        if (analysis.baselineWander) setBaselineWander(analysis.baselineWander);
        if (analysis.wordSpacing) setWordSpacing(analysis.wordSpacing);
        setCharacteristics(analysis.characteristics || []);
        setAnalysisSummary(analysis.summary || 'Handwriting cloned accurately');
        setAnalysisDone(true);
        setActiveTab('customize');
        toast.success('Analysis Complete!', 'Gemini successfully analyzed your handwriting traits');
      }
    } catch (err: any) {
      toast.error('Analysis Failed', err.message || 'Could not analyze sample');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const profileData: Partial<HandwritingStyle> = {
        profileName: profileName.trim() || 'My Handwriting',
        fontFamily,
        slant,
        fontSize,
        lineSpacing,
        letterSpacing,
        wordSpacing,
        jitter,
        inkType,
        paperType,
        sheetStyle,
        blueInkNuance,
        penPressure,
        baselineWander,
        sampleImageUrl: previewUrl || undefined,
      };

      const res = await api.saveHandwritingProfile(profileData);
      toast.success('Handwriting Saved!', 'Profile persisted to your account in MongoDB');
      if (onProfileCreated) {
        onProfileCreated(res.profile);
      }
      onClose();
    } catch (err: any) {
      toast.error('Failed to save profile', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getFontFamilyClass = (f: HandwritingFont) => {
    switch (f) {
      case 'Caveat':
        return 'font-caveat';
      case 'Kalam':
        return 'font-kalam';
      case 'Homemade Apple':
        return 'font-homemade';
      case 'Cedarville Cursive':
        return 'font-cursive';
      default:
        return 'font-caveat';
    }
  };

  const getInkClass = (ink: InkType) => {
    switch (ink) {
      case 'ballpoint-blue':
        return 'ink-blue';
      case 'ballpoint-black':
        return 'ink-black';
      case 'gel-blue':
        return 'ink-gel-blue';
      case 'gel-black':
        return 'ink-gel-black';
      default:
        return 'ink-blue';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-5 sm:p-7 text-neutral-100 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    Handwriting Synthesis Studio
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Clone your authentic penmanship or customize an academic font profile
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 pt-4 pb-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>1. Upload Sample & AI Analyze</span>
                {analysisDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('customize')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'customize'
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>2. Fine-Tune Slant, Ink & Spacing</span>
              </button>
            </div>

            {/* Modal Body with scrollable content */}
            <div className="flex-1 overflow-y-auto py-3 space-y-6 pr-1">
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  {/* Drag-and-drop box with animation */}
                  <motion.div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    animate={{
                      borderColor: dragOver ? 'rgba(168, 85, 247, 0.8)' : 'rgba(64, 64, 64, 0.6)',
                      scale: dragOver ? 1.01 : 1,
                      backgroundColor: dragOver ? 'rgba(168, 85, 247, 0.05)' : 'rgba(10, 10, 10, 0.4)',
                    }}
                    transition={{ duration: 0.2 }}
                    className="border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center space-y-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />

                    {previewUrl ? (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative group rounded-xl overflow-hidden border border-neutral-700 max-h-48 max-w-xs shadow-lg">
                          <img src={previewUrl} alt="Sample Preview" className="object-cover w-full h-full" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
                            Click to change image
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sample loaded: {selectedFile?.name || 'Photo'}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-purple-400 shadow-inner">
                          <FileImage className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-200">
                            Drop a photo of your handwritten notes or exam paper
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Supports PNG, JPG, JPEG up to 20MB. Clear natural lighting works best.
                          </p>
                        </div>
                        <span className="px-3.5 py-1.5 bg-neutral-800 text-xs font-medium text-neutral-300 rounded-lg border border-neutral-700">
                          Browse Files
                        </span>
                      </>
                    )}
                  </motion.div>

                  {/* Gemini Analyze Action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-purple-950/20 border border-purple-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-purple-200">
                          Forensic AI Handwriting Analyzer
                        </h4>
                        <p className="text-[11px] text-purple-300/70">
                          Extracts slant, pen pressure, curvature, and letter connections.
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={runGeminiAnalysis}
                      disabled={isAnalyzing || !previewUrl}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Analyzing with Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Analyze Handwriting</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Or Select a Ready-Made Authentic Preset
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {presets.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setFontFamily(p.font);
                            setSlant(p.slant);
                            setInkType(p.ink);
                            setPenPressure(p.pressure);
                            setProfileName(p.name);
                            setActiveTab('customize');
                            toast.info('Preset applied', `${p.name} loaded`);
                          }}
                          className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-indigo-500/40 rounded-xl text-left transition-all group"
                        >
                          <span className={`text-base block text-neutral-200 ${getFontFamilyClass(p.font)}`}>
                            Sample Write
                          </span>
                          <span className="text-xs font-semibold text-neutral-300 block mt-1">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-neutral-500 block">
                            {p.font} • {p.ink}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'customize' && (
                <div className="space-y-5">
                  {/* Analysis Result Banner if available */}
                  {analysisSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs space-y-1 text-indigo-200"
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Graphology Diagnostic:</span>
                      </div>
                      <p className="text-neutral-300">{analysisSummary}</p>
                      {characteristics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {characteristics.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-900/40 border border-indigo-700/40 text-[11px] text-indigo-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Profile Name & Font Select */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Profile Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="My Physics Assignment Handwriting"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Handwriting Script Base</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value as HandwritingFont)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Caveat">Caveat (Natural Student Cursive)</option>
                        <option value="Kalam">Kalam (Rounded Penmanship)</option>
                        <option value="Homemade Apple">Homemade Apple (Quick Ballpoint Notes)</option>
                        <option value="Cedarville Cursive">Cedarville Cursive (Flowing Script)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sliders: Slant, Pressure, Font Size, Line Spacing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                    {/* Slant Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400 font-medium">Slant Angle</span>
                        <span className="text-neutral-200 font-bold">{slant}°</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="1"
                        value={slant}
                        onChange={(e) => setSlant(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-600">
                        <span>Backward (-10°)</span>
                        <span>Upright (0°)</span>
                        <span>Forward (+10°)</span>
                      </div>
                    </div>

                    {/* Pen Pressure */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400 font-medium">Pen Pressure</span>
                        <span className="text-neutral-200 font-bold">{penPressure.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.3"
                        step="0.05"
                        value={penPressure}
                        onChange={(e) => setPenPressure(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-600">
                        <span>Delicate (0.8x)</span>
                        <span>Standard (1.0x)</span>
                        <span>Heavy Gel (1.3x)</span>
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400 font-medium">Font Size</span>
                        <span className="text-neutral-200 font-bold">{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="26"
                        step="1"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    {/* Line Spacing */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400 font-medium">Ruling Line Height</span>
                        <span className="text-neutral-200 font-bold">{lineSpacing}px</span>
                      </div>
                      <input
                        type="range"
                        min="28"
                        max="40"
                        step="1"
                        value={lineSpacing}
                        onChange={(e) => setLineSpacing(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Sheet / Paper Template & Ink Variation Selection */}
                  <div className="pt-2 border-t border-neutral-800">
                    <SheetPaperSelector
                      style={{
                        profileName,
                        fontFamily,
                        slant,
                        fontSize,
                        lineSpacing,
                        letterSpacing,
                        wordSpacing,
                        jitter,
                        inkType,
                        paperType,
                        sheetStyle,
                        blueInkNuance,
                        penPressure,
                        baselineWander,
                      }}
                      onChange={(updated) => {
                        if (updated.fontFamily) setFontFamily(updated.fontFamily);
                        if (updated.slant !== undefined) setSlant(updated.slant);
                        if (updated.fontSize) setFontSize(updated.fontSize);
                        if (updated.lineSpacing) setLineSpacing(updated.lineSpacing);
                        if (updated.letterSpacing !== undefined) setLetterSpacing(updated.letterSpacing);
                        if (updated.wordSpacing !== undefined) setWordSpacing(updated.wordSpacing);
                        if (updated.inkType) setInkType(updated.inkType);
                        if (updated.paperType) setPaperType(updated.paperType);
                        if (updated.sheetStyle) setSheetStyle(updated.sheetStyle);
                        if (updated.blueInkNuance) setBlueInkNuance(updated.blueInkNuance);
                        if (updated.baselineWander !== undefined) setBaselineWander(updated.baselineWander);
                      }}
                    />
                  </div>

                  {/* Live Notebook Paper Preview */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Live Paper Synthesis Preview</span>
                      </label>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {sheetStyle} • {blueInkNuance}
                      </span>
                    </div>

                    <div className="relative w-full h-36 rounded-xl border border-neutral-700/80 p-4 overflow-hidden shadow-inner">
                      <SheetPaperBackground
                        sheetStyle={sheetStyle}
                        lineSpacing={lineSpacing}
                        width={700}
                        height={200}
                        marginTop={25}
                        marginLeft={50}
                      />
                      <div className="relative z-10 pl-14 pt-1 space-y-1">
                        <div className="font-bold">
                          <RealisticHandwrittenText
                            text="Q1. Explain the fundamental principles of thermodynamics."
                            style={{
                              fontFamily,
                              slant,
                              fontSize: fontSize + 1,
                              lineSpacing,
                              letterSpacing,
                              wordSpacing,
                              jitter,
                              inkType,
                              paperType,
                              sheetStyle,
                              blueInkNuance,
                              penPressure,
                              baselineWander,
                            }}
                            lineIndex={0}
                            className="font-bold"
                          />
                        </div>
                        <div>
                          <RealisticHandwrittenText
                            text="Ans: The first law establishes conservation of energy in isolated systems, while the second law governs the direction of spontaneous thermodynamic processes."
                            style={{
                              fontFamily,
                              slant,
                              fontSize,
                              lineSpacing,
                              letterSpacing,
                              wordSpacing,
                              jitter,
                              inkType,
                              paperType,
                              sheetStyle,
                              blueInkNuance,
                              penPressure,
                              baselineWander,
                            }}
                            lineIndex={1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white rounded-xl transition-colors"
              >
                Close
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving to MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Set as Default Profile</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
