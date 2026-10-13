import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  GraduationCap,
  Users,
  Heart,
  ArrowRight,
  Award,
  Sparkles,
} from 'lucide-react';
import { AdminSuccessStory } from '../types';
import { subscribeToRealtimeSuccessStories } from '../services/firebaseAuth';

interface SuccessStoriesPageProps {
  onNavigateHome: () => void;
  onNavigateAbout: () => void;
  onOpenEnquiry: () => void;
  onOpenDemoBooking?: () => void;
}

export const SuccessStoriesPage: React.FC<SuccessStoriesPageProps> = ({
  onNavigateHome,
  onOpenEnquiry,
}) => {
  const [dynamicStories, setDynamicStories] = useState<AdminSuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Real-time subscription to Firestore collection 'success_stories'
    const unsub = subscribeToRealtimeSuccessStories((stories) => {
      setDynamicStories(stories);
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  const featuredStory = dynamicStories.length > 0 ? dynamicStories[0] : null;
  const gridStories = dynamicStories.length > 1 ? dynamicStories.slice(1) : dynamicStories;

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans selection:bg-amber-200 selection:text-slate-900">
      {/* =========================================================================
          1. HERO SECTION: "Success Stories"
         ========================================================================= */}
      <section className="relative bg-gradient-to-b from-[#eaf4fe] via-[#f4f9ff] to-white pt-6 pb-12 sm:pt-10 sm:pb-16 md:pb-20 overflow-hidden border-b border-blue-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Heading, Subheading, and Description */}
            <div className="lg:col-span-7 text-left">
              {/* Eyebrow in blue script/italic */}
              <p className="text-sm sm:text-base font-semibold text-[#1d4ed8] italic tracking-wide mb-2 select-none">
                Real Students &nbsp;•&nbsp; Real Growth &nbsp;•&nbsp; Bright Futures
              </p>

              {/* Main Heading: "Success Stories" */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                <span className="text-[#0c2340]">Success </span>
                <span className="text-amber-500">Stories</span>
              </h1>

              {/* Secondary Bold Subheading */}
              <h2 className="text-lg sm:text-xl font-bold text-[#0c2340] mt-3 sm:mt-4">
                Every achievement inspires us to do better.
              </h2>

              {/* Descriptive Paragraph */}
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                At Kumari Institute in Rayagada, we believe in nurturing every child's potential. Here are stories of students who dreamed, learned and achieved with our support.
              </p>
            </div>

            {/* Right Column: Hero Graphic */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md flex items-center justify-center">
                <div className="relative z-10 w-10/12 sm:w-11/12 rounded-[32px] overflow-hidden shadow-lg border-4 border-white bg-white">
                  <img
                    src="/images/success/hero_girl.jpg"
                    alt="Student studying with books and notebook at Kumari Institute"
                    className="w-full h-64 sm:h-76 md:h-84 object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Right Whimsical Note */}
                <div className="absolute -right-2 sm:-right-4 top-4 sm:top-6 z-20 flex flex-col items-center select-none pointer-events-none drop-shadow-xs">
                  <span className="font-handwriting text-xl sm:text-2xl md:text-3xl text-[#1e40af] font-bold tracking-wide transform rotate-3 leading-tight text-center">
                    Small steps<br />
                    today,<br />
                    big dreams<br />
                    tomorrow <span className="inline-block text-xl">♡</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FEATURED SUCCESS STORY (Rendered ONLY if genuine story exists in Firestore)
         ========================================================================= */}
      {featuredStory && (
        <section className="py-8 sm:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#fffefc] rounded-3xl p-6 sm:p-8 md:p-10 border border-amber-200/90 shadow-xs relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
                {/* Left Column: Student Portrait */}
                <div className="lg:col-span-3 flex flex-col items-center">
                  <div className="relative w-full max-w-[240px] rounded-2xl overflow-hidden shadow-md border-2 border-white group">
                    <img
                      src={featuredStory.image || '/images/success/hero_girl.jpg'}
                      alt={`${featuredStory.studentName} - Kumari Institute`}
                      className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-11/12 bg-amber-400 text-slate-900 font-black text-xs sm:text-sm py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 shadow-md">
                      <Trophy className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
                      <span>{featuredStory.badge || 'Top Performer'}</span>
                    </div>
                  </div>
                </div>

                {/* Middle Column: Story Content */}
                <div className="lg:col-span-6 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-800 text-xs font-bold mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Featured Success Story</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
                    {featuredStory.studentName}
                  </h3>
                  <div className="mt-1 mb-3 flex items-center gap-2 flex-wrap">
                    {featuredStory.score && (
                      <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {featuredStory.score}
                      </span>
                    )}
                    {featuredStory.exam && (
                      <span className="inline-block px-3 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold">
                        {featuredStory.exam}
                      </span>
                    )}
                  </div>

                  {featuredStory.testimonial && (
                    <div className="my-3">
                      <p className="text-sm sm:text-base italic text-[#1d4ed8] font-semibold leading-relaxed">
                        <span className="text-amber-500 font-serif font-black text-lg not-italic">“ </span>
                        {featuredStory.testimonial}
                        <span className="text-amber-500 font-serif font-black text-lg not-italic"> ”</span>
                      </p>
                    </div>
                  )}

                  {featuredStory.story && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                      {featuredStory.story}
                    </p>
                  )}
                </div>

                {/* Right Column: Parent feedback note */}
                <div className="lg:col-span-3 flex justify-center">
                  <div className="w-full max-w-[260px] bg-[#fef9c3] p-5 sm:p-6 rounded-2xl shadow-sm border border-yellow-200/90 relative transform rotate-1 sm:rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="absolute -top-2.5 right-6 w-12 h-5 bg-amber-200/70 backdrop-blur-xs rounded-xs transform -rotate-6 border border-amber-300/40" />

                    <p className="font-handwriting text-lg sm:text-xl text-[#1e3a8a] font-bold leading-relaxed">
                      “{featuredStory.testimonial || 'Proud of our child\'s consistent growth with Kumari Institute.'}”
                    </p>

                    <p className="mt-4 text-xs font-bold text-amber-800 text-right">
                      — {featuredStory.parentName ? `${featuredStory.parentName}'s Family` : "Parent's Feedback"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. DYNAMIC SUCCESS STORIES GRID (From Firestore Admin Panel)
         ========================================================================= */}
      <section className="py-8 sm:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 sm:w-12 h-1 bg-amber-400 rounded-full" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c2340] tracking-tight">
                Student Achievements &amp; Stories
              </h2>
              <span className="w-8 sm:w-12 h-1 bg-amber-400 rounded-full" />
            </div>
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-normal">
              {dynamicStories.length > 0
                ? 'Inspiring achievements and experiences shared by our students and parents.'
                : 'Success stories and student achievements managed directly in the Admin Panel.'}
            </p>
          </div>

          {dynamicStories.length === 0 ? (
            <div className="bg-[#f8fafc] rounded-3xl p-10 sm:p-14 border border-slate-200 text-center max-w-lg mx-auto shadow-xs space-y-3.5 my-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Success Stories Published Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                All sample and placeholder stories have been removed. Verified student achievements and testimonials can be added directly via the Admin Panel under <strong>Success Stories Collection</strong>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {gridStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-3xl p-6 border border-amber-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between text-left relative overflow-hidden"
                >
                  {story.badge && (
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] flex items-center gap-1 border border-amber-300">
                      <Award className="w-3 h-3 text-amber-700" />
                      <span>{story.badge}</span>
                    </div>
                  )}
                  <div>
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-amber-50 border-2 border-amber-200 shadow-xs mb-4">
                      <img
                        src={story.image || '/images/success/hero_girl.jpg'}
                        alt={story.studentName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <h4 className="text-base font-black text-[#0c2340]">
                      {story.studentName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5 mt-0.5">
                      {story.score && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[11px] rounded-md">
                          {story.score}
                        </span>
                      )}
                      {story.exam && (
                        <span className="text-[11px] text-slate-500 font-medium truncate">
                          {story.exam}
                        </span>
                      )}
                    </div>

                    {story.testimonial && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                        <span className="text-amber-500 font-serif font-bold">“</span>
                        {story.testimonial}
                        <span className="text-amber-500 font-serif font-bold">”</span>
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span>— {story.parentName ? `${story.parentName}'s Family` : "Parent's Feedback"}</span>
                    {story.school && <span className="text-[10px] text-slate-400 truncate max-w-[110px]">{story.school}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. STATS SUMMARY SECTION
         ========================================================================= */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f0f7fe] rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-100/80 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-4 text-left">
                <div className="mb-2">
                  <Trophy className="w-8 h-8 text-amber-500 fill-amber-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
                  Academic Growth &amp; Results
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 mb-4 leading-relaxed font-normal">
                  Our personalized approach delivers consistent progress and concept clarity.
                </p>
                <button
                  type="button"
                  onClick={onOpenEnquiry}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <span>Enquire Today</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">500+</span>
                  <span className="text-xs text-slate-600 font-medium mt-0.5">Learners Guided</span>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">95%</span>
                  <span className="text-xs text-slate-600 font-medium mt-0.5">Score Improvement</span>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">100+</span>
                  <span className="text-xs text-slate-600 font-medium mt-0.5">Top Performers</span>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight">100%</span>
                  <span className="text-xs text-slate-600 font-medium mt-0.5">Parent Dedication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BOTTOM ENROLL CTA
         ========================================================================= */}
      <section className="mt-8 sm:mt-12 bg-[#0c2340] text-white pt-10 pb-8 sm:pt-14 sm:pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start select-none pointer-events-none text-center lg:text-left">
              <span className="font-handwriting text-2xl sm:text-3xl text-white font-bold tracking-wide transform -rotate-3 leading-snug">
                Let's Build<br />
                a Brighter Future Together
              </span>
              <svg className="w-24 sm:w-28 h-4 text-amber-400 mt-1 transform -rotate-3" viewBox="0 0 100 20" fill="none">
                <path d="M5 14 Q 50 3 95 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            <div className="lg:col-span-4 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Give Your Child the Right Guidance
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-6 font-normal">
                Join Kumari Institute today and give your child personalized coaching support.
              </p>
              <button
                type="button"
                id="success-cta-enroll-btn"
                onClick={onOpenEnquiry}
                className="inline-flex items-center gap-2 px-8 sm:px-10 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="lg:col-span-4 relative flex items-center justify-center">
              <div className="relative w-full max-w-[280px]">
                <img
                  src="/images/success/cta_kids.jpg"
                  alt="Happy students of Kumari Institute"
                  className="w-full h-auto object-contain rounded-2xl drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
