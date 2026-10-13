import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Users,
  Monitor,
  Building2,
  ArrowRight,
  User,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';

import { subscribeToRealtimeGallery, AdminGalleryItem } from '../services/firebaseAuth';

interface GalleryPageProps {
  onOpenEnquiry?: () => void;
  onOpenDemoBooking?: () => void;
}

type GalleryCategory = 'all' | 'students' | 'classrooms' | 'building';

interface GalleryItem {
  id: string;
  category: 'students' | 'classrooms' | 'building';
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  iconType: 'user' | 'users' | 'screen' | 'building';
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  onOpenEnquiry,
  onOpenDemoBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [dynamicItems, setDynamicItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    // Real-time listener for Firestore collection 'gallery'
    const unsub = subscribeToRealtimeGallery((items) => {
      const mapped: GalleryItem[] = items.map((item) => ({
        id: item.id,
        category: (item.category === 'events' ? 'students' : item.category) as any,
        title: item.title,
        subtitle: item.subtitle || '',
        image: item.image,
        alt: item.alt || item.title,
        iconType: (item.category === 'building' ? 'building' : item.category === 'classrooms' ? 'screen' : 'user') as any
      }));
      setDynamicItems(mapped);
    });

    return () => unsub();
  }, []);

  const galleryItems = useMemo(() => {
    if (activeCategory === 'all') return dynamicItems;
    return dynamicItems.filter((it) => it.category === activeCategory);
  }, [dynamicItems, activeCategory]);

  const handleOpenLightbox = (id: string) => {
    const idx = galleryItems.findIndex((item) => item.id === id);
    if (idx !== -1) {
      setActiveLightboxIndex(idx);
    }
  };

  const handleNextLightbox = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((prev) =>
        prev === null ? 0 : (prev + 1) % galleryItems.length
      );
    }
  };

  const handlePrevLightbox = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((prev) =>
        prev === null ? 0 : (prev - 1 + galleryItems.length) % galleryItems.length
      );
    }
  };

  return (
    <div className="bg-[#fbfcff] min-h-screen text-slate-800 font-sans selection:bg-amber-200 selection:text-slate-900">
      {/* =========================================================================
          1. HERO SECTION: "Moments That Inspire Learning"
         ========================================================================= */}
      <section className="relative bg-gradient-to-b from-[#eaf3fc] via-[#f4f8fe] to-[#fbfcff] pt-8 sm:pt-12 pb-10 sm:pb-14 overflow-hidden border-b border-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-4">
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs sm:text-sm font-black tracking-wider text-[#0c2340] uppercase">
                  OUR GALLERY
                </span>
                <span className="w-8 h-0.5 bg-amber-400 rounded-full inline-block"></span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-[#0c2340] leading-[1.15] tracking-tight">
                Moments That<br />
                Inspire{' '}
                <span className="text-[#f59e0b]">Learning</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed font-normal">
                A glimpse into our vibrant learning environment, activities and the joyful journey of our students.
              </p>
            </div>

            {/* Right Image Column with Doodle Sunburst */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative max-w-[420px] w-full">
                {/* Yellow burst rays doodle accent overhead */}
                <div className="absolute -top-6 left-6 z-10 select-none pointer-events-none">
                  <svg
                    className="w-12 h-12 text-amber-400"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 28L4 24"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M18 16L12 8"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M30 14L34 6"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M38 24L46 22"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Main Hero Student Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-lg border-2 border-white bg-white/80">
                  <img
                    src="/src/assets/images/gallery_student_hero_1788780817013.jpg"
                    alt="Kumari Institute Student studying attentively"
                    className="w-full h-auto object-cover object-center max-h-[340px] sm:max-h-[380px]"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle gradient vignette at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CATEGORY FILTER TABS ROW
         ========================================================================= */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
            {/* 1. All Photos */}
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                activeCategory === 'all'
                  ? 'bg-[#0c2340] text-white shadow-sm'
                  : 'bg-[#eef6ff] text-[#0c2340] hover:bg-blue-100/80'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>All Photos</span>
            </button>

            {/* 2. Students */}
            <button
              type="button"
              onClick={() => setActiveCategory('students')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                activeCategory === 'students'
                  ? 'bg-[#0c2340] text-white shadow-sm'
                  : 'bg-[#eef6ff] text-[#0c2340] hover:bg-blue-100/80'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
            </button>

            {/* 3. Classrooms */}
            <button
              type="button"
              onClick={() => setActiveCategory('classrooms')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                activeCategory === 'classrooms'
                  ? 'bg-[#0c2340] text-white shadow-sm'
                  : 'bg-[#eef6ff] text-[#0c2340] hover:bg-blue-100/80'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Classrooms</span>
            </button>

            {/* 4. Building */}
            <button
              type="button"
              onClick={() => setActiveCategory('building')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                activeCategory === 'building'
                  ? 'bg-[#0c2340] text-white shadow-sm'
                  : 'bg-[#eef6ff] text-[#0c2340] hover:bg-blue-100/80'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Building</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. GALLERY SECTIONS CONTAINER
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-12">
        {galleryItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center max-w-lg mx-auto shadow-xs space-y-3.5 my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center mx-auto shadow-2xs">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Gallery Photos Yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Campus photos, classroom views, and student moments can be added and managed in the Admin Panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenLightbox(item.id)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-[#0c2340] rounded-full p-2 shadow-md">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="p-3.5 sm:p-4 bg-white flex items-center gap-2.5 text-left border-t border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1d4ed8] flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-[#0c2340] block truncate">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="text-[11px] text-slate-500 block truncate">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            4. BOTTOM CTA BANNER: "Experience the difference"
           ========================================================================= */}
        <div className="relative bg-gradient-to-r from-[#0c2340] via-[#0f2d52] to-[#0a1c33] rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-md">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-blue-600/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Slogan with Doodle */}
            <div className="lg:col-span-5 text-left flex flex-col items-start justify-center">
              {/* Yellow burst rays doodle */}
              <div className="mb-2 select-none pointer-events-none">
                <svg
                  className="w-8 h-8 text-amber-400"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 22L4 18"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 12L8 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M24 10L28 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Angled handwritten slogan with underline */}
              <div className="transform -rotate-2 select-none">
                <p className="font-handwriting text-2xl sm:text-3xl text-white font-bold tracking-wide leading-tight">
                  Be a part of<br />
                  <span className="text-white">our growing family!</span>
                </p>
                {/* Double yellow underline flourish */}
                <div className="mt-1 space-y-1">
                  <div className="w-44 h-1 bg-amber-400 rounded-full"></div>
                  <div className="w-36 h-0.5 bg-amber-400/80 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Right Column: Text + Button */}
            <div className="lg:col-span-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-left">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Experience the difference
                  </h3>
                  <Send className="w-4 h-4 text-amber-400 -rotate-12 shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Visit our campus and see how we create a better future for your child.
                </p>
              </div>

              {/* Schedule a Visit Button */}
              <button
                type="button"
                onClick={onOpenDemoBooking || onOpenEnquiry}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Schedule a Visit</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. LIGHTBOX MODAL (Interactive preview for photos)
         ========================================================================= */}
      {activeLightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveLightboxIndex(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Nav Arrows */}
            <button
              type="button"
              onClick={handlePrevLightbox}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNextLightbox}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Lightbox Image */}
            <div className="max-h-[75vh] flex items-center justify-center bg-black/40">
              {galleryItems[activeLightboxIndex]?.image ? (
                <img
                  src={galleryItems[activeLightboxIndex].image}
                  alt={galleryItems[activeLightboxIndex].alt || 'Gallery Photo'}
                  className="max-h-[70vh] w-auto max-w-full object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>

            {/* Caption Bar */}
            <div className="p-4 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div>
                <h4 className="text-white font-bold text-base sm:text-lg">
                  {galleryItems[activeLightboxIndex].title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {galleryItems[activeLightboxIndex].subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveLightboxIndex(null);
                  if (onOpenDemoBooking) onOpenDemoBooking();
                }}
                className="px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Schedule a Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
