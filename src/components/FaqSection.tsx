import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'booking' | 'payment' | 'classes' | 'security';
  question: string;
  answer: string;
  highlight?: string;
  steps?: string[];
}

interface FaqSectionProps {
  onOpenDemoBooking?: () => void;
  onOpenEnquiry?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  onOpenDemoBooking,
  onOpenEnquiry,
}) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'booking',
      question: 'How do I book a verified home or online tutor for my child?',
      answer: 'Booking a tutor with Kumari Home Tuition is quick, verified, and personalized:',
      steps: [
        'Step 1: Submit your requirement or click "Book Free Demo" with your child’s grade, subject, syllabus, and preferred location.',
        'Step 2: Our academic coordinator matches you with 2–3 thoroughly verified and background-checked expert tutors in your area.',
        'Step 3: Schedule a convenient free 1-on-1 demo trial class at your home or online to experience the teaching quality firsthand.',
        'Step 4: Once you and your child are 100% satisfied, finalize the monthly tuition schedule and commence regular sessions.'
      ],
      highlight: 'Free trial demo included before any commitment!'
    },
    {
      id: 'faq-2',
      category: 'booking',
      question: 'Is the initial demo trial class completely free?',
      answer: 'Yes! We provide a free 1-on-1 demo trial session for your child. This allows both the student and parents to assess the tutor’s communication style, pedagogical approach, and subject expertise without paying anything upfront.',
      highlight: 'Zero upfront commitment for the demo session.'
    },
    {
      id: 'faq-3',
      category: 'payment',
      question: 'How does the payment and fee structure work?',
      answer: 'We maintain complete transparency with no hidden fees or surprise charges:',
      steps: [
        'Pay monthly tuition directly through our secure institute payment channel (UPI, Net Banking, Credit/Debit card).',
        'Transparent hourly or monthly package rates tailored to class level (Class 1–12, ICSE/CBSE/State, or Navodaya/Sainik School Prep).',
        'Official digital payment receipts and attendance vouchers are instantly generated for complete peace of mind.',
        'No advance full-year lock-ins; payments are simple and monthly.'
      ],
      highlight: 'Transparent pricing with official receipts.'
    },
    {
      id: 'faq-4',
      category: 'booking',
      question: 'What if we are not satisfied with the assigned tutor?',
      answer: 'Your child’s learning comfort and academic improvement are our highest priorities. If you feel the assigned teacher does not match your child’s pace or personality, inform our support coordinator immediately. We provide free tutor replacement within 24–48 hours at zero additional cost.',
      highlight: '100% Free Tutor Replacement Guarantee.'
    },
    {
      id: 'faq-5',
      category: 'payment',
      question: 'Are online payment methods safe and when is the tuition fee due?',
      answer: 'Tuition fees are due at the start of each monthly billing cycle after your successful demo confirmation. We use bank-grade 256-bit encrypted payment gateways supporting Google Pay, PhonePe, Paytm, all UPI apps, Net Banking, and cards. You can view payment receipts and fee histories directly in your parent dashboard.',
      highlight: 'Bank-grade encrypted payments & instant digital receipts.'
    },
    {
      id: 'faq-6',
      category: 'classes',
      question: 'How are tutors vetted and verified before visiting our home?',
      answer: 'Every tutor undergoes a stringent multi-tier onboarding verification process:',
      steps: [
        'Document and government ID proof verification (Aadhaar/PAN/Voter ID).',
        'Educational degree and academic certificate authenticity validation.',
        'Subject matter demonstration and pedagogical interview with senior educators.',
        'Background and address cross-verification for family security.'
      ],
      highlight: 'Strict 4-step background & credential verification.'
    },
    {
      id: 'faq-7',
      category: 'classes',
      question: 'Can we adjust class timings or reschedule missed sessions?',
      answer: 'Yes, our home and online tutoring schedules are highly flexible. If your child has school exams, events, or is unwell, you can coordinate with your dedicated tutor in advance to reschedule missed classes at a mutually convenient date and time.',
      highlight: 'Flexible class scheduling & easy makeup sessions.'
    },
    {
      id: 'faq-8',
      category: 'payment',
      question: 'Is there a refund policy if classes are discontinued mid-month?',
      answer: 'In the rare event you need to pause or discontinue lessons due to relocation or medical reasons, unused prepaid session balances are prorated and refunded as per our transparent policy, or can be retained as credits for subsequent months.',
      highlight: 'Fair prorated refund and pause policy.'
    }
  ];

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <section
      id="faq-section"
      className="py-14 sm:py-20 bg-gradient-to-b from-white via-sky-50/40 to-slate-50 relative overflow-hidden border-t border-slate-100"
    >
      {/* Soft background accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-100/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-3 shadow-xs">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#03132B] tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600">Questions</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Everything new parents need to know about our home & online tutor booking, free trial demo, flexible schedules, and secure payment procedures.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 sm:space-y-3.5">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-blue-300 shadow-md ring-1 ring-blue-100'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-4 sm:px-6 py-4 sm:py-4.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Q
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-blue-50 text-blue-600 rotate-180'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    <p className="mt-1">{faq.answer}</p>

                    {faq.steps && (
                      <ul className="mt-3 space-y-1.5 pl-1">
                        {faq.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {faq.highlight && (
                      <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{faq.highlight}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA Banner */}
        <div className="mt-10 sm:mt-12 bg-gradient-to-r from-[#03132B] via-[#082245] to-[#041938] rounded-2xl p-6 sm:p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-blue-900/40">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-lg sm:text-xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <PhoneCall className="w-5 h-5 text-amber-400" />
              <span>Still have specific questions about tuition or fees?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our academic counselors are available to guide you, answer questions regarding home visits, syllabus matching, or process your free demo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            {onOpenDemoBooking && (
              <button
                type="button"
                onClick={onOpenDemoBooking}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer text-center"
              >
                Book Free Demo Trial
              </button>
            )}
            {onOpenEnquiry && (
              <button
                type="button"
                onClick={onOpenEnquiry}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer text-center"
              >
                Request Callback
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
