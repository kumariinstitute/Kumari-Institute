import React from 'react';
import { Mail, Phone, Clock } from 'lucide-react';
import { instituteInfo } from '../data/instituteData';

export const TopBar: React.FC = () => {
  return (
    <div id="top-contact-bar" className="bg-[#0b213f] text-slate-200 text-xs sm:text-sm py-2 px-4 sm:px-6 border-b border-slate-800/40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Contact Links */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
          <a
            id="topbar-email-link"
            href={`mailto:${instituteInfo.email}`}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{instituteInfo.email}</span>
          </a>
          <a
            id="topbar-phone-link"
            href={`tel:${instituteInfo.phoneClean}`}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{instituteInfo.phone}</span>
          </a>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center gap-1.5 text-slate-300 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{instituteInfo.hours}</span>
        </div>
      </div>
    </div>
  );
};
