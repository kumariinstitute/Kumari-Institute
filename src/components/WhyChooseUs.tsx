import React from 'react';
import {
  GraduationCap,
  Users2,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { whyChooseData } from '../data/instituteData';

export const WhyChooseUs: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6" />;
      case 'Users2':
        return <Users2 className="w-6 h-6" />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="w-6 h-6" />;
      case 'FileText':
        return <FileText className="w-6 h-6" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <section id="why-us" className="py-16 md:py-24 bg-slate-50/50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div
            id="why-us-tag"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 mb-3"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Why Choose Us?</span>
          </div>

          <h2
            id="why-us-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a192f] tracking-tight mb-4"
          >
            Guidance You Can Trust, Results You Can See
          </h2>

          <p
            id="why-us-subheading"
            className="text-base sm:text-lg text-slate-600 leading-relaxed"
          >
            A proven pedagogy that balances conceptual depth, regular testing, and personalized mentoring.
          </p>
        </div>

        {/* 5 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
          {whyChooseData.map((item) => (
            <div
              key={item.id}
              id={`why-card-${item.id}`}
              className="bg-white rounded-2xl p-6 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-1"
            >
              {/* Circular Icon with tinted background */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 border transition-transform duration-300 group-hover:scale-110 ${item.bgClass} ${item.colorClass}`}
              >
                {getIcon(item.icon)}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
