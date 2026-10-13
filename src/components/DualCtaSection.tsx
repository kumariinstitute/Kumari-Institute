import React from 'react';
import { Phone, Mail, MapPin, Check, ArrowRight, Sparkles } from 'lucide-react';
import demoStudentImg from '../assets/images/demo_student_1788498834829.jpg';
import { instituteInfo } from '../data/instituteData';

interface DualCtaSectionProps {
  onOpenDemoBooking: () => void;
  onOpenContact: () => void;
}

export const DualCtaSection: React.FC<DualCtaSectionProps> = ({
  onOpenDemoBooking,
  onOpenContact,
}) => {
  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Card - Deep Navy "Book a Free Demo Class" */}
          <div
            id="book-demo-cta-card"
            className="lg:col-span-7 bg-[#0b213f] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Soft background aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10">
              {/* Content left */}
              <div className="sm:col-span-7">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/20 text-blue-200 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free Trial Session</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  Book a Free Demo Class
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  Experience our teaching quality before you decide.
                </p>

                {/* 3 Benefits */}
                <div className="space-y-2.5 mb-8">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>No Obligation</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Meet Our Faculty</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Understand Our Methodology</span>
                  </div>
                </div>

                <button
                  id="cta-book-now-btn"
                  onClick={onOpenDemoBooking}
                  className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#0b213f] font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Student Image right */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-3 border-white/20 shadow-2xl bg-slate-800">
                  <img
                    id="demo-student-photo"
                    src={demoStudentImg}
                    alt="Student studying in demo class"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b213f]/40 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Warm Golden/Yellow "Have Questions?" */}
          <div
            id="have-questions-cta-card"
            className="lg:col-span-5 bg-gradient-to-br from-[#fcd34d] via-[#fbcfe8]/20 to-[#f59e0b] rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg text-slate-900 flex flex-col justify-between border border-amber-300/40 relative overflow-hidden"
          >
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                Have Questions?
              </h3>

              <p className="text-xs sm:text-sm text-slate-800/90 font-medium mb-6 leading-relaxed">
                We're here to help! Talk to our academic experts.
              </p>

              {/* Contact Information */}
              <div className="space-y-4 mb-8">
                <a
                  id="cta-phone-link"
                  href={`tel:${instituteInfo.phoneClean}`}
                  className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#0b213f] transition-colors p-2 rounded-xl hover:bg-white/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>{instituteInfo.phone}</span>
                </a>

                <a
                  id="cta-email-link"
                  href={`mailto:${instituteInfo.email}`}
                  className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#0b213f] transition-colors p-2 rounded-xl hover:bg-white/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{instituteInfo.email}</span>
                </a>

                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-900 p-2 rounded-xl hover:bg-white/30">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>{instituteInfo.address}</span>
                </div>
              </div>
            </div>

            <button
              id="cta-contact-us-btn"
              onClick={onOpenContact}
              className="w-full sm:w-auto self-start px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
