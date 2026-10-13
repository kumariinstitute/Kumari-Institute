import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  User,
  GraduationCap,
  BookOpen,
  Monitor,
  MessageSquare,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Shield,
  Star,
  Clock,
} from 'lucide-react';
import { instituteInfo } from '../data/instituteData';

interface ContactPageProps {
  onNavigateHome: () => void;
  onNavigateAbout: () => void;
  onNavigateSuccess: () => void;
  onOpenEnquiry?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigateHome,
  onOpenEnquiry,
}) => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    studentClass: '',
    program: '',
    preferredMode: '',
    message: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 600);
  };

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans selection:bg-amber-200 selection:text-slate-900">
      {/* =========================================================================
          1. HERO SECTION: "Let's Start Your Child's Learning Journey" + Counseling Visual
         ========================================================================= */}
      <section className="relative bg-gradient-to-b from-[#eef6ff] via-[#f7faff] to-white pt-6 pb-12 sm:pt-10 sm:pb-16 md:pb-20 overflow-hidden border-b border-blue-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Heading, Subheading, and Feature Pills */}
            <div className="lg:col-span-7 text-left">
              {/* Eyebrow with horizontal golden line */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs sm:text-sm font-bold tracking-wider text-[#0c2340] uppercase">
                  CONTACT KUMARI INSTITUTE
                </span>
                <span className="w-10 h-0.5 bg-amber-400 rounded-full" />
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-[#0c2340]">
                Let's Start Your Child's <br className="hidden sm:inline" />
                <span className="text-[#1d4ed8]">Learning Journey</span>
              </h1>

              {/* Subheading */}
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Have questions about courses, batches, home tuition or entrance preparation? Our team is here to guide you.
              </p>

              {/* 3 Quick Value Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                {/* 1. Personal Guidance */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0c2340]">
                    Personal<br className="sm:hidden" /> Guidance
                  </span>
                </div>

                {/* 2. Trusted Institute */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0c2340]">
                    Trusted<br className="sm:hidden" /> Institute
                  </span>
                </div>

                {/* 3. Better Future */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Star className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0c2340]">
                    Better<br className="sm:hidden" /> Future
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Counseling Desk Visual with Doodles */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md flex items-center justify-center">
                {/* Hero Counseling Photo */}
                <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-white">
                  <img
                    src="/images/contact/counseling.jpg"
                    alt="Admission counseling session at Kumari Institute"
                    className="w-full h-64 sm:h-76 md:h-80 object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Overhead Whimsical Note: "Your Child Our Priority ♡" */}
                <div className="absolute -top-6 right-2 sm:-right-2 z-20 select-none pointer-events-none drop-shadow-xs">
                  <span className="font-handwriting text-xl sm:text-2xl md:text-3xl text-[#1e40af] font-bold tracking-wide transform rotate-3 leading-tight block text-center">
                    Your Child<br />
                    Our Priority <span className="inline-block text-xl">♡</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN 2-COLUMN SECTION: Talk to Us (Left) & Send an Enquiry (Right)
         ========================================================================= */}
      <section className="pt-8 sm:pt-12 pb-4 sm:pb-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ----------------- LEFT COLUMN: Talk to Us ----------------- */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#fbfcff] rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs text-left">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0c2340]">
                      Talk to Us
                    </h2>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 font-normal">
                  Get in touch with us through your preferred way.
                </p>

                {/* Contact Option 1: Call Us */}
                <a
                  href={`tel:${instituteInfo.phoneClean}`}
                  className="group block bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0c2340]">Call Us</h3>
                        <p className="text-[11px] text-slate-500">Speak directly with our team</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#1d4ed8] flex items-center justify-center transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </a>

                {/* Contact Option 2: WhatsApp */}
                <a
                  href={`https://wa.me/919437281920?text=${encodeURIComponent(
                    'Hello Kumari Institute, I would like to inquire about courses and admissions.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group block bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <MessageSquare className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0c2340]">WhatsApp</h3>
                        <p className="text-[11px] text-slate-500">Message us for quick enquiry</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </a>

                {/* Contact Option 3: Email */}
                <a
                  href="mailto:info@kumariinstitute.in"
                  className="group block bg-white rounded-2xl p-4 mb-6 border border-slate-100 shadow-2xs hover:shadow-md hover:border-amber-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0c2340]">Email</h3>
                        <p className="text-[11px] text-slate-500">Send us your queries anytime</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-amber-50 text-slate-400 group-hover:text-amber-600 flex items-center justify-center transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </a>

                {/* Timings & Address Summary */}
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-[#1d4ed8] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0c2340] uppercase tracking-wide">
                        Counseling Timings
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        <span className="font-semibold text-slate-800">Mon – Sat:</span> 8:00 AM – 8:00 PM
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">Sunday:</span> 9:00 AM – 1:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0c2340] uppercase tracking-wide">
                        Indira Nagar Center
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Indira Nagar, Rayagada, Odisha 765001
                      </p>
                      <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                        Parent walk-ins welcome
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------- RIGHT COLUMN: Send an Enquiry Form ----------------- */}
            <div id="enquiry-form-container" className="lg:col-span-7">
              <div className="bg-[#fbfcff] rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs text-left">
                {/* Form Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0c2340]">
                      Send an Enquiry
                    </h2>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 font-normal">
                  Fill in the details below and we'll get back to you shortly.
                </p>

                {formSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0c2340]">
                      Thank You, {formData.name || 'Parent'}!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-4">
                      Your enquiry has been received successfully. Our counselor in Indira Nagar will call you shortly on{' '}
                      <span className="font-bold text-slate-900">{formData.phone}</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({
                          name: '',
                          phone: '',
                          studentClass: '',
                          program: '',
                          preferredMode: '',
                          message: '',
                        });
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1: Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Parent / Student Name */}
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-bold text-[#0c2340] mb-1.5"
                        >
                          Parent / Student Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            id="contact-name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your name"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="block text-xs font-bold text-[#0c2340] mb-1.5"
                        >
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            type="tel"
                            id="contact-phone"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 Enter mobile number"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Student's Class & Interested Program */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Student's Class */}
                      <div>
                        <label
                          htmlFor="contact-class"
                          className="block text-xs font-bold text-[#0c2340] mb-1.5"
                        >
                          Student's Class <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <select
                            id="contact-class"
                            required
                            value={formData.studentClass}
                            onChange={(e) =>
                              setFormData({ ...formData, studentClass: e.target.value })
                            }
                            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs appearance-none cursor-pointer"
                          >
                            <option value="">Select class</option>
                            <option value="1st to 5th Standard">1st to 5th Standard</option>
                            <option value="6th to 8th Standard">6th to 8th Standard</option>
                            <option value="9th & 10th Standard">9th & 10th Standard (High School)</option>
                            <option value="11th & 12th Standard">11th & 12th (Higher Secondary Science)</option>
                            <option value="Navodaya / Adarsh Aspirant">Navodaya / Adarsh Aspirant</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Interested Program */}
                      <div>
                        <label
                          htmlFor="contact-program"
                          className="block text-xs font-bold text-[#0c2340] mb-1.5"
                        >
                          Interested Program <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <select
                            id="contact-program"
                            required
                            value={formData.program}
                            onChange={(e) =>
                              setFormData({ ...formData, program: e.target.value })
                            }
                            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs appearance-none cursor-pointer"
                          >
                            <option value="">Select program</option>
                            <option value="Home Tuition (1st - 5th)">Home Tuition (1st - 5th)</option>
                            <option value="Navodaya & Adarsh Preparation">Navodaya & Adarsh Vidyalaya Prep</option>
                            <option value="Offline Classes (6th - 10th)">Offline Classes (6th - 10th)</option>
                            <option value="Higher Secondary (11th - 12th)">Higher Secondary (11th - 12th)</option>
                            <option value="Math & Science Concept Batch">Math & Science Concept Batch</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Preferred Mode */}
                    <div>
                      <label
                        htmlFor="contact-mode"
                        className="block text-xs font-bold text-[#0c2340] mb-1.5"
                      >
                        Preferred Mode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Monitor className="w-4 h-4" />
                        </div>
                        <select
                          id="contact-mode"
                          required
                          value={formData.preferredMode}
                          onChange={(e) =>
                            setFormData({ ...formData, preferredMode: e.target.value })
                          }
                          className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs appearance-none cursor-pointer"
                        >
                          <option value="">Select mode</option>
                          <option value="Offline Classroom (Indira Nagar Center)">
                            Offline Classroom (Indira Nagar Center)
                          </option>
                          <option value="Home Tuition (Teacher visits home)">
                            Home Tuition (Teacher visits home)
                          </option>
                          <option value="Small Group Coaching (Max 10 Students)">
                            Small Group Coaching (Max 10 Students)
                          </option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Message */}
                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-bold text-[#0c2340] mb-1.5"
                      >
                        Message
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <textarea
                          id="contact-message"
                          rows={3}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          placeholder="Tell us about your query..."
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        id="contact-submit-btn"
                        className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-sm shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-75"
                      >
                        <Send className="w-4 h-4 -rotate-12" />
                        <span>{isSubmitting ? 'Sending Enquiry...' : 'Send Enquiry'}</span>
                      </button>
                      <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">
                        We'll get back to you shortly.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. VISIT OUR INSTITUTE (MAP SECTION) - After Send an Enquiry
         ========================================================================= */}
      <section className="py-2 sm:py-3 bg-gradient-to-b from-white via-[#f7faff] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fbfcff] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200/90 shadow-xs">
            {/* Header */}
            <div className="mb-3 sm:mb-4 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold tracking-wider text-[#1d4ed8] uppercase">
                  OUR CAMPUS LOCATION
                </span>
                <span className="w-8 h-0.5 bg-amber-400 rounded-full" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0c2340]">
                  Visit Our Institute
                </h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
                Indira Nagar, Rayagada, Odisha 765001. We welcome parents and students for in-person counseling, faculty interactions, and batch enrollment.
              </p>
            </div>

            {/* Embedded Google Maps iFrame */}
            <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.479881404528!2d83.41843217384886!3d19.174231482050615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3b45414eeb8b7f%3A0xe346c93159c30ba1!2sKumari%20Institute!5e0!3m2!1sen!2sin!4v1788781648628!5m2!1sen!2sin"
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Kumari Institute Map"
                className="w-full h-48 sm:h-60 md:h-[360px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. "WHAT HAPPENS NEXT?" 3-STEP PROCESS SECTION
         ========================================================================= */}
      <section className="pt-2 pb-8 sm:pt-4 sm:pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fffefb] rounded-3xl p-6 sm:p-8 md:p-10 border border-amber-200/90 shadow-xs">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2 text-left">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0c2340]">
                  What Happens Next?
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 text-left mb-8 font-normal">
              It's simple. Just a few steps and your child's journey begins.
            </p>

            {/* 3 Steps Row with Connectors */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* Step 1 */}
              <div className="md:col-span-3 flex items-start gap-3.5 text-left">
                <div className="w-10 h-10 rounded-full bg-[#0c2340] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0c2340]">
                    Submit Enquiry
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Fill in the form or contact us via phone / WhatsApp.
                  </p>
                </div>
              </div>

              {/* Connector Arrow 1 */}
              <div className="hidden md:flex md:col-span-1 justify-center text-slate-300">
                <ArrowRight className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Step 2 */}
              <div className="md:col-span-3 flex items-start gap-3.5 text-left">
                <div className="w-10 h-10 rounded-full bg-[#0c2340] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0c2340]">
                    Talk to Our Team
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    We'll understand your needs and suggest the best option.
                  </p>
                </div>
              </div>

              {/* Connector Arrow 2 */}
              <div className="hidden md:flex md:col-span-1 justify-center text-slate-300">
                <ArrowRight className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Step 3 */}
              <div className="md:col-span-3 flex items-start gap-3.5 text-left">
                <div className="w-10 h-10 rounded-full bg-[#0c2340] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0c2340]">
                    Choose the Right Class/Batch
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Start your child's learning journey with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

