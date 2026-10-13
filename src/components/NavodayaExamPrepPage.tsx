import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Video,
  BookOpen,
  FileCheck,
  MessageSquare,
  BarChart3,
  Check,
  Lightbulb,
  Calculator,
  Brain,
  Globe,
  FlaskConical,
  Languages,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Users,
  Star,
  Search,
  User,
  Radio,
  FileText,
  CreditCard,
  Laptop,
  Sparkles,
  Phone,
  CheckCircle2,
  Lock,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';

interface NavodayaExamPrepPageProps {
  onNavigateHome: () => void;
  onNavigateTutors: () => void;
  onOpenEnquiry: () => void;
  onOpenDemoBooking?: () => void;
}

interface PlanItem {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  isPopular?: boolean;
  features: string[];
}

export const NavodayaExamPrepPage: React.FC<NavodayaExamPrepPageProps> = ({
  onNavigateHome,
  onNavigateTutors,
  onOpenEnquiry,
  onOpenDemoBooking,
}) => {
  // Selected Plan for Checkout Modal
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('Class 5');
  const [parentPhone, setParentPhone] = useState('');
  const [targetExam, setTargetExam] = useState('Navodaya Vidyalaya (JNVST)');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 3 Pricing Plans matching the exact design
  const PLANS: PlanItem[] = [
    {
      id: 'plan-live-only',
      name: 'Live Classes Only',
      subtitle: 'Attend live classes and get expert guidance.',
      price: '₹ 2,999',
      period: '/ 3 Months',
      features: [
        'Live Interactive Classes',
        'Recorded Sessions (Limited)',
        'Doubt Support',
      ],
    },
    {
      id: 'plan-live-study',
      name: 'Live Classes + Study Material',
      subtitle: 'Complete preparation with notes and practice sets.',
      price: '₹ 4,499',
      period: '/ 3 Months',
      isPopular: true,
      features: [
        'Live Interactive Classes',
        'Detailed Study Material (PDF + Worksheets)',
        'Practice Sets & Mock Tests',
        'Doubt Support',
      ],
    },
    {
      id: 'plan-full-package',
      name: 'Live Classes + Material + Mock Tests',
      subtitle: 'Full package for exam success.',
      price: '₹ 5,999',
      period: '/ 3 Months',
      features: [
        'Live Interactive Classes',
        'Study Material (PDF + Worksheets)',
        'Full-Length Mock Tests',
        'Performance Analysis',
        'Doubt Support',
      ],
    },
  ];

  const handleOpenCheckout = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setIsSubmitted(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsCheckoutOpen(false);
      setIsSubmitted(false);
      setStudentName('');
      setParentPhone('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Breadcrumb Back Bar (No duplicate navbar) */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#1d4ed8] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#1d4ed8]" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">Navodaya &amp; Adarsha Vidyalaya Prep</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          HERO SECTION: NAVODAYA & OTHER SUDHRALAYA ENTRANCE EXAM PREPARATION
         ========================================================================= */}
      <section className="bg-gradient-to-r from-[#071d49] via-[#0d3470] to-[#124d9c] text-white py-10 sm:py-14 lg:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              {/* Live Classes Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#1d4ed8] text-xs font-bold shadow-sm">
                <Radio className="w-3.5 h-3.5 text-[#1d4ed8] animate-pulse" />
                <span>Live Classes</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                Navodaya &amp; Other{' '}
                <span className="text-[#f59e0b]">Sudhralaya</span>
                <br className="hidden sm:inline" /> Entrance Exam Preparation
              </h1>

              {/* Subtitle Row with Vertical Dividers */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-blue-100/90">
                <span>Live Interactive Classes</span>
                <span className="text-blue-300">|</span>
                <span>Expert Guidance</span>
                <span className="text-blue-300">|</span>
                <span>Complete Study Support</span>
              </div>

              {/* Description Paragraph */}
              <p className="text-sm sm:text-base text-blue-50/90 leading-relaxed font-normal max-w-2xl">
                Give your child the right direction with our structured live classes for Navodaya Vidyalaya and other Sudhralaya entrance exams. Build a strong foundation and help them achieve their dream.
              </p>

              {/* 3 Feature Badges in a Horizontal Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* 1. Expert Faculty */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="w-10 h-10 rounded-full bg-white text-[#0c2340] flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Expert Faculty
                    </div>
                    <div className="text-[11px] text-blue-200">
                      Experienced &amp; Trained Teachers
                    </div>
                  </div>
                </div>

                {/* 2. Live Interactive */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="w-10 h-10 rounded-full bg-white text-[#0c2340] flex items-center justify-center shrink-0 shadow-xs">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Live Interactive
                    </div>
                    <div className="text-[11px] text-blue-200">
                      Real-time Doubt Solving Sessions
                    </div>
                  </div>
                </div>

                {/* 3. Detailed Study Material */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="w-10 h-10 rounded-full bg-white text-[#0c2340] flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Detailed Study Material
                    </div>
                    <div className="text-[11px] text-blue-200">
                      Easy Notes, Practice Sets &amp; Mock Tests
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Graphic Column (Student Image with Dream Big and 4 Exam Checkmark Pills) */}
            <div className="lg:col-span-5 relative flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Student Photo with "Dream Big ☆" doodle */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-3/4 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-blue-900/40">
                <img
                  src="/src/assets/images/navodaya_hero_girl_1788972869973.jpg"
                  alt="Student preparing for Navodaya and Sudhralaya exams"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />

                {/* "Dream Big ☆" playful badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#0c2340] font-black text-xs shadow-md border border-white/40">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Dream Big ☆</span>
                </div>
              </div>

              {/* 4 Exam Checkmark Pills Stacked on the Right */}
              <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-slate-800 text-xs sm:text-sm font-black shadow-lg border border-white/40 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                  <span>Navodaya Vidyalaya</span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-slate-800 text-xs sm:text-sm font-black shadow-lg border border-white/40 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                  <span>Adarsh Vidyalaya</span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-slate-800 text-xs sm:text-sm font-black shadow-lg border border-white/40 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                  <span>Sainik School</span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-slate-800 text-xs sm:text-sm font-black shadow-lg border border-white/40 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                  <span>RIMC &amp; Other Sudhralaya Exams</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: COURSE OVERVIEW (5 Feature Cards Grid)
         ========================================================================= */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Course Overview
            </h2>
            <p className="text-sm font-bold text-[#1d4ed8] mt-1">
              Comprehensive preparation for a brighter future.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Live Classes */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#0c2340]">Live Classes</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Interactive live classes with expert teachers.
                </p>
              </div>
            </div>

            {/* 2. Subject Coverage */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#0c2340]">Subject Coverage</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Maths, Reasoning, Hindi, English, Science &amp; Social Science (as per exam pattern).
                </p>
              </div>
            </div>

            {/* 3. Practice & Mock Tests */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#0c2340]">Practice &amp; Mock Tests</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Regular practice sets, chapter-wise tests &amp; full-length mock exams.
                </p>
              </div>
            </div>

            {/* 4. Doubt Support */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#0c2340]">Doubt Support</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Get your doubts cleared in live sessions or through chat support.
                </p>
              </div>
            </div>

            {/* 5. Performance Tracking */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#0c2340]">Performance Tracking</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Regular progress reports to track improvement and strengths.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: SUBJECTS & EXAM DETAILS
         ========================================================================= */}
      <section className="py-12 sm:py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Subjects &amp; Exam Details
            </h2>
            <p className="text-sm font-bold text-[#1d4ed8] mt-1">
              Everything your child needs to succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Exam Covered Card */}
            <div className="lg:col-span-4 bg-[#f0f7ff] rounded-3xl p-6 sm:p-7 border border-blue-100 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#0c2340]">
                  Exam Covered
                </h3>

                <ul className="space-y-3 text-sm font-bold text-slate-800">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#1d4ed8] stroke-[3]" />
                    <span>Navodaya Vidyalaya (JNVST)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#1d4ed8] stroke-[3]" />
                    <span>Adarsh Vidyalaya</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#1d4ed8] stroke-[3]" />
                    <span>Sainik School</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#1d4ed8] stroke-[3]" />
                    <span>RIMC &amp; Other Sudhralaya Exams</span>
                  </li>
                </ul>
              </div>

              {/* Lightbulb Note Box at Bottom */}
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 fill-amber-300 text-amber-600" />
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                  The exam is conducted for admission into prestigious residential schools across India.
                </p>
              </div>
            </div>

            {/* Right Column: Subjects Include (6 Cards in 2x3 Grid) */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-lg font-black text-[#0c2340]">
                Subjects Include
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Mathematics */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0c2340]">
                      Mathematics
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      (Counting, Geometry, Number System, Mensuration, etc.)
                    </p>
                  </div>
                </div>

                {/* 2. Reasoning */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0c2340]">
                      Reasoning
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      (Verbal &amp; Non-Verbal, Logical Reasoning, Series, etc.)
                    </p>
                  </div>
                </div>

                {/* 3. English */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0c2340]">
                      English
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      (Grammar, Vocabulary, Comprehension, etc.)
                    </p>
                  </div>
                </div>

                {/* 4. Hindi */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0c2340]">
                      Hindi
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      (Grammar, Reading Comprehension, etc.)
                    </p>
                  </div>
                </div>

                {/* 5. Science */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0c2340]">
                      Science
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      (Physics, Chemistry, Biology, Environment, etc.)
                    </p>
                  </div>
                </div>

                {/* 6. Social Science */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0c2340]">
                      Social Science
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      (History, Geography, Civics, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: CHOOSE YOUR LEARNING PLAN (3 Pricing Cards)
         ========================================================================= */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          {/* Section Header with Category Icons */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
                Choose Your Learning Plan
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Get access to live classes, study material and complete exam preparation.
              </p>
            </div>

            {/* Category Pills on the Right */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                <Video className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>Live Classes</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>Study Material</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                <FileCheck className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>Mock Tests</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                <MessageSquare className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>Doubt Support</span>
              </div>
            </div>
          </div>

          {/* 3 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative transition-all duration-200 ${
                  plan.isPopular
                    ? 'bg-white border-2 border-[#1d4ed8] shadow-lg ring-4 ring-blue-500/10'
                    : 'bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Most Popular Badge on Center Card */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-[#1d4ed8] text-white text-xs font-black uppercase tracking-wider shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#0c2340]">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-1">
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#0c2340]">
                      {plan.price}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-500">
                      {plan.period}
                    </span>
                  </div>

                  {/* Buy Now Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                      plan.isPopular
                        ? 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-blue-500/20'
                        : 'bg-white hover:bg-blue-50/50 text-[#1d4ed8] border border-[#1d4ed8]'
                    }`}
                  >
                    <span>Buy Now</span>
                  </button>

                  {/* Feature Checklist */}
                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <Check className="w-4 h-4 text-[#1d4ed8] stroke-[2.5] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: HOW TO GET STARTED? (Steps & Dark Blue Promo Card)
         ========================================================================= */}
      <section className="py-12 sm:py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              How to Get Started?
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Just a few simple steps to begin your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Side: 3 Steps Process Container */}
            <div className="lg:col-span-8 bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 border border-blue-100 flex flex-col justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 items-center">
                {/* Step 1 */}
                <div className="flex items-center sm:flex-col sm:text-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-[#1d4ed8] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0c2340]">
                      1 Choose Your Plan
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Select the best plan for your child.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center sm:flex-col sm:text-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-[#1d4ed8] flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0c2340]">
                      2 Make Payment
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Secure and easy payment process.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center sm:flex-col sm:text-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-[#1d4ed8] flex items-center justify-center shrink-0">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0c2340]">
                      3 Get Access
                    </h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Start attending live classes and access study material.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Deep Navy Promo Card */}
            <div className="lg:col-span-4 bg-[#0c2340] rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between space-y-6 shadow-md">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 text-sky-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">
                  Give Your Child the Best Opportunity
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
                  Join our live classes today and be a step closer to their dream!
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onOpenDemoBooking || onOpenEnquiry}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-slate-100 active:scale-95 text-[#0c2340] font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER TRUST RIBBON (Matching Bottom Bar in Image)
         ========================================================================= */}
      <footer className="bg-[#071a33] text-white py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            {/* 3 Trust Badges on Left */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 sm:gap-10 text-xs sm:text-sm font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Trusted by 10,000+ Parents</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Expert Faculty</span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Proven Results</span>
              </div>
            </div>

            {/* Quote on Right */}
            <div className="text-xs sm:text-sm text-slate-300 italic font-medium max-w-md">
              “A small step in the right direction can make a big difference in a child&apos;s future.”
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          CHECKOUT & ENROLLMENT MODAL (Parent-Friendly Interactive Feature)
         ========================================================================= */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-left mb-4">
              <span className="text-[11px] font-black uppercase text-[#1d4ed8] tracking-wider">
                Enroll in Live Exam Batch
              </span>
              <h4 className="text-xl font-black text-[#0c2340] mt-0.5">
                {selectedPlan.name}
              </h4>
              <div className="text-sm font-black text-emerald-600 mt-1">
                {selectedPlan.price}{' '}
                <span className="text-xs font-normal text-slate-500">
                  {selectedPlan.period}
                </span>
              </div>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h5 className="text-lg font-black text-slate-900">
                  Enrollment Successful!
                </h5>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Thank you! Our academic coordinator will contact you on WhatsApp with batch timings and app access credentials.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Aarav Mohanty"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current Class
                    </label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 font-medium bg-white"
                    >
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Entrance Exam
                    </label>
                    <select
                      value={targetExam}
                      onChange={(e) => setTargetExam(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 font-medium bg-white"
                    >
                      <option value="Navodaya Vidyalaya (JNVST)">Navodaya (JNVST)</option>
                      <option value="Adarsh Vidyalaya">Adarsh Vidyalaya</option>
                      <option value="Sainik School">Sainik School</option>
                      <option value="RIMC & Other Sudhralaya Exams">RIMC / Sudhralaya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent WhatsApp / Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Confirm Enrollment ({selectedPlan.price})</span>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Safe &amp; Verified. Instant Receipt &amp; Live Batch Access</span>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
