import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Quote
} from 'lucide-react';
import { TutorReview } from '../data/tutorsData';

interface TutorReviewsSliderProps {
  reviews: TutorReview[];
  tutorName: string;
  tutorRating: number;
}

export const TutorReviewsSlider: React.FC<TutorReviewsSliderProps> = ({
  reviews,
  tutorName,
  tutorRating
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
        No reviews recorded yet for {tutorName}.
      </div>
    );
  }

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleSelect = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const currentReview = reviews[currentIndex];

  // Slide animation variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.22 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Header with verified badge and navigation arrows */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
          <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide">
            Parent Reviews ({reviews.length})
          </h4>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            100% Verified Parents
          </span>
        </div>

        {/* Sliding Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1 tabular-nums">
            {currentIndex + 1} of {reviews.length}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous review"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-90 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next review"
            className="w-8 h-8 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white active:scale-90 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Swipeable / Animated Horizontal Sliding Viewport */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 p-4 sm:p-5 shadow-2xs min-h-[175px] sm:min-h-[160px] flex flex-col justify-between">
        <Quote className="w-10 h-10 text-blue-200/50 absolute top-3 right-4 pointer-events-none" />

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentReview.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              const swipeThreshold = 50;
              if (info.offset.x < -swipeThreshold) {
                handleNext();
              } else if (info.offset.x > swipeThreshold) {
                handlePrev();
              }
            }}
            className="w-full flex-1 flex flex-col justify-between cursor-grab active:cursor-grabbing touch-pan-y"
          >
            {/* Top Row: Parent info & Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200/60">
              <div>
                <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>{currentReview.parentName}</span>
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {currentReview.relation} • {currentReview.studentGrade}
                  {currentReview.schoolName && ` • ${currentReview.schoolName}`}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(currentReview.rating)
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {currentReview.date}
                </span>
              </div>
            </div>

            {/* Review Comment Body */}
            <p className="text-xs sm:text-[13px] text-slate-700 italic leading-relaxed pt-2.5 select-none font-normal">
              "{currentReview.comment}"
            </p>

            {/* Mobile swipe hint */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 select-none">
              <span className="italic">← Swipe horizontally to read more reviews →</span>
              <span className="font-bold text-blue-700">★ {currentReview.rating.toFixed(1)} / 5</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Sliding Dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {reviews.map((rev, idx) => (
          <button
            key={rev.id}
            type="button"
            onClick={() => handleSelect(idx)}
            aria-label={`Go to review ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-6 h-2 bg-[#1d4ed8]'
                : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
