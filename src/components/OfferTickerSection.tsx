import React, { useState, useEffect } from 'react';
import {
  Tag,
  Sparkles,
  ChevronRight,
  ExternalLink,
  X,
  Flame,
  Calendar,
  Clock
} from 'lucide-react';
import { OfferItem, subscribeToActiveOffers } from '../services/offerService';

interface OfferTickerSectionProps {
  onOpenDemoBooking?: () => void;
  onOpenEnquiry?: () => void;
  onNavigateTutors?: () => void;
  onNavigateCourses?: () => void;
}

export const OfferTickerSection: React.FC<OfferTickerSectionProps> = ({
  onOpenDemoBooking,
  onOpenEnquiry,
  onNavigateTutors,
  onNavigateCourses
}) => {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<OfferItem | null>(null);

  useEffect(() => {
    const unsub = subscribeToActiveOffers((activeList) => {
      setOffers(activeList);
    });
    return () => unsub();
  }, []);

  if (offers.length === 0) return null;

  const handleOfferClick = (offer: OfferItem) => {
    if (offer.actionType === 'demo' && onOpenDemoBooking) {
      onOpenDemoBooking();
    } else if (offer.actionType === 'enquiry' && onOpenEnquiry) {
      onOpenEnquiry();
    } else if (offer.actionType === 'tutors' && onNavigateTutors) {
      onNavigateTutors();
    } else if (offer.actionType === 'courses' && onNavigateCourses) {
      onNavigateCourses();
    } else {
      setSelectedOffer(offer);
    }
  };

  return (
    <>
      {/* =========================================================================
          OFFER TICKER BAR - Exact Reference Style (Directly below Top Nav Bar)
          - Golden border top and bottom as requested
          - Decreased height: sleek, compact, highly legible
          - Left: Striking "OFFERS" badge with dot and megaphone icon
          - Right: Continually moving text with HTML marquee tag (pause on hover/touch)
          - Synced with Cloud Firestore with automated expiry cleanup
         ========================================================================= */}
      <aside
        id="navbar-offers-ticker"
        aria-label="Latest Offers and Announcements"
        className="w-full bg-[#03132B] relative z-30 select-none overflow-hidden m-0 p-0"
        style={{
          background: 'linear-gradient(to right, #020e20 0%, #061B38 50%, #03132B 100%)',
          borderTop: '0.5px solid rgba(245, 186, 66, 0.75)',
          borderBottom: '0.5px solid rgba(245, 186, 66, 0.75)'
        }}
      >
        <div className="w-full flex items-center h-7 sm:h-8 p-0 m-0">
          
          {/* Left: Full-Height Solid Orange/Golden Block matching reference image (dot + megaphone + OFFERS) */}
          <div className="h-full bg-gradient-to-r from-[#F59E0B] via-[#F5BA42] to-[#F59E0B] px-2.5 sm:px-3.5 flex items-center gap-1.5 sm:gap-2 shrink-0 select-none shadow-xs">
            {/* Black Dot */}
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-950 shrink-0" />
            
            {/* Megaphone Icon from reference image */}
            <svg
              className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-950 shrink-0 stroke-[2.4]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 11 18-5v12L3 14v-3z" />
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>

            {/* OFFERS Text in bold uppercase */}
            <span className="font-black text-slate-950 text-[10px] sm:text-[11px] tracking-wider uppercase">
              OFFERS
            </span>
          </div>

          {/* Continuous Moving Marquee Container - Never Blank, Endless Stream */}
          <div className="flex-1 overflow-hidden relative leading-none px-2 sm:px-3 py-0.5">
            <div className="animate-ticker-seamless cursor-pointer py-0.5">
              {/* Loop 1: Repeated offers to guarantee continuous stream across any screen width */}
              {[...offers, ...offers].map((offer, idx) => (
                <span
                  key={`loop-1-${offer.id || idx}-${idx}`}
                  onClick={() => handleOfferClick(offer)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 hover:text-amber-300 transition-colors cursor-pointer group whitespace-nowrap mr-6 sm:mr-8 shrink-0 text-[10.5px] sm:text-[11.5px]"
                >
                  {offer.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide shadow-xs inline-flex items-center justify-center leading-none">
                      {offer.badge}
                    </span>
                  )}
                  <span className="font-medium sm:font-semibold text-white/95 group-hover:underline underline-offset-2 text-[10.5px] sm:text-[11.5px]">
                    {offer.title}
                  </span>
                  {offer.expiryDate && (
                    <span className="text-[8.5px] sm:text-[9px] text-amber-300/80 font-mono hidden sm:inline">
                      (Valid till {offer.expiryDate})
                    </span>
                  )}
                  <span className="text-amber-400 text-[9px] sm:text-[10px] font-black ml-1 select-none">
                    ✦
                  </span>
                </span>
              ))}

              {/* Loop 2: Identical twin clone seamlessly following Loop 1 (at -50% translateX it loops seamlessly) */}
              {[...offers, ...offers].map((offer, idx) => (
                <span
                  key={`loop-2-${offer.id || idx}-${idx}`}
                  onClick={() => handleOfferClick(offer)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 hover:text-amber-300 transition-colors cursor-pointer group whitespace-nowrap mr-6 sm:mr-8 shrink-0 text-[10.5px] sm:text-[11.5px]"
                >
                  {offer.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide shadow-xs inline-flex items-center justify-center leading-none">
                      {offer.badge}
                    </span>
                  )}
                  <span className="font-medium sm:font-semibold text-white/95 group-hover:underline underline-offset-2 text-[10.5px] sm:text-[11.5px]">
                    {offer.title}
                  </span>
                  {offer.expiryDate && (
                    <span className="text-[8.5px] sm:text-[9px] text-amber-300/80 font-mono hidden sm:inline">
                      (Valid till {offer.expiryDate})
                    </span>
                  )}
                  <span className="text-amber-400 text-[9px] sm:text-[10px] font-black ml-1 select-none">
                    ✦
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Right: Quick action icon button on mobile & desktop */}
          <div className="shrink-0 pr-2 sm:pr-3 hidden xs:flex items-center">
            <button
              type="button"
              onClick={() => {
                if (offers[0]) handleOfferClick(offers[0]);
              }}
              className="px-1.5 py-0.5 rounded-md bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/30 text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
              title="View Offer Details"
            >
              <span>View</span>
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>

        </div>
      </aside>

      {/* =========================================================================
          OFFER DETAILS LIGHTBOX (When clicked on marquee item)
         ========================================================================= */}
      {selectedOffer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-slate-900 rounded-3xl max-w-md w-full border border-amber-500/40 p-6 text-white shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setSelectedOffer(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                {selectedOffer.badge || 'SPECIAL OFFER'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Valid till {selectedOffer.expiryDate}</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {selectedOffer.title}
            </h3>

            {selectedOffer.description && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                {selectedOffer.description}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const o = selectedOffer;
                  setSelectedOffer(null);
                  if (o.actionType === 'demo' && onOpenDemoBooking) onOpenDemoBooking();
                  else if (o.actionType === 'tutors' && onNavigateTutors) onNavigateTutors();
                  else if (o.actionType === 'courses' && onNavigateCourses) onNavigateCourses();
                  else if (onOpenEnquiry) onOpenEnquiry();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-amber-500/20"
              >
                Claim This Offer Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
