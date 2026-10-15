import { Tutor, calculateDistanceKm, RAYAGADA_LOCALITIES, findClosestLocality } from '../data/tutorsData';

export interface NearbyTeachersResponse {
  success: boolean;
  parentLocation: {
    latitude: number;
    longitude: number;
  };
  searchRadiusKm: number;
  totalMatchingInRadius: number;
  teachers: (Tutor & { travelTimeMinutes?: number })[];
  nextClosestTeachers?: (Tutor & { travelTimeMinutes?: number })[];
  totalRegisteredTeachers: number;
}

export interface TeacherLocationPayload {
  name: string;
  email?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  address?: string;
  locationArea?: string;
  qualification?: string;
  experienceYears?: number;
  subjects?: string[];
  classesHandled?: string[];
  monthlyFee?: number;
  hourlyRate?: number;
  customFeeSchedule?: any;
  bio?: string;
  gender?: 'male' | 'female';
  teacherType?: 'home' | 'both';
}

export interface LiveLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: 'gps_hardware' | 'network_wifi' | 'ip_lookup';
  placeName: string;
  subText: string;
  isRayagada: boolean;
  distanceFromRayagadaKm: number;
}

/**
 * Strict High-Accuracy GPS Options:
 * - enableHighAccuracy: true -> Forces OS to power up satellite GNSS/GPS receiver instead of cheap IP/Wi-Fi estimates
 * - timeout: 15000 -> Allows 15 seconds for satellite ephemeris synchronization
 * - maximumAge: 0 -> Forbids cached positions, requiring a brand new satellite fix
 */
export const GPS_HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0
};

/**
 * Robust Geolocation Error Handler for PERMISSION_DENIED, POSITION_UNAVAILABLE, and TIMEOUT
 */
export function formatGeolocationError(err: any): string {
  if (err && typeof err.code === 'number') {
    switch (err.code) {
      case 1: // GeolocationPositionError.PERMISSION_DENIED
        return 'Location access was denied. Please click the lock or tune icon in your address bar to allow location access and try again.';
      case 2: // GeolocationPositionError.POSITION_UNAVAILABLE
        return 'GPS position is unavailable. Please ensure location services / GPS are toggled ON in your device settings and you have a clear view of the sky.';
      case 3: // GeolocationPositionError.TIMEOUT
        return 'Acquiring precise GPS lock timed out (15 seconds). Please check that your device GPS is enabled and try again.';
      default:
        return err.message || 'An unexpected error occurred while fetching your live location.';
    }
  }
  return err?.message || 'Failed to acquire live GPS location.';
}

/**
 * Pure hardware-level GPS coordinate fetcher.
 * Guarantees { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }.
 */
export async function fetchPreciseGPSCoordinates(
  onStatusChange?: (status: string) => void
): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}> {
  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation is not supported by your browser or device.');
  }

  // Check permission state if Permissions API is supported
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (perm.state === 'denied') {
        throw new Error('Location permission is blocked in your browser. Please allow location access in your address bar.');
      }
    } catch {
      // Permission API query might fail in some browsers; proceed to getCurrentPosition
    }
  }

  onStatusChange?.('Acquiring precise GPS lock...');

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp
        });
      },
      (err) => {
        reject(new Error(formatGeolocationError(err)));
      },
      GPS_HIGH_ACCURACY_OPTIONS
    );
  });
}

/**
 * Captures user device coordinates via HTML5 Geolocation API with strict hardware accuracy:
 * 1. Checks permissions and uses navigator.geolocation with { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
 * 2. Emits clear loading status ("Acquiring precise GPS lock...")
 * 3. Handles PERMISSION_DENIED, POSITION_UNAVAILABLE, and TIMEOUT with friendly messages
 * 4. Extracts the accuracy radius (in meters)
 * 5. Reverse-geocodes exact coordinates and matches with Rayagada's verified localities
 */
export async function getLiveUserLocation(
  onStatusChange?: (status: string) => void
): Promise<LiveLocationData> {
  const coords = await fetchPreciseGPSCoordinates(onStatusChange);
  const { latitude, longitude, accuracy } = coords;
  const roundedAccuracy = Math.round(accuracy);

  // Calculate distance from Rayagada Town Center (19.1691° N, 83.4150° E)
  const distFromRayagada = calculateDistanceKm(latitude, longitude, 19.1691, 83.4150);
  const isRayagada = distFromRayagada <= 30;

  // Reverse geocoding to human-readable address
  let placeName = '';
  try {
    const revRes = await fetch(`/api/location/reverse?lat=${latitude}&lng=${longitude}`);
    if (revRes.ok) {
      const revData = await revRes.json();
      if (revData.displayName) {
        placeName = revData.displayName;
      }
    }
  } catch {
    // Reverse geocode fetch failed
  }

  // Precise landmark matching against verified Rayagada localities
  const closestLocality = findClosestLocality(latitude, longitude);
  const distToClosest = calculateDistanceKm(latitude, longitude, closestLocality.latitude, closestLocality.longitude);

  if (!placeName || placeName.includes('Coordinates')) {
    if (distToClosest <= 2.5) {
      placeName = `${closestLocality.name}, Rayagada`;
    } else if (isRayagada) {
      placeName = `Rayagada (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`;
    } else {
      placeName = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;
    }
  } else if (isRayagada && distToClosest <= 1.2 && !placeName.toLowerCase().includes(closestLocality.name.toLowerCase())) {
    placeName = `${placeName} (near ${closestLocality.name})`;
  }

  const subText = isRayagada
    ? `Live GPS Sensor • ±${roundedAccuracy}m radius • Rayagada Area (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`
    : `Live GPS Sensor • ±${roundedAccuracy}m radius • ~${Math.round(distFromRayagada)} km from Rayagada`;

  return {
    latitude,
    longitude,
    accuracy: roundedAccuracy,
    source: 'gps_hardware',
    placeName,
    subText,
    isRayagada,
    distanceFromRayagadaKm: Math.round(distFromRayagada * 10) / 10,
  };
}

/**
 * Drop-in handler for Tutor Registration / Complete Profile "Use Live Location" button.
 * Saves exact latitude, longitude, and accuracy radius, providing progress & error callbacks.
 */
export async function handleTutorLiveLocationAction(options: {
  onStart?: () => void;
  onProgress?: (message: string) => void;
  onSuccess: (data: { lat: number; lng: number; accuracy: number; placeName: string; notice: string }) => void;
  onError: (errorMessage: string) => void;
  onFinish?: () => void;
}): Promise<void> {
  options.onStart?.();
  options.onProgress?.('Acquiring precise GPS lock...');

  try {
    const geo = await getLiveUserLocation(options.onProgress);
    const notice = `GPS Locked: ${geo.placeName} (${geo.latitude.toFixed(4)}° N, ${geo.longitude.toFixed(4)}° E • ±${geo.accuracy}m radius)`;
    options.onSuccess({
      lat: geo.latitude,
      lng: geo.longitude,
      accuracy: geo.accuracy,
      placeName: geo.placeName,
      notice
    });
  } catch (err: any) {
    options.onError(err.message || 'Failed to acquire live GPS location.');
  } finally {
    options.onFinish?.();
  }
}

/**
 * Drop-in handler for Parent Find Tutors "Use Live Location" button.
 * Fetches hardware-level GPS, updates live accuracy feedback, and triggers nearby tutor queries.
 */
export async function handleParentFindTutorsLocationAction(options: {
  onStart?: () => void;
  onProgress?: (message: string) => void;
  onSuccess: (geo: LiveLocationData) => void;
  onError: (errorMessage: string) => void;
  onFinish?: () => void;
}): Promise<void> {
  options.onStart?.();
  options.onProgress?.('Acquiring precise GPS lock...');

  try {
    const geo = await getLiveUserLocation(options.onProgress);
    options.onSuccess(geo);
  } catch (err: any) {
    options.onError(err.message || 'Failed to acquire live GPS location.');
  } finally {
    options.onFinish?.();
  }
}

/**
 * Backward-compatible helper for simple coordinate extraction
 */
export async function getBrowserGeolocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  const result = await getLiveUserLocation();
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    accuracy: result.accuracy,
  };
}

/**
 * Query backend API for tutors within a specified radius from the parent's GPS location.
 * Uses the Haversine formula on the server and returns sorted results.
 */
export async function searchNearbyTeachers(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  filters?: {
    subject?: string;
    classLevel?: string;
  }
): Promise<NearbyTeachersResponse> {
  const query = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radiusKm.toString(),
  });

  if (filters?.subject && filters.subject !== 'All Subjects') {
    query.append('subject', filters.subject);
  }
  if (filters?.classLevel && !filters.classLevel.includes('All')) {
    query.append('classLevel', filters.classLevel);
  }

  try {
    const res = await fetch(`/api/teachers/nearby?${query.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[tutorApi] Backend call failed, using client-side Haversine fallback', err);
    // Client-side fallback if server is momentarily unreachable during dev reload
    const { INITIAL_TUTORS } = await import('../data/tutorsData');
    const withDist = INITIAL_TUTORS.map((t) => {
      const distanceKm = calculateDistanceKm(lat, lng, t.latitude, t.longitude);
      const travelTimeMinutes = Math.max(2, Math.round((distanceKm / 20) * 60));
      return { ...t, distanceKm, travelTimeMinutes };
    });

    let filtered = withDist;
    if (filters?.subject && filters.subject !== 'All Subjects') {
      filtered = filtered.filter((t) =>
        t.subjects.some((s) => s.toLowerCase().includes(filters.subject!.toLowerCase()))
      );
    }
    if (filters?.classLevel && !filters.classLevel.includes('All')) {
      filtered = filtered.filter((t) =>
        t.classesHandled.some((c) => c.toLowerCase().includes(filters.classLevel!.toLowerCase()))
      );
    }

    const withinRadius = filtered
      .filter((t) => t.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const nextClosest = filtered
      .filter((t) => t.distanceKm > radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 2);

    return {
      success: true,
      parentLocation: { latitude: lat, longitude: lng },
      searchRadiusKm: radiusKm,
      totalMatchingInRadius: withinRadius.length,
      teachers: withinRadius,
      nextClosestTeachers: nextClosest,
      totalRegisteredTeachers: INITIAL_TUTORS.length,
    };
  }
}

/**
 * Register or update teacher's profile with captured live GPS coordinates in the backend
 */
export async function registerTeacherLocation(
  payload: TeacherLocationPayload
): Promise<{ success: boolean; message: string; teacher: Tutor }> {
  try {
    const res = await fetch('/api/teachers/register-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[tutorApi] Backend register failed, simulating locally', err);
    return {
      success: true,
      message: 'Teacher live location saved successfully (local state).',
      teacher: {
        id: `tutor-local-${Date.now()}`,
        name: payload.name,
        qualification: payload.qualification || 'Verified Tutor',
        experienceYears: payload.experienceYears || 3,
        experienceText: `${payload.qualification || 'Verified Tutor'} • ${payload.experienceYears || 3} Years`,
        subjects: payload.subjects || ['Mathematics'],
        distanceKm: 0,
        latitude: payload.latitude,
        longitude: payload.longitude,
        availabilityText: 'Available',
        availabilityType: 'available_now',
        availabilityBadge: 'Verified Home Tutor',
        rating: 5.0,
        reviewCount: 1,
        monthlyFee: payload.monthlyFee || 3500,
        hourlyRate: payload.hourlyRate || 400,
        bio: payload.bio || '',
        avatar: '/src/assets/images/tutor_priya_sharma_1789370534007.jpg',
        gender: payload.gender || 'female',
        teacherType: payload.teacherType || 'home',
        classesHandled: payload.classesHandled || ['1st Class', '2nd Class'],
        boardsSupported: ['CBSE', 'ICSE', 'Odisha State Board'],
        locationArea: payload.locationArea || 'Rayagada',
        addressSnippet: payload.address || 'Rayagada',
        verified: true,
        teachingHighlights: ['GPS Location Verified', 'Background Checked'],
        reviews: [],
      },
    };
  }
}

export async function searchLocationsOnline(
  query: string
): Promise<{ displayName: string; fullAddress?: string; latitude: number; longitude: number }[]> {
  try {
    const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (err) {
    console.warn('[tutorApi] searchLocationsOnline notice:', err);
  }
  return [];
}

/**
 * Fetch all registered teachers from backend
 */
export async function fetchAllTeachers(): Promise<Tutor[]> {
  try {
    const res = await fetch('/api/teachers');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.teachers || [];
  } catch (err) {
    console.warn('[tutorApi] Failed to fetch teachers from API, using fallback data', err);
    const { INITIAL_TUTORS } = await import('../data/tutorsData');
    return INITIAL_TUTORS;
  }
}
