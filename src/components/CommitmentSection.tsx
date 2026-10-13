import React from 'react';
import { Lightbulb, Sparkles, Rocket, HeartHandshake } from 'lucide-react';
import { commitmentPillars } from '../data/instituteData';

export const CommitmentSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-blue-500" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-purple-500" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-rose-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <section id="commitment" className="py-14 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Title */}
          <div className="lg:col-span-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Our Commitment
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a192f] tracking-tight leading-tight">
              We Don't Just Teach, <br />
              <span className="text-[#0f4c81]">We Transform</span>
            </h2>
          </div>

          {/* Right 4 Pillars */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {commitmentPillars.map((pillar, idx) => (
              <div
                key={idx}
                id={`commitment-pillar-${idx}`}
                className="flex flex-col items-start p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-blue-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center mb-3">
                  {getIcon(pillar.icon)}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
