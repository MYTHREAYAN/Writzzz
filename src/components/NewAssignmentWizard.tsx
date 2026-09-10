import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  FileText,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from './Toast';
import { Assignment, HandwritingStyle, AnswerItem } from '../types';
import { calculatePageCapacity, simulateQuestionPageLayout } from '../lib/pageCapacityEngine';

interface NewAssignmentWizardProps {
  onCancel: () => void;
  onAssignmentCreated: (assignment: Assignment) => void;
  defaultHandwriting?: HandwritingStyle;
}

interface QuestionRow {
  id: string;
  questionNumber: string | number;
  questionText: string;
  marks: number;
  requiredPages: number;
}

export const NewAssignmentWizard: React.FC<NewAssignmentWizardProps> = ({
  onCancel,
  onAssignmentCreated,
  defaultHandwriting,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Form & Question upload
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [studentName, setStudentName] = useState(user?.name || '');
  const [rollNumber, setRollNumber] = useState('');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [rawQuestionsText, setRawQuestionsText] = useState('');
  const [questionImageBase64, setQuestionImageBase64] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isProcessingQuestions, setIsProcessingQuestions] = useState(false);

  // Step 2: Extracted Questions Planner
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [defaultPagesPerQuestion, setDefaultPagesPerQuestion] = useState(1);
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [isGeneratingAnswers, setIsGeneratingAnswers] = useState(false);

  // Step 3: Generated Answers & Handwriting Style
  const [generatedAnswers, setGeneratedAnswers] = useState<AnswerItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<HandwritingStyle>(
    defaultHandwriting || {
      profileName: 'Authentic Student Cursive',
      fontFamily: 'Caveat',
      slant: 2,
      fontSize: 18,
      lineSpacing: 32,
      letterSpacing: 0.5,
      wordSpacing: 4,
      jitter: 1,
      inkType: 'ballpoint-blue',
      paperType: 'ruled',
      sheetStyle: 'single-rule',
      blueInkNuance: 'natural-ballpoint',
      penPressure: 1.05,
      baselineWander: 1,
    }
  );

  const pageMetrics = useMemo(() => {
    return calculatePageCapacity(selectedStyle, undefined, 5);
  }, [selectedStyle]);

  const [isSavingToMongo, setIsSavingToMongo] = useState(false);

  // Keep studentName updated if user loads late
  useEffect(() => {
    if (user?.name && !studentName) {
      setStudentName(user.name);
    }
  }, [user?.name]);

  // Handle Image Upload for Question Extraction
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', 'Please upload a clear JPG or PNG image of your question paper');
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setQuestionImageBase64(base64);
      toast.success('Question Paper Uploaded', file.name);
    };
    reader.readAsDataURL(file);
  };

  // Process Questions with AI (or fall back to raw text parsing)
  const handleProcessQuestions = async () => {
    if (!title.trim() && !rawQuestionsText.trim() && !questionImageBase64) {
      toast.error('Input Required', 'Please enter a title, paste questions, or upload a question sheet');
      return;
    }

    setIsProcessingQuestions(true);
    try {
      const mimeMatch = questionImageBase64 ? questionImageBase64.match(/^data:([^;]+);base64,/) : null;
      const detectedMime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const cleanImgBase64 = questionImageBase64 ? questionImageBase64.replace(/^data:[^;]+;base64,/, '') : undefined;

      const res = await api.processQuestions(
        rawQuestionsText,
        cleanImgBase64,
        detectedMime,
        subject
      );

      if (res.title && !title) setTitle(res.title);
      if (res.subject && !subject) setSubject(res.subject);

      if (res.questions && res.questions.length > 0) {
        setQuestions(
          res.questions.map((q, idx) => {
            const parsedMarks = q.marks ? parseInt(String(q.marks), 10) : 10;
            const parsedPages = q.requiredPages ? parseInt(String(q.requiredPages), 10) : defaultPagesPerQuestion;
            return {
              id: Math.random().toString(36).substring(2, 9),
              questionNumber: q.questionNumber || idx + 1,
              questionText: q.questionText,
              marks: isNaN(parsedMarks) || parsedMarks < 1 ? 10 : parsedMarks,
              requiredPages: isNaN(parsedPages) || parsedPages < 1 ? 1 : parsedPages,
            };
          })
        );
      } else {
        // Fallback split
        setQuestions([
          {
            id: Math.random().toString(36).substring(2, 9),
            questionNumber: 1,
            questionText: rawQuestionsText || 'Assignment Question 1',
            marks: 10,
            requiredPages: defaultPagesPerQuestion,
          },
        ]);
      }

      setStep(2);
      toast.success('Questions Analyzed', 'Review marks, target pages, and question wording');
    } catch (err: any) {
      toast.error('Question Processing Note', 'Using raw question text as primary input');
      setQuestions([
        {
          id: Math.random().toString(36).substring(2, 9),
          questionNumber: 1,
          questionText: rawQuestionsText || 'Coursework Question 1',
          marks: 10,
          requiredPages: defaultPagesPerQuestion,
        },
      ]);
      setStep(2);
    } finally {
      setIsProcessingQuestions(false);
    }
  };

  // Generate answers with Gemini AI
  const handleGenerateAnswers = async () => {
    if (questions.length === 0) {
      toast.error('No questions found', 'Add at least one question to generate answers');
      return;
    }

    // Validate that all questions have non-empty text and sensible marks
    const hasEmptyQuestion = questions.some((q) => !q.questionText.trim());
    if (hasEmptyQuestion) {
      toast.error('Incomplete Questions', 'Please provide wording for all questions before generating');
      return;
    }

    setIsGeneratingAnswers(true);
    try {
      const res = await api.generateAnswers(questions, subject, academicLevel, selectedStyle);
      setGeneratedAnswers(res.answers || []);
      setStep(3);
      toast.success('Answers Generated!', 'Academic handwritten solutions drafted to target pages');
    } catch (err: any) {
      toast.error('Answer Generation Failed', err.message);
    } finally {
      setIsGeneratingAnswers(false);
    }
  };

  // Add custom question manually in step 2
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        questionNumber: prev.length + 1,
        questionText: '',
        marks: 10,
        requiredPages: defaultPagesPerQuestion,
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, questionText: text } : q)));
  };

  const handleUpdateMarks = (id: string, marksVal: number) => {
    const validMarks = isNaN(marksVal) || marksVal < 1 ? 1 : Math.min(100, Math.floor(marksVal));
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, marks: validMarks } : q)));
  };

  const handleUpdatePages = (id: string, pagesVal: number) => {
    const validPages = isNaN(pagesVal) || pagesVal < 1 ? 1 : Math.min(10, Math.floor(pagesVal));
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, requiredPages: validPages } : q)));
  };

  const handleApplyDefaultPagesToAll = (pages: number) => {
    setDefaultPagesPerQuestion(pages);
    setQuestions((prev) => prev.map((q) => ({ ...q, requiredPages: pages })));
    toast.info('Pages Updated', `Applied target of ${pages} page${pages > 1 ? 's' : ''} to all questions`);
  };

  // Save Assignment to MongoDB and Open
  const handleSaveAndOpen = async () => {
    if (!title.trim()) {
      toast.error('Title required', 'Please give this assignment a title');
      return;
    }

    setIsSavingToMongo(true);
    try {
      const calculatedPages = Math.max(
        1,
        generatedAnswers.reduce((sum, a) => sum + (a.requiredPages || 1), 0)
      );

      const newAssignmentPayload: Partial<Assignment> = {
        title: title.trim(),
        subject: subject.trim() || 'General Studies',
        studentName: studentName.trim() || undefined,
        rollNumber: rollNumber.trim() || undefined,
        submissionDate: submissionDate || undefined,
        answers: generatedAnswers,
        style: selectedStyle,
        totalPages: calculatedPages,
        status: 'draft',
      };

      const res = await api.createAssignment(newAssignmentPayload);
      toast.success('Assignment Saved!', `Created successfully`);
      onAssignmentCreated(res.assignment);
    } catch (err: any) {
      toast.error('Failed to save assignment', err.message);
    } finally {
      setIsSavingToMongo(false);
    }
  };

  // Total summary calculations for step 2
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const totalTargetPages = questions.reduce((sum, q) => sum + (q.requiredPages || 1), 0);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {[
            { num: 1, label: 'Questions Upload' },
            { num: 2, label: 'Assignment Planner' },
            { num: 3, label: 'Handwriting & Save' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  step === s.num
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium ${
                  step === s.num ? 'text-indigo-400 font-semibold' : 'text-neutral-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Metadata & Input */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Step 1: Assignment Details & Question Input</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your assignment topic, subject, and paste questions or upload a photo of your question paper.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Assignment Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Operating Systems Assignment 2"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Subject / Course</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E.g., Computer Science & Engineering"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Student Name (On Page Header)</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="E.g., Your Full Name"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Roll / Reg Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="22BCS104"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Date</label>
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Question Input: Textarea & File Upload */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Questions (Type / Paste, or Upload Image)
              </label>
              <span className="text-[11px] text-neutral-500">Supports OCR from question sheet</span>
            </div>

            <textarea
              value={rawQuestionsText}
              onChange={(e) => setRawQuestionsText(e.target.value)}
              placeholder="Paste assignment questions here...&#10;E.g.:&#10;1. Explain Process Scheduling algorithms with Gantt chart examples.&#10;2. Differentiate between paging and segmentation with architectural diagrams."
              rows={5}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
            />

            {/* Image upload button */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-neutral-950 border border-dashed border-neutral-800 hover:border-indigo-500 rounded-xl cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-indigo-400" />
                <span className="text-xs text-neutral-300 font-medium">
                  {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Upload question sheet photo (JPG/PNG)'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProcessQuestions}
              disabled={isProcessingQuestions || (!title.trim() && !rawQuestionsText.trim() && !questionImageBase64)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isProcessingQuestions ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <span>Analyze Questions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Assignment Planner & Question Review */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Step 2: Assignment Planner & Question Breakdown</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Customize marks and target page counts per question. Gemini will adjust solution length and side headings to fill the requested pages.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          {/* Academic Level & Batch Page Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rigor Picker */}
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-300 block">Target Academic Rigor:</span>
              <div className="flex gap-1.5">
                {['High School', 'Undergraduate', 'Postgraduate'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setAcademicLevel(level)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      academicLevel === level
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Batch Default Pages */}
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Default Target Pages:</span>
                <span className="text-[11px] text-neutral-500">Apply to all questions</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleApplyDefaultPagesToAll(p)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      defaultPagesPerQuestion === p
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {p} Page{p > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 sm:p-5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3 group hover:border-neutral-700 transition-all"
              >
                {/* Question Header & Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                      Q{q.questionNumber || idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-neutral-300">
                      Question {q.questionNumber || idx + 1}
                    </span>
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-neutral-900"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Question Textarea */}
                <textarea
                  value={q.questionText}
                  onChange={(e) => handleUpdateQuestion(q.id, e.target.value)}
                  placeholder="Enter complete question statement..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-indigo-500 rounded-xl p-3 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                />

                {/* Controls Row: Manual Marks & Pages Per Question */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  {/* Marks Manual Input */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Marks:</span>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={q.marks}
                      onChange={(e) => handleUpdateMarks(q.id, parseInt(e.target.value, 10))}
                      className="w-20 bg-neutral-900 border border-neutral-700 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white font-semibold text-center focus:outline-none"
                    />
                    <span className="text-[11px] text-neutral-500">pts</span>
                  </div>

                  {/* Required Pages Per Question */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>Target Pages:</span>
                    </div>
                    <select
                      value={q.requiredPages}
                      onChange={(e) => handleUpdatePages(q.id, parseInt(e.target.value, 10))}
                      className="bg-neutral-900 border border-neutral-700 focus:border-indigo-500 rounded-lg px-3 py-1 text-xs text-white font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value={1}>1 Page (~{pageMetrics.pageCapacities[0]?.targetWords || 380} words)</option>
                      <option value={2}>2 Pages (~{(pageMetrics.pageCapacities[0]?.targetWords || 380) + (pageMetrics.pageCapacities[1]?.targetWords || 390)} words)</option>
                      <option value={3}>3 Pages (~{pageMetrics.pageCapacities.slice(0, 3).reduce((s, p) => s + p.targetWords, 0)} words)</option>
                      <option value={4}>4 Pages (~{pageMetrics.pageCapacities.slice(0, 4).reduce((s, p) => s + p.targetWords, 0)} words)</option>
                      <option value={5}>5 Pages (~{pageMetrics.pageCapacities.slice(0, 5).reduce((s, p) => s + p.targetWords, 0)} words)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Aggregate Summary Badge */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800/80 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
            <span className="font-semibold text-neutral-200">
              Assignment Summary:
            </span>
            <div className="flex items-center gap-4 text-neutral-300">
              <span>{questions.length} Question{questions.length > 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">{totalMarks} Total Marks</span>
              <span>•</span>
              <span className="text-purple-300 font-semibold">~{totalTargetPages} Target Pages</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateAnswers}
              disabled={isGeneratingAnswers}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isGeneratingAnswers ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gemini drafting solutions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Answers</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Preview Answers & Choose Handwriting */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Step 3: Review Solutions & Select Handwriting Profile</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Your assignment is ready. You can review the drafted solutions and choose your handwriting personality.
            </p>
          </div>

          {/* Quick Style Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Active Handwriting Profile:
              </label>
              <span className="text-xs text-indigo-400 font-medium">
                {selectedStyle.profileName} ({selectedStyle.fontFamily})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Casual Flow', font: 'Caveat', slant: 2, nuance: 'natural-ballpoint' },
                { name: 'Neat Academic Print', font: 'Indie Flower', slant: 0, nuance: 'vibrant-gel' },
                { name: 'Fast Cursive', font: 'Architects Daughter', slant: -2, nuance: 'dark-fountain' },
              ].map((preset) => (
                <div
                  key={preset.name}
                  onClick={() =>
                    setSelectedStyle((prev) => ({
                      ...prev,
                      profileName: preset.name,
                      fontFamily: preset.font,
                      slant: preset.slant,
                      blueInkNuance: preset.nuance as any,
                    }))
                  }
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedStyle.fontFamily === preset.font
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-md'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <p className="text-xs font-semibold text-white">{preset.name}</p>
                  <p
                    className="text-lg mt-1 text-indigo-300 truncate"
                    style={{ fontFamily: preset.font }}
                  >
                    The quick brown fox jumps over...
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Answers List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Drafted Assignment Solutions ({generatedAnswers.length})
            </h3>
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {generatedAnswers.map((ans, i) => {
                const sim = simulateQuestionPageLayout(
                  ans.questionText,
                  ans.answerText,
                  Boolean(ans.diagram),
                  ans.requiredPages || 1,
                  selectedStyle
                );
                return (
                  <div
                    key={ans.id || i}
                    className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="font-bold text-indigo-400">
                        Q{ans.questionNumber || i + 1}: {ans.questionText}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-300 text-[11px] font-semibold">
                          {ans.marks || 10} Marks
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/80 text-purple-300 text-[11px] font-semibold">
                          Target: {ans.requiredPages || 1}p • Rendered: {sim.actualPages}p ({sim.lastPageFillPercentage}% fill)
                        </span>
                      </div>
                    </div>
                    <p className="text-neutral-400 line-clamp-3 leading-relaxed font-mono whitespace-pre-line">
                      {ans.answerText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Adjust Planner</span>
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveAndOpen}
              disabled={isSavingToMongo}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              {isSavingToMongo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Assignment...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Open in True A4 Studio</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
