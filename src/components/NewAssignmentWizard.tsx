import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Sparkles,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  BookOpen,
  Sliders,
  Check,
  Eye,
  PenTool,
  Save
} from 'lucide-react';
import { AnswerItem, Assignment, HandwritingStyle } from '../types';
import { api } from '../lib/api';
import { useToast } from './Toast';
import { SheetPaperSelector } from './SheetPaperSelector';
import { SheetPaperBackground } from './SheetPaperBackground';
import { RealisticHandwrittenText } from './RealisticHandwrittenText';

interface NewAssignmentWizardProps {
  onCancel: () => void;
  onAssignmentCreated: (newAssignment: Assignment) => void;
  defaultHandwriting?: HandwritingStyle;
}

export const NewAssignmentWizard: React.FC<NewAssignmentWizardProps> = ({
  onCancel,
  onAssignmentCreated,
  defaultHandwriting,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Form & Question upload
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [rawQuestionsText, setRawQuestionsText] = useState('');
  const [questionImageBase64, setQuestionImageBase64] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isProcessingQuestions, setIsProcessingQuestions] = useState(false);

  // Step 2: Extracted Questions Planner
  const [questions, setQuestions] = useState<Array<{ id: string; questionNumber: string | number; questionText: string; marks: number }>>([]);
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
  const [isSavingToMongo, setIsSavingToMongo] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setQuestionImageBase64(reader.result as string);
        toast.success('Question Document Loaded', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process questions with Gemini
  const handleProcessQuestions = async () => {
    if (!title.trim() && !rawQuestionsText.trim() && !questionImageBase64) {
      toast.error('Details required', 'Please provide an assignment title and enter questions or upload a question sheet');
      return;
    }

    setIsProcessingQuestions(true);
    try {
      const res = await api.processQuestions(rawQuestionsText, questionImageBase64);
      if (res.title && !title) setTitle(res.title);
      if (res.subject && !subject) setSubject(res.subject);

      if (res.questions && res.questions.length > 0) {
        setQuestions(
          res.questions.map((q, idx) => ({
            id: Math.random().toString(36).substring(2, 9),
            questionNumber: q.questionNumber || idx + 1,
            questionText: q.questionText,
            marks: q.marks || 10,
          }))
        );
      } else {
        // Fallback split
        setQuestions([
          {
            id: Math.random().toString(36).substring(2, 9),
            questionNumber: 1,
            questionText: rawQuestionsText || 'Assignment Question 1',
            marks: 10,
          },
        ]);
      }

      setStep(2);
      toast.success('Questions Analyzed', 'Review and fine-tune your assignment outline');
    } catch (err: any) {
      toast.error('Question Processing Failed', err.message);
      // Resilient fallback: allow continuing with user's raw text
      setQuestions([
        {
          id: Math.random().toString(36).substring(2, 9),
          questionNumber: 1,
          questionText: rawQuestionsText || 'Coursework Question 1',
          marks: 10,
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

    setIsGeneratingAnswers(true);
    try {
      const res = await api.generateAnswers(questions, subject, academicLevel);
      setGeneratedAnswers(res.answers || []);
      setStep(3);
      toast.success('Answers Generated!', 'Gemini drafted academic handwritten answers');
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
        marks: 5,
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, questionText: text } : q)));
  };

  // Save Assignment to MongoDB and Open
  const handleSaveAndOpen = async () => {
    if (!title.trim()) {
      toast.error('Title required', 'Please give this assignment a title');
      return;
    }

    setIsSavingToMongo(true);
    try {
      const newAssignmentPayload: Partial<Assignment> = {
        title: title.trim(),
        subject: subject.trim() || 'General Studies',
        studentName: studentName.trim() || undefined,
        rollNumber: rollNumber.trim() || undefined,
        submissionDate: submissionDate || undefined,
        answers: generatedAnswers,
        style: selectedStyle,
        totalPages: Math.max(1, Math.ceil(generatedAnswers.length * 0.8)),
        status: 'draft',
      };

      const res = await api.createAssignment(newAssignmentPayload);
      toast.success('Assignment Saved to MongoDB!', `Created with ID: ${res.assignment._id}`);
      onAssignmentCreated(res.assignment);
    } catch (err: any) {
      toast.error('Failed to save assignment', err.message);
    } finally {
      setIsSavingToMongo(false);
    }
  };

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
              <span className="text-[11px] font-semibold text-neutral-300 mt-1.5">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="w-full max-w-md mx-auto h-1 bg-neutral-800 rounded-full mt-3 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400"
          />
        </div>
      </div>

      {/* STEP 1: Questions Upload & Metadata */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Step 1: Assignment Details & Question Input</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your coursework metadata and paste or upload questions for Gemini AI extraction.
            </p>
          </div>

          {/* Academic Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Assignment Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Quantum Physics Assignment 2"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Subject / Course Name</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E.g., Applied Physics & Nanotechnology"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Student Name (On Page Header)</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="E.g., Nikil Karuppusamy"
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
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Enter Questions or Syllabus Prompts</span>
                <span className="text-[11px] text-neutral-500">Numbered lists or paragraphs</span>
              </label>
              <textarea
                value={rawQuestionsText}
                onChange={(e) => setRawQuestionsText(e.target.value)}
                rows={4}
                placeholder={`1. Explain the working principle of a Wheatstone Bridge with circuit diagram.\n2. State and prove Carnot's Theorem.\n3. Discuss the differences between TCP and UDP protocols.`}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-xs leading-relaxed"
              />
            </div>

            {/* Document / Photo Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Or Upload Question Paper (Photo / Image)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-neutral-700 hover:border-indigo-500/50 bg-neutral-950/60 p-4 rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-indigo-400" />
                <span className="text-xs text-neutral-300 font-medium">
                  {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Click to select question paper image'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white rounded-xl transition-colors"
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
                  <Loader2 className="w-4 h-4 animate-spin" />
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
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Step 2: Assignment Planner & Question Breakdown</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Verify each extracted question and select academic rigor level before Gemini writes the solutions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          {/* Academic level picker */}
          <div className="flex items-center gap-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs font-semibold text-neutral-300">Target Academic Rigor:</span>
            <div className="flex gap-2">
              {['High School', 'Undergraduate', 'Postgraduate'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setAcademicLevel(level)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    academicLevel === level
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-3 group"
              >
                <span className="w-8 h-8 rounded-lg bg-neutral-800 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  Q{q.questionNumber || idx + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => handleUpdateQuestion(q.id, e.target.value)}
                    placeholder="Enter question wording..."
                    className="w-full bg-transparent border-b border-transparent focus:border-neutral-700 text-sm text-neutral-100 focus:outline-none"
                  />
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                    <span>Marks: {q.marks || 10}</span>
                  </div>
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white rounded-xl transition-colors"
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
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Gemini drafting handwritten answers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Answers</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Preview Generated Answers & Save to MongoDB */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Step 3: Solution Preview & MongoDB Persistence</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Your assignment is generated! Review the answer summary and persist it with a real ID.
            </p>
          </div>

          {/* Generated Answers Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200">Generated Questions & Solutions ({generatedAnswers.length})</span>
              <span>Academic Level: {academicLevel}</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {generatedAnswers.map((ans, idx) => (
                <div key={ans.id || idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">
                      Q{ans.questionNumber || idx + 1}: {ans.questionText}
                    </span>
                    {ans.diagram && (
                      <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
                        Diagram Attached
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 line-clamp-3 font-mono leading-relaxed bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850">
                    {ans.answerText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sheet & Paper Style Selector */}
          <div className="pt-2 border-t border-neutral-800">
            <SheetPaperSelector
              style={selectedStyle}
              onChange={setSelectedStyle}
            />
          </div>

          {/* Live Paper & Handwriting Preview Card */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Sample Page Rendering ({selectedStyle.fontFamily} • {selectedStyle.sheetStyle || 'Single Rule'})</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Real-time baseline & glyph preview
              </span>
            </label>

            <div className="relative rounded-xl border border-neutral-700 h-36 overflow-hidden shadow-inner p-4">
              <SheetPaperBackground
                sheetStyle={selectedStyle.sheetStyle || 'single-rule'}
                lineSpacing={selectedStyle.lineSpacing || 32}
                width={800}
                height={200}
                marginTop={30}
                marginLeft={56}
              />
              <div className="relative z-10 pl-14 pt-1 space-y-1">
                <div className="font-bold">
                  <RealisticHandwrittenText
                    text={`Q1. ${generatedAnswers[0]?.questionText || 'Discuss fundamental principles.'}`}
                    style={selectedStyle}
                    lineIndex={0}
                    className="font-bold"
                  />
                </div>
                <div>
                  <RealisticHandwrittenText
                    text={`Ans: ${generatedAnswers[0]?.answerText?.slice(0, 140) || 'Comprehensive academic solution with natural penmanship.'}...`}
                    style={selectedStyle}
                    lineIndex={1}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Save to MongoDB & Open */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to MongoDB Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Assignment to MongoDB & Open</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
