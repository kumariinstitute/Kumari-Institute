/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ContactPage } from './components/ContactPage';
import { SuccessStoriesPage } from './components/SuccessStoriesPage';
import { AboutUsPage } from './components/AboutUsPage';
import { GalleryPage } from './components/GalleryPage';
import { FindTutorsPage } from './components/FindTutorsPage';
import { NavodayaExamPrepPage } from './components/NavodayaExamPrepPage';
import { HeroSection } from './components/HeroSection';
import { ChildDeservesBestSection } from './components/ChildDeservesBestSection';
import { StatsRibbon } from './components/StatsRibbon';
import { ResultsAndTestimonials } from './components/ResultsAndTestimonials';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { DemoBookingModal } from './components/DemoBookingModal';
import { EnquiryModal } from './components/EnquiryModal';
import { ProgramDetailModal } from './components/ProgramDetailModal';
import { ResultsModal } from './components/ResultsModal';
import { AuthPage, AuthViewMode } from './components/AuthPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminPanel } from './components/AdminPanel';
import { BottomNav } from './components/BottomNav';
import { Program } from './types';
import {
  subscribeToFirebaseAuth,
  logoutUserFromFirebase,
  loadSavedUserSession,
  AppUserProfile
} from './services/firebaseAuth';

export type CurrentUser = AppUserProfile;

export default function App() {
  // Home page opens by default on initial website load
  const [activeTab, setActiveTab] = useState<
    'home' | 'tutors' | 'gallery' | 'contact' | 'success' | 'about' | 'exam-prep' | 'auth' | 'profile' | 'admin'
  >('home');
  const [authInitialMode, setAuthInitialMode] = useState<AuthViewMode>('login');
  const [authInitialRole, setAuthInitialRole] = useState<'parent' | 'teacher'>('parent');
  // Load saved session immediately, strictly verifying email status before setting session in App.tsx
  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(() => {
    const saved = loadSavedUserSession();
    return saved && saved.emailVerified === true ? saved : null;
  });
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Synchronize authenticated user state with Firebase Authentication & Firestore in real-time
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAuth((firebaseUser) => {
      // Ensure only verified accounts can establish an active session in App.tsx
      if (firebaseUser && firebaseUser.emailVerified === true) {
        setCurrentUser(firebaseUser);
        // If user was on auth tab waiting for verification or logging in, transition smoothly
        setActiveTab((prev) => (prev === 'auth' ? 'home' : prev));
      } else {
        setCurrentUser(null);
        // If a user signs out from another tab while on profile, transition to home
        setActiveTab((prev) => (prev === 'profile' ? 'home' : prev));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDemo = () => setIsDemoModalOpen(true);
  const handleOpenEnquiry = () => setIsEnquiryModalOpen(true);
  const handleOpenResults = () => setIsResultsModalOpen(true);
  const handleSelectProgram = (program: Program) => setSelectedProgram(program);

  const handleNavigateHome = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTutors = () => {
    setActiveTab('tutors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateExamPrep = () => {
    setActiveTab('exam-prep');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAbout = () => {
    setActiveTab('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSuccess = () => {
    setActiveTab('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateGallery = () => {
    setActiveTab('gallery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateContact = () => {
    setActiveTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAdmin = () => {
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAuth = (
    mode: AuthViewMode = 'login',
    role: 'parent' | 'teacher' = 'parent'
  ) => {
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    setActiveTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateProfile = () => {
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToCourses = () => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('programs');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div
      id="brightpath-app-root"
      className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-amber-200 selection:text-slate-900 pb-16 lg:pb-0"
    >
      {/* Main Navigation */}
      {activeTab !== 'admin' && (
        <Navbar
          activeTab={activeTab}
          currentUser={currentUser}
          onOpenProfile={handleNavigateProfile}
          onNavigateHome={handleNavigateHome}
          onNavigateTutors={handleNavigateTutors}
          onNavigateExamPrep={handleNavigateExamPrep}
          onNavigateAbout={handleNavigateAbout}
          onNavigateSuccess={handleNavigateSuccess}
          onNavigateGallery={handleNavigateGallery}
          onNavigateContact={handleNavigateContact}
          onNavigateAdmin={handleNavigateAdmin}
          onOpenEnquiry={handleOpenEnquiry}
          onOpenDemoBooking={handleOpenDemo}
          onNavigateAuth={handleNavigateAuth}
        />
      )}

      {/* Main View Router */}
      {activeTab === 'admin' ? (
        <main className="flex-1 bg-slate-950">
          <AdminPanel
            currentUser={currentUser}
            onNavigateHome={handleNavigateHome}
            onNavigateTutors={handleNavigateTutors}
            onLogout={async () => {
              try {
                await logoutUserFromFirebase();
              } catch (err) {
                console.warn('Firebase logout notice:', err);
              }
              setCurrentUser(null);
              setActiveTab('home');
            }}
          />
        </main>
      ) : activeTab === 'auth' ? (
        <main className="flex-1 bg-[#f8fafc]">
          <AuthPage
            initialMode={authInitialMode}
            initialRole={authInitialRole}
            currentUser={currentUser}
            onNavigateHome={handleNavigateHome}
            onNavigateProfile={handleNavigateProfile}
            onNavigateTutors={handleNavigateTutors}
            onNavigateAdmin={handleNavigateAdmin}
            onLoginSuccess={(user) => {
              // Strictly verify email status before setting the session in App.tsx
              if (user && user.emailVerified === true) {
                setCurrentUser(user);
                if (user.role === 'admin' || user.email?.toLowerCase().includes('kkumariinstitut')) {
                  setActiveTab('admin');
                }
              } else {
                console.warn('Blocked unverified user session in App.tsx');
                setCurrentUser(null);
              }
            }}
            onTeacherRegistered={() => {
              // Registration requires email verification before session is set
            }}
            onOpenProfileModal={handleNavigateProfile}
          />
        </main>
      ) : activeTab === 'exam-prep' ? (
        <main className="flex-1">
          <NavodayaExamPrepPage
            onNavigateHome={handleNavigateHome}
            onNavigateTutors={handleNavigateTutors}
            onOpenEnquiry={handleOpenEnquiry}
            onOpenDemoBooking={handleOpenDemo}
          />
        </main>
      ) : activeTab === 'tutors' ? (
        <main className="flex-1">
          <FindTutorsPage
            currentUser={currentUser}
            onNavigateHome={handleNavigateHome}
            onOpenEnquiry={handleOpenEnquiry}
            onOpenDemoBooking={handleOpenDemo}
            onNavigateAuth={handleNavigateAuth}
          />
        </main>
      ) : activeTab === 'gallery' ? (
        <main className="flex-1">
          <GalleryPage
            onOpenEnquiry={handleOpenEnquiry}
            onOpenDemoBooking={handleOpenDemo}
          />
        </main>
      ) : activeTab === 'contact' ? (
        <main className="flex-1">
          <ContactPage
            onNavigateHome={handleNavigateHome}
            onNavigateAbout={handleNavigateAbout}
            onNavigateSuccess={handleNavigateSuccess}
            onOpenEnquiry={handleOpenEnquiry}
          />
        </main>
      ) : activeTab === 'success' ? (
        <main className="flex-1">
          <SuccessStoriesPage
            onNavigateHome={handleNavigateHome}
            onNavigateAbout={handleNavigateAbout}
            onOpenEnquiry={handleOpenEnquiry}
            onOpenDemoBooking={handleOpenDemo}
          />
        </main>
      ) : activeTab === 'about' ? (
        <main className="flex-1">
          <AboutUsPage
            onNavigateHome={handleNavigateHome}
            onOpenEnquiry={handleOpenEnquiry}
            onOpenDemoBooking={handleOpenDemo}
          />
        </main>
      ) : activeTab === 'profile' ? (
        <main className="flex-1">
          {currentUser && currentUser.emailVerified === true ? (
            <ProfilePage
              user={currentUser}
              onNavigateHome={handleNavigateHome}
              onNavigateCourses={handleScrollToCourses}
              onNavigateTutors={handleNavigateTutors}
              onOpenEnquiry={handleOpenEnquiry}
              onOpenDemoBooking={handleOpenDemo}
              onLogout={async () => {
                try {
                  await logoutUserFromFirebase();
                } catch (err) {
                  console.warn('Firebase logout notice:', err);
                }
                setCurrentUser(null);
                setActiveTab('home');
              }}
              onProfileUpdated={(updatedUser) => setCurrentUser(updatedUser)}
            />
          ) : (
            <div className="py-24 max-w-md mx-auto px-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
              <p className="text-sm text-slate-600">
                Kindly verify your email and log in to access your profile and learning dashboard.
              </p>
              <button
                type="button"
                onClick={() => handleNavigateAuth('login')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Log In with Verified Account
              </button>
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1">
          {/* Hero Section (Banner + Spotlight Service Boxes) */}
          <HeroSection
            onOpenCourses={handleScrollToCourses}
            onOpenDemoBooking={handleOpenDemo}
            onOpenEnquiry={handleOpenEnquiry}
            onNavigateTutors={handleNavigateTutors}
            onNavigateExamPrep={handleNavigateExamPrep}
            onSelectProgram={handleSelectProgram}
          />

          {/* Why Choose Us Section */}
          <ChildDeservesBestSection id="why-us" onOpenDemoBooking={handleOpenDemo} />

          {/* 4 Stats Blue Ribbon */}
          <StatsRibbon />

          {/* Success Stories */}
          <ResultsAndTestimonials onViewMoreResults={handleOpenResults} />

          {/* Frequently Asked Questions */}
          <FaqSection
            onOpenDemoBooking={handleOpenDemo}
            onOpenEnquiry={handleOpenEnquiry}
          />
        </main>
      )}

      {/* Unified Website Footer across pages */}
      {activeTab !== 'exam-prep' && activeTab !== 'admin' && (
        <Footer
          onNavigateHome={handleNavigateHome}
          onNavigateTutors={handleNavigateTutors}
          onNavigateAbout={handleNavigateAbout}
          onNavigateSuccess={handleNavigateSuccess}
          onNavigateGallery={handleNavigateGallery}
          onNavigateContact={handleNavigateContact}
          onOpenEnquiry={handleOpenEnquiry}
        />
      )}

      {/* Interactive Modals */}
      <DemoBookingModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        currentUser={currentUser}
        onBookingRecorded={(updatedUser) => setCurrentUser(updatedUser)}
      />

      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />

      <ProgramDetailModal
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
        onBookDemo={handleOpenDemo}
        currentUser={currentUser}
        onEnrollSuccess={(updatedUser) => setCurrentUser(updatedUser)}
        onPromptLogin={() => handleNavigateAuth('login')}
      />

      <ResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        onBookDemo={handleOpenDemo}
      />

      {/* Mobile App-Style Bottom Navigation Bar (< lg) */}
      {activeTab !== 'admin' && (
        <BottomNav
          activeTab={activeTab}
          currentUser={currentUser}
          onNavigateHome={handleNavigateHome}
          onNavigateAbout={handleNavigateAbout}
          onNavigateSuccess={handleNavigateSuccess}
          onNavigateGallery={handleNavigateGallery}
          onNavigateTutors={handleNavigateTutors}
          onNavigateContact={handleNavigateContact}
          onNavigateProfile={() => {
            if (currentUser) {
              handleNavigateProfile();
            } else {
              handleNavigateAuth('login', 'parent');
            }
          }}
          onNavigateAuth={handleNavigateAuth}
        />
      )}
    </div>
  );
}
