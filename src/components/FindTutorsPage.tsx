import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  Search,
  BookOpen,
  Briefcase,
  Star,
  Clock,
  ShieldCheck,
  UserCheck,
  Heart,
  ChevronDown,
  X,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Phone,
  Calendar,
  Home,
  User,
  GraduationCap,
  Shield,
  Layers,
  Award,
  LocateFixed,
  Loader2,
  Building2,
  Check,
  Radio,
  Navigation2,
  Compass,
  AlertCircle,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-react';
import {
  Tutor,
  calculateDistanceKm,
  RAYAGADA_LOCALITIES,
  RayagadaLocality,
  findClosestLocality
} from '../data/tutorsData';
import { BookHomeTutorModal } from './BookHomeTutorModal';
import { TutorProfilePage } from './TutorProfilePage';
import { getLiveUserLocation, LiveLocationData, searchNearbyTeachers, searchLocationsOnline } from '../services/tutorApi';
import {
  subscribeToRealtimeTeachers,
  subscribeToRealtimeBookings,
  AppUserProfile,
  loginWithGoogleFirebase,
  formatFirebaseError
} from '../services/firebaseAuth';

interface FindTutorsPageProps {
  currentUser?: AppUserProfile | null;
  onNavigateHome: () => void;
  onOpenEnquiry: () => void;
  onOpenDemoBooking: () => void;
  onNavigateAuth?: (mode?: 'login' | 'parent-login' | 'teacher-login' | 'create-parent' | 'create-teacher', role?: 'parent' | 'teacher') => void;
  onLoginSuccess?: (user: AppUserProfile) => void;
  onViewingProfileChange?: (isViewing: boolean) => void;
}

export const CLASS_OPTIONS = [
  'All Classes',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th'
];

export const BOARD_OPTIONS = [
  'All Boards',
  'CBSE',
  'ICSE'
];

// Dynamically resolves subjects based on the selected class
export const getSubjectOptionsForClass = (cls: string): string[] => {
  if (['1st', '2nd', '3rd', '4th', '5th'].includes(cls)) {
    return ['All Subjects', 'Math', 'English', 'Hindi', 'Odia', 'Social', 'Science'];
  }
  if (['6th', '7th'].includes(cls)) {
    return ['All Subjects', 'English', 'Hindi', 'Odia', 'Mathmatics', 'Science', 'Social Science SST'];
  }
  if (['8th', '9th', '10th', '11th', '12th'].includes(cls)) {
    return ['All Subjects', 'Mathmatics', 'Physics', 'Chemistry', 'Biology', 'SST'];
  }
  return [
    'All Subjects',
    'Math',
    'Mathmatics',
    'Science',
    'English',
    'Hindi',
    'Odia',
    'Social',
    'Social Science SST',
    'Physics',
    'Chemistry',
    'Biology',
    'SST'
  ];
};

interface LiveLocationState {
  lat: number;
  lng: number;
  name: string;
  subText: string;
  isGps: boolean;
  accuracy?: number;
  source?: 'gps_hardware' | 'network_wifi' | 'ip_lookup' | 'manual_hub';
  isRayagada?: boolean;
  distanceFromRayagadaKm?: number;
}

export const FindTutorsPage: React.FC<FindTutorsPageProps> = ({
  currentUser,
  onNavigateHome,
  onOpenEnquiry,
  onOpenDemoBooking,
  onNavigateAuth,
  onLoginSuccess,
  onViewingProfileChange
}) => {
  // Home tutor booking modal state
  const [bookingTutorTarget, setBookingTutorTarget] = useState<Tutor | null>(null);
  const [viewingTutorProfile, setViewingTutorProfile] = useState<Tutor | null>(null);

  useEffect(() => {
    onViewingProfileChange?.(Boolean(viewingTutorProfile));
  }, [viewingTutorProfile, onViewingProfileChange]);

  // Direct Google Sign-In as Parent for logged-out users
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  const handleParentGoogleSignIn = async () => {
    setIsGoogleLoggingIn(true);
    setGoogleAuthError(null);
    try {
      // Authenticates user strictly with 'parent' role
      const user = await loginWithGoogleFirebase('parent');
      if (user && onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      console.error('Parent Google Sign-In error:', err);
      setGoogleAuthError(formatFirebaseError(err) || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleBookHomeTutor = (tutor: Tutor) => {
    setBookingTutorTarget(tutor);
  };

  // Live user location state (coordinates default to central Rayagada for distance metrics)
  const [currentLocation, setCurrentLocation] = useState<LiveLocationState>({
    lat: 19.1691,
    lng: 83.4150,
    name: '',
    subText: '',
    isGps: false,
    source: 'manual_hub',
    isRayagada: true,
    distanceFromRayagadaKm: 0
  });

  // Location search field input - strictly NO default address
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [onlineSearchResults, setOnlineSearchResults] = useState<{ displayName: string; fullAddress?: string; latitude: number; longitude: number }[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsToast, setGpsToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Active searched or live location name for display in headings, empty states, and prompts
  const currentLocationLabel = useMemo(() => {
    const input = locationSearchInput.replace(/^📍\s*/, '').trim();
    if (input && input !== 'all') {
      return input;
    }
    if (currentLocation.name) {
      return currentLocation.name.replace(/^📍\s*/, '').trim();
    }
    return 'Rayagada';
  }, [locationSearchInput, currentLocation.name]);

  // Debounced search for any custom city/area typed by the parent
  useEffect(() => {
    const trimmed = locationSearchInput.replace(/^📍\s*/, '').trim();
    if (!trimmed || trimmed.length < 2 || trimmed === 'Current Location') {
      setOnlineSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const results = await searchLocationsOnline(trimmed);
        setOnlineSearchResults(results);
      } catch (err) {
        console.warn('Online location search notice:', err);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [locationSearchInput]);

  // Proximity Search Radius State (Default 20 km as requested)
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(20);
  const [isQueryingBackend, setIsQueryingBackend] = useState<boolean>(false);
  const [backendNearbyTeachers, setBackendNearbyTeachers] = useState<Tutor[] | null>(null);
  const [nextClosestTeachers, setNextClosestTeachers] = useState<Tutor[]>([]);
  const [firestoreLiveTeachers, setFirestoreLiveTeachers] = useState<Tutor[]>([]);

  // Real-time listener for tutors registered in Firestore & server
  useEffect(() => {
    // 1. Initial immediate load from persistent server
    fetch('/api/teachers')
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const approved = data.filter((t) => {
            const id = (t.id || '').toLowerCase();
            const name = (t.name || '').toLowerCase().trim();
            if (!name || name === 'educator' || name.includes('educator') || id.includes('educator')) return false;
            return (
              (t.verified === true && (t.isApproved === true || t.status === 'approved')) ||
              (t.isApproved === true && t.status === 'approved')
            );
          });
          setBackendNearbyTeachers(approved);
        }
      })
      .catch((err) => console.warn('Fetch teachers error:', err));

    // 2. Real-time Firestore live listener
    const unsub = subscribeToRealtimeTeachers((liveTeachers) => {
      setFirestoreLiveTeachers(liveTeachers);
    });
    return () => unsub();
  }, []);

  // Real-time tracking of tutors booked by the currently logged-in parent
  // Only parents who have an officially completed/confirmed booking for this tutor see the "Booked" status.
  // All other parents (and users without completed bookings) see the active "Book Home Tutor" button.
  const [parentBookedTutorIds, setParentBookedTutorIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (currentUser && (currentUser.role === 'parent' || !currentUser.role)) {
      if (Array.isArray(currentUser.hiredTutors)) {
        currentUser.hiredTutors.forEach((h: any) => {
          if (h && h.tutorId) set.add(String(h.tutorId));
        });
      }
      if (currentUser.assignedEducator?.id) {
        set.add(String(currentUser.assignedEducator.id));
      }
    }
    return set;
  });

  useEffect(() => {
    // Only logged-in parents can have completed bookings
    if (!currentUser || currentUser.role === 'teacher' || currentUser.role === 'admin') {
      setParentBookedTutorIds(new Set());
      return;
    }

    const normPhone = currentUser.phone ? currentUser.phone.replace(/\D/g, '') : '';
    const userEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : '';
    const userUid = currentUser.uid || '';

    const unsub = subscribeToRealtimeBookings((allBookings) => {
      const bookedSet = new Set<string>();

      // Check current parent profile fields
      if (Array.isArray(currentUser.hiredTutors)) {
        currentUser.hiredTutors.forEach((h: any) => {
          if (h && h.tutorId) bookedSet.add(String(h.tutorId));
        });
      }
      if (currentUser.assignedEducator?.id) {
        bookedSet.add(String(currentUser.assignedEducator.id));
      }

      // Check bookings in Firestore: ONLY count completed / accepted / assigned bookings for THIS specific parent
      allBookings.forEach((b: any) => {
        // STRICT REQUIREMENT: Only booking-completed parents see the booked button.
        // Pending booking requests or declined/cancelled bookings do NOT show "Booked".
        const isBookingCompleted =
          b.status === 'accepted' ||
          b.status === 'assigned' ||
          b.status === 'completed' ||
          b.status === 'confirmed' ||
          b.status === 'reassigned';

        if (!isBookingCompleted) return;

        const bPhone = b.parentPhone ? b.parentPhone.replace(/\D/g, '') : '';
        const bEmail = b.parentEmail ? b.parentEmail.toLowerCase().trim() : '';
        const bUid = b.parentUid || '';

        const isMatch =
          Boolean(userUid && bUid && userUid === bUid) ||
          Boolean(userEmail && bEmail && userEmail === bEmail) ||
          Boolean(
            normPhone &&
            bPhone &&
            normPhone.length >= 10 &&
            bPhone.length >= 10 &&
            normPhone.slice(-10) === bPhone.slice(-10)
          );

        if (isMatch) {
          if (b.requestedTutorId) bookedSet.add(String(b.requestedTutorId));
          if (b.assignedTutorId) bookedSet.add(String(b.assignedTutorId));
        }
      });

      setParentBookedTutorIds(bookedSet);
    });

    return () => unsub();
  }, [currentUser?.uid, currentUser?.email, currentUser?.phone, currentUser?.role]);

  // Subject, Class & Board filter state
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedBoard, setSelectedBoard] = useState('All Boards');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [sortBy, setSortBy] = useState<'distance' | 'recommended' | 'rating' | 'price_low' | 'price_high' | 'experience'>('distance');

  // Handle class change and reset subject if current subject not in new class options
  const handleClassChange = (newCls: string) => {
    setSelectedClass(newCls);
    const validSubjects = getSubjectOptionsForClass(newCls);
    if (!validSubjects.includes(selectedSubject)) {
      setSelectedSubject('All Subjects');
    }
  };

  // Favorites / Shortlist State
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set<string>());

  // Close Rapido dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch nearby teachers from Express backend using Haversine calculation
  const fetchBackendProximityTeachers = async (
    lat: number,
    lng: number,
    radius: number,
    subject = selectedSubject,
    classLevel = selectedClass
  ) => {
    setIsQueryingBackend(true);
    try {
      const res = await searchNearbyTeachers(lat, lng, radius, {
        subject,
        classLevel
      });
      if (res && res.success) {
        setBackendNearbyTeachers(res.teachers);
        setNextClosestTeachers(res.nextClosestTeachers || []);
      }
    } catch (err) {
      console.warn('[FindTutorsPage] Proximity query notice:', err);
    } finally {
      setIsQueryingBackend(false);
    }
  };

  // Sync with backend whenever position, radius, or filters change
  useEffect(() => {
    fetchBackendProximityTeachers(currentLocation.lat, currentLocation.lng, searchRadiusKm, selectedSubject, selectedClass);
  }, [currentLocation.lat, currentLocation.lng, searchRadiusKm, selectedSubject, selectedClass]);

  // Toggle favorite
  const toggleFavorite = (tutorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(tutorId)) {
        next.delete(tutorId);
      } else {
        next.add(tutorId);
      }
      return next;
    });
  };

  // Device Location Detection ("Use Live Location" button)
  const handleUseCurrentLocation = async () => {
    setIsLocatingGps(true);
    setGpsToast({
      type: 'info',
      message: 'Acquiring precise GPS lock...'
    });

    try {
      const geo: LiveLocationData = await getLiveUserLocation((statusMsg) => {
        setGpsToast({
          type: 'info',
          message: statusMsg
        });
      });
      const { latitude, longitude, accuracy, source, placeName, subText, isRayagada, distanceFromRayagadaKm } = geo;

      const liveDisplayName = `📍 ${placeName}`;

      setCurrentLocation({
        lat: latitude,
        lng: longitude,
        name: liveDisplayName,
        subText: subText,
        isGps: true,
        accuracy: accuracy,
        source: source,
        isRayagada: isRayagada,
        distanceFromRayagadaKm: distanceFromRayagadaKm
      });

      setLocationSearchInput(liveDisplayName);
      setIsDropdownOpen(false);

      // If outside Rayagada (e.g. testing from outside), auto-expand radius to show all Rayagada tutors
      // with exact Haversine distance from their real live coordinates
      const effectiveRadius = isRayagada ? 20 : 999;
      if (!isRayagada) {
        setSearchRadiusKm(999);
      } else {
        setSearchRadiusKm(20);
      }

      // Automatically sort by nearest distance first
      setSortBy('distance');

      // Query backend proximity search immediately with live coordinates
      await fetchBackendProximityTeachers(latitude, longitude, effectiveRadius);

      setGpsToast({
        type: 'success',
        message: `Exact GPS lock acquired: ${placeName} (±${accuracy}m radius). Nearest tutors sorted by proximity!`
      });
    } catch (err: any) {
      setGpsToast({
        type: 'error',
        message: err.message || 'Could not detect live position. You can choose any area from the list below.'
      });
      setIsDropdownOpen(true);
    } finally {
      setIsLocatingGps(false);
      setTimeout(() => setGpsToast(null), 6000);
    }
  };

  // Custom / Geocoded location selection
  const handleSelectCustomLocation = (name: string, lat?: number, lng?: number, subText?: string) => {
    const cleanName = name.replace(/^📍\s*/, '').trim();
    const finalLat = typeof lat === 'number' && !isNaN(lat) ? lat : currentLocation.lat;
    const finalLng = typeof lng === 'number' && !isNaN(lng) ? lng : currentLocation.lng;

    setCurrentLocation({
      lat: finalLat,
      lng: finalLng,
      name: cleanName,
      subText: subText || `Searched: ${cleanName}`,
      isGps: false,
      source: 'manual_hub'
    });
    setLocationSearchInput(cleanName);
    setIsDropdownOpen(false);
    setGpsToast({
      type: 'success',
      message: `Location set to ${cleanName}. Displaying nearest tutors!`
    });
    setTimeout(() => setGpsToast(null), 4000);
  };

  // Reset back to Default Hub
  const handleResetToDefaultHub = () => {
    const hub = RAYAGADA_LOCALITIES[0]; // Indira Nagar
    setCurrentLocation({
      lat: hub.latitude,
      lng: hub.longitude,
      name: `${hub.name}`,
      subText: hub.subtitle,
      isGps: false,
      source: 'manual_hub',
      isRayagada: true,
      distanceFromRayagadaKm: 0
    });
    setLocationSearchInput(`${hub.name}`);
    setSearchRadiusKm(20);
    setIsDropdownOpen(false);
    setGpsToast({
      type: 'info',
      message: `Reset to central hub (${hub.name}, 20 km radius).`
    });
    setTimeout(() => setGpsToast(null), 4000);
  };

  // Locality Selection
  const handleSelectLocality = (loc: RayagadaLocality) => {
    setCurrentLocation({
      lat: loc.latitude,
      lng: loc.longitude,
      name: `${loc.name}`,
      subText: loc.subtitle,
      isGps: false,
      source: 'manual_hub',
      isRayagada: true,
      distanceFromRayagadaKm: 0
    });
    setLocationSearchInput(`${loc.name}`);
    setIsDropdownOpen(false);
    setGpsToast({
      type: 'success',
      message: `Location set to ${loc.name}. Tutors updated with live distance!`
    });
    setTimeout(() => setGpsToast(null), 4000);
  };

  // Filtered localities in the Rapido search dropdown
  const filteredLocalities = useMemo(() => {
    const query = locationSearchInput.toLowerCase().replace(', rayagada', '').trim();
    if (!query || query === 'rayagada' || query === 'all' || locationSearchInput.includes('Live GPS')) {
      return RAYAGADA_LOCALITIES;
    }
    return RAYAGADA_LOCALITIES.filter((loc) => {
      return (
        loc.name.toLowerCase().includes(query) ||
        loc.subtitle.toLowerCase().includes(query) ||
        loc.landmark.toLowerCase().includes(query) ||
        loc.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [locationSearchInput]);

  // Dynamically enrich tutors with real distance from currentLocation using Haversine formula
  const enrichedTutors = useMemo(() => {
    // Single Source of Truth: real registered teachers directly from Firestore Cloud Database or Server fallback
    const sourceTutors =
      firestoreLiveTeachers && firestoreLiveTeachers.length > 0
        ? firestoreLiveTeachers
        : backendNearbyTeachers && backendNearbyTeachers.length > 0
        ? backendNearbyTeachers
        : [];

    // STRICT REQUIREMENT: Only genuine tutors accepted and verified by admin show on the Find Home Tutor page
    const approvedTutors = sourceTutors.filter((t) => {
      const id = (t.id || '').toLowerCase();
      const name = (t.name || '').toLowerCase().trim();
      // Exclude educator placeholder or fake/prototype tutor profiles
      if (
        !name ||
        name === 'educator' ||
        name.includes('educator') ||
        id.includes('educator')
      ) {
        return false;
      }
      if (
        id.includes('priya-sharma') ||
        id.includes('rakesh-tripathy') ||
        id.includes('sneha-patel') ||
        id.includes('sagar-das') ||
        id.includes('anita-mohanty') ||
        id.includes('sukumar')
      ) {
        return false;
      }
      // Strictly exclude tutors who have NOT updated/completed their profile
      const hasCompletedProfile = Boolean(
        t.profileCompleted === true ||
        (Array.isArray(t.subjects) && t.subjects.length > 0 && Array.isArray(t.classesHandled) && t.classesHandled.length > 0 && (t.educationDetails || t.customFeeSchedule || (t.qualification && t.qualification.trim().length > 0)))
      );
      if (!hasCompletedProfile || (t as any).profileCompleted === false) {
        return false;
      }
      // Must be verified and accepted by admin
      const isAccepted =
        (t.verified === true && (t.isApproved === true || t.status === 'approved')) ||
        (t.isApproved === true && t.status === 'approved');
      return isAccepted && t.verified !== false && t.status !== 'rejected';
    });

    return approvedTutors.map((tutor) => {
      const tutorLat = typeof tutor.latitude === 'number' && !isNaN(tutor.latitude) ? tutor.latitude : 19.1691;
      const tutorLng = typeof tutor.longitude === 'number' && !isNaN(tutor.longitude) ? tutor.longitude : 83.4150;

      const liveDist = calculateDistanceKm(
        currentLocation.lat,
        currentLocation.lng,
        tutorLat,
        tutorLng
      );
      // Commute time based on average 20 km/h local speed in Rayagada
      const travelTime = Math.max(2, Math.round((liveDist / 20) * 60));
      return {
        ...tutor,
        latitude: tutorLat,
        longitude: tutorLng,
        liveDistanceKm: liveDist,
        travelTimeMinutes: travelTime
      };
    });
  }, [backendNearbyTeachers, firestoreLiveTeachers, currentLocation]);

  // Filter & Sort Logic (Proximity radius constraint + Subject + Class + All Keyword Address Matching + Sort)
  const filteredTutors = useMemo(() => {
    const rawQuery = locationSearchInput.replace(/^📍\s*/, '').toLowerCase().replace(', rayagada', '').trim();
    const hasSpecificQuery = rawQuery && rawQuery !== 'rayagada' && rawQuery !== 'all' && !rawQuery.includes('live gps');
    const queryTokens = hasSpecificQuery ? rawQuery.split(/[\s,+-]+/).filter((w) => w.length >= 2) : [];

    return enrichedTutors.filter((tutor) => {
      // 1. Filter by board (CBSE, ICSE)
      if (selectedBoard !== 'All Boards') {
        const targetBoard = selectedBoard.toUpperCase();
        const tutorBoards = [
          ...((tutor as any).boards || []),
          ...((tutor as any).boardsSupported || []),
          ...((tutor as any).customFeeSchedule?.boards || [])
        ].map((b: string) => String(b).toUpperCase());

        const matchesBoard =
          tutorBoards.includes(targetBoard) ||
          ((tutor as any).board && String((tutor as any).board).toUpperCase().includes(targetBoard)) ||
          ((tutor as any).customFeeSchedule?.[selectedBoard.toLowerCase()]) ||
          (tutorBoards.length === 0); // fallback if not explicitly restricted

        if (!matchesBoard) return false;
      }

      // 2. Filter by class (1st to 12th)
      if (selectedClass !== 'All Classes') {
        const targetNumber = selectedClass.replace(/[^0-9]/g, '');
        const matchesClass = tutor.classesHandled.some((cls) => {
          const lower = cls.toLowerCase();
          if (lower.includes(selectedClass.toLowerCase())) return true;
          if (targetNumber) {
            const num = Number(targetNumber);
            if (
              lower.includes(`${targetNumber}st`) ||
              lower.includes(`${targetNumber}nd`) ||
              lower.includes(`${targetNumber}rd`) ||
              lower.includes(`${targetNumber}th`)
            ) {
              return true;
            }
            if ((lower.includes('1st - 6th') || lower.includes('1st to 6th')) && num >= 1 && num <= 6) return true;
            if ((lower.includes('1st - 5th') || lower.includes('1st to 5th')) && num >= 1 && num <= 5) return true;
            if ((lower.includes('1 to 7th') || lower.includes('1st to 7th')) && num >= 1 && num <= 7) return true;
            if ((lower.includes('8th to 10th') || lower.includes('8 to 10th')) && num >= 8 && num <= 10) return true;
            if ((lower.includes('11th & 12th') || lower.includes('11 to 12th')) && num >= 11 && num <= 12) return true;
            if (lower.includes('all')) return true;
          }
          return false;
        });
        if (!matchesClass) return false;
      }

      // 3. Filter by subject (Math, English, Hindi, Odia, Social, Science, SST, Physics, Chemistry, Biology, etc.)
      if (selectedSubject !== 'All Subjects') {
        const subLower = selectedSubject.toLowerCase();
        const matchesSubject = tutor.subjects.some((sub) => {
          const s = sub.toLowerCase();
          if (s.includes(subLower)) return true;
          if (subLower === 'math' && (s.includes('math') || s.includes('mathematics') || s.includes('maths'))) return true;
          if (subLower === 'mathmatics' && (s.includes('math') || s.includes('mathematics') || s.includes('maths'))) return true;
          if (subLower === 'sst' && (s.includes('sst') || s.includes('social') || s.includes('studies'))) return true;
          if (subLower === 'social' && (s.includes('social') || s.includes('sst') || s.includes('studies'))) return true;
          if (subLower === 'social science sst' && (s.includes('social') || s.includes('sst') || s.includes('studies'))) return true;
          return false;
        });
        if (!matchesSubject) return false;
      }

      // 3. Search using ALL keywords added in the tutor's address details
      // (district, street, city, locality, landmark, pincode, door/house, state, etc.)
      if (hasSpecificQuery) {
        const tutorAddressTokens = [
          tutor.name,
          tutor.locationArea,
          tutor.addressSnippet,
          (tutor as any).address,
          (tutor as any).locality,
          (tutor as any).addressDetails?.line1,
          (tutor as any).addressDetails?.street,
          (tutor as any).addressDetails?.landmark,
          (tutor as any).addressDetails?.city,
          (tutor as any).addressDetails?.state,
          (tutor as any).addressDetails?.pincode,
          'rayagada',
          'rayagada district',
          'odisha',
          ...(tutor.subjects || []),
          ...(tutor.classesHandled || []),
          ...(tutor.teachingHighlights || []),
          tutor.bio,
          tutor.qualification
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesAddress =
          tutorAddressTokens.includes(rawQuery) ||
          (queryTokens.length > 0 && queryTokens.some((token) => tutorAddressTokens.includes(token)));

        // If the tutor matches the typed district, street, city, locality or landmark keyword, include them!
        if (matchesAddress) {
          return true;
        }

        // If it didn't match the address keyword and distance is beyond search radius, filter out
        if (searchRadiusKm !== 999 && tutor.liveDistanceKm > searchRadiusKm) {
          return false;
        }
      } else {
        // Standard proximity radius filter when searching by live location
        if (searchRadiusKm !== 999 && tutor.liveDistanceKm > searchRadiusKm) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'distance') return a.liveDistanceKm - b.liveDistanceKm;
      if (sortBy === 'recommended') {
        // High rating combined with proximity
        const scoreA = a.rating * 10 - a.liveDistanceKm * 1.5;
        const scoreB = b.rating * 10 - b.liveDistanceKm * 1.5;
        return scoreB - scoreA;
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return (a.hourlyRate || 400) - (b.hourlyRate || 400);
      if (sortBy === 'price_high') return (b.hourlyRate || 400) - (a.hourlyRate || 400);
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return 0;
    });
  }, [enrichedTutors, searchRadiusKm, selectedSubject, selectedClass, selectedBoard, locationSearchInput, sortBy]);

  // Color mapper for subject pills matching the design
  const getSubjectBadgeStyle = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    if (s.includes('english')) {
      return 'bg-sky-50 text-sky-700 border-sky-100';
    }
    if (s.includes('evs') || s.includes('science')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
    if (s.includes('hindi') || s.includes('odia')) {
      return 'bg-amber-50 text-amber-800 border-amber-100';
    }
    if (s.includes('social')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Dedicated Mobile-First Tutor Profile Page (replaces popup modal)
  if (viewingTutorProfile) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <TutorProfilePage
          tutor={viewingTutorProfile}
          currentUser={currentUser}
          onBack={() => {
            setViewingTutorProfile(null);
            onViewingProfileChange?.(false);
          }}
          onBookTutor={(t) => {
            handleBookHomeTutor(t);
          }}
          onNavigateAuth={onNavigateAuth}
          onOpenEnquiry={onOpenEnquiry}
        />
        {/* Direct Booking Modal from Profile Page */}
        <BookHomeTutorModal
          isOpen={Boolean(bookingTutorTarget)}
          tutor={bookingTutorTarget}
          currentUser={currentUser}
          onClose={() => setBookingTutorTarget(null)}
          onNavigateAuth={onNavigateAuth}
          onBookingSuccess={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* =========================================================================
          TOP BREADCRUMB BAR (Clean, no duplicate navbar)
         ========================================================================= */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#1d4ed8] transition-colors cursor-pointer"
          >
            <span>← Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Home</span>
              <span>/</span>
              <span className="text-[#1d4ed8] font-bold">Find Tutors Near You</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          HERO SECTION (Matching desktop & mobile layout in reference image)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#dbeafe]/70 via-[#eff6ff]/80 to-[#f8fafc] border-b border-slate-200/60 pt-6 sm:pt-10 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
              {/* Pill Tag: Find the Perfect Tutor Near You */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-blue-200/80 text-[#1d4ed8] shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  Find the Perfect Tutor Near You
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2340] tracking-tight leading-[1.15]">
                  Find Trusted Home Tutors <br className="hidden sm:inline" />
                  in Your Area
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl">
                  Search by location, subject, class and more. Connect with verified
                  and experienced tutors near you.
                </p>
              </div>

              {/* 3 Trust Badges (Visible on Desktop here; on mobile rendered below search) */}
              <div className="hidden md:grid grid-cols-3 gap-3.5 pt-1">
                {/* 1. Verified Tutors */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 border border-blue-100/90 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0c2340]">Verified Tutors</div>
                    <div className="text-[11px] text-slate-500 font-medium">Background Checked</div>
                  </div>
                </div>

                {/* 2. Local & Nearby */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 border border-blue-100/90 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0c2340]">Local & Nearby</div>
                    <div className="text-[11px] text-slate-500 font-medium">Find tutors near you</div>
                  </div>
                </div>

                {/* 3. Flexible Timing */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 border border-blue-100/90 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0c2340]">Flexible Timing</div>
                    <div className="text-[11px] text-slate-500 font-medium">Learn at convenience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Graphic Column: Tutor Teaching Girl + Whimsical "Better Learning Brighter Future ♡" note */}
            <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center">
              <div className="relative w-full max-w-[420px]">
                {/* Decorative background glow */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-blue-300/30 via-indigo-200/20 to-sky-200/30 rounded-3xl blur-xl" />

                {/* Main rounded tutor-student photo */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white/90 aspect-[4/3] bg-slate-100">
                  <img
                    src="/src/assets/images/tutor_hero_guidance_1789370512786.jpg"
                    alt="Trusted home tutor guiding a student kindly"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle inner gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Hand-drawn style doodle text matching the screenshot */}
                <div className="absolute -top-7 -left-6 z-10 pointer-events-none select-none">
                  <div className="text-left font-serif transform -rotate-12">
                    <span className="block text-sm font-black text-[#1d4ed8] tracking-wider drop-shadow-2xs">
                      Better
                    </span>
                    <span className="block text-sm font-black text-[#1d4ed8] tracking-wider drop-shadow-2xs ml-3">
                      Learning
                    </span>
                    <span className="block text-xs font-bold text-[#0c2340] tracking-wide ml-6">
                      Brighter
                    </span>
                    <span className="block text-xs font-bold text-[#0c2340] tracking-wide ml-9">
                      Future ♡
                    </span>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-4 -right-2 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                    ✓
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900">100% Verified Teachers</div>
                    <div className="text-[10px] font-semibold text-emerald-700">Doorstep Home Tuition</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================================
              RAPIDO-STYLE LOCATION SEARCH BAR (With Live Distance & GPS)
             ======================================================================= */}
          <div className="mt-6 sm:mt-10 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3.5 sm:p-5 shadow-lg text-left">
            {/* GPS / Location Feedback Toast */}
            {gpsToast && (
              <div
                className={`mb-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                  gpsToast.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : gpsToast.type === 'error'
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-blue-50 text-blue-900 border border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-sm">
                    {gpsToast.type === 'success' ? '✓' : gpsToast.type === 'error' ? '⚠️' : '📍'}
                  </span>
                  <span>{gpsToast.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGpsToast(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold px-1.5 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* 1. Location Input */}
              <div className="md:col-span-4 relative" ref={searchDropdownRef}>
                <div className="flex items-center justify-between mb-1 pl-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Location / Address
                  </label>
                  {currentLocation.name && (
                    <span className="text-[10px] text-blue-700 font-bold truncate max-w-[150px]">
                      📍 {currentLocation.name.replace(/^📍\s*/, '')}
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center justify-center pointer-events-none z-10">
                    <MapPin className="w-4 h-4 text-[#1d4ed8]" />
                  </div>

                  <input
                    type="text"
                    value={locationSearchInput}
                    onChange={(e) => {
                      setLocationSearchInput(e.target.value);
                    }}
                    placeholder="Address, locality, or landmark..."
                    className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-slate-50/90 hover:bg-slate-100/90 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-[#1d4ed8] transition-all placeholder:text-slate-400 placeholder:font-normal"
                  />

                  {locationSearchInput && (
                    <div className="absolute right-2.5 flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setLocationSearchInput('');
                        }}
                        className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                        title="Clear input"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Select Class (Select First: 1st..12th) */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 pl-1">
                  Class <span className="text-blue-600 font-black">(1st)</span>
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-[#1d4ed8] absolute left-3 pointer-events-none" />
                  <select
                    id="find-tutors-class-select"
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full pl-9 pr-7 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                  >
                    {CLASS_OPTIONS.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls === 'All Classes' ? 'All Classes' : `${cls} Class`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 3. Select Board Filter (CBSE, ICSE) */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 pl-1">
                  Board
                </label>
                <div className="relative flex items-center">
                  <Layers className="w-4 h-4 text-[#1d4ed8] absolute left-3 pointer-events-none" />
                  <select
                    id="find-tutors-board-select"
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full pl-9 pr-7 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                  >
                    {BOARD_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b === 'All Boards' ? 'All Boards' : `${b} Board`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 4. Select Subject (Dynamically resolved based on class selected) */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 pl-1">
                  Subject
                </label>
                <div className="relative flex items-center">
                  <BookOpen className="w-4 h-4 text-[#1d4ed8] absolute left-3 pointer-events-none" />
                  <select
                    id="find-tutors-subject-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full pl-9 pr-7 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                  >
                    {getSubjectOptionsForClass(selectedClass).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 5. Action Buttons: Use Live Location + Search */}
              <div className="md:col-span-2 flex flex-col gap-1.5 pt-1 md:pt-0">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocatingGps}
                  className="w-full py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1d4ed8] border border-blue-200/90 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 active:scale-[0.98]"
                  title="Detect your device live location"
                >
                  {isLocatingGps ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1d4ed8]" />
                      <span className="text-[11px] font-bold">Acquiring GPS Lock...</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-3.5 h-3.5 text-[#1d4ed8]" />
                      <span className="text-[11px] font-bold">Use Live Location</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('tutors-grid-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-[#0c2340] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Tutors</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Trust Badges for Mobile View (Directly beneath search box as shown in mobile image) */}
          <div className="md:hidden grid grid-cols-3 gap-2 mt-4 pt-2">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-blue-100 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1d4ed8] flex items-center justify-center mb-1">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-[#0c2340] leading-tight">Verified Tutors</span>
              <span className="text-[9px] text-slate-500 leading-tight">Background Checked</span>
            </div>

            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-blue-100 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1d4ed8] flex items-center justify-center mb-1">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-[#0c2340] leading-tight">Local &amp; Nearby</span>
              <span className="text-[9px] text-slate-500 leading-tight">Find tutors near you</span>
            </div>

            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-blue-100 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1d4ed8] flex items-center justify-center mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-[#0c2340] leading-tight">Flexible Timing</span>
              <span className="text-[9px] text-slate-500 leading-tight">Learn at convenience</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TOP TUTORS NEAR YOU SECTION (Matching the exact card layout from screenshot)
         ========================================================================= */}
      <section id="tutors-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Section Header with dynamic count and sort filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Top Tutors Near You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              We found <span className="font-bold text-[#1d4ed8]">{filteredTutors.length}</span> trusted tutors{' '}
              {searchRadiusKm !== 999 ? `within ${searchRadiusKm} km of ${currentLocationLabel}` : `near ${currentLocationLabel}`}
              {isQueryingBackend && <span className="text-slate-400 ml-2 animate-pulse">Syncing proximity...</span>}
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-500">Sort by:</span>
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
              >
                <option value="distance">Nearest to You (Distance)</option>
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Parent Authentication Gate: Require Login or Sign Up to view tutors */}
        {!currentUser ? (
          <div className="my-8 max-w-xl mx-auto bg-white rounded-3xl border border-blue-200/90 p-8 sm:p-10 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8 text-[#1d4ed8]" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 inline-block">
                Parent Login Required
              </span>
              <h3 className="text-2xl font-black text-[#0c2340]">
                Sign In with Google to View Verified Tutors
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Sign in securely with your Google account as a Parent to browse verified home tutors in Rayagada, check complete qualifications, fee schedules, and book doorstep trial sessions.
              </p>
            </div>

            {googleAuthError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium max-w-md mx-auto text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{googleAuthError}</span>
              </div>
            )}

            {/* Direct Google Log In Section (Logs in as Parent) */}
            <div className="pt-2 max-w-md mx-auto">
              <button
                type="button"
                id="parent-google-signin-btn"
                onClick={handleParentGoogleSignIn}
                disabled={isGoogleLoggingIn}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-800 font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3.5 cursor-pointer disabled:opacity-60 active:scale-[0.99] group"
              >
                {isGoogleLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Connecting Google Account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google as Parent</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Verified Doorstep Home Tutors</span>
            </div>
          </div>
        ) : (
          <>
            {/* 2-Column Grid on Desktop, Clean 1-Column Responsive Cards on Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filteredTutors.map((tutor) => {
            const isFav = favoriteIds.has(tutor.id);
            const hourlyPrice =
              Number(tutor.hourlyRate) ||
              Number((tutor as any).hourlyCharges) ||
              Number((tutor as any).hourlyFee) ||
              (tutor.monthlyFee ? Math.round(tutor.monthlyFee / 30) : 0);
            const monthly30 = hourlyPrice > 0 ? hourlyPrice * 30 : (tutor.monthlyFee || 0);
            const monthly31 = hourlyPrice > 0 ? hourlyPrice * 31 : (tutor.monthlyFee || 0);
            const effectiveMonthly = monthly30;
            const hasFee = hourlyPrice > 0 || effectiveMonthly > 0;

            return (
              <div
                key={tutor.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-6 flex flex-col justify-between text-left group"
              >
                <div>
                  {/* Top Row: Big Avatar + Name & Details (offset to the right) + Heart Button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4 sm:gap-6 min-w-0 flex-1">
                      {/* Big Tutor Headshot Photo or Initials Placeholder */}
                      <div className="relative shrink-0">
                        {(tutor.avatar || (tutor as any).photoUrl) ? (
                          <img
                            src={tutor.avatar || (tutor as any).photoUrl}
                            alt={tutor.name}
                            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl object-cover border-2 border-slate-100 shadow-md ring-1 ring-slate-200/60 bg-slate-100"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0c2340] to-blue-800 text-white flex flex-col items-center justify-center border-2 border-slate-100 shadow-sm p-2 text-center">
                            <span className="text-2xl sm:text-3xl font-black">
                              {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                            </span>
                            <span className="text-[10px] font-medium text-blue-200 mt-1">Photo Pending</span>
                          </div>
                        )}
                        <div
                          className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-xs"
                          title="Verified Tutor"
                        >
                          ✓
                        </div>
                      </div>

                      {/* Tutor Details - Offset to the right with generous gap and pl-1 sm:pl-2 */}
                      <div className="space-y-1.5 min-w-0 flex-1 pl-1 sm:pl-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-black text-[#0c2340] tracking-tight truncate">
                            {tutor.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/80">
                            ✓ {parentBookedTutorIds.has(tutor.id)
                              ? 'Booked by You'
                              : (tutor.availabilityBadge || '').toLowerCase().includes('educator')
                              ? 'Verified Home Tutor'
                              : (tutor.availabilityBadge === 'Booked' ? 'Verified Genuine Home Tutor' : (tutor.availabilityBadge || 'Verified Tutor'))}
                          </span>
                        </div>

                        {/* Qualifications & Experience */}
                        <div className="text-xs sm:text-sm text-slate-600 font-medium truncate flex items-center gap-1.5 flex-wrap">
                          {tutor.qualification ? (
                            <span className="text-slate-800 font-bold">{tutor.qualification}</span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Qualification pending • Set up profile
                            </span>
                          )}
                          {(String(tutor.experienceText || (tutor as any).experience || (tutor as any).totalExperience || '')).toLowerCase().includes('fresher') || tutor.experienceYears === 0 ? (
                            <span className="text-blue-700 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Fresher</span>
                          ) : tutor.experienceYears && tutor.experienceYears > 0 ? (
                            <span className="text-slate-800 font-bold">{tutor.experienceYears} Years Exp</span>
                          ) : (
                            <span className="text-slate-500 font-normal text-[11px]">Experience pending</span>
                          )}
                        </div>

                        {/* Rating and Distance in One Clean Line - No Bulky Address, No Commute Text */}
                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs pt-0.5">
                          {tutor.reviewCount > 0 ? (
                            <div className="flex items-center gap-1 font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-slate-900 font-extrabold">{tutor.rating}</span>
                              <span className="text-slate-400 font-normal">({tutor.reviewCount})</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <Star className="w-3 h-3 text-slate-300" />
                              <span>New Tutor</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-[#1d4ed8]" />
                            <span>
                              {(tutor.liveDistanceKm ?? tutor.distanceKm).toFixed(1)} km away
                            </span>
                          </div>

                          {(tutor.liveDistanceKm ?? tutor.distanceKm) <= searchRadiusKm && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <LocateFixed className="w-2.5 h-2.5 text-emerald-600" />
                              Within {searchRadiusKm === 999 ? 'your area' : `${searchRadiusKm} km`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Heart Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(tutor.id, e)}
                      className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0 ml-1"
                      title={isFav ? 'Remove from shortlist' : 'Save tutor'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-all ${
                          isFav ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Bio snippet or meaningful Set Up Profile prompt */}
                  {tutor.bio ? (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {tutor.bio}
                    </p>
                  ) : (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-medium">Bio not added yet • Set up your profile</span>
                    </div>
                  )}

                  {/* Clean Verified Tuition Highlight (Old fee table removed as requested) */}
                  <div className="mt-3.5 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900">Doorstep Home Tuition</span>
                        <span className="block text-[11px] text-slate-500">1-on-1 Personalized Mentoring</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full inline-block">
                        {tutor.monthlyFee || (tutor as any)?.customFeeSchedule?.primary1to5
                          ? `From ₹${Number((tutor as any)?.customFeeSchedule?.primary1to5 || tutor.monthlyFee).toLocaleString('en-IN')}/mo`
                          : 'Affordable Monthly'}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-3.5 border-t border-slate-100" />

                  {/* Subjects Section */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Subjects
                    </div>
                    {tutor.subjects && tutor.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {tutor.subjects.map((sub) => (
                          <span
                            key={sub}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getSubjectBadgeStyle(
                              sub
                            )}`}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-700 font-medium flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>No subjects added yet • Set up your profile</span>
                      </div>
                    )}
                  </div>

                  {/* Classes Section */}
                  <div className="mt-3 space-y-0.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Classes Handled
                    </div>
                    <div className="text-xs font-bold text-slate-700">
                      {tutor.classesHandled && tutor.classesHandled.length > 0 ? (
                        tutor.classesHandled.join(', ')
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">
                          Classes not specified • Set up your profile
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons: View Profile + Book Home Tutor */}
                <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingTutorProfile(tutor)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>View Profile</span>
                  </button>

                  {parentBookedTutorIds.has(tutor.id) ? (
                    <div
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-emerald-300 select-none shadow-2xs"
                      title="You have booked this home tutor"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Booked</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBookHomeTutor(tutor)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Home className="w-3.5 h-3.5 shrink-0" />
                      <span>Book Tutor</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if search finds nothing within radius */}
        {filteredTutors.length === 0 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-5 max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center mx-auto shadow-2xs">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {searchRadiusKm !== 999
                  ? `No tutors registered within ${searchRadiusKm} km of ${currentLocationLabel}`
                  : `No tutors found near ${currentLocationLabel}`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {searchRadiusKm !== 999
                  ? `There are verified tutors just slightly outside ${searchRadiusKm} km in ${currentLocationLabel}. Try expanding your search radius:`
                  : `Try selecting "All Subjects", "All Classes", or adjusting your searched location.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {searchRadiusKm < 10 && (
                <button
                  type="button"
                  onClick={() => setSearchRadiusKm(10)}
                  className="px-4 py-2 rounded-xl bg-[#1d4ed8] text-white font-bold text-xs hover:bg-[#0c2340] transition-colors shadow-2xs cursor-pointer"
                >
                  Expand Radius to 10 km
                </button>
              )}
              {searchRadiusKm < 20 && searchRadiusKm >= 10 && (
                <button
                  type="button"
                  onClick={() => setSearchRadiusKm(20)}
                  className="px-4 py-2 rounded-xl bg-[#1d4ed8] text-white font-bold text-xs hover:bg-[#0c2340] transition-colors shadow-2xs cursor-pointer"
                >
                  Expand Radius to 20 km
                </button>
              )}
              {searchRadiusKm < 50 && searchRadiusKm >= 20 && (
                <button
                  type="button"
                  onClick={() => setSearchRadiusKm(50)}
                  className="px-4 py-2 rounded-xl bg-[#1d4ed8] text-white font-bold text-xs hover:bg-[#0c2340] transition-colors shadow-2xs cursor-pointer"
                >
                  Expand Radius to 50 km
                </button>
              )}
              {searchRadiusKm !== 999 && (
                <button
                  type="button"
                  onClick={() => setSearchRadiusKm(999)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Show All Tutors ({enrichedTutors.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject('All Subjects');
                  setSelectedClass('All Classes');
                  setSelectedBoard('All Boards');
                  setSearchRadiusKm(999);
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 text-[#1d4ed8] font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
        </>
        )}

        {/* =======================================================================
            PARENT TRUST & PEACE OF MIND PROMISE (Builds deep trust)
           ======================================================================= */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs text-left">
          <div className="max-w-3xl mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Parent Safety &amp; Quality Guarantee
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight">
              Why Parents Trust Kumari Institute Home Tutors
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Every tutor sent to your home undergoes rigorous 4-step physical verification and academic audits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-[#0c2340]">Police &amp; ID Verified</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Government Aadhaar, address, and local police verification completed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-[#0c2340]">Free 1-on-1 Demo Session</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Observe the teacher interacting with your child before paying any tuition fees.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-[#0c2340]">Weekly Progress Diary</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Daily homework tracking and weekly test reports shared directly with parents.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="text-sm font-bold text-[#0c2340]">Instant Tutor Replacement</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Not satisfied with the teaching style? Request a new tutor anytime with 0 hassle.
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================================
            BOTTOM HELP BANNER (Matching "Can't find the right tutor?" in screenshot)
           ======================================================================= */}
        <div className="mt-8 bg-[#f0f7ff] rounded-2xl sm:rounded-3xl border border-blue-200/70 p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1d4ed8] flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0c2340] tracking-tight">
                Can't find the right tutor?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                We'll help you find the best match based on your child's needs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenEnquiry}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Request a Tutor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Home Tutor Direct Booking Modal */}
      <BookHomeTutorModal
        isOpen={Boolean(bookingTutorTarget)}
        tutor={bookingTutorTarget}
        currentUser={currentUser}
        onClose={() => setBookingTutorTarget(null)}
        onNavigateAuth={onNavigateAuth}
        onBookingSuccess={() => {
          // Real-time listener will mark as booked once booking is officially completed by admin
        }}
      />
    </div>
  );
};
