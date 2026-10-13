import React from 'react';
import { Phone, MessageCircle, Sparkles } from 'lucide-react';
import { instituteInfo } from '../data/instituteData';

interface MobileQuickBarProps {
  onOpenDemoBooking: () => void;
}

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({ onOpenDemoBooking }) => {
  return (
    <div
      id="mobile-quick-action-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-3 shadow-2xl flex items-center justify-between gap-2"
    >
      {/* Call Button */}
      <a
        id="mobile-action-call"
        href={`tel:${instituteInfo.phoneClean}`}
        className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 active:bg-slate-100 transition-colors shadow-2xs"
      >
        <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>Call</span>
      </a>

      {/* WhatsApp Button */}
      <a
        id="mobile-action-whatsapp"
        href={`https://wa.me/${instituteInfo.whatsappNumber}?text=Hello%20BrightPath%20Institute%2C%20I%20would%20like%20to%20know%20more%20about%20your%20courses.`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:bg-emerald-700 transition-colors shadow-2xs"
      >
        <MessageCircle className="w-3.5 h-3.5 shrink-0 fill-white" />
        <span>WhatsApp</span>
      </a>

      {/* Free Demo Class */}
      <button
        id="mobile-action-demo"
        onClick={onOpenDemoBooking}
        className="flex-1 py-2.5 rounded-xl bg-[#0b213f] text-white font-bold text-xs flex items-center justify-center gap-1.5 active:bg-slate-900 transition-colors shadow-2xs cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Book Demo</span>
      </button>
    </div>
  );
};
