import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { subscribeToRealtimeSuccessStories } from '../services/firebaseAuth';
import { AdminSuccessStory } from '../types';

interface ResultsAndTestimonialsProps {
  onViewMoreResults?: () => void;
}

export const ResultsAndTestimonials: React.FC<ResultsAndTestimonialsProps> = ({
  onViewMoreResults,
}) => {
  const [stories, setStories] = useState<AdminSuccessStory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = subscribeToRealtimeSuccessStories((items) => {
      setStories(items || []);
    });
    return () => unsub();
  }, []);

  if (stories.length === 0) {
    // No fake sample reviews shown when no genuine stories have been added by admin
    return null;
  }

  const totalReviews = stories.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalReviews - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalReviews - 1 ? 0 : prev + 1));
  };

  const getVisibleDesktopIndices = () => {
    if (totalReviews <= 3) {
      return Array.from({ length: totalReviews }, (_, i) => i);
    }
    return [
      currentIndex % totalReviews,
      (currentIndex + 1) % totalReviews,
      (currentIndex + 2) % totalReviews,
    ];
  };

  const visibleIndices = getVisibleDesktopIndices();

  return (
    <section id="success-stories" className="py-14 sm:py-20 md:py-24 bg-slate-50/60 relative overflow-hidden">
      <div id="gallery" className="-mt-20 pt-20" aria-hidden="true" />

      {/* Subtle ambient light accents */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div
            id="success-stories-tag"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 mb-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Success Stories</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0a2540] tracking-tight">
            What Parents &amp; Students Say
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-2 leading-relaxed">
            Real experiences from families and learners who transformed their academic confidence with us.
          </p>
        </div>

        {/* Review Box Container with Left & Right Arrows */}
        <div className="relative max-w-6xl mx-auto">
          {totalReviews > 1 && (
            <>
              <button
                id="testimonial-prev-btn"
                onClick={handlePrev}
                aria-label="Previous review"
                className="absolute -left-3 sm:-left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-slate-50 text-[#0a2540] border border-slate-200/90 shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                id="testimonial-next-btn"
                onClick={handleNext}
                aria-label="Next review"
                className="absolute -right-3 sm:-right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-slate-50 text-[#0a2540] border border-slate-200/90 shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 hover:scale-105"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* Desktop & Tablet Multi-Card View */}
          <div className={`hidden md:grid gap-5 lg:gap-6 px-4 ${visibleIndices.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : visibleIndices.length === 2 ? 'grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-3'}`}>
            {visibleIndices.map((idx) => {
              const item = stories[idx];
              if (!item) return null;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  id={`testimonial-card-${item.id}`}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
                >
                  <Quote className="w-8 h-8 text-blue-100/80 absolute top-4 right-4 pointer-events-none group-hover:text-blue-200/80 transition-colors" />

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.studentName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0a2540] flex items-center justify-center font-bold text-sm border-2 border-slate-100 shadow-xs">
                          {item.studentName?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#0a2540] truncate">
                          {item.studentName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {item.parentName ? `${item.parentName}'s Family` : (item.school || 'Student')}
                        </p>
                        {item.score && (
                          <span className="inline-block px-2 py-0.5 mt-1 rounded-md bg-blue-50 text-[#0a2540] text-[10px] font-semibold border border-blue-100">
                            {item.score} • {item.exam || 'Academics'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed italic relative z-10">
                      "{item.testimonial || item.story}"
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Student
                    </span>
                    <span>{item.badge || 'Academic Excellence'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Carousel View */}
          <div className="md:hidden px-2">
            {(() => {
              const currentItem = stories[currentIndex % totalReviews];
              if (!currentItem) return null;
              return (
                <div
                  id={`mobile-testimonial-${currentItem.id}`}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md relative min-h-[220px] flex flex-col justify-between"
                >
                  <Quote className="w-8 h-8 text-blue-100 absolute top-4 right-4 pointer-events-none" />

                  <div>
                    <div className="flex items-center gap-3 mb-3.5">
                      {currentItem.image ? (
                        <img
                          src={currentItem.image}
                          alt={currentItem.studentName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0a2540] flex items-center justify-center font-bold text-sm border-2 border-slate-100 shadow-xs">
                          {currentItem.studentName?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-[#0a2540]">
                          {currentItem.studentName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {currentItem.parentName ? `${currentItem.parentName}'s Family` : (currentItem.school || 'Student')}
                        </p>
                        {currentItem.score && (
                          <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-blue-50 text-[#0a2540] text-[10px] font-semibold border border-blue-100">
                            {currentItem.score} • {currentItem.exam || 'Academics'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-sm text-slate-700 italic leading-relaxed">
                      "{currentItem.testimonial || currentItem.story}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Verified Student
                    </span>
                    <span className="text-slate-400">{currentItem.badge || 'Success Story'}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};
