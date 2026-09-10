import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Sparkles, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from './Toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const toast = useToast();

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating', 'Tap any star from 1 to 5 to rate your experience');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitFeedback(rating, comment);
      setIsSuccess(true);
      toast.success('Thank you!', 'Your feedback has been stored securely in MongoDB');
      setTimeout(() => {
        setIsSuccess(false);
        setRating(0);
        setComment('');
        onClose();
      }, 2000);
    } catch (err: any) {
      toast.error('Failed to submit feedback', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = [
    '',
    'Needs improvement',
    'Fair, but has gaps',
    'Good work',
    'Very impressive',
    'Masterpiece! College Expo Ready',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-100 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-neutral-100">Writzz Feedback</h3>
                  <p className="text-xs text-neutral-400">Help us refine handwritten authenticity</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-neutral-100">Feedback Recorded!</h4>
                <p className="text-sm text-neutral-400 max-w-xs">
                  Your rating and notes have been saved to your profile and database.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                {/* 1-5 Star Rating with Hover / Bounce Animation */}
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      const isSelected = rating === star;
                      return (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          whileHover={{ scale: 1.25, rotate: 5 }}
                          whileTap={{ scale: 0.85 }}
                          className="p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg cursor-pointer transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors duration-150 ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : 'text-neutral-600 hover:text-neutral-400'
                            }`}
                          />
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-medium text-amber-400/90 h-4 transition-all">
                    {ratingDescriptions[hoverRating || rating]}
                  </p>
                </div>

                {/* Optional Comment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Additional Comments or Feature Requests (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="E.g., The ballpoint blue ink looks very authentic, maybe add more ruled line styles..."
                    className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving to MongoDB...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
