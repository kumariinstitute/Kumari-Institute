export interface Program {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  iconName: string;
  features: string[];
  themeColor: 'amber' | 'blue' | 'emerald' | 'purple' | 'teal';
  btnColor: string;
  badgeColor: string;
  bgGradient: string;
  description: string;
  curriculum: string[];
  timingOptions: string[];
  feeEstimate: string;
  image?: string;
  cardPill?: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  boardOrClass: string;
}

export interface ResultHighlight {
  id: string;
  percentageOrCount: string;
  label: string;
  accentColor: string;
}

export interface TopperStudent {
  name: string;
  exam: string;
  score: string;
  school: string;
  badge: string;
}

export interface DemoBookingForm {
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  grade: string;
  subject: string;
  mode: 'Home Tutor' | 'Tuition Center' | 'Online Live';
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

export interface HomeTutorBooking {
  id: string;
  parentUid?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  studentName: string;
  studentGrade: string;
  subjects: string[];
  address: string;
  locality?: string;
  preferredTimeSlot?: string;
  requestedTutorId: string;
  requestedTutorName: string;
  requestedTutorMonthlyFee: number;
  requestedTutorAvatar?: string;
  assignedTutorId?: string;
  assignedTutorName?: string;
  assignedTutorPhone?: string;
  assignedTutorFee?: number;
  assignedTutorAvatar?: string;
  status: 'pending' | 'accepted' | 'reassigned' | 'rejected' | 'declined';
  reassignedNotes?: string;
  declineReason?: string;
  declinedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OfflineDemoQuery {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email?: string;
  grade: string;
  subject: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  queryType?: 'offline_coaching' | 'demo_class';
  status: 'new' | 'contacted' | 'scheduled' | 'enrolled' | 'closed';
  createdAt: string;
}

export interface AdminGalleryItem {
  id: string;
  category: 'students' | 'classrooms' | 'building' | 'events';
  title: string;
  subtitle: string;
  image: string;
  alt?: string;
  iconType?: 'user' | 'users' | 'screen' | 'building';
  createdAt?: string;
}

export interface AdminSuccessStory {
  id: string;
  studentName: string;
  score: string;
  exam: string;
  school?: string;
  parentName?: string;
  testimonial: string;
  image: string;
  year?: string;
  badge?: string;
  createdAt?: string;
}

export type ActivityActionType =
  | 'tutor_approved'
  | 'tutor_rejected'
  | 'tutor_visibility_toggled'
  | 'demo_booking_handled'
  | 'demo_booking_scheduled'
  | 'payment_home_tutor'
  | 'payment_course'
  | 'booking_accepted'
  | 'booking_reassigned'
  | 'booking_declined'
  | 'payout_processed';

export type ActivityCategory =
  | 'all'
  | 'tutors'
  | 'demo_bookings'
  | 'payment_home_tutors'
  | 'payment_courses'
  | 'bookings'
  | 'payouts';

export interface AdminActivityLog {
  id: string;
  adminName: string;
  adminEmail?: string;
  adminAvatar?: string;
  actionType: ActivityActionType;
  category: 'tutors' | 'demo_bookings' | 'payment_home_tutors' | 'payment_courses' | 'bookings' | 'payouts';
  title: string;
  description: string;
  targetId?: string;
  targetName?: string;
  studentName?: string;
  parentName?: string;
  parentPhone?: string;
  tutorName?: string;
  courseTitle?: string;
  amount?: number;
  paymentMethod?: 'UPI / QR' | 'Cash (At Center)' | 'Bank Transfer / NEFT' | 'Online Card / Gateway';
  transactionId?: string;
  receiptNo?: string;
  status: 'completed' | 'verified' | 'pending' | 'flagged';
  notes?: string;
  timestamp: string; // ISO
}

