import React from 'react';
import { X, Trophy, Award, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { toppersList, resultHighlights } from '../data/instituteData';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookDemo: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  onBookDemo
}) => {
  // Ensure bottom navigation bar is hidden while modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      window.dispatchEvent(new Event('modal-state-change'));
      return () => {
        document.body.classList.remove('modal-open');
        window.dispatchEvent(new Event('modal-state-change'));
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="results-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 sm:p-8 relative">
          <button
            id="close-results-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <img
              src="/Logo/kumarilogo.png"
              alt="Kumari Institute"
              className="h-10 sm:h-12 w-auto max-w-[170px] object-contain p-[3px]"
              style={{ padding: '3px' }}
              referrerPolicy="no-referrer"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Trophy className="w-4 h-4" />
              <span>Hall of Fame &amp; Academic Excellence</span>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Our Proud Achievers
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Celebrating consistent excellence across CBSE, ICSE, State Boards, and National Competitive Exams.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Key Overall Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {resultHighlights.map((stat) => (
              <div
                key={stat.id}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center"
              >
                <div className="text-3xl font-black text-amber-600 mb-1">
                  {stat.percentageOrCount}
                </div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Toppers Cards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Recent Top Performers</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toppersList.map((topper, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0b213f] text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h5 className="text-sm font-bold text-slate-900 truncate">
                        {topper.name}
                      </h5>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {topper.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-blue-700">
                      {topper.exam} • <span className="font-bold text-amber-600">{topper.score}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {topper.school}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 text-center sm:text-left">
            Give your child the BrightPath advantage. Start with a free assessment session.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookDemo();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#0b213f] hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              Book Free Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
