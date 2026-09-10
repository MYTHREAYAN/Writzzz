import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { NewAssignmentWizard } from './components/NewAssignmentWizard';
import { AssignmentEditorView } from './components/AssignmentEditorView';
import { HandwritingUploadModal } from './components/HandwritingUploadModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Assignment, HandwritingStyle } from './types';

type ViewMode = 'dashboard' | 'new-assignment' | 'assignment-detail';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isHandwritingStudioOpen, setIsHandwritingStudioOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [activeHandwritingProfile, setActiveHandwritingProfile] = useState<HandwritingStyle | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-neutral-400">Loading Writzz Workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          setCurrentView('dashboard');
        }}
      />
    );
  }

  const handleOpenAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentView('assignment-detail');
  };

  const handleAssignmentCreated = (newAssignment: Assignment) => {
    setSelectedAssignment(newAssignment);
    setCurrentView('assignment-detail');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'handwriting-lab') {
            setIsHandwritingStudioOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenHandwritingUpload={() => setIsHandwritingStudioOpen(true)}
      />

      {/* Main View Transition Layer */}
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <DashboardView
                onNewAssignment={() => setCurrentView('new-assignment')}
                onOpenAssignment={handleOpenAssignment}
                onOpenHandwritingStudio={() => setIsHandwritingStudioOpen(true)}
              />
            </motion.div>
          )}

          {currentView === 'new-assignment' && (
            <motion.div
              key="new-assignment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <NewAssignmentWizard
                onCancel={() => setCurrentView('dashboard')}
                onAssignmentCreated={handleAssignmentCreated}
                defaultHandwriting={activeHandwritingProfile}
              />
            </motion.div>
          )}

          {currentView === 'assignment-detail' && selectedAssignment && (
            <motion.div
              key={`assignment-${selectedAssignment._id || selectedAssignment.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <AssignmentEditorView
                assignment={selectedAssignment}
                onBack={() => setCurrentView('dashboard')}
                onAssignmentUpdated={(updated) => setSelectedAssignment(updated)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Handwriting Upload & Cloning Studio Modal */}
      <HandwritingUploadModal
        isOpen={isHandwritingStudioOpen}
        onClose={() => setIsHandwritingStudioOpen(false)}
        existingStyle={activeHandwritingProfile}
        onProfileCreated={(profile) => {
          setActiveHandwritingProfile(profile);
        }}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
