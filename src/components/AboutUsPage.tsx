import React from 'react';
import {
  ChevronRight,
  ArrowRight,
  Target,
  Eye,
  Gem,
  Check,
  UserCheck,
  ShieldCheck,
  Users,
  TrendingUp,
  BookOpen,
  HeartHandshake,
  Star,
  Heart,
  FileEdit,
} from 'lucide-react';

interface AboutUsPageProps {
  onNavigateHome: () => void;
  onOpenEnquiry: () => void;
  onOpenDemoBooking?: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onNavigateHome,
  onOpenEnquiry,
}) => {
  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans selection:bg-amber-200 selection:text-slate-900">
      {/* =========================================================================
          1. HERO SECTION: "About Kumari Institute" with Campus Visual & Doodle
         ========================================================================= */}
      <section className="relative bg-gradient-to-b from-[#eaf4fe] via-[#f3f8fe] to-white pt-6 pb-12 sm:pt-10 sm:pb-16 md:pb-20 overflow-hidden border-b border-blue-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
              <li>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="hover:text-[#1d4ed8] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </li>
              <li className="text-[#1d4ed8] font-semibold">About Us</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 xl:col-span-6 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0c2340] tracking-tight leading-[1.12]">
                About <br />
                <span className="text-[#1d4ed8]">Kumari Institute</span>
              </h1>

              <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                A trusted learning partner in Indira Nagar, Rayagada, helping every child build a strong foundation and achieve their dreams.
              </p>

              {/* Decorative golden-yellow underline accent matching reference */}
              <div className="w-14 h-1 sm:h-1.5 bg-amber-400 rounded-full mt-4 sm:mt-5" />
            </div>

            {/* Right Visual Column: Campus Building + Whimsical "Building Better Futures ♡" Doodle */}
            <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center">
                {/* Campus Image with soft rounded frame & cloud mask feeling */}
                <div className="relative z-10 w-full sm:w-11/12 rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-lg border-4 border-white bg-slate-100">
                  <img
                    src="/images/about/campus.jpg"
                    alt="Kumari Institute campus building in Indira Nagar, Rayagada"
                    className="w-full h-64 sm:h-72 md:h-80 lg:h-88 object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Whimsical Doodle Overlay: "Building Better Futures ♡" with gold brush underline */}
                <div className="absolute -right-2 sm:-right-4 top-2 sm:top-4 z-20 flex flex-col items-center select-none pointer-events-none drop-shadow-xs">
                  <span className="font-handwriting text-2xl sm:text-3xl md:text-4xl text-[#1e40af] font-bold tracking-wide transform -rotate-6 leading-tight text-center">
                    Building<br />
                    Better<br />
                    Futures
                  </span>
                  <span className="font-handwriting text-2xl sm:text-3xl text-[#1e40af] font-bold transform -rotate-6 -mt-1">
                    ♡
                  </span>
                  {/* Golden curved brush underline */}
                  <svg
                    className="w-20 sm:w-24 h-4 text-amber-400 transform -rotate-6 mt-0.5"
                    viewBox="0 0 100 20"
                    fill="none"
                  >
                    <path
                      d="M5 14 Q 50 3 95 12"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. OUR STORY SECTION: "From a Dream to a Trusted Institute" + Photo
         ========================================================================= */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Story Text Column */}
            <div className="lg:col-span-6 text-left">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0c2340]">
                Our Story
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-[#0c2340] tracking-tight leading-tight mt-1 mb-4 sm:mb-5">
                From a Dream <br />
                to a Trusted Institute
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 sm:mb-8 font-normal">
                Kumari Institute in Indira Nagar, Rayagada was founded with a simple yet powerful vision — to provide quality education and personalized guidance to every child, regardless of their background. What started as a dream to support students has today grown into a trusted coaching and learning center, known for its dedicated faculty, structured learning programs, and proven results.
              </p>

              <div>
                <button
                  type="button"
                  id="about-learn-more-btn"
                  onClick={onOpenEnquiry}
                  className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full border-2 border-[#0c2340] text-[#0c2340] font-bold text-sm hover:bg-[#0c2340] hover:text-white transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group"
                >
                  <span>Learn More About Us</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Photo Card with "Every child matters ♡" Doodle */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-md border border-slate-100/90 group">
                <img
                  src="/images/about/teacher.jpg"
                  alt="Teacher guiding young students at study table in Kumari Institute"
                  className="w-full h-64 sm:h-76 md:h-84 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Top-Right Playful Note Doodle: "Every child matters ♡" */}
                <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-white/85 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl shadow-xs border border-white/60 transform rotate-3 select-none pointer-events-none">
                  <div className="font-handwriting text-lg sm:text-2xl text-[#1e3a8a] font-bold leading-tight text-center">
                    Every child<br />
                    matters <span className="inline-block text-base sm:text-xl">♡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CORE PILLARS: "Our Mission", "Our Vision", "Our Values"
         ========================================================================= */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Our Mission */}
            <div className="bg-[#f0f7fe] rounded-3xl p-6 sm:p-8 border border-blue-100/70 hover:border-blue-200 transition-all shadow-xs flex flex-col justify-start">
              {/* Circular Icon Container */}
              <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#1d4ed8] shadow-2xs mb-4">
                <Target className="w-6 h-6 stroke-[2.2]" />
              </div>

              <h3 className="text-xl font-black text-[#0c2340] mb-2 tracking-tight">
                Our Mission
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                To provide quality education, personalized guidance and a supportive learning environment that helps every child reach their full potential.
              </p>
            </div>

            {/* Card 2: Our Vision */}
            <div className="bg-[#f0f7fe] rounded-3xl p-6 sm:p-8 border border-blue-100/70 hover:border-blue-200 transition-all shadow-xs flex flex-col justify-start">
              {/* Circular Icon Container */}
              <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#1d4ed8] shadow-2xs mb-4">
                <Eye className="w-6 h-6 stroke-[2.2]" />
              </div>

              <h3 className="text-xl font-black text-[#0c2340] mb-2 tracking-tight">
                Our Vision
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                To become a leading educational institute in Rayagada, shaping confident, capable and successful learners for a brighter tomorrow.
              </p>
            </div>

            {/* Card 3: Our Values */}
            <div className="bg-[#f0f7fe] rounded-3xl p-6 sm:p-8 border border-blue-100/70 hover:border-blue-200 transition-all shadow-xs flex flex-col justify-start">
              {/* Circular Icon Container */}
              <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#1d4ed8] shadow-2xs mb-4">
                <Gem className="w-6 h-6 stroke-[2.2]" />
              </div>

              <h3 className="text-xl font-black text-[#0c2340] mb-3 tracking-tight">
                Our Values
              </h3>

              <ul className="space-y-2 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#1d4ed8] stroke-[3] shrink-0" />
                  <span>Student–Centered Learning</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#1d4ed8] stroke-[3] shrink-0" />
                  <span>Integrity &amp; Trust</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#1d4ed8] stroke-[3] shrink-0" />
                  <span>Discipline &amp; Dedication</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#1d4ed8] stroke-[3] shrink-0" />
                  <span>Continuous Improvement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. WHY CHOOSE KUMARI INSTITUTE? (6 Features + Student Testimonial Card)
         ========================================================================= */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-left mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0c2340] tracking-tight leading-tight">
              Why Choose <span className="text-[#1d4ed8]">Kumari Institute</span>?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-normal">
              We go beyond just teaching — we guide, support and stand with your child at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left 6 Feature Cards (2 columns x 3 rows) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 items-start">
              {/* Feature 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e0f0fe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-2xs">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#0c2340] tracking-tight">
                    Experienced Faculty
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    Skilled and qualified teachers with years of experience.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e0f0fe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#0c2340] tracking-tight">
                    Safe &amp; Positive Environment
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    A secure and motivating atmosphere for all students.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e0f0fe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#0c2340] tracking-tight">
                    Personalized Attention
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    Focused learning for better results.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e0f0fe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-2xs">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#0c2340] tracking-tight">
                    Proven Results
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    Consistent success in academic achievements.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e0f0fe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-2xs">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#0c2340] tracking-tight">
                    Updated Study Material
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    Well-researched and exam-oriented content.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e0f0fe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-2xs">
                  <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#0c2340] tracking-tight">
                    Parent Involvement
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    Regular updates and open communication.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Parent Testimonial Card */}
            <div className="lg:col-span-5 flex">
              <div className="w-full bg-[#eff6ff] rounded-3xl p-6 sm:p-8 md:p-9 border border-blue-100/90 shadow-xs relative overflow-hidden flex flex-col justify-center">
                {/* Quote Content */}
                <div className="relative z-10">
                  {/* Large Blue Quotation Mark */}
                  <span className="text-4xl sm:text-5xl font-serif text-[#1d4ed8] font-bold leading-none select-none block mb-3">
                    “
                  </span>

                  <p className="text-sm sm:text-base font-semibold text-[#0c2340] leading-relaxed">
                    “The best decision we made for our child. The home tutor is very patient and teaches with great care. My child's confidence has improved a lot.”
                  </p>

                  <div className="mt-6 pt-5 border-t border-blue-200/70 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h5 className="text-sm sm:text-base font-black text-[#0c2340]">
                        Ramesh Kumar
                      </h5>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Parent of 5th Standard Student
                      </p>
                    </div>

                    {/* 5 Gold Stars */}
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              5. STATS COUNTER RIBBON: 100+, 5+, 100%, Excellent
             ========================================================================= */}
          <div className="mt-12 sm:mt-16 bg-[#0c2340] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-md relative overflow-hidden">
            {/* Soft background glow accents */}
            <div className="absolute -left-12 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {/* Stat 1 */}
              <div className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-3.5 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all min-h-[125px] sm:min-h-[145px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center mb-2 sm:mb-2.5">
                  <Users className="w-5 h-5 sm:w-5 sm:h-5" />
                </div>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  100+
                </span>
                <span className="text-[11px] sm:text-xs md:text-sm text-slate-300 font-medium mt-1 leading-tight">
                  Happy Students
                </span>
              </div>

              {/* Stat 2 */}
              <div className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-3.5 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all min-h-[125px] sm:min-h-[145px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center mb-2 sm:mb-2.5">
                  <Star className="w-5 h-5 sm:w-5 sm:h-5 fill-amber-400" />
                </div>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  5+
                </span>
                <span className="text-[11px] sm:text-xs md:text-sm text-slate-300 font-medium mt-1 leading-tight">
                  Years of Experience
                </span>
              </div>

              {/* Stat 3 */}
              <div className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-3.5 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all min-h-[125px] sm:min-h-[145px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center mb-2 sm:mb-2.5">
                  <TrendingUp className="w-5 h-5 sm:w-5 sm:h-5" />
                </div>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  100%
                </span>
                <span className="text-[11px] sm:text-xs md:text-sm text-slate-300 font-medium mt-1 leading-tight">
                  Focus on Individual Growth
                </span>
              </div>

              {/* Stat 4 */}
              <div className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-3.5 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all min-h-[125px] sm:min-h-[145px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center mb-2 sm:mb-2.5">
                  <Heart className="w-5 h-5 sm:w-5 sm:h-5 fill-amber-400" />
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Excellent
                </span>
                <span className="text-[11px] sm:text-xs md:text-sm text-slate-300 font-medium mt-1 leading-tight">
                  Parent Satisfaction
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              6. CTA BANNER: "Give your child the right guidance and support."
             ========================================================================= */}
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-[#fff9f1] via-[#fff8ed] to-[#fff6e6] rounded-3xl p-6 sm:p-10 border border-amber-200/70 shadow-xs relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Left CTA Text & Button */}
              <div className="lg:col-span-7 text-left">
                <span className="text-xs sm:text-sm font-bold text-slate-600 block">
                  Let's Build a Brighter Future Together
                </span>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c2340] leading-tight mt-1.5 mb-2.5">
                  Give your child the right guidance <br className="hidden sm:inline" />
                  and support.
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 font-medium mb-4 max-w-lg">
                  Join Kumari Institute today and take the first step towards a brighter tomorrow.
                </p>

                <button
                  type="button"
                  id="about-cta-enquire-btn"
                  onClick={onOpenEnquiry}
                  className="inline-flex items-center gap-2 px-7 sm:px-9 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0c2340] font-black text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <FileEdit className="w-4 h-4 stroke-[2.5]" />
                  <span>Enquire Now</span>
                </button>
              </div>

              {/* Right CTA Visual: 3 Books (LEARN GROW SUCCEED) + Pen Jar + "Small Steps Big Dreams ♡" Doodle */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative w-full max-w-md flex items-center justify-center">
                  <div className="rounded-2xl overflow-hidden shadow-xs border border-amber-200/60 bg-white/70 w-9/12 sm:w-10/12">
                    <img
                      src="/images/about/cta_books.jpg"
                      alt="Study books labeled Learn Grow Succeed with pens"
                      className="w-full h-36 sm:h-44 object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Whimsical Doodle Overlay: "Small Steps Big Dreams ♡" with sun rays */}
                  <div className="absolute -right-1 sm:right-0 top-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-none drop-shadow-xs">
                    {/* 3 Sunshine rays */}
                    <svg className="w-10 h-5 text-amber-400 mb-0.5" viewBox="0 0 60 30" fill="none">
                      <line x1="30" y1="26" x2="30" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <line x1="16" y1="26" x2="8" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <line x1="44" y1="26" x2="52" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>

                    <span className="font-handwriting text-xl sm:text-2xl text-[#1e3a8a] font-bold leading-tight text-center">
                      Small<br />
                      Steps<br />
                      Big<br />
                      Dreams
                    </span>
                    <span className="font-handwriting text-xl text-[#1e3a8a] font-bold -mt-0.5">
                      ♡
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
