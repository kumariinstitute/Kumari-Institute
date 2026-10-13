import React from 'react';
import { Smile, Users, ShieldCheck, Award } from 'lucide-react';
import { statsData } from '../data/instituteData';

export const StatsRibbon: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smile':
        return <Smile className="w-8 h-8 sm:w-9 sm:h-9 text-blue-300" />;
      case 'Users':
        return <Users className="w-8 h-8 sm:w-9 sm:h-9 text-amber-300" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-300" />;
      case 'Award':
        return <Award className="w-8 h-8 sm:w-9 sm:h-9 text-yellow-300" />;
      default:
        return <Award className="w-8 h-8 sm:w-9 sm:h-9 text-white" />;
    }
  };

  return (
    <section id="faculty-stats" className="bg-[#0b213f] text-white py-10 sm:py-14 lg:py-16 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Modern symmetrical responsive grid: 2 cols on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {statsData.map((stat) => (
            <div
              key={stat.id}
              id={`stat-card-${stat.id}`}
              className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center backdrop-blur-xs transition-all duration-300 group shadow-sm"
            >
              <div className="mb-2.5 sm:mb-3.5 p-2.5 sm:p-3 rounded-xl bg-white/10 border border-white/15 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {getIcon(stat.icon)}
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-[11px] sm:text-xs md:text-sm font-semibold text-blue-200/90 tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
