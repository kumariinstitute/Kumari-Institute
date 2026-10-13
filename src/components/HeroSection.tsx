import React from 'react';
import {
  ArrowRight,
  Users
} from 'lucide-react';
import { programsData } from '../data/instituteData';
import { Program } from '../types';

interface HeroSectionProps {
  onOpenCourses?: () => void;
  onOpenDemoBooking?: () => void;
  onOpenEnquiry?: () => void;
  onNavigateTutors?: () => void;
  onNavigateExamPrep?: () => void;
  onSelectProgram?: (program: Program) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCourses,
  onOpenDemoBooking,
  onOpenEnquiry,
  onNavigateTutors,
  onNavigateExamPrep,
  onSelectProgram
}) => {
  const homeTutorProgram = programsData.find((p) => p.id === 'home-tutors') || programsData[0];
  const navodayaProgram = programsData.find((p) => p.id === 'navodaya-entrance') || programsData[1];
  const offlineProgram =
    programsData.find((p) => p.id === 'offline-classes') ||
    programsData.find((p) => p.id === 'offline-classes-middle') ||
    programsData[2];

  const handleHomeTutorsClick = () => {
    if (onNavigateTutors) {
      onNavigateTutors();
    } else if (onSelectProgram) {
      onSelectProgram(homeTutorProgram);
    }
  };

  const handleNavodayaClick = () => {
    if (onNavigateExamPrep) {
      onNavigateExamPrep();
    } else if (onSelectProgram) {
      onSelectProgram(navodayaProgram);
    }
  };

  const handleOfflineClick = () => {
    if (onSelectProgram) {
      onSelectProgram(offlineProgram);
    } else if (onOpenCourses) {
      onOpenCourses();
    }
  };

  const handleEnquireClick = () => {
    if (onOpenEnquiry) {
      onOpenEnquiry();
    } else if (onOpenDemoBooking) {
      onOpenDemoBooking();
    }
  };

  return (
    <section id="hero" className="w-full bg-slate-50/60 pb-12 sm:pb-16 md:pb-20">
      {/* =======================================================================
          1. HERO BANNER - Exact Design & Structure from Reference Image
             - Base height maintained (h-[68dvh] min-h-[460px] on mobile, proportional on tablet/desktop)
             - Deep midnight navy background (#061B38 / #041226) with soft subtle constellation dots
             - Left text block:
                 * "Building Strong Foundations for a" (White)
                 * "Bright Future" (Warm Mustard / Gold #F5BA42)
                 * Subtle horizontal accent divider line
                 * "Quality Education | Expert Faculty | Personalized Learning"
                 * Rounded Pill Button: "ENQUIRE NOW" in bold dark blue text on warm golden background
             - Right visual block:
                 * Golden circular halo arch backdrop (#E5A93B / #D99B26)
                 * Three students smiling with notebooks & backpacks (boy left, girl center, boy right)
                 * Floating dark rounded badge: Icon + "Trusted by Parents / Focused on Results"
         ======================================================================= */}
      <div
        id="hero-banner-slider"
        className="w-full relative overflow-hidden bg-gradient-to-r from-[#03132B] via-[#061B38] to-[#04152D] select-none h-auto md:aspect-[2.7/1] md:min-h-[440px] lg:min-h-[490px] md:max-h-[530px] shadow-2xl border-b border-[#0a2750]"
      >
        {/* Subtle background star/dot particles accent */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Space between offers section and headings reduced to minimal clean gap (pt-2 sm:pt-2.5 md:pt-0) */}
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between pt-2 sm:pt-2.5 md:pt-0 pb-0">
          
          {/* LEFT CONTENT AREA: Typography, Highlights & CTA */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-start z-20 shrink-0 text-left">
            {/* Main Headline: Two lines, prominent, bold, and larger */}
            <h1 className="text-[30px] sm:text-[38px] md:text-[46px] lg:text-[54px] xl:text-[60px] font-extrabold tracking-tight leading-[1.12] text-white mb-2 sm:mb-2.5">
              <span className="block">Building Strong Foundation</span>
              <span className="block">
                <span>For a </span>
                <span className="text-[#F5BA42] font-black drop-shadow-[0_2px_12px_rgba(245,186,66,0.35)]">
                  Bright Future
                </span>
              </span>
            </h1>

            {/* Subtle Divider Line with tightly adjusted spacing */}
            <div className="w-12 sm:w-14 h-0.5 bg-slate-400/50 my-1 rounded-full" />

            {/* Sub-features text with exactly 2px space after as requested */}
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-200 tracking-wide mb-[2px] drop-shadow-xs">
              Quality Education <span className="text-slate-400 mx-1 sm:mx-1.5 font-light">|</span> Expert Faculty <span className="text-slate-400 mx-1 sm:mx-1.5 font-light">|</span> Personalized Learning
            </p>
          </div>

          {/* RIGHT VISUAL AREA: Golden Circular Backdrop + Big Teachers.png
              Starts right after the subheadings with exactly 2px gap (mt-[2px] md:mt-0).
              Increased image size to cleanly cover space after text. */}
          <div className="w-full md:w-1/2 relative flex items-end justify-center md:justify-end overflow-visible mt-[2px] md:mt-0 h-[315px] sm:h-[375px] md:h-full">
            
            {/* Golden Circle Halo Arch Backdrop */}
            <div className="absolute -bottom-6 sm:-bottom-8 md:bottom-[-2%] right-1/2 translate-x-1/2 md:translate-x-0 md:right-4 w-[280px] sm:w-[380px] md:w-[510px] lg:w-[570px] aspect-square rounded-full bg-gradient-to-tr from-[#C98B1B] via-[#E2A633] to-[#F2BA49] shadow-[0_0_50px_rgba(226,166,51,0.3)] pointer-events-none" />

            {/* Teachers Image Layer: Increased size to cover space after text */}
            <div className="relative z-10 w-full max-w-[460px] sm:max-w-[570px] md:max-w-[650px] h-full flex items-end justify-center pointer-events-none">
              <img
                src="/images/Teachers.png"
                alt="Kumari Institute Teachers"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('public/images/Teachers.png')) {
                    target.src = '/public/images/Teachers.png';
                  }
                }}
                className="w-auto h-full max-h-[315px] sm:max-h-[375px] md:max-h-[640px] md:h-[132%] object-contain object-bottom drop-shadow-[0_16px_32px_rgba(0,0,0,0.65)] select-none pointer-events-auto transition-transform duration-300"
                style={{
                  filter: 'drop-shadow(0 14px 30px rgba(0,0,0,0.6))',
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom Center: "Trusted by Parents | Focused on Results" Badge */}
            <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-[#03152D]/95 hover:bg-[#03152D] border border-cyan-500/35 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.6)] text-white pointer-events-auto whitespace-nowrap">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-400/25 border border-amber-400/50 flex items-center justify-center text-[#F5BA42] shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide">
                  Trusted by Parents
                </span>
                <span className="text-[9px] sm:text-[11px] font-medium text-slate-300">
                  Focused on Results
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* =======================================================================
          2. THE THREE BOXES SECTION - Unified #061B38 theme across all 3 boxes
             - Row 1: Two boxes (Home Tutors & Navodaya) in ONE row with #061B38 color theme
             - Row 2: 3rd box (Offline Classes) in 2nd row CENTERED with matching #061B38 color theme
             - Main text areas feature top transparent gradient
         ======================================================================= */}
      <div id="programs" className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 md:pt-10">
        {/* ROW 1: Home Tutors and Navodaya & Adarsh Vidhyalay Entrance Exam in ONE row with #061B38 theme */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 items-stretch">
          
          {/* BOX 1: Home Tutors with #061B38 theme */}
          <div
            id="service-card-home-tutors"
            onClick={handleHomeTutorsClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleHomeTutorsClick();
              }
            }}
            className="w-full bg-[#061B38] border-2 border-[#0e3266]/90 hover:border-amber-400/90 rounded-[20px] sm:rounded-[32px] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden opacity-95 hover:opacity-100"
          >
            {/* Free Background Image layer */}
            <div className="absolute inset-x-0 top-0 h-32 sm:h-60 md:h-72 pointer-events-none z-0 overflow-hidden opacity-90">
              <img
                src="/Logo/HomeTutors.png"
                alt="Home Tutors"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('service_home_tutor.jpg')) {
                    target.src = '/images/service_home_tutor.jpg';
                  }
                }}
                className="w-full h-full object-cover object-[center_10%] brightness-[1.05] contrast-[1.1] saturate-[1.25] transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#061B38]/30 to-[#061B38]" />
            </div>

            {/* Spacer for Top Image */}
            <div className="h-20 sm:h-44 md:h-52 w-full pointer-events-none" />

            {/* Main Text Content Area with Gradient (top side transparent) */}
            <div className="relative z-10 flex flex-col justify-between flex-1 p-2.5 sm:p-5 md:p-6 bg-gradient-to-b from-transparent via-[#061B38]/95 to-[#061B38]">
              <div className="flex flex-col items-center text-center">
                {/* Shiny Heading Accent Bar */}
                <div className="w-10 sm:w-16 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full mb-1.5 opacity-90 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />

                {/* Heading */}
                <h3 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight leading-tight mb-1.5 sm:mb-2 text-white drop-shadow-md">
                  {homeTutorProgram.title}
                </h3>

                {/* Pill */}
                <div className="mb-1.5 sm:mb-2.5">
                  <span className="inline-block px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-[13px] font-black tracking-wide bg-amber-400 text-[#061B38] border border-amber-300 shadow-sm">
                    ({homeTutorProgram.cardPill || homeTutorProgram.subtitle})
                  </span>
                </div>

                {/* Description */}
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-200 leading-tight sm:leading-relaxed max-w-sm mx-auto mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                  {homeTutorProgram.description}
                </p>
              </div>

              {/* Action Button: curved like circle (rounded-full) */}
              <div className="flex justify-center pt-0.5 sm:pt-1">
                <button
                  type="button"
                  id="home-tutors-find-tutors-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHomeTutorsClick();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2.5 px-4 sm:px-8 py-2 sm:py-2.5 md:py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-[#061B38] font-black text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group-hover:scale-[1.02] active:scale-95"
                >
                  <span>Find Tutors</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* BOX 2: Navodaya & Adarsh Vidhyalay Entrance Exam with #061B38 theme */}
          <div
            id="service-card-navodaya-entrance"
            onClick={handleNavodayaClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavodayaClick();
              }
            }}
            className="w-full bg-[#061B38] border-2 border-[#0e3266]/90 hover:border-amber-400/90 rounded-[20px] sm:rounded-[32px] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden opacity-95 hover:opacity-100"
          >
            {/* Free Background Image layer */}
            <div className="absolute inset-x-0 top-0 h-32 sm:h-60 md:h-72 pointer-events-none z-0 overflow-hidden opacity-90">
              <img
                src="/Logo/Online.png"
                alt="Navodaya & Adarsh Vidhyalay Entrance Exam"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('service_navodaya_exam.jpg')) {
                    target.src = '/images/service_navodaya_exam.jpg';
                  }
                }}
                className="w-full h-full object-cover object-[center_10%] brightness-[1.05] contrast-[1.1] saturate-[1.25] transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#061B38]/30 to-[#061B38]" />
            </div>

            {/* Spacer for Top Image */}
            <div className="h-20 sm:h-44 md:h-52 w-full pointer-events-none" />

            {/* Main Text Content Area with Gradient (top side transparent) */}
            <div className="relative z-10 flex flex-col justify-between flex-1 p-2.5 sm:p-5 md:p-6 bg-gradient-to-b from-transparent via-[#061B38]/95 to-[#061B38]">
              <div className="flex flex-col items-center text-center">
                {/* Shiny Heading Accent Bar */}
                <div className="w-10 sm:w-16 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full mb-1.5 opacity-90 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />

                {/* Heading */}
                <h3 className="text-sm sm:text-2xl md:text-3xl font-black tracking-tight leading-tight mb-1.5 sm:mb-2 text-white drop-shadow-md">
                  {navodayaProgram.title}
                </h3>

                {/* Pill */}
                <div className="mb-1.5 sm:mb-2.5">
                  <span className="inline-block px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-[13px] font-black tracking-wide bg-amber-400 text-[#061B38] border border-amber-300 shadow-sm">
                    ({navodayaProgram.cardPill || navodayaProgram.subtitle})
                  </span>
                </div>

                {/* Description */}
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-200 leading-tight sm:leading-relaxed max-w-sm mx-auto mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                  {navodayaProgram.description}
                </p>
              </div>

              {/* Action Button: curved like circle */}
              <div className="flex justify-center pt-0.5 sm:pt-1">
                <button
                  type="button"
                  id="navodaya-find-tutors-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavodayaClick();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2.5 px-4 sm:px-8 py-2 sm:py-2.5 md:py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-[#061B38] font-black text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group-hover:scale-[1.02] active:scale-95"
                >
                  <span>Join Now</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: 3rd box is in 2nd row and it is in CENTER with matching #061B38 theme */}
        <div className="flex justify-center mt-3 sm:mt-6 md:mt-8">
          <div className="w-full max-w-xl">
            {/* BOX 3: Offline Classes with unified #061B38 theme and top transparent gradient text area */}
            <div
              id="service-card-offline-classes"
              onClick={handleOfflineClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOfflineClick();
                }
              }}
              className="w-full bg-[#061B38] border-2 border-[#0e3266]/90 hover:border-amber-400/90 rounded-[20px] sm:rounded-[32px] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden opacity-95 hover:opacity-100"
            >
              {/* Free Background Image layer */}
              <div className="absolute inset-x-0 top-0 h-32 sm:h-60 md:h-72 pointer-events-none z-0 overflow-hidden opacity-90">
                <img
                  src="/Logo/offline.png"
                  alt="Offline Classes"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('service_offline_class.jpg')) {
                      target.src = '/images/service_offline_class.jpg';
                    }
                  }}
                  className="w-full h-full object-cover object-[center_10%] brightness-[1.05] contrast-[1.1] saturate-[1.25] transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#061B38]/30 to-[#061B38]" />
              </div>

              {/* Spacer for Top Image */}
              <div className="h-20 sm:h-44 md:h-52 w-full pointer-events-none" />

              {/* Main Text Content Area with Gradient (top side transparent) */}
              <div className="relative z-10 flex flex-col justify-between flex-1 p-2.5 sm:p-5 md:p-6 bg-gradient-to-b from-transparent via-[#061B38]/95 to-[#061B38]">
                <div className="flex flex-col items-center text-center">
                  {/* Shiny Heading Accent Bar */}
                  <div className="w-10 sm:w-16 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full mb-1.5 opacity-90 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />

                  {/* Heading */}
                  <h3 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight leading-tight mb-1.5 sm:mb-2 text-white drop-shadow-md">
                    {offlineProgram.title}
                  </h3>

                  {/* Pill */}
                  <div className="mb-1.5 sm:mb-2.5">
                    <span className="inline-block px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-[13px] font-black tracking-wide bg-amber-400 text-[#061B38] border border-amber-300 shadow-sm">
                      ({offlineProgram.cardPill || offlineProgram.subtitle})
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-200 leading-tight sm:leading-relaxed max-w-sm mx-auto mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                    {offlineProgram.description}
                  </p>
                </div>

                {/* Action Button: curved like circle */}
                <div className="flex justify-center pt-0.5 sm:pt-1">
                  <button
                    type="button"
                    id="offline-classes-find-tutors-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOfflineClick();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2.5 px-4 sm:px-8 py-2 sm:py-2.5 md:py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-[#061B38] font-black text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group-hover:scale-[1.02] active:scale-95"
                  >
                    <span>View Batches</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
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

