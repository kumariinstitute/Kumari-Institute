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
import { TeacherCompleteProfilePage } from './components/TeacherCompleteProfilePage';
import { AdminPanel } from './components/AdminPanel';
import { BottomNav } from './components/BottomNav';
import { FloatingContactButtons } from './components/FloatingContactButtons';
import { Program } from './types';
import {
  subscribeToFirebaseAuth,
  logoutUserFromFirebase,
  loadSavedUserSession,
  AppUserProfile
} from './services/firebaseAuth';

export type CurrentUser = AppUserProfile;

export default function App() {
  // Home page opens by default on initial website load (or admin if authenticated admin)
  const [activeTab, setActiveTab] = useState<
    'home' | 'tutors' | 'gallery' | 'contact' | 'success' | 'about' | 'exam-prep' | 'auth' | 'profile' | 'admin'
  >(() => {
    const saved = loadSavedUserSession();
    if (
      saved &&
      saved.emailVerified === true &&
      (saved.role === 'admin' ||
        saved.email?.toLowerCase() === 'kkumariinstitute@gmail.com' ||
        saved.email?.toLowerCase() === 'kkumariinstiture@gmail.com' ||
        saved.email?.toLowerCase().includes('kkumariinstitut'))
    ) {
      return 'admin';
    }
    return 'home';
  });
  const [authInitialMode, setAuthInitialMode] = useState<AuthViewMode>('login');
  const [authInitialRole, setAuthInitialRole] = useState<'parent' | 'teacher'>('parent');
  const [isCompletingTeacherProfile, setIsCompletingTeacherProfile] = useState(false);
  const [isViewingTutorProfile, setIsViewingTutorProfile] = useState(false);
  // Load saved session immediately, strictly verifying email status before setting session in App.tsx
  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(() => {
    const saved = loadSavedUserSession();
    return saved && saved.emailVerified === true ? saved : null;
  });
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Push history step so mobile hardware back button goes back one step rather than exiting site
  const pushStep = (info: { tab?: string; modal?: string; view?: string }) => {
    try {
      window.history.pushState(
        {
          tab: info.tab || activeTab,
          modal: info.modal || null,
          view: info.view || null,
          time: Date.now()
        },
        ''
      );
    } catch {
      // ignore
    }
  };

  // Synchronize authenticated user state with Firebase Authentication & Firestore in real-time
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAuth((firebaseUser) => {
      // Ensure only verified accounts can establish an active session in App.tsx
      if (firebaseUser && firebaseUser.emailVerified === true) {
        setCurrentUser(firebaseUser);
        const isAdmin =
          firebaseUser.role === 'admin' ||
          firebaseUser.email?.toLowerCase() === 'kkumariinstitute@gmail.com' ||
          firebaseUser.email?.toLowerCase() === 'kkumariinstiture@gmail.com' ||
          firebaseUser.email?.toLowerCase().includes('kkumariinstitut');
        if (isAdmin) {
          setActiveTab('admin');
        } else if (
          (firebaseUser.role === 'teacher' || (firebaseUser as any).role === 'tutor') &&
          !firebaseUser.profileCompleted
        ) {
          // Requirement: When a tutor logs in, if profile is not completed, redirect to complete profile page
          setIsCompletingTeacherProfile(true);
          setActiveTab('profile');
        } else {
          // If user was on auth tab, transition to home or profile
          setActiveTab((prev) => (prev === 'auth' ? 'home' : prev));
        }
      } else {
        setCurrentUser(null);
        setActiveTab((prev) => (prev === 'profile' ? 'home' : prev));
      }
    });

    return () => unsubscribe();
  }, []);

  // Strict Tutor Escape Lock: If an unverified/incomplete tutor navigates away or escapes, log them out immediately to the tutor login page
  const handleTutorEscapeLogout = async () => {
    try {
      await logoutUserFromFirebase();
    } catch (err) {
      console.warn('Tutor escape logout notice:', err);
    }
    setCurrentUser(null);
    setIsCompletingTeacherProfile(false);
    setAuthInitialRole('teacher');
    setAuthInitialMode('login');
    setActiveTab('auth');
  };

  // MOBILE BACK BUTTON FEATURE: Go back 1 step rather than exit the page
  useEffect(() => {
    try {
      if (!window.history.state) {
        window.history.replaceState({ tab: 'home', root: true }, '');
      }
    } catch {
      // ignore
    }

    const handlePopState = (e: PopStateEvent) => {
      // 1. Close open modal if any
      if (isDemoModalOpen) {
        setIsDemoModalOpen(false);
        return;
      }
      if (isEnquiryModalOpen) {
        setIsEnquiryModalOpen(false);
        return;
      }
      if (isResultsModalOpen) {
        setIsResultsModalOpen(false);
        return;
      }
      if (selectedProgram) {
        setSelectedProgram(null);
        return;
      }

      // 2. If viewing single tutor profile, close it back to tutor search
      if (isViewingTutorProfile) {
        setIsViewingTutorProfile(false);
        return;
      }

      // 3. If filling complete teacher profile:
      // If profile is not completed, escaping logs tutor out and sends to tutor login page!
      if (isCompletingTeacherProfile) {
        if (!currentUser?.profileCompleted) {
          handleTutorEscapeLogout();
        } else {
          setIsCompletingTeacherProfile(false);
        }
        return;
      }

      // 4. If on another tab than 'home', go back to previous tab or home
      if (activeTab !== 'home') {
        const state = e.state;
        if (state && state.tab && state.tab !== activeTab) {
          setActiveTab(state.tab);
        } else {
          setActiveTab('home');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    isDemoModalOpen,
    isEnquiryModalOpen,
    isResultsModalOpen,
    selectedProgram,
    isViewingTutorProfile,
    isCompletingTeacherProfile,
    activeTab
  ]);

  const handleOpenDemo = () => {
    pushStep({ modal: 'demo' });
    setIsDemoModalOpen(true);
  };
  const handleOpenEnquiry = () => {
    pushStep({ modal: 'enquiry' });
    setIsEnquiryModalOpen(true);
  };
  const handleOpenResults = () => {
    pushStep({ modal: 'results' });
    setIsResultsModalOpen(true);
  };
  const handleSelectProgram = (program: Program) => {
    pushStep({ modal: 'program' });
    setSelectedProgram(program);
  };

  const handleNavigateHome = () => {
    setIsViewingTutorProfile(false);
    setIsCompletingTeacherProfile(false);
    if (activeTab !== 'home') {
      pushStep({ tab: 'home' });
      setActiveTab('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTutors = () => {
    setIsViewingTutorProfile(false);
    pushStep({ tab: 'tutors' });
    setActiveTab('tutors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateExamPrep = () => {
    setIsViewingTutorProfile(false);
    pushStep({ tab: 'exam-prep' });
    setActiveTab('exam-prep');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAbout = () => {
    setIsViewingTutorProfile(false);
    pushStep({ tab: 'about' });
    setActiveTab('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSuccess = () => {
    setIsViewingTutorProfile(false);
    pushStep({ tab: 'success' });
    setActiveTab('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateGallery = () => {
    setIsViewingTutorProfile(false);
    pushStep({ tab: 'gallery' });
    setActiveTab('gallery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateContact = () => {
    setIsViewingTutorProfile(false);
    pushStep({ tab: 'contact' });
    setActiveTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAdmin = () => {
    setIsViewingTutorProfile(false);
    pushStep({ tab: 'admin' });
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAuth = (
    mode: AuthViewMode = 'login',
    role: 'parent' | 'teacher' = 'parent'
  ) => {
    setIsViewingTutorProfile(false);
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    pushStep({ tab: 'auth' });
    setActiveTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateProfile = () => {
    setIsViewingTutorProfile(false);
    // User Requirement: if tutor has NOT completed profile, clicking profile icon opens complete profile page
    if (
      currentUser &&
      (currentUser.role === 'teacher' || (currentUser as any).role === 'tutor') &&
      !currentUser.profileCompleted
    ) {
      pushStep({ tab: 'profile', view: 'complete-profile' });
      setIsCompletingTeacherProfile(true);
    } else {
      pushStep({ tab: 'profile' });
      setIsCompletingTeacherProfile(false);
    }
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
      {activeTab !== 'admin' && !isViewingTutorProfile && (
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
                } else if (
                  user.role === 'teacher' || (user as any).role === 'tutor'
                ) {
                  // Requirement: when a tutor logs in, redirect to profile update page first on screen
                  setIsCompletingTeacherProfile(true);
                  setActiveTab('profile');
                } else {
                  setActiveTab('profile');
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
            onLoginSuccess={(user) => {
              setCurrentUser(user);
            }}
            onViewingProfileChange={(isViewing) => {
              setIsViewingTutorProfile(isViewing);
            }}
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
            isCompletingTeacherProfile ? (
              <TeacherCompleteProfilePage
                currentUser={currentUser}
                onBackToDashboard={() => {
                  if (!currentUser?.profileCompleted) {
                    handleTutorEscapeLogout();
                  } else {
                    setIsCompletingTeacherProfile(false);
                  }
                }}
                onNavigateHome={() => {
                  if (!currentUser?.profileCompleted) {
                    handleTutorEscapeLogout();
                  } else {
                    setIsCompletingTeacherProfile(false);
                    handleNavigateHome();
                  }
                }}
                onEscapeLogout={handleTutorEscapeLogout}
                onProfileSaved={(updated) => {
                  if (updated) setCurrentUser(updated);
                  setIsCompletingTeacherProfile(false);
                }}
              />
            ) : (
              <ProfilePage
                user={currentUser}
                onNavigateHome={handleNavigateHome}
                onNavigateCourses={handleScrollToCourses}
                onNavigateTutors={handleNavigateTutors}
                onCompleteTeacherProfile={() => setIsCompletingTeacherProfile(true)}
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
            )
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

      {/* Realistic Floating WhatsApp and Phone Buttons (Bottom-Right, on top of mobile bottom nav bar) */}
      {activeTab !== 'admin' && !isViewingTutorProfile && (
        <FloatingContactButtons />
      )}

      {/* Mobile App-Style Bottom Navigation Bar (< lg) */}
      {activeTab !== 'admin' && !isViewingTutorProfile && (
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
