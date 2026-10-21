import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Menu,
  X,
  UserCheck,
  Home,
  User,
  Star,
  Image as ImageIcon,
  Phone,
  GraduationCap,
  ChevronRight,
  MapPin,
  Heart,
  Facebook,
  Instagram,
  Youtube,
  Search,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { instituteInfo } from '../data/instituteData';
import { OfferTickerSection } from './OfferTickerSection';

interface NavbarProps {
  activeTab?: 'home' | 'about' | 'success' | 'gallery' | 'contact' | 'tutors' | 'exam-prep' | 'auth' | 'profile' | 'teacher-complete-profile' | 'admin' | string;
  currentUser?: {
    name: string;
    role: 'parent' | 'teacher' | 'admin';
    email: string;
    phone?: string;
    profileCompleted?: boolean;
  } | null;
  onOpenProfile?: () => void;
  onNavigateHome: () => void;
  onNavigateTutors: () => void;
  onNavigateExamPrep?: () => void;
  onNavigateAbout: () => void;
  onNavigateSuccess: () => void;
  onNavigateGallery: () => void;
  onNavigateContact: () => void;
  onNavigateAdmin?: () => void;
  onOpenEnquiry: () => void;
  onOpenDemoBooking?: () => void;
  onNavigateAuth?: (mode?: 'login' | 'create-parent' | 'create-teacher', role?: 'parent' | 'teacher') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'home',
  currentUser,
  onOpenProfile,
  onNavigateHome,
  onNavigateTutors,
  onNavigateExamPrep,
  onNavigateAbout,
  onNavigateSuccess,
  onNavigateGallery,
  onNavigateContact,
  onNavigateAdmin,
  onOpenEnquiry,
  onOpenDemoBooking,
  onNavigateAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdmin =
    currentUser?.role === 'admin' ||
    Boolean(currentUser?.email?.toLowerCase().includes('kkumariinstitut'));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Desktop navigation links - Matches screenshot with Courses
  const desktopNavItems = [
    { label: 'Home', id: 'home', action: onNavigateHome },
    { label: 'Find Tutors', id: 'tutors', action: onNavigateTutors },
    { label: 'Courses', id: 'exam-prep', action: onNavigateExamPrep || onNavigateHome },
    { label: 'About Us', id: 'about', action: onNavigateAbout },
    { label: 'Success Stories', id: 'success', action: onNavigateSuccess },
    { label: 'Gallery', id: 'gallery', action: onNavigateGallery },
    { label: 'Contact', id: 'contact', action: onNavigateContact },
    ...(isAdmin ? [{ label: 'Admin Panel', id: 'admin', action: onNavigateAdmin || onNavigateHome }] : []),
  ];

  // Mobile menu items
  const mobileNavItems = [
    { label: 'Home', id: 'home', icon: Home, action: onNavigateHome },
    { label: 'Find Tutors', id: 'tutors', icon: Search, action: onNavigateTutors },
    { label: 'Courses (Exam Prep)', id: 'exam-prep', icon: GraduationCap, action: onNavigateExamPrep || onNavigateHome },
    { label: 'About Us', id: 'about', icon: User, action: onNavigateAbout },
    { label: 'Success Stories', id: 'success', icon: Star, action: onNavigateSuccess },
    { label: 'Gallery', id: 'gallery', icon: ImageIcon, action: onNavigateGallery },
    { label: 'Contact', id: 'contact', icon: Phone, action: onNavigateContact },
    ...(isAdmin ? [{ label: 'Admin Panel', id: 'admin', icon: ShieldCheck, action: onNavigateAdmin || onNavigateHome }] : []),
  ];

  // Split desktop nav items into left and right groups for symmetrical centered-logo layout
  const leftNavItems = [
    { label: 'Home', id: 'home', action: onNavigateHome },
    { label: 'Find Tutors', id: 'tutors', action: onNavigateTutors },
    { label: 'Courses', id: 'exam-prep', action: onNavigateExamPrep || onNavigateHome },
    { label: 'About Us', id: 'about', action: onNavigateAbout },
  ];

  const rightNavItems = [
    { label: 'Success Stories', id: 'success', action: onNavigateSuccess },
    { label: 'Gallery', id: 'gallery', action: onNavigateGallery },
    { label: 'Contact', id: 'contact', action: onNavigateContact },
    ...(isAdmin ? [{ label: 'Admin Panel', id: 'admin', action: onNavigateAdmin || onNavigateHome }] : []),
  ];

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-40 bg-gradient-to-r from-[#03132B] via-[#061B38] to-[#04152D] transition-shadow duration-300 relative overflow-visible ${
        activeTab === 'home' ? 'border-b-0' : 'border-b border-[#0a2347]/60'
      }`}
      style={{
        background: 'linear-gradient(to right, #03132B 0%, #061B38 50%, #04152D 100%)',
        boxShadow: activeTab === 'home' ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.28)',
        paddingTop: '5px',
        paddingBottom: activeTab === 'home' ? '0px' : '5px'
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* DESKTOP NAVBAR (lg and up): Symmetrical Left Links, Centered Fitted Logo (+10% size), Right Links */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center w-full p-0 m-0">
          {/* Left Navigation Links */}
          <nav id="desktop-nav-left" className="flex items-center gap-5 xl:gap-7 justify-start p-0 m-0">
            {leftNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className={`text-sm font-semibold transition-all py-1.5 relative cursor-pointer ${
                    isActive
                      ? 'text-amber-400 font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-400'
                      : 'text-slate-200 hover:text-amber-400 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-400 hover:after:w-full after:transition-all after:duration-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Centered Brand Logo (strictly 5px padding as requested, navbar tailored per logo) */}
          <div className="flex items-center justify-center p-0 m-0 leading-none">
            <button
              type="button"
              id="brand-logo-link"
              onClick={onNavigateHome}
              className="p-0 m-0 border-0 bg-transparent flex items-center justify-center cursor-pointer focus:outline-none"
              style={{ margin: 0, border: 'none' }}
            >
              <img
                src="/Logo/kumarilogo.png"
                alt="Kumari Institute Logo"
                className="h-[138px] sm:h-[170px] lg:h-[202px] w-auto max-w-[550px] sm:max-w-[720px] lg:max-w-[950px] object-contain transition-transform duration-200 p-[3px] m-0 hover:scale-[1.02]"
                style={{ padding: '3px', margin: 0, display: 'block' }}
                referrerPolicy="no-referrer"
              />
            </button>
          </div>

          {/* Right Navigation Links & Account Actions (NO Log In button) */}
          <div className="flex items-center gap-4 xl:gap-6 justify-end p-0 m-0">
            <nav id="desktop-nav-right" className="flex items-center gap-4 xl:gap-6 p-0 m-0">
              {rightNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className={`text-sm font-semibold transition-all py-1.5 relative cursor-pointer ${
                      isActive
                        ? 'text-amber-400 font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-400'
                        : 'text-slate-200 hover:text-amber-400 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-400 hover:after:w-full after:transition-all after:duration-200'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Quick Find Tutors button for high visibility */}
            <button
              type="button"
              id="desktop-find-tutors-header-btn"
              onClick={onNavigateTutors}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-md shadow-black/40 hover:shadow-lg active:scale-95 ${
                activeTab === 'tutors'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-amber-400/30'
                  : 'bg-[#0d2f5e] hover:bg-[#133d78] text-amber-300 border border-amber-400/40 hover:border-amber-400/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Find Tutors</span>
            </button>

            {/* User Profile Badge if logged in (NO Log In button when logged out) */}
            {currentUser && (
              <div className="relative inline-flex items-center">
                {/* Tutor Update Profile Pop-up (Shows ONLY when tutor profile is incomplete) */}
                {(currentUser.role === 'teacher' || (currentUser as any).role === 'tutor') && !currentUser.profileCompleted && (
                  <div
                    id="tutor-update-profile-popup"
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-md border border-amber-300 animate-bounce flex items-center gap-1 z-30 pointer-events-none"
                  >
                    <span>Update Profile</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rotate-45 border-r border-b border-amber-300" />
                  </div>
                )}
                <button
                  type="button"
                  id="desktop-profile-btn"
                  onClick={onOpenProfile}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs bg-[#0b2b57] hover:bg-[#103a73] border border-blue-400/40 text-white shadow-md shadow-black/40 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
                  title="Click to view My Profile"
                >
                  <div
                    className={`w-6 h-6 rounded-full text-slate-950 flex items-center justify-center font-black text-xs shadow-sm ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-400'
                        : currentUser.role === 'teacher'
                        ? 'bg-purple-400'
                        : 'bg-amber-300'
                    }`}
                  >
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="max-w-[100px] truncate text-slate-100">{currentUser.name}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE & TABLET NAVBAR (< lg): Decreased navbar size slightly, logo size NOT decreased */}
        <div className="flex lg:hidden items-center justify-center w-full relative p-0 m-0 h-[86px] sm:h-[106px]">
          {/* Centered Enlarged Logo (with 3px padding as requested) */}
          <button
            type="button"
            id="mobile-brand-logo-link"
            onClick={onNavigateHome}
            className="p-0 m-0 border-0 bg-transparent flex items-center justify-center cursor-pointer focus:outline-none"
            style={{ margin: 0, border: 'none' }}
          >
            <img
              src="/Logo/kumarilogo.png"
              alt="Kumari Institute Logo"
              className="h-[106px] sm:h-[138px] w-auto max-w-[490px] sm:max-w-[620px] object-contain p-[3px] m-0"
              style={{ padding: '3px', margin: 0, display: 'block' }}
              referrerPolicy="no-referrer"
            />
          </button>

          {/* If admin, small icon badge on absolute left */}
          {isAdmin && (
            <button
              type="button"
              id="mobile-admin-shortcut-btn"
              onClick={onNavigateAdmin}
              className="absolute left-1 p-2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-md shadow-black/40 active:scale-95"
              title="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            </button>
          )}

        </div>
      </div>

      {/* =========================================================================
          OFFER SECTION AT THE BOTTOM OF THE TOP NAV BAR
          - Live continually moving marquee text
          - Synced to Cloud Firestore with auto expiry removal
          - Fully responsive on mobile and desktop
         ========================================================================= */}
      {activeTab === 'home' && (
        <OfferTickerSection
          onOpenDemoBooking={onOpenDemoBooking}
          onOpenEnquiry={onOpenEnquiry}
          onNavigateTutors={onNavigateTutors}
          onNavigateCourses={onNavigateExamPrep}
        />
      )}

      {/* =========================================================================
          FULL-SCREEN PROFESSIONAL MOBILE MENU DRAWER (PORTALED TO BODY FOR RELIABILITY)
         ========================================================================= */}
      {mobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            id="mobile-fullscreen-drawer"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] bg-white overflow-y-auto flex flex-col justify-between"
            style={{ minHeight: '100dvh' }}
          >
            {/* Top Header Bar */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100/80 sticky top-0 bg-white/98 backdrop-blur-md z-10 shadow-xs">
              <div className="flex items-center">
                <img
                  src="/Logo/kumarilogo.png"
                  alt="Kumari Institute Logo"
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <button
                type="button"
                id="mobile-menu-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-1 rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close Navigation Menu"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="p-5 flex-1 flex flex-col space-y-4 max-w-md mx-auto w-full pb-8">
              {/* Top Motto Banner: "Better Learning Brighter Future" with Graduation Cap */}
              <div className="bg-[#edf5fd] rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden border border-blue-100/60 shadow-xs">
                {/* Circular Navy Badge with Graduation Cap */}
                <div className="w-12 h-12 rounded-full bg-[#0c2340] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-6 h-6 text-amber-400" />
                </div>

                {/* Text & Yellow Curved Underline */}
                <div className="flex flex-col text-left relative z-10">
                  <span className="text-sm font-semibold italic text-[#0c2340]">
                    Better Learning
                  </span>
                  <span className="text-lg font-black text-[#0c2340] leading-tight">
                    Brighter Future
                  </span>
                  <svg
                    className="w-24 h-2 text-amber-400 mt-1"
                    viewBox="0 0 100 8"
                    fill="none"
                  >
                    <path
                      d="M2 6C30 2 70 2 98 6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Soft decorative geometric background shape */}
                <div className="absolute right-0 top-0 bottom-0 w-28 bg-blue-100/30 rounded-l-full pointer-events-none" />
              </div>

              {/* Navigation Links List (Professional & Parent Friendly) */}
              <div className="space-y-1.5 pt-1">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        item.action();
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#eaf3fd] text-[#1d4ed8] font-bold shadow-xs'
                          : 'text-[#0c2340] hover:bg-slate-50 active:bg-slate-100 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? 'text-[#1d4ed8]' : 'text-[#0c2340]'
                          }`}
                        />
                        <span className="text-base font-bold">{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 stroke-[2.5] ${
                          isActive ? 'text-[#1d4ed8]' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Login / Profile Quick Section in Mobile Drawer */}
              <div className="pt-1">
                {currentUser ? (
                  <button
                    type="button"
                    id="mobile-drawer-profile-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenProfile?.();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-xs transition-transform active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white text-purple-800 flex items-center justify-center font-black text-sm shrink-0">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="text-left truncate">
                        <div className="truncate text-white font-bold">{currentUser.name}</div>
                        <div className="text-[11px] text-purple-200 font-medium">
                          {currentUser.profileCompleted ? 'Profile Complete (Verified)' : 'Profile Incomplete (Action Needed)'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-200 shrink-0" />
                  </button>
                ) : null}
              </div>

              {/* Subtle Divider Line */}
              <div className="pt-2 border-b border-blue-100/80" />

              {/* "Need Help?" Card with Golden Direct Call Button */}
              <div className="bg-[#edf5fd] rounded-2xl p-5 border border-blue-100/70 shadow-xs">
                <div className="flex items-center gap-3.5 text-left mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#0c2340] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0c2340] leading-tight">
                      Need Help?
                    </h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Talk to our team for any queries.
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${instituteInfo.phoneClean}`}
                  className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
                >
                  <Phone className="w-4 h-4 fill-slate-900 stroke-none" />
                  <span>{instituteInfo.phone}</span>
                </a>
              </div>

              {/* Bottom Card with Social Links, Location & Hand-styled Slogan */}
              <div className="bg-[#f4f9fe] rounded-2xl p-5 border border-blue-100/50 text-center space-y-3.5">
                {/* Follow Us with Circular Social Icons */}
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs font-bold text-slate-700">
                    Follow Us
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-full bg-[#0c2340] text-white flex items-center justify-center hover:bg-[#1d4ed8] transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-full bg-[#0c2340] text-white flex items-center justify-center hover:bg-[#1d4ed8] transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-full bg-[#0c2340] text-white flex items-center justify-center hover:bg-[#1d4ed8] transition-colors"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Location Badge */}
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
                  <span>Indira Nagar, Rayagada, Odisha</span>
                </div>

                {/* Hand-styled Slogan with Heart and Yellow Brush Smile Curve */}
                <div className="pt-2 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[#1d4ed8] font-serif italic text-base font-bold">
                    <span>Better Learning</span>
                    <span className="font-sans text-xs not-italic mx-0.5">·</span>
                    <span>Brighter Future</span>
                    <Heart className="w-3.5 h-3.5 fill-[#1d4ed8] text-[#1d4ed8] inline ml-0.5" />
                  </div>
                  <svg
                    className="w-36 h-2.5 text-amber-400 mt-0.5"
                    viewBox="0 0 140 10"
                    fill="none"
                  >
                    <path
                      d="M4 8C45 2 95 2 136 8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
