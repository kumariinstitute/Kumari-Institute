import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Calendar,
  MapPin,
  Video,
  Receipt,
  Phone,
  Mail,
  X,
  Printer,
  Edit3,
  Save,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  LogOut,
  GraduationCap,
  School,
  Loader2,
  Check,
  ChevronRight,
  BookOpen,
  Users,
  CheckSquare,
  ShieldCheck,
  AlertCircle,
  Wallet,
  IndianRupee,
  ArrowUpRight,
  UploadCloud,
  Camera,
  Search,
  CreditCard
} from 'lucide-react';
import {
  AppUserProfile,
  updateUserProfileInFirebase,
  isTeacherApprovedInRegistry,
  markTeacherApprovedInRegistry
} from '../services/firebaseAuth';
import { AVAILABLE_1HR_SLOTS } from './TeacherCompleteProfilePage';
import {
  INDIAN_BOARDS_A_TO_Z,
  INDIAN_UNIVERSITIES_A_TO_Z,
  INDIAN_COURSES_A_TO_Z
} from '../data/educationData';
import { compressImageToBase64 } from '../utils/imageUtils';
import {
  TutorWithdrawalRequest,
  calculateTutorEarnings,
  submitWithdrawalRequest,
  subscribeToTutorWithdrawals
} from '../services/payoutService';
import {
  ReceivedFeeRecord,
  getTutorPaymentStatus,
  subscribeToReceivedFees
} from '../services/feePaymentService';
import { PayTutorFeeModal } from './PayTutorFeeModal';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProfilePageProps {
  user: AppUserProfile | null;
  onNavigateHome: () => void;
  onNavigateCourses: () => void;
  onNavigateTutors: () => void;
  onCompleteTeacherProfile?: () => void;
  onLogout: () => void;
  onProfileUpdated?: (updatedUser: AppUserProfile) => void;
  onOpenEnquiry?: () => void;
  onOpenDemoBooking?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onNavigateHome,
  onNavigateCourses,
  onNavigateTutors,
  onCompleteTeacherProfile,
  onLogout,
  onProfileUpdated,
  onOpenEnquiry,
}) => {
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isLiveClassModalOpen, setIsLiveClassModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    id: string;
    date: string;
    description: string;
    amount: string;
    status: string;
    utrNumber?: string;
    transferMethod?: string;
    paymentSlipUrl?: string;
    adminNote?: string;
  } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Pay Fee Modal state for Parent
  const [payFeeModalBooking, setPayFeeModalBooking] = useState<any | null>(null);
  const [parentFeeRecords, setParentFeeRecords] = useState<ReceivedFeeRecord[]>([]);
  const [dismissedFeeToast, setDismissedFeeToast] = useState(false);

  // Withdrawal request form state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [withdrawUpiId, setWithdrawUpiId] = useState('');
  const [withdrawBankName, setWithdrawBankName] = useState('');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('');
  const [withdrawIfsc, setWithdrawIfsc] = useState('');
  const [withdrawAccountHolder, setWithdrawAccountHolder] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);
  const [tutorWithdrawals, setTutorWithdrawals] = useState<TutorWithdrawalRequest[]>([]);

  // Message state
  const [messageRecipient, setMessageRecipient] = useState<{
    name: string;
    role: string;
    phone?: string;
  }>({
    name: '',
    role: '',
    phone: ''
  });
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Live class selected state (for parent)
  const [selectedLiveClass, setSelectedLiveClass] = useState<{
    subject: string;
    teacher: string;
    time: string;
    date: string;
  } | null>(null);

  // Common Profile fields
  const [liveUser, setLiveUser] = useState<AppUserProfile | null>(user);
  const isTeacher = (liveUser?.role || user?.role) === 'teacher';
  const [name, setName] = useState(user?.name || user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [locality, setLocality] = useState(user?.locality || user?.address || '');

  // Teacher Profile Picture in Edit modal
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatar || user?.photoUrl || ''
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Parent Specific fields
  const [childName, setChildName] = useState(user?.childName || '');
  const [childGrade, setChildGrade] = useState(user?.childGrade || '');
  const [childBoard, setChildBoard] = useState((user as any)?.childBoard || (user as any)?.board || '');
  const [childSchool, setChildSchool] = useState(user?.childSchool || '');

  // Teacher Specific fields
  const [teacherQualification, setTeacherQualification] = useState(user?.qualification || user?.highestQualification || '');
  const [teacherUniversity, setTeacherUniversity] = useState(user?.university || '');
  const [teacherExperience, setTeacherExperience] = useState(user?.experience || '');
  const [teacherHourlyFee, setTeacherHourlyFee] = useState<string>(
    user?.hourlyCharges?.toString() || user?.hourlyFee?.toString() || ''
  );
  const [teacherBio, setTeacherBio] = useState(user?.bio || '');

  // Teacher Availability slots for quick access popup
  const [teacherSlots, setTeacherSlots] = useState<string[]>(
    user?.availableTimeSlots || []
  );
  const [isSavingSlots, setIsSavingSlots] = useState(false);
  const [slotsSavedToast, setSlotsSavedToast] = useState(false);

  // Live Firestore listener for active user document
  useEffect(() => {
    if (!user?.uid) return;
    const colName = isTeacher ? 'teachers' : 'parents';
    const docRef = doc(db, colName, user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isApprovedInFirestore = Boolean(
          data.isApproved === true ||
          data.status === 'approved' ||
          data.verified === true ||
          data.kycStatus === 'verified' ||
          data.kycStatus === 'approved' ||
          data.verificationStatus === 'Verified Genuine Tutor' ||
          isTeacherApprovedInRegistry(user.uid, (user as any).id, user.email, (user as any).phone)
        );
        const updated: AppUserProfile = {
          ...user,
          ...data,
          uid: user.uid,
          name: data.fullName || data.name || user.name,
          email: data.email || user.email,
          role: (data.role || user.role) as 'parent' | 'teacher',
          phone: data.phone || '',
          locality: data.locality || data.address || '',
          childName: data.childName || '',
          childGrade: data.childGrade || '',
          childBoard: data.childBoard || data.board || '',
          childSchool: data.childSchool || '',
          qualification: data.highestQualification || data.qualification || '',
          university: data.university || '',
          experience: data.experience || '',
          hourlyCharges: data.hourlyCharges || data.hourlyRate,
          hourlyFee: data.hourlyFee || data.hourlyRate,
          monthlyFee: data.monthlyFee,
          bio: data.bio || '',
          avatar: data.avatar || data.photoUrl || '',
          availableTimeSlots: Array.isArray(data.availableTimeSlots) ? data.availableTimeSlots : [],
          profileCompleted: Boolean(data.profileCompleted),
          verified: isApprovedInFirestore || Boolean(data.verified),
          kycStatus: isApprovedInFirestore ? 'approved' : (data.kycStatus || 'pending')
        };
        if (isApprovedInFirestore) {
          (updated as any).isApproved = true;
          (updated as any).status = 'approved';
          (updated as any).kycStatus = 'approved';
          (updated as any).verificationStatus = 'Verified Genuine Tutor';
          markTeacherApprovedInRegistry(user.uid);
          if (user.email) markTeacherApprovedInRegistry(user.email);
        }
        setLiveUser(updated);
        setName(updated.name);
        setPhone(updated.phone || '');
        setLocality(updated.locality || '');
        if (updated.avatar) setAvatarUrl(updated.avatar);
        if (!isTeacher) {
          setChildName(updated.childName || '');
          setChildGrade(updated.childGrade || '');
          setChildBoard((updated as any).childBoard || '');
          setChildSchool(updated.childSchool || '');
        } else {
          setTeacherQualification(updated.qualification || '');
          setTeacherUniversity(updated.university || '');
          setTeacherExperience(updated.experience || '');
          setTeacherHourlyFee(updated.hourlyCharges?.toString() || updated.hourlyFee?.toString() || '');
          setTeacherBio(updated.bio || '');
          if (updated.availableTimeSlots && updated.availableTimeSlots.length > 0) {
            setTeacherSlots(updated.availableTimeSlots);
          }
        }
      }
    }, (err) => {
      console.warn('[ProfilePage] Firestore user document sync notice:', err);
    });
    return () => unsubscribe();
  }, [user?.uid, isTeacher]);

  // Live Firestore listener for trial bookings and demo requests
  const [liveBookings, setLiveBookings] = useState<any[]>([]);
  useEffect(() => {
    if (!user?.uid) return;
    const bookingsCol = collection(db, 'demo_bookings');
    const q = query(bookingsCol);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matching: any[] = [];
      snapshot.forEach((d) => {
        const b = d.data();
        if (isTeacher) {
          if (b.teacherId === user.uid || b.assignedTeacherId === user.uid) {
            matching.push({ id: d.id, ...b });
          }
        } else {
          if (b.userId === user.uid || (user.email && b.email?.toLowerCase() === user.email.toLowerCase()) || (user.phone && b.phone === user.phone)) {
            matching.push({ id: d.id, ...b });
          }
        }
      });
      setLiveBookings(matching);
    }, (err) => {
      console.warn('[ProfilePage] Demo bookings listener notice:', err);
    });
    return () => unsubscribe();
  }, [user?.uid, isTeacher, user?.email, user?.phone]);

  // Live Firestore listener for Home Tutor bookings ('tutor_bookings' collection)
  const [liveHomeTutorBookings, setLiveHomeTutorBookings] = useState<any[]>([]);
  useEffect(() => {
    if (!user?.uid) return;
    const tutorBookingsCol = collection(db, 'tutor_bookings');
    const unsubscribe = onSnapshot(tutorBookingsCol, (snapshot) => {
      const matching: any[] = [];
      snapshot.forEach((d) => {
        const b: any = { id: d.id, ...d.data() };
        if (isTeacher) {
          if (b.assignedTutorId === user.uid || b.requestedTutorId === user.uid) {
            matching.push(b);
          }
        } else {
          if (
            b.parentUid === user.uid ||
            (user.email && b.parentEmail?.toLowerCase() === user.email.toLowerCase()) ||
            (user.phone && b.parentPhone === user.phone)
          ) {
            matching.push(b);
          }
        }
      });
      matching.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setLiveHomeTutorBookings(matching);
    }, (err) => {
      console.warn('[ProfilePage] tutor_bookings listener notice:', err);
    });
    return () => unsubscribe();
  }, [user?.uid, isTeacher, user?.email, user?.phone]);

  // Real-time listener for Tutor Withdrawal Requests
  useEffect(() => {
    if (!user?.uid || !isTeacher) return;
    const unsub = subscribeToTutorWithdrawals(user.uid, user.email, (reqs) => {
      setTutorWithdrawals(reqs);
    });
    return () => unsub();
  }, [user?.uid, isTeacher, user?.email]);

  // Real-time listener for Parent Fee Payments ('received_fees' collection)
  useEffect(() => {
    if (!user?.uid || isTeacher) return;
    const unsub = subscribeToReceivedFees((records) => {
      // Find records matching current parent uid, email, or phone
      const matching = records.filter(
        (r) =>
          r.parentUid === user.uid ||
          (user.email && r.parentEmail && r.parentEmail.toLowerCase() === user.email.toLowerCase()) ||
          (user.phone && r.parentPhone === user.phone)
      );
      setParentFeeRecords(matching);
    });
    return () => unsub();
  }, [user?.uid, isTeacher, user?.email, user?.phone]);

  // Section-based completion & verification calculation
  // 1. Personal Info
  // 2. Qualifications
  // 3. Subjects & Pricing
  // 4. KYC Verification
  // Status: Red for pending, Yellow for verification-in-progress, Green for completed based on form submission status.
  const activeUserData = liveUser || user;
  const isProfileSubmitted = Boolean(activeUserData?.profileCompleted || user?.profileCompleted);
  const isKycVerified = Boolean(
    activeUserData?.verified === true ||
    (activeUserData as any)?.isApproved === true ||
    (activeUserData as any)?.status === 'approved' ||
    activeUserData?.kycStatus === 'verified' ||
    activeUserData?.kycStatus === 'approved' ||
    (activeUserData as any)?.verificationStatus === 'Verified Genuine Tutor' ||
    user?.verified === true ||
    (user as any)?.isApproved === true ||
    (user as any)?.status === 'approved' ||
    user?.kycStatus === 'verified' ||
    user?.kycStatus === 'approved' ||
    (user as any)?.verificationStatus === 'Verified Genuine Tutor' ||
    isTeacherApprovedInRegistry(activeUserData?.uid, (activeUserData as any)?.id, activeUserData?.email, (activeUserData as any)?.phone) ||
    isTeacherApprovedInRegistry(user?.uid, (user as any)?.id, user?.email, (user as any)?.phone)
  );
  const isKycInProgress = isProfileSubmitted && !isKycVerified;

  const profileSectionItems = [
    {
      id: 'personal-info',
      title: 'Personal Info',
      status: isProfileSubmitted ? ('completed' as const) : ('pending' as const),
      statusLabel: isProfileSubmitted ? 'Completed' : 'Pending',
      description: isProfileSubmitted
        ? 'Name, full residential address & GPS pin saved'
        : 'Residential address & contact details required'
    },
    {
      id: 'qualifications',
      title: 'Qualifications',
      status: isProfileSubmitted ? ('completed' as const) : ('pending' as const),
      statusLabel: isProfileSubmitted ? 'Completed' : 'Pending',
      description: isProfileSubmitted
        ? '10th, 12th & Degree marksheets uploaded'
        : 'Board certificates & degree details required'
    },
    {
      id: 'subjects-pricing',
      title: 'Subjects & Pricing',
      status: isProfileSubmitted ? ('completed' as const) : ('pending' as const),
      statusLabel: isProfileSubmitted ? 'Completed' : 'Pending',
      description: isProfileSubmitted
        ? 'Hourly charges & available tuition slots set'
        : 'Hourly fee & 1-hour time slots required'
    },
    {
      id: 'kyc-verification',
      title: 'KYC Verification',
      status: isKycVerified
        ? ('completed' as const)
        : isKycInProgress
        ? ('in-progress' as const)
        : ('pending' as const),
      statusLabel: isKycVerified
        ? 'KYC Completed'
        : isKycInProgress
        ? 'Verification in Progress'
        : 'Pending',
      description: isKycVerified
        ? 'Credentials verified & tuition badge active (KYC Completed)'
        : isKycInProgress
        ? 'Verification in progress by Rayagada team'
        : 'Requires profile form submission for review'
    }
  ];

  const profileCompletionPercent = isKycVerified ? 100 : isProfileSubmitted ? 75 : 0;

  // Dynamic Teacher Assigned Students (loaded reactively from user document & tutor_bookings collection)
  const assignedStudents = React.useMemo(() => {
    const listFromUser: any[] = liveUser?.assignedStudents || user?.assignedStudents || [];
    const tutorUid = liveUser?.uid || user?.uid || liveUser?.id || user?.id || '';

    const fromBookings = liveHomeTutorBookings
      .filter((b) => {
        const isMatchedTutor = b.assignedTutorId === tutorUid || b.requestedTutorId === tutorUid;
        const isActiveStatus = b.status === 'accepted' || b.status === 'assigned';
        return isMatchedTutor && isActiveStatus;
      })
      .map((b) => ({
        id: b.id,
        bookingId: b.id,
        studentName: b.studentName,
        name: b.studentName,
        grade: b.studentGrade || 'Tuition Student',
        board: b.studentBoard || b.board || '',
        school: b.studentSchool || b.school || '',
        parentName: b.parentName || 'Parent',
        parentPhone: b.parentPhone || '',
        parentEmail: b.parentEmail || '',
        address: b.address || b.locality || 'Rayagada',
        locality: b.locality || b.address || 'Rayagada',
        subjects: b.subjects || ['Home Tuition'],
        timing: b.preferredTimeSlot || '5:00 PM - 6:00 PM',
        monthlyFee: b.assignedTutorFee || b.requestedTutorMonthlyFee || 3000,
        assignedAt: b.assignedAt || b.createdAt,
        status: 'Active'
      }));

    // Comprehensive deduplication map by canonical composite key
    const map = new Map<string, any>();
    const allCandidates = [...listFromUser, ...fromBookings];

    for (const raw of allCandidates) {
      if (!raw) continue;
      const cleanBookingId = (raw.bookingId || raw.id || '')
        .toString()
        .replace(/^std-/, '')
        .trim();
      const normName = (raw.studentName || raw.name || '')
        .toString()
        .trim()
        .toLowerCase();
      const normPhone = (raw.parentPhone || raw.phone || '')
        .toString()
        .replace(/\D/g, '');

      // Determine if an existing student matches either this cleanBookingId or normName + normPhone
      let matchedKey: string | null = null;
      for (const [k, ex] of map.entries()) {
        const exCleanBId = (ex.bookingId || ex.id || '').toString().replace(/^std-/, '').trim();
        const exNormName = (ex.studentName || ex.name || '').toString().trim().toLowerCase();
        const exNormPhone = (ex.parentPhone || ex.phone || '').toString().replace(/\D/g, '');

        if (cleanBookingId && exCleanBId && cleanBookingId === exCleanBId) {
          matchedKey = k;
          break;
        }
        if (normName && exNormName && normName === exNormName) {
          if (!normPhone || !exNormPhone || normPhone === exNormPhone) {
            matchedKey = k;
            break;
          }
        }
      }

      const targetKey = matchedKey || cleanBookingId || (normName ? `${normName}_${normPhone}` : (raw.id || String(Math.random())));

      if (map.has(targetKey)) {
        const existing = map.get(targetKey);
        map.set(targetKey, {
          ...existing,
          ...raw,
          id: existing.id || raw.id,
          name: raw.name || raw.studentName || existing.name || existing.studentName || 'Student',
          studentName: raw.studentName || raw.name || existing.studentName || existing.name || 'Student',
          grade: raw.grade || raw.studentGrade || existing.grade || 'Tuition Student',
          school: raw.school || raw.studentSchool || existing.school || '',
          locality: raw.locality || raw.address || existing.locality || existing.address || 'Rayagada',
          address: raw.address || raw.locality || existing.address || 'Rayagada',
          parentName: raw.parentName || existing.parentName || 'Parent',
          parentPhone: raw.parentPhone || existing.parentPhone || '',
          timing: raw.timing || raw.preferredTimeSlot || existing.timing || '5:00 PM - 6:00 PM',
          subjects: raw.subjects || existing.subjects || ['Home Tuition']
        });
      } else {
        map.set(targetKey, {
          id: raw.id || `std-${targetKey}`,
          bookingId: cleanBookingId || raw.bookingId || raw.id,
          name: raw.name || raw.studentName || 'Student',
          studentName: raw.studentName || raw.name || 'Student',
          grade: raw.grade || raw.studentGrade || 'Tuition Student',
          board: raw.board || raw.studentBoard || '',
          school: raw.school || raw.studentSchool || '',
          parentName: raw.parentName || 'Parent',
          parentPhone: raw.parentPhone || '',
          parentEmail: raw.parentEmail || '',
          address: raw.address || raw.locality || 'Rayagada',
          locality: raw.locality || raw.address || 'Rayagada',
          subjects: raw.subjects || ['Home Tuition'],
          timing: raw.timing || raw.preferredTimeSlot || '5:00 PM - 6:00 PM',
          monthlyFee: raw.monthlyFee || raw.assignedTutorFee || 3000,
          assignedAt: raw.assignedAt || raw.createdAt || new Date().toISOString(),
          status: raw.status || 'Active'
        });
      }
    }

    return Array.from(map.values());
  }, [liveUser?.assignedStudents, user?.assignedStudents, liveHomeTutorBookings, liveUser?.uid, user?.uid, liveUser?.id, user?.id]);

  const [markedAttendance, setMarkedAttendance] = useState<Record<string, boolean>>({});
  const [attendanceAlert, setAttendanceAlert] = useState<string | null>(null);

  const handleMarkAttendance = (studentId: string, studentName: string) => {
    setMarkedAttendance((prev) => {
      const next = !prev[studentId];
      setAttendanceAlert(
        next
          ? `Attendance recorded for ${studentName} (${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`
          : `Attendance unmarked for ${studentName}`
      );
      setTimeout(() => setAttendanceAlert(null), 3000);
      return { ...prev, [studentId]: next };
    });
  };

  // Avatar upload handler for profile picture (compresses and stores permanent Base64 data URL)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      return;
    }
    try {
      const base64Url = await compressImageToBase64(file, 500, 0.85);
      if (base64Url) {
        setAvatarUrl(base64Url);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        if (res) setAvatarUrl(res);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle availability slot
  const handleToggleTeacherSlot = (slot: string) => {
    setTeacherSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Save availability slots directly to user profile
  const handleSaveAvailability = async () => {
    if (!user) return;
    setIsSavingSlots(true);
    try {
      const updated = await updateUserProfileInFirebase(user.uid, {
        availableTimeSlots: teacherSlots,
        timeSlots: teacherSlots
      } as any);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setSlotsSavedToast(true);
      setTimeout(() => {
        setSlotsSavedToast(false);
        setIsAvailabilityModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Save slots error:', err);
    } finally {
      setIsSavingSlots(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent, maxAvailable: number) => {
    e.preventDefault();
    if (!user) return;
    const numAmount = Number(withdrawAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setWithdrawNotice('Please enter a valid amount.');
      return;
    }
    if (numAmount > maxAvailable) {
      setWithdrawNotice(`Amount exceeds your available current balance of ₹${maxAvailable.toLocaleString('en-IN')}`);
      return;
    }

    if (withdrawMethod === 'upi' && !withdrawUpiId.trim()) {
      setWithdrawNotice('Please enter your UPI ID (e.g. yourname@oksbi).');
      return;
    }

    if (withdrawMethod === 'bank_transfer') {
      if (!withdrawAccountNumber.trim() || !withdrawIfsc.trim() || !withdrawAccountHolder.trim()) {
        setWithdrawNotice('Please enter your Account Number, IFSC Code, and Account Holder Name.');
        return;
      }
    }

    setIsSubmittingWithdraw(true);
    setWithdrawNotice(null);
    try {
      await submitWithdrawalRequest({
        tutorId: user.uid,
        tutorName: user.name || 'Tutor',
        tutorEmail: user.email,
        tutorPhone: user.phone || phone,
        amount: numAmount,
        paymentMethod: withdrawMethod,
        upiId: withdrawMethod === 'upi' ? withdrawUpiId.trim() : undefined,
        bankDetails:
          withdrawMethod === 'bank_transfer'
            ? {
                bankName: withdrawBankName.trim() || 'Bank Account',
                accountNumber: withdrawAccountNumber.trim(),
                ifscCode: withdrawIfsc.trim().toUpperCase(),
                accountHolder: withdrawAccountHolder.trim()
              }
            : undefined,
        notes: withdrawNotes.trim()
      });

      setWithdrawNotice('Withdrawal request submitted! Sent to Kumari Institute Admin for verification and transfer.');
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        setWithdrawNotice(null);
      }, 2000);
    } catch (err: any) {
      setWithdrawNotice(err?.message || 'Failed to submit withdrawal request.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const parsedHourly = teacherHourlyFee ? Number(teacherHourlyFee) : 0;
      const payload: Partial<AppUserProfile> = isTeacher
        ? {
            name: name.trim(),
            phone: phone.trim(),
            locality: locality.trim(),
            qualification: teacherQualification.trim(),
            university: teacherUniversity.trim(),
            experience: teacherExperience.trim(),
            hourlyCharges: parsedHourly > 0 ? parsedHourly : 0,
            hourlyFee: parsedHourly > 0 ? parsedHourly : 0,
            monthlyFee: parsedHourly > 0 ? parsedHourly * 30 : 0,
            bio: teacherBio.trim(),
            avatar: avatarUrl,
            photoUrl: avatarUrl,
            profileCompleted: true,
            ...(isKycVerified ? {
              isApproved: true,
              verified: true,
              status: 'approved',
              kycStatus: 'approved',
              verificationStatus: 'Verified Genuine Tutor'
            } : {})
          }
        : {
            name: name.trim(),
            phone: phone.trim(),
            locality: locality.trim(),
            childName: childName.trim(),
            childGrade: childGrade.trim(),
            childSchool: childSchool.trim()
          };

      const updated = await updateUserProfileInFirebase(user.uid, payload);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageText('');
      setIsMessageModalOpen(false);
    }, 1500);
  };

  return (
    <div id="profile-page" className="min-h-screen bg-slate-50/60 text-slate-800 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Minimal Breadcrumb & Back */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Account Profile</span>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {(() => {
              const displayAvatar = (user?.avatar?.trim() || user?.photoUrl?.trim() || (isTeacher ? avatarUrl?.trim() : '')) || null;
              return displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={user?.name || name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 shadow-xs ring-4 ring-slate-50 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs ring-4 ring-slate-50">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              );
            })()}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {user?.name || name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {isTeacher ? 'Teacher Account' : 'Parent Account'}
                </span>
                {isTeacher && isKycVerified && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>KYC Completed</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email || 'user@example.com'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.phone || phone}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
            {isTeacher ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Earnings</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Attendance Toast Notification */}
        {attendanceAlert && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{attendanceAlert}</span>
          </div>
        )}

        {/* Parent Specific Sections */}
        {!isTeacher && (
          <div className="space-y-6">
            {/* 3-Day Upcoming Tuition Fee Toast & Small Banner Notification */}
            {(() => {
              const bookingsList = liveHomeTutorBookings.length > 0 ? liveHomeTutorBookings : (
                (liveUser?.hiredTutors && liveUser.hiredTutors.length > 0)
                  ? liveUser.hiredTutors
                  : (liveUser?.assignedEducator ? [liveUser.assignedEducator] : (user?.assignedEducator ? [user.assignedEducator] : []))
              );

              // Check payment status for all assigned tutors
              const alertCandidates = bookingsList.map((b: any) => {
                const tutorId = b.assignedTutorId || b.requestedTutorId || b.id;
                const status = getTutorPaymentStatus(b.id, tutorId, parentFeeRecords, activeUserData);
                const tutorName =
                  b.assignedTutorName || b.requestedTutorName || b.tutorName || b.name || 'Specialized Home Tutor';
                const tutorFee =
                  b.assignedTutorFee || b.requestedTutorMonthlyFee || b.monthlyFee || b.fee || 3000;
                return {
                  booking: b,
                  tutorName,
                  tutorFee,
                  status
                };
              });

              // Alert 1: 3 Days Before Next Monthly Tuition Fee is Due (1, 2, or 3 days remaining)
              const dueSoonCandidate = alertCandidates.find(
                (c) => c.status.isPaid && c.status.daysRemaining <= 3 && c.status.daysRemaining > 0
              );

              // Alert 2: Overdue or Due Now
              const overdueCandidate = alertCandidates.find(
                (c) => c.status.isOverdue || (!c.status.isPaid && (c.booking.status === 'accepted' || c.booking.status === 'assigned'))
              );

              const activeAlert = dueSoonCandidate || overdueCandidate;
              if (!activeAlert) return null;

              const isDueSoon = Boolean(dueSoonCandidate);
              const daysRemaining = activeAlert.status.daysRemaining;

              return (
                <div className="space-y-3">
                  {/* Toast Alert on Dashboard (Interactive with dismiss) */}
                  {!dismissedFeeToast && (
                    <div
                      id="parent-fee-due-toast"
                      role="alert"
                      className={`p-4 rounded-2xl border shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                        isDueSoon
                          ? 'bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 border-amber-300 text-amber-950'
                          : 'bg-gradient-to-r from-rose-50 via-red-50/80 to-rose-50 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isDueSoon ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'
                          }`}
                        >
                          <Clock className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm">
                              {isDueSoon
                                ? `⚠️ Monthly Tuition Fee Due in ${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'}!`
                                : '⚠️ Monthly Tuition Cycle Expired!'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDueSoon ? 'bg-amber-200 text-amber-900' : 'bg-rose-200 text-rose-900'
                              }`}
                            >
                              Due: {activeAlert.status.nextDueDate || 'Now'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Tuition for <strong>{activeAlert.tutorName}</strong> (₹{activeAlert.tutorFee}) is due soon. Click below to pay online and keep classes uninterrupted.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          id="toast-pay-fee-now-btn"
                          onClick={() => setPayFeeModalBooking(activeAlert.booking)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95 ${
                            isDueSoon
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Fee Now</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDismissedFeeToast(true)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
                          title="Dismiss notification toast"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Small Banner Notification on Dashboard */}
                  <div
                    id="parent-fee-due-banner"
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                      isDueSoon
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-rose-50/80 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className={`w-4 h-4 shrink-0 ${isDueSoon ? 'text-amber-600' : 'text-rose-600'}`} />
                      <div className="text-xs">
                        <strong>
                          {isDueSoon
                            ? `Upcoming Tuition Fee (${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining):`
                            : '28-Day Monthly Cycle Expired:'}
                        </strong>{' '}
                        Monthly tuition for <strong>{activeAlert.tutorName}</strong> (₹{activeAlert.tutorFee}) is scheduled for{' '}
                        <strong>{activeAlert.status.nextDueDate || 'renewal'}</strong>.
                      </div>
                    </div>
                    <button
                      type="button"
                      id="banner-pay-fee-direct-btn"
                      onClick={() => setPayFeeModalBooking(activeAlert.booking)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 transition-all self-end sm:self-auto ${
                        isDueSoon
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isDueSoon ? 'Pay Fee' : 'Pay Now'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 1. Booked Home Tutors & Assigned Educators - Real-Time from Firestore */}
            {(() => {
              // Combine liveHomeTutorBookings and hiredTutors / assignedEducator
              const bookingsList = liveHomeTutorBookings.length > 0 ? liveHomeTutorBookings : (
                (liveUser?.hiredTutors && liveUser.hiredTutors.length > 0)
                  ? liveUser.hiredTutors
                  : (liveUser?.assignedEducator ? [liveUser.assignedEducator] : (user?.assignedEducator ? [user.assignedEducator] : []))
              );

              return (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Booked Home Tutors &amp; Assigned Educators</span>
                    </div>
                    {bookingsList.length > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {bookingsList.filter((b: any) => b.status === 'accepted' || b.status === 'assigned' || !b.status).length} Active • {bookingsList.length} Total
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                        No Bookings Yet
                      </span>
                    )}
                  </div>

                  {/* 28-Day Renewal Notice Banner if payment is overdue */}
                  {(() => {
                    const overdueItem = bookingsList.find((b: any) => {
                      const st = getTutorPaymentStatus(
                        b.id,
                        b.assignedTutorId || b.requestedTutorId || b.id,
                        parentFeeRecords,
                        activeUserData
                      );
                      return st.isOverdue;
                    });

                    if (overdueItem) {
                      const tName = overdueItem.assignedTutorName || overdueItem.requestedTutorName || 'Home Tutor';
                      return (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              <strong>28-Day Monthly Cycle Completed:</strong> Tuition renewal for <strong>{tName}</strong> is now due. Please click <strong>Pay Now</strong> below to continue uninterrupted sessions.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPayFeeModalBooking(overdueItem)}
                            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs"
                          >
                            Pay Now
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {bookingsList.length > 0 ? (
                    <div className="space-y-3.5">
                      {bookingsList.map((item: any, idx: number) => {
                        const isAccepted = item.status === 'accepted' || item.status === 'assigned' || (!item.status && item.id);
                        const isPending = item.status === 'pending';
                        const isDeclined = item.status === 'declined';
                        const tutorName = item.assignedTutorName || item.requestedTutorName || item.tutorName || item.name || 'Specialized Home Tutor';
                        const tutorFee = item.assignedTutorFee || item.requestedTutorMonthlyFee || item.monthlyFee;
                        const tutorPhone = item.assignedTutorPhone || item.phone;
                        const tutorSubjects = Array.isArray(item.subjects) ? item.subjects.join(', ') : (item.subjects || 'Home Tuition');
                        const sName = item.studentName || childName;
                        const sGrade = item.studentGrade || childGrade;

                        return (
                          <div
                            key={item.id || `booking-${idx}`}
                            className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200">
                                {tutorName ? tutorName.slice(0, 2).toUpperCase() : 'HT'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-sm text-slate-900 truncate">{tutorName}</h4>
                                  {isAccepted && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      ✓ Assigned &amp; Active
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                      <span>Pending Admin Verification</span>
                                    </span>
                                  )}
                                  {isDeclined && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                      ✕ Declined
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5">{tutorSubjects}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                                  {sName && (
                                    <span>
                                      Student: <strong className="text-slate-700">{sName}</strong> {sGrade ? `(${sGrade})` : ''}
                                    </span>
                                  )}
                                  {item.preferredTimeSlot && (
                                    <span>
                                      Slot: <strong className="text-slate-700">{item.preferredTimeSlot}</strong>
                                    </span>
                                  )}
                                  {tutorFee && (
                                    <span className="text-emerald-700 font-bold">₹{tutorFee}/month</span>
                                  )}
                                </div>
                                {isDeclined && item.declineReason && (
                                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                                    Reason: {item.declineReason}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons Column */}
                            <div className="flex flex-col items-end gap-2 shrink-0 self-end md:self-center">
                              {isAccepted && (
                                <>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMessageRecipient({
                                          name: tutorName,
                                          role: 'Assigned Home Tutor',
                                          phone: tutorPhone
                                        });
                                        setIsMessageModalOpen(true);
                                      }}
                                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 text-blue-300" />
                                      <span>Message</span>
                                    </button>
                                    {tutorPhone && (
                                      <a
                                        href={`tel:${tutorPhone}`}
                                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                                      >
                                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Call</span>
                                      </a>
                                    )}
                                  </div>

                                  {/* Pay Fee / Pay Now Button / Paid Status directly at bottom of Message & Call buttons */}
                                  {(() => {
                                    const payStatus = getTutorPaymentStatus(
                                      item.id,
                                      item.assignedTutorId || item.requestedTutorId || item.id,
                                      parentFeeRecords,
                                      activeUserData
                                    );

                                    if (payStatus.isPaid) {
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (payStatus.lastPayment) {
                                              setSelectedReceipt({
                                                id: payStatus.lastPayment.receiptNo,
                                                date: `${payStatus.lastPayment.paidDate} • ${payStatus.lastPayment.paidTime}`,
                                                description: payStatus.lastPayment.billingPeriod,
                                                amount: payStatus.lastPayment.formattedAmount,
                                                status: 'Paid',
                                                utrNumber: payStatus.lastPayment.transactionId,
                                                transferMethod: payStatus.lastPayment.paymentMethod,
                                                adminNote: `Tuition renewal active for next ${payStatus.daysRemaining} days (due ${payStatus.nextDueDate})`
                                              });
                                            }
                                          }}
                                          title={`Tuition active for next ${payStatus.daysRemaining} days (due ${payStatus.nextDueDate}). Click to view receipt.`}
                                          className="w-full px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Paid ({payStatus.daysRemaining}d left)</span>
                                        </button>
                                      );
                                    }

                                    // If previous payment was made and 28 days have passed -> Display prominent "Pay Now" button asking for recurring payment
                                    if (payStatus.isOverdue) {
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => setPayFeeModalBooking(item)}
                                          className="w-full px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/25 animate-pulse transition-all"
                                          title={`Monthly tuition cycle of 28 days has ended (due ${payStatus.nextDueDate}). Pay now to maintain regular classes.`}
                                        >
                                          <CreditCard className="w-3.5 h-3.5 text-white" />
                                          <span>Pay Now ({tutorFee ? `₹${tutorFee}` : 'Monthly'})</span>
                                        </button>
                                      );
                                    }

                                    // Initial first-time payment
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => setPayFeeModalBooking(item)}
                                        className="w-full px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 hover:scale-[1.02] transition-all"
                                      >
                                        <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                                        <span>Pay Now ({tutorFee ? `₹${tutorFee}` : 'Monthly'})</span>
                                      </button>
                                    );
                                  })()}
                                </>
                              )}
                              {isPending && (
                                <span className="text-xs text-amber-700 font-medium italic">
                                  Admin verifying availability...
                                </span>
                              )}
                              {isDeclined && (
                                <button
                                  type="button"
                                  onClick={onNavigateTutors}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                                >
                                  Book Another Tutor
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 p-4">
                      <User className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No Booked Home Tutors Yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5 mb-3">
                        Connect with verified home tutors near your location in Rayagada and book 1-on-1 tutoring at home.
                      </p>
                      <button
                        type="button"
                        onClick={onNavigateTutors}
                        className="px-3.5 py-1.5 bg-[#0c2340] hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Find Home Tutors</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. Enrolled Courses & Live Classes - Came Second */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Enrolled Courses &amp; Live Classes</span>
                </div>
                <button
                  type="button"
                  onClick={onNavigateCourses}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Explore Courses</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {user?.enrolledCourses && user.enrolledCourses.length > 0 ? (
                  user.enrolledCourses.map((course: any, idx: number) => (
                    <div
                      key={course.id || idx}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">
                          {course.title ? course.title.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{course.title}</h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                              {course.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Batch Fee: <span className="font-medium text-slate-700">{course.fee || 'Enrolled'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 p-4">
                    <BookOpen className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No Enrolled Courses Yet</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5 mb-3">
                      Explore Rayagada foundation batches (JNVST, Sainik School) or connect with top home tutors.
                    </p>
                    <button
                      type="button"
                      onClick={onNavigateCourses}
                      className="px-3.5 py-1.5 bg-[#0c2340] hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Browse Batches</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Fee Receipts & Quick Access */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Fee Receipts & Statements */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span>Fee Receipts</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">All dues cleared</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {(() => {
                    // Combine Firestore received_fees records and user.feeReceipts
                    const combinedMap = new Map();
                    (user?.feeReceipts || []).forEach((r: any) => {
                      combinedMap.set(r.id || r.receiptNo, r);
                    });
                    (liveUser?.feeReceipts || []).forEach((r: any) => {
                      combinedMap.set(r.id || r.receiptNo, r);
                    });
                    parentFeeRecords.forEach((pr) => {
                      combinedMap.set(pr.id || pr.receiptNo, {
                        id: pr.receiptNo,
                        receiptNo: pr.receiptNo,
                        date: `${pr.paidDate} • ${pr.paidTime}`,
                        description: `${pr.billingPeriod} - ${pr.tutorName}`,
                        amount: pr.formattedAmount,
                        status: 'Paid',
                        transferMethod: pr.paymentMethod,
                        utrNumber: pr.transactionId,
                        studentName: pr.studentName,
                        tutorName: pr.tutorName,
                        nextDueDate: pr.nextDueDate,
                        adminNote: `Verified payment for ${pr.studentName} (${pr.tutorSubjects || 'Tuition'})`
                      });
                    });

                    const allReceipts = Array.from(combinedMap.values());

                    if (allReceipts.length > 0) {
                      return allReceipts.map((receipt: any, idx: number) => (
                        <div key={receipt.id || idx} className="py-2.5 flex items-center justify-between gap-3">
                          <div>
                            <span className="font-semibold text-slate-900 block leading-snug">
                              {receipt.description || 'Tuition Fee'}
                            </span>
                            <span className="text-slate-400 block text-[11px] mt-0.5">
                              Paid on {receipt.date} • <strong className="text-emerald-700">{receipt.amount}</strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(receipt)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer shrink-0"
                          >
                            View Receipt
                          </button>
                        </div>
                      ));
                    }

                    return (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        <Receipt className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <p className="font-semibold text-slate-600">No Payment Receipts Yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Transactions and paid invoices will appear here.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Quick Access</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onNavigateTutors}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900">Find Home Tutors</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Local verified tutors</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenEnquiry) onOpenEnquiry();
                      else window.location.href = 'tel:+918280036680';
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900">Help &amp; Support</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Call or enquire</p>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Teacher Specific View */}
        {isTeacher && (
          <div className="space-y-6">
            {/* 1. Profile Completion Progress Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Profile Completion &amp; Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                    {profileCompletionPercent}% Completed
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {profileCompletionPercent === 100 ? 'All steps complete' : 'Steps remaining'}
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-3 pt-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                      profileCompletionPercent === 100
                        ? 'bg-emerald-600'
                        : isProfileSubmitted
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(profileCompletionPercent, 5)}%` }}
                  />
                </div>

                {/* 4 Distinct Items in Simple Previous Badge Style */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  {/* 1. Personal Info */}
                  <div
                    className={`flex items-center gap-1.5 font-semibold px-2.5 py-1.5 rounded-xl border ${
                      isProfileSubmitted
                        ? 'text-emerald-700 bg-emerald-50/80 border-emerald-200'
                        : 'text-red-700 bg-red-50/80 border-red-200'
                    }`}
                  >
                    {isProfileSubmitted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span>{isProfileSubmitted ? 'Personal Info' : 'Personal Info (Pending)'}</span>
                  </div>

                  {/* 2. Qualifications */}
                  <div
                    className={`flex items-center gap-1.5 font-semibold px-2.5 py-1.5 rounded-xl border ${
                      isProfileSubmitted
                        ? 'text-emerald-700 bg-emerald-50/80 border-emerald-200'
                        : 'text-red-700 bg-red-50/80 border-red-200'
                    }`}
                  >
                    {isProfileSubmitted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span>{isProfileSubmitted ? 'Qualifications' : 'Qualifications (Pending)'}</span>
                  </div>

                  {/* 3. Subjects & Pricing */}
                  <div
                    className={`flex items-center gap-1.5 font-semibold px-2.5 py-1.5 rounded-xl border ${
                      isProfileSubmitted
                        ? 'text-emerald-700 bg-emerald-50/80 border-emerald-200'
                        : 'text-red-700 bg-red-50/80 border-red-200'
                    }`}
                  >
                    {isProfileSubmitted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span>{isProfileSubmitted ? 'Subjects & Pricing' : 'Subjects & Pricing (Pending)'}</span>
                  </div>

                  {/* 4. KYC Verification: Red before submission, Yellow (Pending Verification) after submission */}
                  <div
                    className={`flex items-center gap-1.5 font-semibold px-2.5 py-1.5 rounded-xl border ${
                      isKycVerified
                        ? 'text-emerald-700 bg-emerald-50/80 border-emerald-200'
                        : isProfileSubmitted
                        ? 'text-amber-700 bg-amber-50/90 border-amber-300'
                        : 'text-red-700 bg-red-50/80 border-red-200'
                    }`}
                  >
                    {isKycVerified ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : isProfileSubmitted ? (
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span>
                      {isKycVerified
                        ? 'KYC Completed'
                        : isProfileSubmitted
                        ? 'KYC (Pending Verification)'
                        : 'KYC Verification (Pending)'}
                    </span>
                  </div>
                </div>
              </div>

              {onCompleteTeacherProfile && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500 bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl border-t border-slate-100">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Account profile and credentials verification.
                  </p>
                  <button
                    type="button"
                    onClick={onCompleteTeacherProfile}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer self-start sm:self-center shadow-xs"
                  >
                    <span>Complete Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. Assigned Students Section (Deduplicated with real-time student details & attendance) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Assigned Students</span>
                </div>
                {assignedStudents.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {assignedStudents.length} Active {assignedStudents.length === 1 ? 'Student' : 'Students'}
                  </span>
                )}
              </div>

              <div className="space-y-3 pt-1">
                {assignedStudents.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-6">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No Assigned Students Yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Once parents in Rayagada book home tuition or demo sessions with you, your active students will appear here with attendance tracking.
                    </p>
                  </div>
                ) : (
                  assignedStudents.map((student) => {
                    const isMarked = markedAttendance[student.id];
                    return (
                      <div
                        key={student.id}
                        className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-100/80 border border-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {(student.name || 'ST').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2) || 'ST'}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-900">{student.name}</h4>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                {student.grade || 'Tuition Student'} {student.board ? `• ${student.board}` : ''}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {Array.isArray(student.subjects) ? student.subjects.join(', ') : (student.subject || student.subjects || 'Home Tuition')}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                              {student.school && (
                                <span className="flex items-center gap-1">
                                  <School className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{student.school}</span>
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{student.locality || student.address || 'Rayagada'}</span>
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                              <span className="flex items-center gap-1 text-slate-700 font-medium">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{student.timing}</span>
                              </span>
                              <span>•</span>
                              <span>Parent: <strong className="text-slate-700">{student.parentName}</strong></span>
                              {student.parentPhone && (
                                <>
                                  <span>•</span>
                                  <a
                                    href={`tel:${student.parentPhone}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3 text-blue-500" />
                                    <span>{student.parentPhone}</span>
                                  </a>
                                </>
                              )}
                              {student.monthlyFee && (() => {
                                const fee = Number(student.monthlyFee) || 3000;
                                const hourly = Math.round(fee / 30);
                                const fee31 = hourly * 31;
                                return (
                                  <>
                                    <span>•</span>
                                    <span
                                      className="text-emerald-700 font-bold"
                                      title={`₹${fee.toLocaleString('en-IN')}/month`}
                                    >
                                      ₹{fee.toLocaleString('en-IN')}/mo ({hourly > 0 ? `₹${hourly}/hr` : ''})
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(student.id, student.name)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                              isMarked
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                                : 'border border-slate-200 hover:bg-white text-slate-700'
                            }`}
                          >
                            <CheckSquare className={`w-3.5 h-3.5 ${isMarked ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span>{isMarked ? 'Attended Today' : 'Mark Attendance'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Teacher Quick Access */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Teacher Quick Access</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(true)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Earnings &amp; Payouts</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Check accrued earnings, payouts &amp; bank slips</p>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 mt-2 flex items-center gap-0.5">
                    View Ledger <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailabilityModalOpen(true)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Update Availability</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Manage 1-hour home tuition slots (6 AM – 9 PM)</p>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 mt-2 flex items-center gap-0.5">
                    Select Slots <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenEnquiry) onOpenEnquiry();
                    else window.location.href = 'tel:+918280036680';
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Teacher Helpdesk</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Coordinator support &amp; batch queries</p>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 mt-2 flex items-center gap-0.5">
                    Contact Coordinator <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* EDIT DETAILS MODAL */}
      {isEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setIsEditModalOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-left relative my-6">
            {/* Attractive Header */}
            <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Edit3 className="w-4 h-4" />
                <span>Account Profile</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {isTeacher ? 'Edit Tutor Profile' : 'Edit Profile & Student Info'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                {isTeacher
                  ? 'Update your tutor details & credentials in Rayagada'
                  : 'Update your details synced across your learning account'}
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Changes saved successfully!</span>
                </div>
              )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              {/* Profile Photo Upload for Teacher */}
              {isTeacher && (
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Teacher Profile"
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-200 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border-2 border-blue-200 shrink-0 shadow-xs">
                      {name ? name.charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 text-xs">Profile Picture</p>
                    <p className="text-[11px] text-slate-500">Upload clean photo (JPG, PNG)</p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-[11px] text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Camera className="w-3 h-3 text-blue-600" />
                      <span>Change Photo</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isTeacher ? 'Tutor Full Name' : 'Parent / Guardian Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Local address with landmarks</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Near Daily Market, Rayagada"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Teacher Specific Fields */}
              {isTeacher && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <p className="font-bold text-slate-900">Tutor Professional Credentials</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Highest Qualification</label>
                      <input
                        type="text"
                        list="edit-qualifications-list"
                        value={teacherQualification}
                        onChange={(e) => setTeacherQualification(e.target.value)}
                        placeholder="e.g. B.Sc. Mathematics, B.Ed"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                      <datalist id="edit-qualifications-list">
                        {INDIAN_COURSES_A_TO_Z.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">University / Board</label>
                      <input
                        type="text"
                        list="edit-universities-list"
                        value={teacherUniversity}
                        onChange={(e) => setTeacherUniversity(e.target.value)}
                        placeholder="e.g. Berhampur University"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                      <datalist id="edit-universities-list">
                        {INDIAN_UNIVERSITIES_A_TO_Z.map((u) => (
                          <option key={u} value={u} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Teaching Experience</label>
                      <input
                        type="text"
                        value={teacherExperience}
                        onChange={(e) => setTeacherExperience(e.target.value)}
                        placeholder="e.g. 3-5 years"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Hourly Fee (₹ / hour)</label>
                      <input
                        type="number"
                        value={teacherHourlyFee}
                        onChange={(e) => setTeacherHourlyFee(e.target.value)}
                        placeholder="400"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bio / Teaching Approach</label>
                    <textarea
                      rows={2}
                      value={teacherBio}
                      onChange={(e) => setTeacherBio(e.target.value)}
                      placeholder="Brief note about your teaching philosophy..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Parent Specific Fields */}
              {!isTeacher && (
                <>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="font-bold text-slate-900 mb-2">Student Information</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
                        <input
                          type="text"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Class / Standard</label>
                          <select
                            value={childGrade}
                            onChange={(e) => setChildGrade(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          >
                            <option value="">Select Class</option>
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6</option>
                            <option value="Class 7">Class 7</option>
                            <option value="Class 8">Class 8</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Board</label>
                          <select
                            value={childBoard}
                            onChange={(e) => setChildBoard(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                          >
                            <option value="">Select Board</option>
                            {INDIAN_BOARDS_A_TO_Z.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">School Attending</label>
                        <input
                          type="text"
                          value={childSchool}
                          onChange={(e) => setChildSchool(e.target.value)}
                          placeholder="School name"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* LIVE CLASS MODAL */}
      {isLiveClassModalOpen && selectedLiveClass && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 text-left relative">
            <button
              type="button"
              onClick={() => setIsLiveClassModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Live Classroom</span>
                <h3 className="text-base font-bold text-slate-900">{selectedLiveClass.subject}</h3>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Educator:</span>
                <span className="font-semibold text-slate-900">{selectedLiveClass.teacher}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Schedule:</span>
                <span className="font-semibold text-slate-900">{selectedLiveClass.time}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  alert(`Connecting to ${selectedLiveClass.subject} live classroom...`);
                  setIsLiveClassModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Enter Live Classroom</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLiveClassModalOpen(false)}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE TUTOR MODAL */}
      {isMessageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 text-left relative">
            <button
              type="button"
              onClick={() => setIsMessageModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-900">Message {messageRecipient.name}</h3>
              <p className="text-xs text-slate-500">{messageRecipient.role} • Leave a note or inquiry</p>
            </div>

            {messageSent ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Message delivered successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder={`Type your note for ${messageRecipient.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMessageModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SALARY & TRANSACTION HISTORY MODAL (FOR TEACHER) */}
      {isSalaryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setIsSalaryModalOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-left relative my-8">
            {/* Attractive Header */}
            <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsSalaryModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Wallet className="w-4 h-4" />
                <span>Earnings &amp; Payout Dashboard</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Tutor Earnings &amp; Settlements
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Real-time per-hour accrued earnings, pending balances, and settlement history.
              </p>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Salary & Earnings Key Figures */}
            {(() => {
              const breakdown = calculateTutorEarnings(
                user || {},
                assignedStudents,
                tutorWithdrawals
              );

              // Combine withdrawal requests with past disbursement history
              const allTransactions = [
                ...tutorWithdrawals.map((w) => ({
                  id: w.id,
                  title: `Withdrawal Settlement (${w.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'})`,
                  date: new Date(w.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }),
                  amount: `₹ ${(w.transferredAmount || w.amount).toLocaleString('en-IN')}`,
                  rawAmount: w.amount,
                  status:
                    w.status === 'approved'
                      ? 'Approved & Transferred'
                      : w.status === 'pending'
                      ? 'Pending Admin Verification'
                      : 'Declined',
                  mode: w.transferMethod || (w.paymentMethod === 'upi' ? 'UPI Transfer' : 'Direct Bank NEFT/IMPS'),
                  utrNumber: w.utrNumber,
                  paymentSlipUrl: w.paymentSlipUrl,
                  adminNote: w.adminNote
                })),
                ...((user as any)?.payoutHistory || []).map((p: any) => ({
                  id: p.id,
                  title: p.title || 'Tuition Remuneration',
                  date: p.date,
                  amount: p.amount,
                  status: p.status || 'Settled',
                  mode: p.mode || 'Bank Transfer',
                  utrNumber: p.utrNumber,
                  paymentSlipUrl: p.paymentSlipUrl,
                  adminNote: p.adminNote
                }))
              ];

              return (
                <>
                  {/* Top Key Figures: Monthly Accrued, Pending Amount (under 30 days), and Current Amount (Available for withdrawal) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Monthly Accrued Earnings */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] text-slate-500 font-medium block">Monthly Accrued Earnings</span>
                      <span className="text-xl font-black text-[#0c2340] block mt-0.5">
                        ₹ {breakdown.totalMonthlyAccrued.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {breakdown.studentCount} Active {breakdown.studentCount === 1 ? 'Student' : 'Students'} (₹{breakdown.tutorHourly}/hr • 30 hrs/mo)
                      </span>
                    </div>

                    {/* 2. Pending Amount (Tuition cycle in progress, under 30 days) */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-amber-900 font-bold block">Pending Amount</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-200/70 text-amber-800 uppercase tracking-wider">
                          Under 30 Days
                        </span>
                      </div>
                      <span className="text-xl font-black text-amber-700 block mt-0.5">
                        ₹ {breakdown.pendingAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-amber-800/80 font-medium block">
                        Unlocks to Current Amount upon 1 month tuition completion
                      </span>
                    </div>

                    {/* 3. Current Amount (Completed month & available for withdrawal) */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-emerald-900 font-bold block">Current Amount</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-200 text-emerald-900 uppercase tracking-wider">
                            Available Balance
                          </span>
                        </div>
                        <span className="text-xl font-black text-emerald-700 block mt-0.5">
                          ₹ {breakdown.currentAvailableBalance.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-800/80 font-medium block">
                          Ready for direct settlement to your account
                        </span>
                      </div>

                      <div className="pt-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawAmount(
                              breakdown.currentAvailableBalance > 0
                                ? breakdown.currentAvailableBalance.toString()
                                : ''
                            );
                            setWithdrawNotice(null);
                            setIsWithdrawModalOpen(true);
                          }}
                          disabled={breakdown.currentAvailableBalance <= 0}
                          className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>Withdraw Funds</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Current Active Batches / Revenue Breakdown */}
                  <div className="border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-semibold text-slate-900">
                      <span>Active Student Batch Breakdown</span>
                      <span className="text-[11px] text-emerald-600">₹ {breakdown.totalMonthlyAccrued.toLocaleString('en-IN')} Total / mo</span>
                    </div>
                    {assignedStudents.length > 0 ? (
                      <div className="space-y-1.5 text-[11px]">
                        {assignedStudents.map((std: any, sIdx: number) => {
                          const stdFee = Number(std.monthlyFee) || breakdown.defaultMonthlyPerStudent;
                          const stdHourly = Math.round(stdFee / 30);
                          return (
                            <div key={std.id || sIdx} className="flex justify-between items-center text-slate-600">
                              <span>{std.name} ({std.grade || ''} • {std.subject || ''})</span>
                              <strong className="text-slate-900">
                                ₹ {stdFee.toLocaleString('en-IN')} / mo{' '}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({stdHourly}/hr • 30 hrs)
                                </span>
                              </strong>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-400 text-xs">
                        <p className="font-semibold text-slate-600">No Active Student Batches</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          As students book home tuition or batch sessions with you, accrued earnings will calculate automatically.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Past Transaction & Withdrawal History Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">Transaction History &amp; Payout Slips</h4>
                      <span className="text-[11px] text-slate-400">{allTransactions.length} records</span>
                    </div>

                    {allTransactions.length > 0 ? (
                      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden text-xs">
                        {allTransactions.map((txn: any) => (
                          <div key={txn.id} className="p-3 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">{txn.title}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    txn.status.includes('Approved') || txn.status === 'Settled'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : txn.status.includes('Pending')
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-100'
                                  }`}
                                >
                                  {txn.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span>Requested / Processed on {txn.date}</span>
                                {txn.mode && (
                                  <>
                                    <span>•</span>
                                    <span>{txn.mode}</span>
                                  </>
                                )}
                                {txn.utrNumber && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-slate-600">UTR: {txn.utrNumber}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-bold text-slate-900">{txn.amount}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReceipt({
                                    id: txn.id,
                                    date: txn.date,
                                    description: txn.title,
                                    amount: txn.amount,
                                    status: txn.status,
                                    utrNumber: txn.utrNumber,
                                    transferMethod: txn.mode,
                                    paymentSlipUrl: txn.paymentSlipUrl,
                                    adminNote: txn.adminNote
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 cursor-pointer transition-colors"
                              >
                                View Slip
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <Receipt className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <p className="font-semibold text-slate-600">No Payout Disbursements Yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          When you withdraw funds and the admin transfers payment, UTR records and bank slips will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            <div className="flex items-center justify-between pt-1 text-xs">
              <p className="text-[11px] text-slate-400">
                Tuition completed beyond 30 days automatically unlocks to Current Amount for withdrawal.
              </p>
              <button
                type="button"
                onClick={() => setIsSalaryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* TEACHER AVAILABILITY SLOTS MODAL (DIRECT TWO-WAY SYNC) */}
      {isAvailabilityModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setIsAvailabilityModalOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-left relative my-8">
            {/* Attractive Header */}
            <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsAvailabilityModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Teaching Schedule</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Update Teaching Availability
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Select your 1-hour slots from morning 6:00 AM to night 9:00 PM. Directly updates your public tutor profile.
              </p>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

            {slotsSavedToast && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Availability slots updated and saved to your profile!</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-900">1-Hour Time Slots (6 AM to 9 PM)</span>
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {teacherSlots.length} of {AVAILABLE_1HR_SLOTS.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                {AVAILABLE_1HR_SLOTS.map((slot) => {
                  const isChecked = teacherSlots.includes(slot);
                  return (
                    <label
                      key={slot}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTeacherSlot(slot)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <Clock className={`w-3.5 h-3.5 ${isChecked ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-[11px]">{slot}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAvailabilityModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isSavingSlots}
                onClick={handleSaveAvailability}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingSlots ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Slots...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Availability</span>
                  </>
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* WITHDRAWAL REQUEST MODAL (FOR TEACHERS) */}
      {isWithdrawModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-left relative my-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Wallet className="w-4 h-4" />
                <span>Teacher Fund Withdrawal</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Request Settlement Transfer
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Request transfer of your matured tuition earnings to your UPI or Bank Account.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                const currentBreakdown = calculateTutorEarnings(
                  user || {},
                  assignedStudents,
                  tutorWithdrawals
                );
                handleWithdrawSubmit(e, currentBreakdown.currentAvailableBalance);
              }}
              className="p-6 space-y-4 text-xs"
            >
              {(() => {
                const currentBreakdown = calculateTutorEarnings(
                  user || {},
                  assignedStudents,
                  tutorWithdrawals
                );
                const maxAvailable = currentBreakdown.currentAvailableBalance;

                return (
                  <>
                    {/* Available Current Balance Notice */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          Current Available Balance
                        </span>
                        <span className="text-xl font-black text-emerald-700">
                          ₹ {maxAvailable.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount(maxAvailable > 0 ? maxAvailable.toString() : '0')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                        >
                          Withdraw All
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount(maxAvailable > 0 ? Math.round(maxAvailable / 2).toString() : '0')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          50%
                        </button>
                      </div>
                    </div>

                    {withdrawNotice && (
                      <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        withdrawNotice.includes('submitted')
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{withdrawNotice}</span>
                      </div>
                    )}

                    {/* Amount Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Withdrawal Amount (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          required
                          min="100"
                          max={maxAvailable}
                          placeholder={`Enter amount up to ${maxAvailable}`}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Select Settlement Channel *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <label
                          className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            withdrawMethod === 'upi'
                              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="withdrawMethod"
                            checked={withdrawMethod === 'upi'}
                            onChange={() => setWithdrawMethod('upi')}
                            className="rounded-full text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Direct UPI ID</span>
                        </label>

                        <label
                          className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            withdrawMethod === 'bank_transfer'
                              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="withdrawMethod"
                            checked={withdrawMethod === 'bank_transfer'}
                            onChange={() => setWithdrawMethod('bank_transfer')}
                            className="rounded-full text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Bank Account</span>
                        </label>
                      </div>
                    </div>

                    {/* UPI Details */}
                    {withdrawMethod === 'upi' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          UPI ID / VPA *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9876543210@paytm or tutor@oksbi"
                          value={withdrawUpiId}
                          onChange={(e) => setWithdrawUpiId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Admin will transfer directly via Google Pay / PhonePe / Paytm / BHIM UPI.
                        </p>
                      </div>
                    ) : (
                      /* Bank Account Details */
                      <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Account Holder Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Name as per Passbook"
                              value={withdrawAccountHolder}
                              onChange={(e) => setWithdrawAccountHolder(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Bank Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. State Bank of India"
                              value={withdrawBankName}
                              onChange={(e) => setWithdrawBankName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Account Number *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Bank Account Number"
                              value={withdrawAccountNumber}
                              onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              IFSC Code *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. SBIN0000167"
                              value={withdrawIfsc}
                              onChange={(e) => setWithdrawIfsc(e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Optional Note */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Optional Note to Admin
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Please settle for Class 8 tuition batch"
                        value={withdrawNotes}
                        onChange={(e) => setWithdrawNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsWithdrawModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmittingWithdraw || maxAvailable <= 0}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmittingWithdraw ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting Notice...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Send Withdrawal Notice</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                );
              })()}
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT & PAYOUT SLIP MODAL */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setSelectedReceipt(null)}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-left relative my-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0c2340] via-[#132e54] to-[#1e3a8a] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ring-1 ring-white/20 shadow-xs"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Receipt className="w-4 h-4" />
                <span>Verified Transfer Voucher</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Official Payout Voucher
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Kumari Educational Coaching Institute • Rayagada, Odisha
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Transfer Reference / ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Date &amp; Time:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Payment Purpose:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.description}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Transfer Method:</span>
                <span className="font-semibold text-blue-700">{selectedReceipt.transferMethod || 'Direct Bank Settlement'}</span>
              </div>

              {/* UTR Number */}
              {selectedReceipt.utrNumber ? (
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Bank UTR / Transaction No.
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-900">
                      {selectedReceipt.utrNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedReceipt.utrNumber) {
                        navigator.clipboard.writeText(selectedReceipt.utrNumber);
                      }
                    }}
                    className="px-2 py-1 rounded bg-white text-emerald-800 font-bold text-[10px] border border-emerald-300 hover:bg-emerald-100 cursor-pointer"
                  >
                    Copy UTR
                  </button>
                </div>
              ) : null}

              {selectedReceipt.adminNote && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                  <strong className="block font-bold">Admin Remarks:</strong>
                  <span>{selectedReceipt.adminNote}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900 text-sm">Amount Transferred:</span>
                <span className="text-xl font-black text-emerald-700">{selectedReceipt.amount}</span>
              </div>
            </div>

            {/* Payment Slip Image Preview */}
            {selectedReceipt.paymentSlipUrl ? (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Official Bank Transfer Slip / Proof:
                </span>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 max-h-56 flex items-center justify-center">
                  <img
                    src={selectedReceipt.paymentSlipUrl}
                    alt="Payment Slip"
                    className="w-full h-full object-contain max-h-56"
                  />
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified by Kumari Institute Accounts Desk</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* SIGN OUT MODAL */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sign Out</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to sign out of your account?</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAY TUTOR FEE MODAL */}
      {payFeeModalBooking && activeUserData && (
        <PayTutorFeeModal
          isOpen={Boolean(payFeeModalBooking)}
          booking={payFeeModalBooking}
          currentUser={activeUserData}
          onClose={() => setPayFeeModalBooking(null)}
          onPaymentSuccess={(record, receipt) => {
            setPayFeeModalBooking(null);
            // Immediately display receipt popup to the parent
            setSelectedReceipt({
              id: receipt.receiptNo || record.receiptNo,
              date: receipt.date,
              description: receipt.description,
              amount: receipt.amount,
              status: 'Paid',
              utrNumber: receipt.utrNumber,
              transferMethod: receipt.transferMethod,
              adminNote: `Official tuition fee receipt for ${record.studentName} (${record.tutorSubjects}). Valid for 28 days until ${record.nextDueDate}.`
            });
          }}
        />
      )}

    </div>
  );
};
