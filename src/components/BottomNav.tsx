import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Users,
  GraduationCap,
  PhoneCall,
  Sparkles,
  Award,
  Image as ImageIcon,
  User,
  Compass,
  Info
} from 'lucide-react';
import { AppUserProfile } from '../services/firebaseAuth';

interface BottomNavProps {
  activeTab: string;
  currentUser: AppUserProfile | null;
  onNavigateHome: () => void;
  onNavigateAbout: () => void;
  onNavigateSuccess?: () => void;
  onNavigateGallery?: () => void;
  onNavigateTutors: () => void;
  onNavigateContact: () => void;
  onNavigateProfile?: () => void;
  onNavigateAuth?: (mode?: 'login' | 'create-parent' | 'create-teacher', role?: 'parent' | 'teacher') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  currentUser,
  onNavigateHome,
  onNavigateAbout,
  onNavigateSuccess,
  onNavigateGallery,
  onNavigateTutors,
  onNavigateContact,
  onNavigateProfile,
  onNavigateAuth
}) => {
  // State for the Explore/About popup showing 3 icons (About Us, Success Stories, Gallery)
  const [isExploreMenuOpen, setIsExploreMenuOpen] = useState(false);
  const exploreMenuRef = useRef<HTMLDivElement>(null);

  // Close floating explore menu if clicked/tapped outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (exploreMenuRef.current && !exploreMenuRef.current.contains(e.target as Node)) {
        setIsExploreMenuOpen(false);
      }
    };
    if (isExploreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExploreMenuOpen]);

  const isHomeActive = activeTab === 'home';
  const isExploreActive = activeTab === 'about' || activeTab === 'success' || activeTab === 'gallery';
  const isTutorsActive = activeTab === 'tutors';
  const isContactActive = activeTab === 'contact';
  const isProfileActive = false; // Opens profile modal or auth

  const handleProfileClick = () => {
    setIsExploreMenuOpen(false);
    if (onNavigateProfile) {
      onNavigateProfile();
    } else if (onNavigateAuth) {
      onNavigateAuth('login', 'parent');
    }
  };

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-10px_35px_rgba(0,0,0,0.2)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center relative">
        {/* 1. HOME */}
        <button
          type="button"
          id="bottom-nav-home"
          onClick={() => {
            setIsExploreMenuOpen(false);
            onNavigateHome();
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer ${
            isHomeActive ? 'text-[#0c2340]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Home
              className={`w-5 h-5 transition-transform duration-200 ${
                isHomeActive ? 'scale-110 stroke-[2.6] text-[#0c2340]' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              isHomeActive ? 'font-black text-[#0c2340]' : 'font-semibold text-slate-500'
            }`}
          >
            Home
          </span>
        </button>

        {/* 2. EXPLORE / ABOUT (SHOWS 3 ICONS: About Us, Success Stories, Gallery. Clicks only open popup, does not redirect) */}
        <div
          ref={exploreMenuRef}
          className="relative flex flex-col items-center justify-center"
        >
          {/* FLOATING 3-ICON SUBMENU (About Us, Success Stories, Gallery) */}
          {isExploreMenuOpen && (
            <div
              id="explore-floating-popup"
              className="absolute bottom-full left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 mb-3.5 z-50 bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-[0_16px_40px_rgba(12,35,64,0.45)] rounded-2xl p-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Arrow pointing down toward Explore icon */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 w-3 h-3 bg-slate-950 border-r border-b border-slate-700 rotate-45 pointer-events-none" />

              {/* Icon 1: About Us */}
              <button
                type="button"
                id="submenu-item-about-us"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExploreMenuOpen(false);
                  onNavigateAbout();
                }}
                className={`flex flex-col items-center justify-center px-2.5 py-2 rounded-xl transition-all cursor-pointer min-w-[64px] active:scale-95 ${
                  activeTab === 'about'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Info className={`w-5 h-5 mb-1 ${activeTab === 'about' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">About Us</span>
              </button>

              {/* Icon 2: Success Stories */}
              <button
                type="button"
                id="submenu-item-success-stories"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExploreMenuOpen(false);
                  onNavigateSuccess?.();
                }}
                className={`flex flex-col items-center justify-center px-2.5 py-2 rounded-xl transition-all cursor-pointer min-w-[64px] active:scale-95 ${
                  activeTab === 'success'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Award className={`w-5 h-5 mb-1 ${activeTab === 'success' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">Stories</span>
              </button>

              {/* Icon 3: Gallery */}
              <button
                type="button"
                id="submenu-item-gallery"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExploreMenuOpen(false);
                  onNavigateGallery?.();
                }}
                className={`flex flex-col items-center justify-center px-2.5 py-2 rounded-xl transition-all cursor-pointer min-w-[64px] active:scale-95 ${
                  activeTab === 'gallery'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ImageIcon className={`w-5 h-5 mb-1 ${activeTab === 'gallery' ? 'text-slate-950' : 'text-sky-300'}`} />
                <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">Gallery</span>
              </button>
            </div>
          )}

          {/* MAIN EXPLORE BUTTON: Clicking ONLY toggles the 3 icons, DOES NOT redirect to about us page */}
          <button
            type="button"
            id="bottom-nav-explore"
            onClick={() => setIsExploreMenuOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer ${
              isExploreActive || isExploreMenuOpen ? 'text-[#0c2340]' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Explore About Us, Success Stories & Gallery"
          >
            <div className="relative">
              <Compass
                className={`w-5 h-5 transition-transform duration-200 ${
                  isExploreActive || isExploreMenuOpen ? 'scale-110 stroke-[2.6] text-[#0c2340]' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight ${
                isExploreActive || isExploreMenuOpen ? 'font-black text-[#0c2340]' : 'font-semibold text-slate-500'
              }`}
            >
              Explore
            </span>
          </button>
        </div>

        {/* 3. FIND HOME TUTORS - CENTER, BIG & VERY FOCUSED */}
        <div className="flex flex-col items-center justify-center -mt-7 relative">
          <button
            type="button"
            id="bottom-nav-find-tutors"
            onClick={() => {
              setIsExploreMenuOpen(false);
              onNavigateTutors();
            }}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shadow-[0_10px_25px_rgba(245,186,66,0.5)] border-4 border-white transition-all duration-300 active:scale-95 cursor-pointer relative group ${
              isTutorsActive
                ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 ring-4 ring-amber-400/80 scale-105'
                : 'bg-gradient-to-tr from-amber-400 via-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 ring-2 ring-amber-300/40'
            }`}
            title="Find Verified Home Tutors"
          >
            <GraduationCap className="w-7 h-7 text-slate-950 stroke-[2.5] group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-[10px] font-black text-[#0c2340] mt-1 tracking-tight flex items-center gap-0.5 whitespace-nowrap">
            <span>Find Tutors</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
          </span>
        </div>

        {/* 4. CONTACT US (IN PLACE OF FORMER STORIES ICON) */}
        <button
          type="button"
          id="bottom-nav-contact"
          onClick={() => {
            setIsExploreMenuOpen(false);
            onNavigateContact();
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer ${
            isContactActive ? 'text-[#0c2340]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <PhoneCall
              className={`w-5 h-5 transition-transform duration-200 ${
                isContactActive ? 'scale-110 stroke-[2.6] text-[#0c2340]' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              isContactActive ? 'font-black text-[#0c2340]' : 'font-semibold text-slate-500'
            }`}
          >
            Contact Us
          </span>
        </button>

        {/* 5. PROFILE (ON THE RIGHT SIDE WHERE CONTACT ICON WAS) */}
        <div className="relative flex flex-col items-center justify-center">
          {currentUser && (currentUser.role === 'teacher' || (currentUser as any).role === 'tutor') && !currentUser.profileCompleted && (
            <div
              id="mobile-bottom-nav-update-profile-popup"
              className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shadow-md border border-amber-300 animate-bounce flex items-center gap-1 z-30 pointer-events-none"
            >
              <span>Update Profile</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rotate-45 border-r border-b border-amber-300" />
            </div>
          )}
          <button
            type="button"
            id="bottom-nav-profile"
            onClick={handleProfileClick}
            className={`flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer ${
              isProfileActive ? 'text-[#0c2340]' : 'text-slate-500 hover:text-slate-800'
            }`}
            title={currentUser ? `Profile: ${currentUser.name}` : 'My Profile'}
          >
            <div className="relative">
            {currentUser ? (
              <div
                className={`w-5 h-5 rounded-full text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-400'
                    : currentUser.role === 'teacher'
                    ? 'bg-purple-300'
                    : 'bg-amber-300'
                }`}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            ) : (
              <User
                className={`w-5 h-5 transition-transform duration-200 ${
                  isProfileActive ? 'scale-110 stroke-[2.6] text-[#0c2340]' : 'stroke-[1.8]'
                }`}
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              currentUser ? 'font-black text-[#0c2340]' : 'font-semibold text-slate-500'
            }`}
          >
            {currentUser ? 'Profile' : 'Profile'}
          </span>
        </button>
        </div>
      </div>
    </nav>
  );
};

