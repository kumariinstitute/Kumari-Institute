import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { instituteInfo } from '../data/instituteData';

interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateTutors?: () => void;
  onNavigateAbout?: () => void;
  onNavigateSuccess?: () => void;
  onNavigateGallery?: () => void;
  onNavigateContact?: () => void;
  onOpenEnquiry?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateTutors,
  onNavigateAbout,
  onNavigateSuccess,
  onNavigateGallery,
  onNavigateContact,
  onOpenEnquiry,
}) => {
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSub.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmailSub('');
    }, 4000);
  };

  const handleNav = (target: 'home' | 'tutors' | 'courses' | 'about' | 'success' | 'gallery' | 'contact') => {
    if (target === 'home') {
      if (onNavigateHome) onNavigateHome();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'tutors') {
      if (onNavigateTutors) onNavigateTutors();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'courses') {
      if (onNavigateHome) onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById('programs');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 600, behavior: 'smooth' });
      }, 100);
    } else if (target === 'about') {
      if (onNavigateAbout) onNavigateAbout();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'success') {
      if (onNavigateSuccess) onNavigateSuccess();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'gallery') {
      if (onNavigateGallery) onNavigateGallery();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'contact') {
      if (onNavigateContact) onNavigateContact();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-[#08182b] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4">
            <div className="mb-4">
              <button
                type="button"
                onClick={() => handleNav('home')}
                className="inline-block text-left cursor-pointer focus:outline-none p-0 m-0"
              >
                <img
                  src="/Logo/kumarilogo.png"
                  alt="Kumari Institute Logo"
                  className="h-16 sm:h-20 w-auto max-w-[260px] object-contain p-[3px] hover:scale-105 transition-transform duration-200"
                  style={{ padding: '3px' }}
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              Empowering young minds with conceptual clarity, personalized mentoring, and dedicated faculty support from primary schooling to competitive exam triumphs in Indira Nagar, Rayagada.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{instituteInfo.hours}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('tutors')}
                  className="hover:text-amber-400 text-blue-300 font-semibold transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>Find Home Tutors</span>
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">New</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('courses')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  All Courses
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('about')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('success')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Success Stories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('gallery')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Programs */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Our Programs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li
                onClick={onOpenEnquiry}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Home Tuition (Class 1 to 5)
              </li>
              <li
                onClick={onOpenEnquiry}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Navodaya &amp; Adarsh Vidyalaya Prep
              </li>
              <li
                onClick={onOpenEnquiry}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Offline Classes (Class 6 to 10)
              </li>
              <li
                onClick={onOpenEnquiry}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Higher Secondary (Class 11 &amp; 12)
              </li>
              <li
                onClick={onOpenEnquiry}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Math &amp; Science Concept Batch
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Stay Informed
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Subscribe to exam alerts, revision notes, and free scholarship test updates.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you! We will share updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2 mb-4">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter parent or student email"
                    value={emailSub}
                    onChange={(e) => setEmailSub(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`tel:${instituteInfo.phoneClean}`} className="hover:text-white">
                  {instituteInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`mailto:${instituteInfo.email}`} className="hover:text-white">
                  {instituteInfo.email}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{instituteInfo.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Kumari Institute. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Student Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
