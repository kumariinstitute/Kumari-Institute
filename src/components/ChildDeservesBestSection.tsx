import React from 'react';
import { Users, UserCheck, BookOpen, ShieldCheck, Sparkles, CheckCircle2, Star, ArrowRight, Quote } from 'lucide-react';

interface ChildDeservesBestSectionProps {
  id?: string;
  onOpenDemoBooking?: () => void;
}

export const ChildDeservesBestSection: React.FC<ChildDeservesBestSectionProps> = ({ 
  id = 'why-choose-us-showcase',
  onOpenDemoBooking,
}) => {
  return (
    <section
      id={id}
      className="relative bg-[#f1f7fc] border-y border-sky-100/90 py-12 sm:py-16 lg:py-20 overflow-hidden"
    >
      <div id="about" className="-mt-20 pt-20" aria-hidden="true" />
      {/* Background soft ambient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center">
          
          {/* Left Column: Tutor & Student Photo with Arched Backdrop & Script Text */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[340px] xl:max-w-[370px]">
              
              {/* Organic Sky Blue Arch Background */}
              <div 
                className="absolute -top-4 -left-3 sm:-top-5 sm:-left-4 w-[92%] h-[95%] bg-[#77c4f2] rounded-t-[100px] rounded-br-[70px] rounded-bl-[40px] -z-0 transition-transform duration-300"
                aria-hidden="true"
              />

              {/* Main Photo Cutout / Frame */}
              <div className="relative z-10 aspect-[4/3.9] w-full rounded-t-[90px] rounded-b-2xl overflow-hidden shadow-lg border-2 border-white/80 bg-white">
                <img
                  src="/images/tutor_student_guidance.jpg"
                  alt="Teacher guiding student with care and confidence"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Handwritten Blue Script: Guidance Builds Confidence ♡ */}
              <div 
                className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 z-20 select-none transform rotate-3 hover:rotate-0 transition-transform duration-300"
                aria-label="Guidance Builds Confidence"
              >
                <div className="flex flex-col items-center text-[#175aa6] drop-shadow-xs">
                  <span className="text-[13px] sm:text-[15px] font-bold tracking-tight italic font-serif leading-tight">
                    Guidance
                  </span>
                  <span className="text-[15px] sm:text-[18px] font-extrabold tracking-tight italic font-serif leading-tight">
                    Builds
                  </span>
                  <span className="text-[14px] sm:text-[16px] font-bold tracking-tight italic font-serif leading-tight">
                    Confidence
                  </span>

                  {/* Playful Heart & Arrow Indicator */}
                  <svg 
                    className="w-7 h-7 sm:w-8 sm:h-8 text-[#175aa6] mt-0.5" 
                    viewBox="0 0 36 36" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M10 6 C 16 12, 19 16, 18 22" />
                    <path 
                      d="M18 22 C 16 20, 13 19, 12 21 C 10.5 23.5, 15 28, 18 31 C 21 28, 25.5 23.5, 24 21 C 23 19, 20 20, 18 22 Z" 
                      fill="currentColor" 
                      fillOpacity="0.25" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Heading + 2x2 Feature Points */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center">
            {/* Tag */}
            <span className="text-xs sm:text-sm font-extrabold tracking-[0.16em] text-[#2563eb] uppercase mb-2">
              WHY CHOOSE US
            </span>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-[2.2rem] xl:text-[2.4rem] font-black text-[#0a2540] tracking-tight leading-[1.2] mb-6 sm:mb-8">
              Because Your Child Deserves the Best
            </h2>

            {/* 2x2 Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 sm:gap-y-7">
              
              {/* Feature 1: Experienced Faculty */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-12 h-12 rounded-full bg-[#0a2e5c] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0a2540] leading-snug">
                    Experienced Faculty
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                    Skilled and qualified teachers with years of experience.
                  </p>
                </div>
              </div>

              {/* Feature 2: Personalized Attention */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-12 h-12 rounded-full bg-[#0a2e5c] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0a2540] leading-snug">
                    Personalized Attention
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                    Focused learning for better results.
                  </p>
                </div>
              </div>

              {/* Feature 3: Updated Study Material */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-12 h-12 rounded-full bg-[#0a2e5c] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0a2540] leading-snug">
                    Updated Study Material
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                    Well-researched and exam-oriented content.
                  </p>
                </div>
              </div>

              {/* Feature 4: Positive Learning Environment */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-12 h-12 rounded-full bg-[#0a2e5c] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0a2540] leading-snug">
                    Positive Learning Environment
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                    Safe, friendly and motivating atmosphere.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Professional Academic Mission & Parent Pledge Card */}
          <div className="lg:col-span-3 xl:col-span-3 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-sm lg:max-w-none bg-white rounded-2xl p-5 sm:p-6 border-t-4 border-[#0e2a47] border-x border-b border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
              
              {/* Header Badge & Quote Icon */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#0e2a47] text-[11px] font-bold tracking-wide uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Academic Pledge
                  </span>
                  <Quote className="w-6 h-6 text-slate-300 shrink-0" />
                </div>

                {/* Professional Mission Statement */}
                <p className="text-slate-800 text-[13.5px] sm:text-[14.5px] font-semibold leading-relaxed tracking-tight">
                  “Our goal is not just to teach syllabus, but to nurture confident thinkers, ignite lifelong curiosity, and build successful futures.”
                </p>

                {/* Accent Separator */}
                <div className="w-10 h-0.5 bg-amber-400 rounded-full my-3.5" />

                {/* Tangible Impact Highlights */}
                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated 1-on-1 Mentor Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Regular Chapter Testing & Revision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Weekly Parent Progress Reports</span>
                  </div>
                </div>
              </div>

              {/* Trust Rating & Interactive Call-to-Action */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="font-semibold text-slate-700">4.9/5 by 3,500+ Parents</span>
                </div>

                {onOpenDemoBooking && (
                  <button
                    type="button"
                    onClick={onOpenDemoBooking}
                    className="w-full py-2 px-3 rounded-xl bg-[#0e2a47] hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-xs"
                  >
                    <span>Book Free Demo Class</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
