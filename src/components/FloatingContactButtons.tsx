import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { instituteInfo } from '../data/instituteData';

interface FloatingContactButtonsProps {
  phoneNumber?: string;
  whatsappNumber?: string;
  defaultMessage?: string;
}

export const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({
  phoneNumber = instituteInfo.phoneClean.replace(/\D/g, '') || '9439851521',
  whatsappNumber = instituteInfo.whatsappNumber || '919439851521',
  defaultMessage = 'Hello Kumari Institute, I would like to enquire about Home Tutors and Courses in Rayagada.'
}) => {
  const [hoveredBtn, setHoveredBtn] = useState<'whatsapp' | 'phone' | null>(null);
  const [isModalActive, setIsModalActive] = useState(false);

  // Hide floating action buttons if any popup/dialog is active
  React.useEffect(() => {
    const checkActiveModals = () => {
      if (document.body.classList.contains('modal-open')) {
        setIsModalActive(true);
        return;
      }
      const modalElements = document.querySelectorAll(
        '[role="dialog"], [aria-modal="true"], .modal-overlay, .modal-backdrop'
      );
      if (modalElements.length > 0) {
        setIsModalActive(true);
        return;
      }
      const fixedOverlays = Array.from(document.querySelectorAll('.fixed.inset-0')).filter((el) => {
        if (el.closest('#mobile-bottom-navigation')) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
      setIsModalActive(fixedOverlays.length > 0);
    };

    checkActiveModals();
    const observer = new MutationObserver(() => checkActiveModals());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('modal-state-change', checkActiveModals);
    window.addEventListener('resize', checkActiveModals);

    return () => {
      observer.disconnect();
      window.removeEventListener('modal-state-change', checkActiveModals);
      window.removeEventListener('resize', checkActiveModals);
    };
  }, []);

  if (isModalActive) return null;

  const cleanPhone = phoneNumber.startsWith('+91')
    ? phoneNumber
    : phoneNumber.length === 10
    ? `+91${phoneNumber}`
    : phoneNumber;

  const cleanWhatsApp = whatsappNumber.startsWith('91')
    ? whatsappNumber
    : `91${whatsappNumber.replace(/\D/g, '')}`;

  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(defaultMessage)}`;
  const telUrl = `tel:${cleanPhone}`;

  return (
    <aside
      aria-label="Direct Quick Contact Options"
      className="fixed z-40 right-3.5 sm:right-5 bottom-[74px] lg:bottom-6 flex flex-col items-end gap-3 pointer-events-auto select-none print:hidden transition-all duration-300"
    >
      {/* 1. REALISTIC WHATSAPP FLOATING BUTTON */}
      <div className="relative flex items-center">
        {/* Tooltip on hover */}
        {hoveredBtn === 'whatsapp' && (
          <div
            role="tooltip"
            className="absolute right-full mr-3 hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-slate-700/80 whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-150"
          >
            <span>Chat on WhatsApp (9439851521)</span>
            <div className="w-2 h-2 bg-slate-900 border-t border-r border-slate-700/80 rotate-45 absolute -right-1" />
          </div>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHoveredBtn('whatsapp')}
          onMouseLeave={() => setHoveredBtn(null)}
          aria-label="Chat with Kumari Institute on WhatsApp 9439851521"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[0_8px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_28px_rgba(37,211,102,0.55)] transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300/50"
        >
          {/* Subtle radiating ripple effect */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none opacity-40 group-hover:opacity-70" />

          {/* Authentic WhatsApp SVG Logo */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 fill-white drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>

      {/* 2. REALISTIC PHONE FLOATING BUTTON */}
      <div className="relative flex items-center">
        {/* Tooltip on hover */}
        {hoveredBtn === 'phone' && (
          <div
            role="tooltip"
            className="absolute right-full mr-3 hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-slate-700/80 whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-150"
          >
            <span>Call Helpline (9439851521)</span>
            <div className="w-2 h-2 bg-slate-900 border-t border-r border-slate-700/80 rotate-45 absolute -right-1" />
          </div>
        )}

        <a
          href={telUrl}
          onMouseEnter={() => setHoveredBtn('phone')}
          onMouseLeave={() => setHoveredBtn(null)}
          aria-label="Direct Phone Call to 9439851521"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#0c2340] via-[#0f2e59] to-[#0284c7] text-white shadow-[0_8px_20px_rgba(12,35,64,0.45)] hover:shadow-[0_12px_28px_rgba(2,132,199,0.55)] border border-sky-400/30 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-400/40"
        >
          {/* Pulse ring on phone */}
          <span className="absolute -inset-1 rounded-full bg-sky-500/20 animate-pulse pointer-events-none" />

          <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-sky-200 group-hover:text-white drop-shadow-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        </a>
      </div>
    </aside>
  );
};
