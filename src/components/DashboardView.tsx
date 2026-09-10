import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Calendar,
  Layers,
  ChevronRight,
  Trash2,
  Copy,
  Clock,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  PenTool,
  Hash
} from 'lucide-react';
import { Assignment, HandwritingStyle } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface DashboardViewProps {
  onNewAssignment: () => void;
  onOpenAssignment: (assignment: Assignment) => void;
  onOpenHandwritingStudio: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNewAssignment,
  onOpenAssignment,
  onOpenHandwritingStudio,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [profiles, setProfiles] = useState<HandwritingStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [assignmentsRes, profilesRes] = await Promise.all([
        api.getAssignments(),
        api.getHandwritingProfiles(),
      ]);

      setAssignments(assignmentsRes.assignments || []);
      setProfiles(profilesRes.profiles || []);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load assignments. Please check MongoDB connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this assignment from MongoDB?')) {
      return;
    }

    setIsDeletingId(id);
    try {
      await api.deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => (a._id || a.id) !== id));
      toast.success('Assignment Deleted', 'Removed from database');
    } catch (err: any) {
      toast.error('Deletion Failed', err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || a.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(assignments.map((a) => a.subject).filter(Boolean)));

  const totalPages = assignments.reduce((acc, a) => acc + (a.totalPages || 1), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Welcome back, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Generate coursework, clone your handwriting, and print authentic A4 ruled sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenHandwritingStudio}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-purple-400" />
            <span>Handwriting Studio</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewAssignment}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </motion.button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assignments</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{assignments.length}</p>
          <span className="text-[11px] text-neutral-500 mt-1 block">Persisted in MongoDB</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pages Synthesized</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{totalPages}</p>
          <span className="text-[11px] text-neutral-500 mt-1 block">A4 Ruled Sheets</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Handwriting Style</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white truncate">
            {profiles[0]?.profileName || 'Authentic Cursive'}
          </p>
          <span className="text-[11px] text-purple-400 mt-1 block">
            {profiles[0]?.fontFamily || 'Caveat'} Script
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Engine</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">Gemini 2.5 Flash</p>
          <span className="text-[11px] text-neutral-500 mt-1 block">Server-Side Verified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments or subjects..."
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubject === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
          <button
            onClick={fetchDashboardData}
            title="Reload assignments from MongoDB"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 h-44 animate-pulse space-y-4"
            >
              <div className="w-1/3 h-5 bg-neutral-800 rounded-md" />
              <div className="w-3/4 h-6 bg-neutral-800 rounded-md" />
              <div className="w-1/2 h-4 bg-neutral-800 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {error && !isLoading && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-rose-200">Unable to load assignments</h3>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAssignments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/40 border border-neutral-800 border-dashed rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Assignments Found</h3>
            <p className="text-xs text-neutral-400 mt-1">
              {searchQuery
                ? 'No assignments match your search filter.'
                : 'Create your first academic assignment or upload your handwriting profile to get started.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewAssignment}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Assignment</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Assignment Cards with Fade + Slide-up Animations */}
      {!isLoading && !error && filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((assignment, index) => {
            const mongoId = assignment._id || assignment.id || '';
            return (
              <motion.div
                key={mongoId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
                whileHover={{ y: -3 }}
                onClick={() => onOpenAssignment(assignment)}
                className="group relative bg-neutral-900/90 hover:bg-neutral-850/90 border border-neutral-800/80 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all cursor-pointer overflow-hidden"
              >
                {/* Top badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-[11px] font-semibold">
                      {assignment.subject || 'Academic'}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {mongoId ? mongoId.slice(-6) : 'local'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {assignment.answers?.[0]?.questionText || 'Custom assignment with handwritten pages'}
                    </p>
                  </div>
                </div>

                {/* Card footer details */}
                <div className="pt-4 mt-4 border-t border-neutral-800/70 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-neutral-500" />
                      {assignment.answers?.length || 1} Qs
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      {assignment.submissionDate || 'Today'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDelete(mongoId, e)}
                      disabled={isDeletingId === mongoId}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-indigo-400 font-semibold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
