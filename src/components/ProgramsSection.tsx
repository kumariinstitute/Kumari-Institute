import React from 'react';
import { ArrowRight } from 'lucide-react';
import { programsData } from '../data/instituteData';
import { Program } from '../types';

interface ProgramsSectionProps {
  onSelectProgram: (program: Program) => void;
  onBookDemo: () => void;
  onNavigateTutors?: () => void;
  onNavigateExamPrep?: () => void;
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({
  onSelectProgram,
  onBookDemo,
  onNavigateTutors,
  onNavigateExamPrep,
}) => {
  const homeTutorProgram = programsData.find((p) => p.id === 'home-tutors') || programsData[0];
  const navodayaProgram = programsData.find((p) => p.id === 'navodaya-entrance') || programsData[1];
  const offlineProgram =
    programsData.find((p) => p.id === 'offline-classes') ||
    programsData.find((p) => p.id === 'offline-classes-middle') ||
    programsData[2];

  return (
    <section id="courses" className="py-12 sm:py-16 md:py-20 bg-white relative">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <p
            id="our-services-tag"
            className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-[#1d4ed8] mb-1.5"
          >
            OUR SERVICES
          </p>

          <h2
            id="services-main-heading"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-[#0c2340] tracking-tight leading-tight"
          >
            Comprehensive Learning Solutions
          </h2>

          <p
            id="services-subheading"
            className="text-xs sm:text-sm md:text-base text-slate-600 mt-2 leading-relaxed"
          >
            From foundation to future, we provide the right guidance at every stage.
          </p>
        </div>

        {/* Programs Grid: Spotlight Feature Cards (Home Tutors, Navodaya Entrance & Offline Classes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          
          {/* 1. Home Tutors Container */}
          <div className="flex">
            <div
              id="service-card-home-tutors"
              onClick={() => {
                if (onNavigateTutors) {
                  onNavigateTutors();
                } else {
                  onSelectProgram(homeTutorProgram);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onNavigateTutors) {
                    onNavigateTutors();
                  } else {
                    onSelectProgram(homeTutorProgram);
                  }
                }
              }}
              className="w-full bg-[#fffef7] border-2 border-[#fef08a] hover:border-[#fde047] rounded-[28px] sm:rounded-[32px] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Free Background Image layer with enhanced color & contrast */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <img
                  src="/Logo/HomeTutors.png"
                  alt="Home Tutors"
                  className="w-full h-56 sm:h-64 md:h-72 object-cover object-[center_10%] brightness-[1.05] contrast-[1.1] saturate-[1.25] transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Seamless gradient overlay: crisp top image, softly fading towards text */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-[#fffef7]/60 via-55% to-[#fffef7] to-80%" />
              </div>

              {/* Content Layer: Heading positioned down to showcase image artwork clearly */}
              <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 md:p-6 pt-50 sm:pt-56 md:pt-62">
                <div className="flex flex-col items-center text-center">
                  {/* Heading: Home Tutors (adjusted down to clear the image) */}
                  <h3 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight leading-tight mb-1.5">
                    {homeTutorProgram.title}
                  </h3>

                  {/* Pill: (1st to 5th Standard) - Vibrant & High Contrast */}
                  <div className="mb-2 sm:mb-2.5">
                    <span className="inline-block px-3.5 sm:px-4 py-1 rounded-full text-xs sm:text-[13px] font-black tracking-wide bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-400 text-[#0c2340] border border-amber-400 shadow-xs">
                      ({homeTutorProgram.cardPill || homeTutorProgram.subtitle})
                    </span>
                  </div>

                  {/* Description sentence with minimal space after */}
                  <p className="text-xs sm:text-sm font-semibold text-[#0c2340] leading-relaxed max-w-sm mx-auto mb-2.5 sm:mb-3">
                    {homeTutorProgram.description}
                  </p>
                </div>

                {/* Action Button: Find Tutors → */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    id="home-tutors-find-tutors-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateTutors) {
                        onNavigateTutors();
                      } else {
                        onSelectProgram(homeTutorProgram);
                      }
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-2.5 sm:py-3 rounded-full bg-[#facc15] hover:bg-[#eab308] text-[#0c2340] font-black text-sm sm:text-base shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group-hover:scale-[1.02] active:scale-95"
                  >
                    <span>Find Tutors</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Navodaya & Adarsh Vidhyalay Entrance Exam Container: Same Structure & Positions */}
          <div className="flex">
            <div
              id="service-card-navodaya-entrance"
              onClick={() => {
                if (onNavigateExamPrep) {
                  onNavigateExamPrep();
                } else {
                  onSelectProgram(navodayaProgram);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onNavigateExamPrep) {
                    onNavigateExamPrep();
                  } else {
                    onSelectProgram(navodayaProgram);
                  }
                }
              }}
              className="w-full bg-[#f0f9ff] border-2 border-[#bae6fd] hover:border-[#7dd3fc] rounded-[28px] sm:rounded-[32px] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Free Background Image layer with enhanced color & contrast */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <img
                  src="/Logo/Online.png"
                  alt="Navodaya & Adarsh Vidhyalay Entrance Exam"
                  className="w-full h-56 sm:h-64 md:h-72 object-cover object-[center_10%] brightness-[1.05] contrast-[1.1] saturate-[1.25] transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Seamless gradient overlay: crisp top image, softly fading towards text */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-[#f0f9ff]/60 via-55% to-[#f0f9ff] to-80%" />
              </div>

              {/* Content Layer: Same exact compact spacing and positions */}
              <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 md:p-6 pt-50 sm:pt-56 md:pt-62">
                <div className="flex flex-col items-center text-center">
                  {/* Heading: Navodaya & Adarsh Vidhyalay Entrance Exam */}
                  <h3 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight leading-tight mb-1.5">
                    {navodayaProgram.title}
                  </h3>

                  {/* Pill: (Online Preparation) - Vibrant & High Contrast */}
                  <div className="mb-2 sm:mb-2.5">
                    <span className="inline-block px-3.5 sm:px-4 py-1 rounded-full text-xs sm:text-[13px] font-black tracking-wide bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border border-sky-400 shadow-xs">
                      ({navodayaProgram.cardPill || navodayaProgram.subtitle})
                    </span>
                  </div>

                  {/* Description sentence with minimal space after */}
                  <p className="text-xs sm:text-sm font-semibold text-[#0c2340] leading-relaxed max-w-sm mx-auto mb-2.5 sm:mb-3">
                    {navodayaProgram.description}
                  </p>
                </div>

                {/* Action Button: Join Now → */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    id="navodaya-find-tutors-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateExamPrep) {
                        onNavigateExamPrep();
                      } else {
                        onSelectProgram(navodayaProgram);
                      }
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-2.5 sm:py-3 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-sm sm:text-base shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group-hover:scale-[1.02] active:scale-95"
                  >
                    <span>Join Now</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Offline Classes Container: Same Structure, Positions & Style */}
          <div className="flex md:col-span-2 lg:col-span-1 md:max-w-md md:mx-auto lg:max-w-none w-full">
            <div
              id="service-card-offline-classes"
              onClick={() => onSelectProgram(offlineProgram)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProgram(offlineProgram);
                }
              }}
              className="w-full bg-[#f0fdf9] border-2 border-[#a7f3d0] hover:border-[#6ee7b7] rounded-[28px] sm:rounded-[32px] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Free Background Image layer with enhanced color & contrast */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <img
                  src="/Logo/offline.png"
                  alt="Offline Classes"
                  className="w-full h-56 sm:h-64 md:h-72 object-cover object-[center_10%] brightness-[1.05] contrast-[1.1] saturate-[1.25] transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Seamless gradient overlay: crisp top image, softly fading towards text */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-[#f0fdf9]/60 via-55% to-[#f0fdf9] to-80%" />
              </div>

              {/* Content Layer: Same exact compact spacing and positions as Home Tutors */}
              <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 md:p-6 pt-50 sm:pt-56 md:pt-62">
                <div className="flex flex-col items-center text-center">
                  {/* Heading: Offline Classes */}
                  <h3 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight leading-tight mb-1.5">
                    {offlineProgram.title}
                  </h3>

                  {/* Pill: (6th to 12th Standard) - Vibrant & High Contrast */}
                  <div className="mb-2 sm:mb-2.5">
                    <span className="inline-block px-3.5 sm:px-4 py-1 rounded-full text-xs sm:text-[13px] font-black tracking-wide bg-gradient-to-r from-emerald-500 via-teal-500 to-teal-600 text-white border border-emerald-400 shadow-xs">
                      ({offlineProgram.cardPill || offlineProgram.subtitle})
                    </span>
                  </div>

                  {/* Description sentence with minimal space after */}
                  <p className="text-xs sm:text-sm font-semibold text-[#0c2340] leading-relaxed max-w-sm mx-auto mb-2.5 sm:mb-3">
                    {offlineProgram.description}
                  </p>
                </div>

                {/* Action Button: Join Offline Batches → */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    id="offline-find-tutors-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProgram(offlineProgram);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-2.5 sm:py-3 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-black text-sm sm:text-base shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group-hover:scale-[1.02] active:scale-95"
                  >
                    <span>Join Offline Batches</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

