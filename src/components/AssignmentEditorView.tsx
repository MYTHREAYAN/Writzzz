import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Save,
  Download,
  Eye,
  Edit3,
  Boxes,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Sliders,
  CheckCircle2,
  FileCheck,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { Assignment, AnswerItem, DiagramItem, HandwritingStyle } from '../types';
import { api } from '../lib/api';
import { TrueA4Preview } from './TrueA4Preview';
import { DiagramStudioModal } from './DiagramStudioModal';
import { HandwritingUploadModal } from './HandwritingUploadModal';
import { useToast } from './Toast';

interface AssignmentEditorViewProps {
  assignment: Assignment;
  onBack: () => void;
  onAssignmentUpdated: (updated: Assignment) => void;
}

export const AssignmentEditorView: React.FC<AssignmentEditorViewProps> = ({
  assignment: initialAssignment,
  onBack,
  onAssignmentUpdated,
}) => {
  const toast = useToast();
  const [assignment, setAssignment] = useState<Assignment>(initialAssignment);
  const [activeTab, setActiveTab] = useState<'preview' | 'editor' | 'diagrams'>('preview');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedQuestionForDiagram, setSelectedQuestionForDiagram] = useState<number | null>(null);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isHandwritingModalOpen, setIsHandwritingModalOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // Answer modification handlers
  const handleUpdateAnswerText = (index: number, text: string) => {
    const updatedAnswers = [...assignment.answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      answerText: text,
    };
    setAssignment((prev) => ({ ...prev, answers: updatedAnswers }));
  };

  const handleUpdateQuestionText = (index: number, text: string) => {
    const updatedAnswers = [...assignment.answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      questionText: text,
    };
    setAssignment((prev) => ({ ...prev, answers: updatedAnswers }));
  };

  const handleAddQuestion = () => {
    const newAnswer: AnswerItem = {
      id: Math.random().toString(36).substring(2, 9),
      questionNumber: assignment.answers.length + 1,
      questionText: 'New Question',
      marks: 5,
      answerText: 'Write or generate the answer to this question here...',
    };
    setAssignment((prev) => ({
      ...prev,
      answers: [...prev.answers, newAnswer],
    }));
    toast.info('Question Added', `Q${assignment.answers.length + 1} appended`);
  };

  const handleDeleteQuestion = (index: number) => {
    if (assignment.answers.length <= 1) {
      toast.error('Cannot remove', 'An assignment must have at least one question');
      return;
    }
    const updated = assignment.answers.filter((_, i) => i !== index);
    setAssignment((prev) => ({ ...prev, answers: updated }));
    toast.info('Question Removed', `Deleted question ${index + 1}`);
  };

  // Diagram insertion
  const handleAttachDiagram = (diagram: DiagramItem) => {
    if (selectedQuestionForDiagram === null) return;
    const updatedAnswers = [...assignment.answers];
    updatedAnswers[selectedQuestionForDiagram] = {
      ...updatedAnswers[selectedQuestionForDiagram],
      diagram,
    };
    setAssignment((prev) => ({ ...prev, answers: updatedAnswers }));
    setSelectedQuestionForDiagram(null);
  };

  const handleRemoveDiagram = (index: number) => {
    const updatedAnswers = [...assignment.answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      diagram: undefined,
    };
    setAssignment((prev) => ({ ...prev, answers: updatedAnswers }));
    toast.info('Diagram Removed', 'Diagram detached from question');
  };

  // Save changes to MongoDB
  const handleSaveToMongo = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateAssignment(assignment._id || assignment.id || '', assignment);
      setAssignment(res.assignment);
      onAssignmentUpdated(res.assignment);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast.success('Saved to MongoDB', 'All assignment changes persisted securely');
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(assignment._id || assignment.id || '');
    toast.info('Copied!', 'Assignment MongoDB ID copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">{assignment.title}</h1>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
                {assignment.subject}
              </span>
              <button
                onClick={copyIdToClipboard}
                className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded"
                title="Click to copy real MongoDB ID"
              >
                <Hash className="w-3 h-3" />
                <span>{(assignment._id || assignment.id || '').slice(0, 10)}...</span>
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Last saved: {lastSavedTime} • {assignment.answers?.length || 0} questions • Real MongoDB Document
            </p>
          </div>
        </div>

        {/* Action buttons & Tab switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>True A4 Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Question Editor</span>
            </button>
          </div>

          <button
            onClick={() => setIsHandwritingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Handwriting Style</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveToMongo}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* VIEW MODE: TRUE A4 PREVIEW */}
      {activeTab === 'preview' && (
        <div className="w-full">
          <TrueA4Preview
            assignment={assignment}
            onOpenSettings={() => setIsHandwritingModalOpen(true)}
            onUpdateStyle={async (updatedStyle) => {
              const updated = { ...assignment, style: updatedStyle };
              setAssignment(updated);
              try {
                const res = await api.updateAssignment(assignment._id || assignment.id || '', updated);
                onAssignmentUpdated(res.assignment);
                setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              } catch (e) {
                console.warn('Style auto-persist note:', e);
              }
            }}
            onUpdateHeaderSettings={async (updatedHeader) => {
              const updated = { ...assignment, headerSettings: updatedHeader };
              setAssignment(updated);
              try {
                const res = await api.updateAssignment(assignment._id || assignment.id || '', updated);
                onAssignmentUpdated(res.assignment);
                setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              } catch (e) {
                console.warn('Header auto-persist note:', e);
              }
            }}
          />
        </div>
      )}

      {/* VIEW MODE: QUESTION & ANSWER EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">
              Edit Solutions, Wording, & Insert Diagrams ({assignment.answers.length} Questions)
            </h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-4">
            {assignment.answers.map((ans, idx) => (
              <div
                key={ans.id || idx}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      Q{ans.questionNumber || idx + 1}
                    </span>
                    <input
                      type="text"
                      value={ans.questionText}
                      onChange={(e) => handleUpdateQuestionText(idx, e.target.value)}
                      placeholder="Enter question text..."
                      className="w-full bg-transparent border-b border-neutral-800 focus:border-indigo-500 text-sm font-semibold text-white focus:outline-none pb-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedQuestionForDiagram(idx);
                        setIsDiagramModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Boxes className="w-3.5 h-3.5 text-purple-400" />
                      <span>{ans.diagram ? 'Edit Diagram' : 'Attach Diagram'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Answer Text Area */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-400">
                    Handwritten Answer Body (Natural paragraphs & numbered bullet points)
                  </label>
                  <textarea
                    value={ans.answerText}
                    onChange={(e) => handleUpdateAnswerText(idx, e.target.value)}
                    rows={6}
                    placeholder="Enter thorough answer text..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl p-3.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed font-mono"
                  />
                </div>

                {/* Attached Diagram Box if present */}
                {ans.diagram && (
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-white rounded border border-neutral-300 p-1 flex items-center justify-center overflow-hidden">
                        <div
                          className="scale-50 origin-center pointer-events-none"
                          dangerouslySetInnerHTML={{ __html: ans.diagram.data }}
                        />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {ans.diagram.caption || ans.diagram.title || 'Academic Diagram'}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">
                          Rendered in A4 handwritten preview
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDiagram(idx)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                    >
                      Detach
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagram Studio Modal */}
      <DiagramStudioModal
        isOpen={isDiagramModalOpen}
        onClose={() => setIsDiagramModalOpen(false)}
        onInsertDiagram={handleAttachDiagram}
      />

      {/* Handwriting Upload & Configuration Modal */}
      <HandwritingUploadModal
        isOpen={isHandwritingModalOpen}
        onClose={() => setIsHandwritingModalOpen(false)}
        existingStyle={assignment.style}
        onProfileCreated={(profile) => {
          setAssignment((prev) => ({ ...prev, style: profile }));
        }}
      />
    </div>
  );
};
