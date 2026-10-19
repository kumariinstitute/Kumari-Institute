export interface TutorReview {
  id: string;
  parentName: string;
  relation: string; // e.g., "Parent of Class 3 student (CBSE)"
  rating: number;
  date: string;
  comment: string;
  studentGrade: string;
  schoolName: string;
  verifiedBooking: boolean;
}

export interface Tutor {
  id: string;
  name: string;
  qualification: string;
  experienceYears: number;
  experienceText: string;
  subjects: string[];
  distanceKm: number;
  latitude: number;
  longitude: number;
  availabilityText: string;
  availabilityType: 'available_now' | 'limited_slots' | 'weekdays_only';
  availabilityBadge: string;
  rating: number;
  reviewCount: number;
  monthlyFee: number;
  hourlyRate?: number;
  bio: string;
  avatar: string;
  gender: 'male' | 'female';
  teacherType: 'home' | 'both';
  classesHandled: string[]; // ['1st Class', '2nd Class', '3rd Class', '4th Class', '5th Class']
  boardsSupported: string[]; // ['CBSE', 'ICSE', 'Odisha State Board']
  locationArea: string;
  addressSnippet: string;
  address?: string;
  locality?: string;
  addressDetails?: any;
  verified: boolean;
  teachingHighlights: string[];
  reviews: TutorReview[];
  phone?: string;
  email?: string;
  status?: 'pending' | 'approved' | 'rejected';
  isApproved?: boolean;
  kycStatus?: 'pending' | 'submitted' | 'verified' | 'approved' | 'rejected';
  isBooked?: boolean;
  bookingStatus?: 'available' | 'booked';
  bookedByStudentName?: string;
  bookedByParentName?: string;
  bookedByParentPhone?: string;
  assignedStudents?: any[];
  educationDetails?: any;
  certificates?: any;
  aadhaarDocUrl?: string;
  aadhaarNumber?: string;
  rejectionReason?: string;
  approvedAt?: string;
  submittedAt?: string;
  createdAt?: string;
  profileCompleted?: boolean;
  customFeeSchedule?: any;
  feeClass1to7?: number;
  feeClass8to10?: number;
  feeClass11to12?: number;
  boards?: string[];
  availableTimeSlots?: string[];
  bookedTimeSlots?: string[];
  lastBookedAt?: string;
  verificationStatus?: string;
  updatedAt?: string;
  videoIntro?: {
    duration: string;
    headline: string;
    description: string;
    posterImage?: string;
    chapters: { title: string; time: string; highlight: string }[];
    sampleSpeech: string;
    teachingFocus: string[];
  };
  educationDossier?: {
    degree: string;
    institution: string;
    experienceSummary: string;
    policeVerificationDate: string;
    backgroundChecked: boolean;
    languagesSpoken: string[];
  };
  dailyRoutine?: { step: string; desc: string; icon: string }[];
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export interface RayagadaLocality {
  id: string;
  name: string;
  subtitle: string;
  landmark: string;
  latitude: number;
  longitude: number;
  tags: string[];
  popularForParents: boolean;
  tutorCount: number;
}

export const RAYAGADA_LOCALITIES: RayagadaLocality[] = [
  {
    id: 'indira-nagar',
    name: 'Indira Nagar',
    subtitle: 'Sector 1 & 2, Kumari Institute & Traffic Square',
    landmark: 'Near Kumari Institute & Sai Mandir',
    latitude: 19.1691,
    longitude: 83.4150,
    tags: ['kumari institute', 'traffic chowk', 'traffic square', 'sector 1', 'sector 2', 'sai mandir', 'indira nagar'],
    popularForParents: true,
    tutorCount: 4
  },
  {
    id: 'college-road',
    name: 'College Road',
    subtitle: 'Autonomous College Area & Science Campus',
    landmark: 'Near Rayagada Autonomous College',
    latitude: 19.1645,
    longitude: 83.4210,
    tags: ['college road', 'autonomous college', 'science college', 'auditorium'],
    popularForParents: true,
    tutorCount: 5
  },
  {
    id: 'barijhola',
    name: 'Barijhola',
    subtitle: 'Convent Road, De Paul School & Sacred Heart',
    landmark: 'Near De Paul School & Convent',
    latitude: 19.1765,
    longitude: 83.4010,
    tags: ['barijhola', 'de paul school', 'sacred heart', 'convent road'],
    popularForParents: true,
    tutorCount: 3
  },
  {
    id: 'new-colony',
    name: 'New Colony',
    subtitle: 'Opposite Gandhi Park, KV School & Collectorate Zone',
    landmark: 'Opposite Gandhi Park & KV School',
    latitude: 19.1620,
    longitude: 83.4100,
    tags: ['new colony', 'gandhi park', 'collectorate', 'kendriya vidyalaya', 'kv school'],
    popularForParents: true,
    tutorCount: 4
  },
  {
    id: 'raniguda-farm',
    name: 'Raniguda Farm',
    subtitle: 'Chinmaya Vidyalaya & Raniguda Farm Road',
    landmark: 'Near Chinmaya Vidyalaya',
    latitude: 19.1550,
    longitude: 83.4280,
    tags: ['raniguda', 'farm road', 'chinmaya vidyalaya'],
    popularForParents: true,
    tutorCount: 3
  },
  {
    id: 'sai-priya-nagar',
    name: 'Sai Priya Nagar',
    subtitle: 'Overbridge Road & Shirdi Sai Baba Temple',
    landmark: 'Near Overbridge & Shirdi Sai Mandir',
    latitude: 19.1660,
    longitude: 83.4130,
    tags: ['sai priya nagar', 'overbridge', 'temple', 'mandir'],
    popularForParents: true,
    tutorCount: 4
  },
  {
    id: 'gandhi-nagar',
    name: 'Gandhi Nagar',
    subtitle: 'Town Hall & Rayagada Public School Area',
    landmark: 'Near Town Hall & Public School',
    latitude: 19.1680,
    longitude: 83.4230,
    tags: ['gandhi nagar', 'town hall', 'public school', 'police station'],
    popularForParents: true,
    tutorCount: 4
  },
  {
    id: 'kasturi-nagar',
    name: 'Kasturi Nagar',
    subtitle: 'Saraswati Sishu Vidya Mandir & Residential Area',
    landmark: 'Near Saraswati Sishu Mandir',
    latitude: 19.1730,
    longitude: 83.4120,
    tags: ['kasturi nagar', 'sishu mandir', 'vidya mandir', 'saraswati'],
    popularForParents: true,
    tutorCount: 3
  },
  {
    id: 'main-market',
    name: 'Main Market / MG Road',
    subtitle: 'Daily Market, Gandhi Chowk & City Center',
    landmark: 'Gandhi Chowk & Main Commercial Hub',
    latitude: 19.1710,
    longitude: 83.4180,
    tags: ['mg road', 'daily market', 'gandhi chowk', 'main road', 'city center'],
    popularForParents: false,
    tutorCount: 2
  },
  {
    id: 'railway-colony',
    name: 'Railway Colony / Station Road',
    subtitle: 'Near Rayagada Railway Junction (RGDA) & DRM Office',
    landmark: 'Rayagada Railway Junction',
    latitude: 19.1740,
    longitude: 83.4260,
    tags: ['railway station', 'station road', 'railway colony', 'drm office'],
    popularForParents: false,
    tutorCount: 2
  },
  {
    id: 'ashok-nagar',
    name: 'Ashok Nagar',
    subtitle: 'Gayatri Temple & Water Tank Area',
    landmark: 'Near Gayatri Temple',
    latitude: 19.1600,
    longitude: 83.4170,
    tags: ['ashok nagar', 'gayatri temple', 'water tank'],
    popularForParents: false,
    tutorCount: 2
  },
  {
    id: 'pitamahal',
    name: 'Pitamahal Road',
    subtitle: 'Pitamahal Colony & Ring Road Bypass',
    landmark: 'Pitamahal Ring Road',
    latitude: 19.1820,
    longitude: 83.3950,
    tags: ['pitamahal', 'ring road', 'bypass'],
    popularForParents: false,
    tutorCount: 1
  }
];

export function findClosestLocality(lat: number, lon: number): RayagadaLocality {
  let closest = RAYAGADA_LOCALITIES[0];
  let minDistance = calculateDistanceKm(lat, lon, closest.latitude, closest.longitude);
  for (let i = 1; i < RAYAGADA_LOCALITIES.length; i++) {
    const d = calculateDistanceKm(lat, lon, RAYAGADA_LOCALITIES[i].latitude, RAYAGADA_LOCALITIES[i].longitude);
    if (d < minDistance) {
      minDistance = d;
      closest = RAYAGADA_LOCALITIES[i];
    }
  }
  return closest;
}

// Active tutors are loaded directly from Firestore and the backend
export const INITIAL_TUTORS: Tutor[] = [];

export const CLASS_OPTIONS = [
  'All Classes (1st to 5th)',
  '1st Class',
  '2nd Class',
  '3rd Class',
  '4th Class',
  '5th Class'
];

export const BOARD_OPTIONS = [
  'All Boards',
  'CBSE',
  'ICSE',
  'Odisha State Board'
];
