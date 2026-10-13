import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  UploadCloud,
  Building,
  Percent,
  X,
  AlertCircle,
  Clock,
  Loader2,
  Compass,
  Navigation,
  Check,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  XCircle,
  BookOpen
} from 'lucide-react';
import {
  AppUserProfile,
  updateTeacherProfileInFirestore,
  saveUserSessionToStorage,
  syncUserToPersistence,
  isTeacherApprovedInRegistry,
  markTeacherApprovedInRegistry
} from '../services/firebaseAuth';
import { registerTeacherLocation, getLiveUserLocation } from '../services/tutorApi';
import { auth } from '../lib/firebase';
import {
  INDIAN_STATES_A_TO_Z,
  INDIAN_BOARDS_A_TO_Z,
  INDIAN_UNIVERSITIES_A_TO_Z,
  INDIAN_COURSES_A_TO_Z
} from '../data/educationData';
import { uploadImageToImgBB } from '../services/imgbbService';
import { compressImageToBase64 } from '../utils/imageUtils';
import { RAYAGADA_LOCALITIES } from '../data/tutorsData';

interface TeacherCompleteProfilePageProps {
  currentUser?: AppUserProfile | null;
  onBackToDashboard: () => void;
  onNavigateHome: () => void;
  onProfileSaved?: (updatedUser: AppUserProfile) => void;
}

export interface UploadedFileMeta {
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
  imgbbUrl?: string;
  isUploading?: boolean;
}

// 1-Hour Interval Slots from 6:00 AM to 9:00 PM
export const AVAILABLE_1HR_SLOTS: string[] = [
  '06:00 AM - 07:00 AM',
  '07:00 AM - 08:00 AM',
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '08:00 PM - 09:00 PM'
];

export const TeacherCompleteProfilePage: React.FC<TeacherCompleteProfilePageProps> = ({
  currentUser,
  onBackToDashboard,
  onProfileSaved
}) => {
  const draftKey = `teacher_profile_draft_${currentUser?.uid || 'guest'}`;

  // 1. Personal Information State
  const [fullName, setFullName] = useState(currentUser?.name || currentUser?.fullName || '');
  const [gender, setGender] = useState(currentUser?.gender || 'female');
  const [dob, setDob] = useState((currentUser as any)?.dob || '');
  const [profilePhoto, setProfilePhoto] = useState<UploadedFileMeta | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(
    currentUser?.avatar || currentUser?.photoUrl || ''
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || '');
  const [altNumber, setAltNumber] = useState((currentUser as any)?.altNumber || '');

  // 2. Structured Address & Live Location State
  const [addressLine1, setAddressLine1] = useState(
    currentUser?.addressDetails?.line1 || currentUser?.locality || ''
  );
  const [addressStreet, setAddressStreet] = useState(
    currentUser?.addressDetails?.street || ''
  );
  const [addressLandmark, setAddressLandmark] = useState(
    currentUser?.addressDetails?.landmark || ''
  );
  const [addressCity, setAddressCity] = useState(
    currentUser?.addressDetails?.city || ''
  );
  const [addressState, setAddressState] = useState(
    currentUser?.addressDetails?.state || ''
  );
  const [addressPincode, setAddressPincode] = useState(
    currentUser?.addressDetails?.pincode || ''
  );
  const [isLocating, setIsLocating] = useState(false);
  const [liveLocation, setLiveLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(
    currentUser?.latitude && currentUser?.longitude
      ? { lat: currentUser.latitude, lng: currentUser.longitude }
      : null
  );
  const [locationSuccessNotice, setLocationSuccessNotice] = useState<string | null>(
    currentUser?.latitude && currentUser?.longitude
      ? `Saved GPS Pin: ${currentUser.latitude.toFixed(4)}° N, ${currentUser.longitude.toFixed(4)}° E`
      : null
  );

  // 3. Family Details State
  const [fatherName, setFatherName] = useState((currentUser as any)?.fatherName || '');
  const [fatherMobile, setFatherMobile] = useState((currentUser as any)?.fatherMobile || '');
  const [motherName, setMotherName] = useState((currentUser as any)?.motherName || '');
  const [motherMobile, setMotherMobile] = useState((currentUser as any)?.motherMobile || '');

  // 4. Education Details State with Individual Certificate Uploads
  // 10th
  const [tenthSchool, setTenthSchool] = useState(
    currentUser?.educationDetails?.tenth?.school || ''
  );
  const [tenthBoard, setTenthBoard] = useState(
    currentUser?.educationDetails?.tenth?.board ||
      'Board of Secondary Education, Odisha (BSE Odisha)'
  );
  const [customTenthBoard, setCustomTenthBoard] = useState('');
  const [tenthYear, setTenthYear] = useState(
    currentUser?.educationDetails?.tenth?.year || ''
  );
  const [tenthScore, setTenthScore] = useState(
    currentUser?.educationDetails?.tenth?.score || ''
  );
  const [tenthImage, setTenthImage] = useState<UploadedFileMeta | null>(null);

  // 12th
  const [twelfthCollege, setTwelfthCollege] = useState(
    currentUser?.educationDetails?.twelfth?.college || ''
  );
  const [twelfthBoard, setTwelfthBoard] = useState(
    currentUser?.educationDetails?.twelfth?.board ||
      'Council of Higher Secondary Education, Odisha (CHSE Odisha)'
  );
  const [customTwelfthBoard, setCustomTwelfthBoard] = useState('');
  const [twelfthYear, setTwelfthYear] = useState(
    currentUser?.educationDetails?.twelfth?.year || ''
  );
  const [twelfthScore, setTwelfthScore] = useState(
    currentUser?.educationDetails?.twelfth?.score || ''
  );
  const [twelfthImage, setTwelfthImage] = useState<UploadedFileMeta | null>(null);

  // Degree
  const [degreeCollege, setDegreeCollege] = useState(
    currentUser?.educationDetails?.degree?.university ||
      currentUser?.university ||
      ''
  );
  const [customDegreeCollege, setCustomDegreeCollege] = useState('');
  const [degreeCourse, setDegreeCourse] = useState(
    currentUser?.educationDetails?.degree?.course ||
      currentUser?.qualification ||
      ''
  );
  const [customDegreeCourse, setCustomDegreeCourse] = useState('');
  const [degreeYear, setDegreeYear] = useState(
    currentUser?.educationDetails?.degree?.year || ''
  );
  const [degreeScore, setDegreeScore] = useState(
    currentUser?.educationDetails?.degree?.score || ''
  );
  const [degreeImage, setDegreeImage] = useState<UploadedFileMeta | null>(null);

  // 5. Subjects & Classes Handled State
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    (currentUser as any)?.subjects || []
  );
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    (currentUser as any)?.classesHandled || []
  );

  // 6. Professional Details State & Availability
  const [experienceYears, setExperienceYears] = useState(
    currentUser?.experience || ''
  );
  const [hourlyCharges, setHourlyCharges] = useState<string>(
    currentUser?.hourlyCharges?.toString() ||
      currentUser?.hourlyFee?.toString() ||
      ''
  );
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(
    currentUser?.availableTimeSlots || []
  );
  const [languages, setLanguages] = useState<{
    english: boolean;
    hindi: boolean;
    odia: boolean;
    other: boolean;
  }>({
    english: true,
    hindi: true,
    odia: true,
    other: false
  });
  const [otherLanguageText, setOtherLanguageText] = useState('');

  // 7. About Yourself
  const [bio, setBio] = useState(currentUser?.bio || '');

  // 8. KYC Verification State
  const [aadhaarNumber, setAadhaarNumber] = useState((currentUser as any)?.aadhaarNumber || '');
  const [aadhaarImage, setAadhaarImage] = useState<UploadedFileMeta | null>(null);
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);

  // Status computation for: 'Personal Info', 'Qualifications', 'Subjects & Pricing', 'KYC Verification'
  const personalInfoStatus: 'completed' | 'in_progress' | 'pending' =
    fullName.trim() && mobileNumber.trim() && addressLine1.trim() && (profilePhoto || profilePhotoUrl)
      ? 'completed'
      : fullName.trim() || mobileNumber.trim()
      ? 'in_progress'
      : 'pending';

  const qualificationsStatus: 'completed' | 'in_progress' | 'pending' =
    tenthSchool.trim() && twelfthCollege.trim() && degreeCollege.trim()
      ? 'completed'
      : tenthSchool.trim() || twelfthCollege.trim() || degreeCollege.trim()
      ? 'in_progress'
      : 'pending';

  const subjectsPricingStatus: 'completed' | 'in_progress' | 'pending' =
    selectedSubjects.length > 0 && selectedClasses.length > 0 && Number(hourlyCharges) > 0
      ? 'completed'
      : selectedSubjects.length > 0 || Number(hourlyCharges) > 0
      ? 'in_progress'
      : 'pending';

  const isTeacherApproved = Boolean(
    currentUser?.verified ||
    (currentUser as any)?.isApproved === true ||
    currentUser?.kycStatus === 'approved' ||
    currentUser?.kycStatus === 'verified' ||
    (currentUser as any)?.status === 'approved' ||
    (currentUser as any)?.verificationStatus === 'Verified Genuine Tutor' ||
    isTeacherApprovedInRegistry(currentUser?.uid, (currentUser as any)?.id, currentUser?.email, (currentUser as any)?.phone)
  );

  const kycStatus: 'completed' | 'in_progress' | 'pending' =
    isTeacherApproved
      ? 'completed'
      : currentUser?.kycStatus === 'submitted' || aadhaarNumber.trim().length >= 12 || aadhaarImage
      ? 'in_progress'
      : 'pending';

  // UI & Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  // File Input Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const tenthInputRef = useRef<HTMLInputElement>(null);
  const twelfthInputRef = useRef<HTMLInputElement>(null);
  const degreeInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  // Load saved draft on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.fullName) setFullName(d.fullName);
        if (d.gender) setGender(d.gender);
        if (d.dob) setDob(d.dob);
        if (d.addressLine1) setAddressLine1(d.addressLine1);
        if (d.addressStreet) setAddressStreet(d.addressStreet);
        if (d.addressLandmark) setAddressLandmark(d.addressLandmark);
        if (d.addressCity) setAddressCity(d.addressCity);
        if (d.addressState) setAddressState(d.addressState);
        if (d.addressPincode) setAddressPincode(d.addressPincode);
        if (d.mobileNumber) setMobileNumber(d.mobileNumber);
        if (d.altNumber) setAltNumber(d.altNumber);
        if (d.fatherName) setFatherName(d.fatherName);
        if (d.fatherMobile) setFatherMobile(d.fatherMobile);
        if (d.motherName) setMotherName(d.motherName);
        if (d.motherMobile) setMotherMobile(d.motherMobile);
        if (d.tenthSchool) setTenthSchool(d.tenthSchool);
        if (d.tenthBoard) {
          // Normalize legacy abbreviations if needed
          if (d.tenthBoard === 'BSE Odisha') {
            setTenthBoard('Board of Secondary Education, Odisha (BSE Odisha)');
          } else if (d.tenthBoard === 'CBSE') {
            setTenthBoard('Central Board of Secondary Education (CBSE)');
          } else if (d.tenthBoard === 'ICSE') {
            setTenthBoard('Council for the Indian School Certificate Examinations (CISCE / ICSE / ISC)');
          } else {
            setTenthBoard(d.tenthBoard);
          }
        }
        if (d.customTenthBoard) setCustomTenthBoard(d.customTenthBoard);
        if (d.tenthYear) setTenthYear(d.tenthYear);
        if (d.tenthScore) setTenthScore(d.tenthScore);
        if (d.twelfthCollege) setTwelfthCollege(d.twelfthCollege);
        if (d.twelfthBoard) {
          // Normalize legacy abbreviations if needed
          if (d.twelfthBoard === 'CHSE Odisha') {
            setTwelfthBoard('Council of Higher Secondary Education, Odisha (CHSE Odisha)');
          } else if (d.twelfthBoard === 'CBSE') {
            setTwelfthBoard('Central Board of Secondary Education (CBSE)');
          } else if (d.twelfthBoard === 'ISC') {
            setTwelfthBoard('Council for the Indian School Certificate Examinations (CISCE / ICSE / ISC)');
          } else {
            setTwelfthBoard(d.twelfthBoard);
          }
        }
        if (d.customTwelfthBoard) setCustomTwelfthBoard(d.customTwelfthBoard);
        if (d.twelfthYear) setTwelfthYear(d.twelfthYear);
        if (d.twelfthScore) setTwelfthScore(d.twelfthScore);
        if (d.degreeCollege) {
          if (d.degreeCollege === 'Berhampur University') {
            setDegreeCollege('Berhampur University, Bhanja Bihar, Berhampur, Odisha');
          } else {
            setDegreeCollege(d.degreeCollege);
          }
        }
        if (d.customDegreeCollege) setCustomDegreeCollege(d.customDegreeCollege);
        if (d.degreeCourse) {
          if (d.degreeCourse === 'B.Sc') {
            setDegreeCourse('B.Sc (Bachelor of Science - General)');
          } else if (d.degreeCourse === 'B.A') {
            setDegreeCourse('B.A (Bachelor of Arts)');
          } else if (d.degreeCourse === 'B.Com') {
            setDegreeCourse('B.Com (Bachelor of Commerce)');
          } else {
            setDegreeCourse(d.degreeCourse);
          }
        }
        if (d.customDegreeCourse) setCustomDegreeCourse(d.customDegreeCourse);
        if (d.degreeYear) setDegreeYear(d.degreeYear);
        if (d.degreeScore) setDegreeScore(d.degreeScore);
        if (d.experienceYears) setExperienceYears(d.experienceYears);
        if (d.hourlyCharges) setHourlyCharges(d.hourlyCharges);
        if (Array.isArray(d.availableTimeSlots)) setAvailableTimeSlots(d.availableTimeSlots);
        if (d.bio) setBio(d.bio);
      }
    } catch {
      // ignore
    }
  }, [draftKey]);

  // Autosave draft on form edits
  useEffect(() => {
    try {
      const draftData = {
        fullName,
        gender,
        dob,
        addressLine1,
        addressStreet,
        addressLandmark,
        addressCity,
        addressState,
        addressPincode,
        mobileNumber,
        altNumber,
        fatherName,
        fatherMobile,
        motherName,
        motherMobile,
        tenthSchool,
        tenthBoard,
        customTenthBoard,
        tenthYear,
        tenthScore,
        twelfthCollege,
        twelfthBoard,
        customTwelfthBoard,
        twelfthYear,
        twelfthScore,
        degreeCollege,
        customDegreeCollege,
        degreeCourse,
        customDegreeCourse,
        degreeYear,
        degreeScore,
        experienceYears,
        hourlyCharges,
        availableTimeSlots,
        bio
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } catch {
      // ignore
    }
  }, [
    draftKey,
    fullName,
    gender,
    dob,
    addressLine1,
    addressStreet,
    addressLandmark,
    addressCity,
    addressState,
    addressPincode,
    mobileNumber,
    altNumber,
    fatherName,
    fatherMobile,
    motherName,
    motherMobile,
    tenthSchool,
    tenthBoard,
    customTenthBoard,
    tenthYear,
    tenthScore,
    twelfthCollege,
    twelfthBoard,
    customTwelfthBoard,
    twelfthYear,
    twelfthScore,
    degreeCollege,
    customDegreeCollege,
    degreeCourse,
    customDegreeCourse,
    degreeYear,
    degreeScore,
    experienceYears,
    hourlyCharges,
    availableTimeSlots,
    bio
  ]);

  // Toast feedback helper
  const showToast = (type: 'success' | 'info', message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper for photo upload with ImgBB storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      showToast('info', 'Please upload a JPG, JPEG, or PNG image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('info', 'Photo size exceeds 8MB limit.');
      return;
    }

    let localPreview = '';
    try {
      localPreview = await compressImageToBase64(file, 600, 0.85);
    } catch {
      localPreview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve((ev.target?.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    }
    setProfilePhotoUrl(localPreview);
    setProfilePhoto({
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.type,
      dataUrl: localPreview,
      isUploading: true
    });
    setIsUploadingPhoto(true);

    try {
      showToast('info', 'Processing & uploading profile photo...');
      const result = await uploadImageToImgBB(file, `teacher_profile_${Date.now()}`);
      const finalUrl = result.url || localPreview;
      setProfilePhotoUrl(finalUrl);
      setProfilePhoto({
        name: file.name,
        size: result.size || `${Math.round(file.size / 1024)} KB`,
        type: file.type,
        dataUrl: localPreview,
        imgbbUrl: finalUrl,
        isUploading: false
      });
      showToast('success', 'Profile photo saved successfully!');
    } catch (err: any) {
      console.warn('[Photo Upload] Notice:', err);
      setProfilePhoto((prev) => (prev ? { ...prev, isUploading: false, dataUrl: localPreview, imgbbUrl: localPreview } : null));
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  // Helper for single educational document image upload (JPG, PNG, JPEG) with ImgBB storage
  const handleSingleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedFileMeta | null>>,
    sectionName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png'];

    if (!validMimes.includes(file.type) && !validExts.includes(ext)) {
      showToast('info', `Please upload JPG, JPEG, or PNG format for ${sectionName}.`);
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('info', 'File size exceeds 8MB limit.');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    // Immediately show preview with isUploading flag
    setter({
      name: file.name,
      size: sizeStr,
      type: file.type || 'image/jpeg',
      dataUrl: localPreview,
      isUploading: true
    });

    try {
      showToast('info', `Uploading ${sectionName} to ImgBB...`);
      const customName = `${sectionName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
      const result = await uploadImageToImgBB(file, customName);

      if (result.success && result.url) {
        setter({
          name: file.name,
          size: result.size,
          type: file.type || 'image/jpeg',
          dataUrl: localPreview,
          imgbbUrl: result.url,
          isUploading: false
        });
        showToast('success', `${sectionName} uploaded to ImgBB successfully!`);
      } else {
        setter((prev) => (prev ? { ...prev, isUploading: false, imgbbUrl: result.url } : null));
        showToast('info', `${sectionName} attached.`);
      }
    } catch (err: any) {
      console.warn(`[${sectionName} Upload] Notice:`, err);
      setter((prev) => (prev ? { ...prev, isUploading: false } : null));
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Live Location Trigger
  const handleUseLiveLocation = async () => {
    setIsLocating(true);
    setLocationSuccessNotice(null);
    showToast('info', 'Acquiring precise GPS lock...');

    try {
      const geo = await getLiveUserLocation((statusMsg) => {
        showToast('info', statusMsg);
      });
      setLiveLocation({ lat: geo.latitude, lng: geo.longitude, accuracy: geo.accuracy });
      const notice = `GPS Locked: ${geo.placeName} (${geo.latitude.toFixed(4)}° N, ${geo.longitude.toFixed(4)}° E • ±${geo.accuracy}m radius)`;
      setLocationSuccessNotice(notice);
      if (geo.placeName) {
        if (!addressStreet || addressStreet === 'Rayagada') {
          setAddressStreet(geo.placeName);
        }
        if (!addressCity) setAddressCity('Rayagada');
        if (!addressState) setAddressState('Odisha');
        if (!addressPincode) setAddressPincode('765001');
      }
      showToast('success', `Exact GPS lock acquired (±${geo.accuracy}m radius): ${geo.placeName}`);
    } catch (err: any) {
      console.warn('Geolocation error:', err.message);
      showToast('info', err.message || 'Could not fetch your GPS location. Please choose your locality.');
    } finally {
      setIsLocating(false);
    }
  };

  // Time slot toggle
  const handleToggleSlot = (slot: string) => {
    setAvailableTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Submit complete profile
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !mobileNumber.trim()) {
      showToast('info', 'Please fill in your Full Name and Mobile Number');
      return;
    }

    if (!addressLine1.trim() || !addressStreet.trim() || !addressLandmark.trim()) {
      showToast('info', 'Please complete your residential address fields with landmarks');
      return;
    }

    if (availableTimeSlots.length === 0) {
      showToast('info', 'Please select at least one 1-hour availability slot');
      return;
    }

    setIsSubmitting(true);
    try {
      const uid = currentUser?.uid || auth.currentUser?.uid || `teacher_${Date.now()}`;

      const effectiveTenthBoard =
        tenthBoard === 'Other State / Recognized Board' && customTenthBoard.trim()
          ? customTenthBoard.trim()
          : tenthBoard;

      const effectiveTwelfthBoard =
        twelfthBoard === 'Other State / Recognized Board' && customTwelfthBoard.trim()
          ? customTwelfthBoard.trim()
          : twelfthBoard;

      const effectiveDegreeCollege =
        degreeCollege === 'Other University / College' && customDegreeCollege.trim()
          ? customDegreeCollege.trim()
          : degreeCollege;

      const effectiveDegreeCourse =
        degreeCourse === 'Other Degree / Course' && customDegreeCourse.trim()
          ? customDegreeCourse.trim()
          : degreeCourse;

      const compiledAddress = `${addressLine1.trim()}, ${addressStreet.trim()}, Landmark: ${addressLandmark.trim()}, ${addressCity.trim()}, ${addressState.trim()} - ${addressPincode.trim()}`;

      const teacherPayload = {
        fullName: fullName.trim(),
        name: fullName.trim(),
        gender,
        dob,
        phone: mobileNumber.trim(),
        altNumber: altNumber.trim(),
        address: compiledAddress,
        locationArea: addressStreet.trim() || addressLandmark.trim() || 'Rayagada',
        locality: addressStreet.trim() || addressLandmark.trim() || 'Rayagada',
        addressSnippet: compiledAddress,
        coordinates: {
          lat: liveLocation?.lat || 19.1691,
          lng: liveLocation?.lng || 83.4150
        },
        addressDetails: {
          line1: addressLine1.trim(),
          street: addressStreet.trim(),
          landmark: addressLandmark.trim(),
          city: addressCity.trim(),
          state: addressState.trim(),
          pincode: addressPincode.trim(),
          latitude: liveLocation?.lat || 19.1691,
          longitude: liveLocation?.lng || 83.4150
        },
        latitude: liveLocation?.lat || 19.1691,
        longitude: liveLocation?.lng || 83.4150,
        fatherName: fatherName.trim(),
        fatherMobile: fatherMobile.trim(),
        motherName: motherName.trim(),
        motherMobile: motherMobile.trim(),
        highestQualification: effectiveDegreeCourse || 'B.Sc',
        courseDegree: `${effectiveDegreeCourse} (${effectiveDegreeCollege})`,
        university: effectiveDegreeCollege.trim(),
        passingYear: degreeYear.trim(),
        educationDetails: {
          tenth: {
            school: tenthSchool,
            board: effectiveTenthBoard,
            year: tenthYear,
            score: tenthScore,
            marksheetName: tenthImage?.name || '',
            marksheetUrl: tenthImage?.imgbbUrl || tenthImage?.dataUrl || ''
          },
          twelfth: {
            college: twelfthCollege,
            board: effectiveTwelfthBoard,
            year: twelfthYear,
            score: twelfthScore,
            marksheetName: twelfthImage?.name || '',
            marksheetUrl: twelfthImage?.imgbbUrl || twelfthImage?.dataUrl || ''
          },
          degree: {
            university: effectiveDegreeCollege,
            course: effectiveDegreeCourse,
            year: degreeYear,
            score: degreeScore,
            marksheetName: degreeImage?.name || '',
            marksheetUrl: degreeImage?.imgbbUrl || degreeImage?.dataUrl || ''
          }
        },
        experienceYears: parseInt(experienceYears) || 4,
        totalExperience: experienceYears,
        experience: experienceYears,
        hourlyCharges: Number(hourlyCharges) || 100,
        hourlyRate: Number(hourlyCharges) || 100,
        hourlyFee: Number(hourlyCharges) || 100,
        monthlyFee: (Number(hourlyCharges) || 100) * 30,
        availableTimeSlots: availableTimeSlots,
        timeSlots: availableTimeSlots,
        tuitionModes: ['Home Tuition'],
        languages: [
          languages.english ? 'English' : '',
          languages.hindi ? 'Hindi' : '',
          languages.odia ? 'Odia' : '',
          languages.other ? otherLanguageText : ''
        ].filter(Boolean),
        bio: bio.trim(),
        avatar: profilePhoto?.imgbbUrl || profilePhotoUrl,
        photoUrl: profilePhoto?.imgbbUrl || profilePhotoUrl,
        subjects: selectedSubjects.length > 0 ? selectedSubjects : ['Mathematics', 'Science'],
        classesHandled: selectedClasses.length > 0 ? selectedClasses : ['1st - 6th Class'],
        aadhaarNumber: aadhaarNumber.trim(),
        aadhaarDocUrl: aadhaarImage?.imgbbUrl || aadhaarImage?.dataUrl || '',
        profileCompleted: true,
        kycStatus: isTeacherApproved ? ('approved' as const) : ('submitted' as const),
        verified: isTeacherApproved,
        status: isTeacherApproved ? 'approved' : 'pending',
        isApproved: isTeacherApproved,
        isBooked: Boolean((currentUser as any)?.isBooked),
        bookingStatus: (currentUser as any)?.bookingStatus || 'available',
        verificationStatus: isTeacherApproved ? 'Verified Genuine Tutor' : 'Pending Verification',
        updatedAt: new Date().toISOString()
      };

      // 1. Save all teacher details to Firestore DB
      try {
        await updateTeacherProfileInFirestore(uid, teacherPayload);
      } catch (fsErr) {
        console.warn('Firestore write notice:', fsErr);
      }

      // 2. Register live location with backend search engine
      try {
        await registerTeacherLocation({
          name: fullName.trim(),
          email: currentUser?.email || auth.currentUser?.email,
          phone: mobileNumber.trim(),
          latitude: liveLocation?.lat || 19.1691,
          longitude: liveLocation?.lng || 83.4150,
          address: compiledAddress,
          locationArea: addressStreet.trim() || addressLandmark.trim() || 'Rayagada',
          qualification: effectiveDegreeCourse || 'B.Sc',
          experienceYears: parseInt(experienceYears) || 3,
          subjects: selectedSubjects.length > 0 ? selectedSubjects : ['Mathematics', 'Science'],
          classesHandled: selectedClasses.length > 0 ? selectedClasses : ['1st - 6th Class'],
          monthlyFee: (Number(hourlyCharges) || 100) * 30,
          hourlyRate: Number(hourlyCharges) || 100,
          bio: bio.trim(),
          gender: gender === 'female' ? 'female' : 'male',
          teacherType: 'both'
        });
      } catch (locErr) {
        console.warn('Location registration notice:', locErr);
      }

      // 3. Update local session profile
      const updatedProfile: AppUserProfile = {
        ...(currentUser || {
          uid,
          email: currentUser?.email || auth.currentUser?.email || 'teacher@kumari.edu',
          role: 'teacher' as const
        }),
        name: fullName.trim(),
        fullName: fullName.trim(),
        phone: mobileNumber.trim(),
        gender: gender as 'male' | 'female' | 'other',
        profileCompleted: true,
        kycStatus: isTeacherApproved ? ('approved' as const) : ('submitted' as const),
        verified: isTeacherApproved,
        isApproved: isTeacherApproved,
        status: isTeacherApproved ? 'approved' : 'pending',
        verificationStatus: isTeacherApproved ? 'Verified Genuine Tutor' : 'Pending Verification',
        locality: compiledAddress,
        qualification: effectiveDegreeCourse || 'B.Sc',
        university: effectiveDegreeCollege,
        experience: experienceYears,
        hourlyCharges: Number(hourlyCharges) || 400,
        hourlyFee: Number(hourlyCharges) || 400,
        availableTimeSlots: availableTimeSlots,
        avatar: profilePhoto?.imgbbUrl || profilePhotoUrl,
        photoUrl: profilePhoto?.imgbbUrl || profilePhotoUrl,
        addressDetails: teacherPayload.addressDetails,
        educationDetails: teacherPayload.educationDetails,
        latitude: liveLocation?.lat || 19.1691,
        longitude: liveLocation?.lng || 83.4150,
        subjects: selectedSubjects.length > 0 ? selectedSubjects : ['Mathematics', 'Science'],
        classesHandled: selectedClasses.length > 0 ? selectedClasses : ['1st - 6th Class'],
        aadhaarNumber: aadhaarNumber.trim(),
        aadhaarDocUrl: aadhaarImage?.imgbbUrl || aadhaarImage?.dataUrl || ''
      };

      if (isTeacherApproved) {
        markTeacherApprovedInRegistry(uid);
        if (currentUser?.email) markTeacherApprovedInRegistry(currentUser.email);
      }

      saveUserSessionToStorage(updatedProfile);
      await syncUserToPersistence(updatedProfile);

      // 4. Clear draft
      localStorage.removeItem(draftKey);
      showToast('success', 'Teacher profile details saved to Firestore & submitted for verification!');

      setTimeout(() => {
        if (onProfileSaved) {
          onProfileSaved(updatedProfile);
        } else {
          onBackToDashboard();
        }
      }, 1200);
    } catch (err: any) {
      console.error('Submission error:', err);
      showToast('info', err?.message || 'Failed to submit profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toastMessage.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Back Link Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to My Profile</span>
          </button>
        </div>

        {/* Page Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Your Teacher Profile
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Provide your verified educational credentials and home tuition details for parents in Rayagada.
          </p>
        </div>

        {/* Verification Status Overview: 4 Distinct Items */}
        <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Personal Info */}
          <div className={`p-4 rounded-2xl border transition-all ${
            personalInfoStatus === 'completed'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : personalInfoStatus === 'in_progress'
              ? 'bg-amber-50/60 border-amber-200 text-amber-950'
              : 'bg-rose-50/60 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800">Personal Info</span>
              {personalInfoStatus === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : personalInfoStatus === 'in_progress' ? (
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                personalInfoStatus === 'completed' ? 'bg-emerald-500' : personalInfoStatus === 'in_progress' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="text-[11px] font-semibold">
                {personalInfoStatus === 'completed' ? 'Completed' : personalInfoStatus === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
          </div>

          {/* 2. Qualifications */}
          <div className={`p-4 rounded-2xl border transition-all ${
            qualificationsStatus === 'completed'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : qualificationsStatus === 'in_progress'
              ? 'bg-amber-50/60 border-amber-200 text-amber-950'
              : 'bg-rose-50/60 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800">Qualifications</span>
              {qualificationsStatus === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : qualificationsStatus === 'in_progress' ? (
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                qualificationsStatus === 'completed' ? 'bg-emerald-500' : qualificationsStatus === 'in_progress' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="text-[11px] font-semibold">
                {qualificationsStatus === 'completed' ? 'Completed' : qualificationsStatus === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
          </div>

          {/* 3. Subjects & Pricing */}
          <div className={`p-4 rounded-2xl border transition-all ${
            subjectsPricingStatus === 'completed'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : subjectsPricingStatus === 'in_progress'
              ? 'bg-amber-50/60 border-amber-200 text-amber-950'
              : 'bg-rose-50/60 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800">Subjects & Pricing</span>
              {subjectsPricingStatus === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : subjectsPricingStatus === 'in_progress' ? (
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                subjectsPricingStatus === 'completed' ? 'bg-emerald-500' : subjectsPricingStatus === 'in_progress' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="text-[11px] font-semibold">
                {subjectsPricingStatus === 'completed' ? 'Completed' : subjectsPricingStatus === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
          </div>

          {/* 4. KYC Verification */}
          <div className={`p-4 rounded-2xl border transition-all ${
            kycStatus === 'completed'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : kycStatus === 'in_progress'
              ? 'bg-amber-50/60 border-amber-200 text-amber-950'
              : 'bg-rose-50/60 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800">KYC Verification</span>
              {kycStatus === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : kycStatus === 'in_progress' ? (
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                kycStatus === 'completed' ? 'bg-emerald-500' : kycStatus === 'in_progress' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="text-[11px] font-semibold">
                {kycStatus === 'completed' ? 'KYC Completed' : kycStatus === 'in_progress' ? 'Under Review' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Workspace Form */}
        <form onSubmit={handleSubmitProfile} className="space-y-6">
          {/* SECTION 1: Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500">Update your basic identification and contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Profile Picture */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Profile Picture <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt="Profile Preview"
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border-2 border-blue-100 shrink-0">
                        {fullName ? fullName.charAt(0).toUpperCase() : 'T'}
                      </div>
                    )}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          <span>Uploading to ImgBB...</span>
                        </>
                      ) : (
                        <span>Choose Photo</span>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span>JPG, PNG (Stored on ImgBB Cloud)</span>
                      {profilePhoto?.imgbbUrl && (
                        <span className="text-emerald-600 font-semibold">✓ ImgBB Stored</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter 10-digit mobile"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alternative Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={altNumber}
                    onChange={(e) => setAltNumber(e.target.value)}
                    placeholder="Secondary emergency contact"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Detailed Address & Live Location */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Residential Address &amp; Location</h2>
                  <p className="text-xs text-slate-500">
                    Helps parents find nearby tutors within walking/cycling radius in Rayagada
                  </p>
                </div>
              </div>

              {/* Use Live Location Button */}
              <button
                type="button"
                onClick={handleUseLiveLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto disabled:opacity-50"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Compass className="w-4 h-4 text-blue-600" />
                )}
                <span>{isLocating ? 'Acquiring GPS Lock...' : 'Use Live Location'}</span>
              </button>
            </div>

            {/* GPS Location Status Indicator */}
            {locationSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{locationSuccessNotice}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded text-emerald-700">
                  Accurate
                </span>
              </div>
            )}

            {/* GPS Location Cardinals & Rayagada Locality Quick Preset */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  Exact GPS Cardinals (Used for nearest tutor proximity search)
                </span>
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded self-start sm:self-auto">
                  {(liveLocation?.lat || 19.1691).toFixed(4)}° N, {(liveLocation?.lng || 83.4150).toFixed(4)}° E
                </span>
              </div>

              {/* Quick Rayagada Locality Preset */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quick Select Rayagada Locality Preset
                </label>
                <select
                  value={addressStreet || 'Indira Nagar'}
                  onChange={(e) => {
                    const sel = e.target.value;
                    const matched = RAYAGADA_LOCALITIES.find(l => l.name === sel);
                    if (matched) {
                      setLiveLocation({ lat: matched.latitude, lng: matched.longitude });
                      setAddressStreet(matched.name);
                      setAddressLandmark(matched.landmark);
                      setAddressCity('Rayagada');
                      setAddressState('Odisha');
                      setAddressPincode('765001');
                      setLocationSuccessNotice(`GPS Cardinals set to ${matched.name}: ${matched.latitude.toFixed(4)}° N, ${matched.longitude.toFixed(4)}° E`);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {RAYAGADA_LOCALITIES.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.landmark})
                    </option>
                  ))}
                </select>
              </div>

              {/* Exact Latitude and Longitude Cardinals */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Latitude Cardinal (° N) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={liveLocation?.lat || 19.1691}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setLiveLocation(prev => ({
                        lat: isNaN(val) ? 19.1691 : val,
                        lng: prev?.lng || 83.4150
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Longitude Cardinal (° E) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={liveLocation?.lng || 83.4150}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setLiveLocation(prev => ({
                        lat: prev?.lat || 19.1691,
                        lng: isNaN(val) ? 83.4150 : val
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Flat / House No. & Building */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Flat / Door / House No. &amp; Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. Flat 204, Gayatri Residency"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Street / Road / Locality */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Street / Area / Locality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="e.g. College Road / Indira Nagar"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Landmark */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressLandmark}
                  onChange={(e) => setAddressLandmark(e.target.value)}
                  placeholder="e.g. Near Sacred Heart Convent School / Majhigouri Temple"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* City, State & PIN Code */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="Rayagada"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                  >
                    {INDIAN_STATES_A_TO_Z.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressPincode}
                    onChange={(e) => setAddressPincode(e.target.value)}
                    placeholder="765001"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Family Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Family Details</h2>
                <p className="text-xs text-slate-500">Emergency &amp; guardian verification contacts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Enter father's full name"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Father's Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={fatherMobile}
                  onChange={(e) => setFatherMobile(e.target.value)}
                  placeholder="Enter mobile number"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mother's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Enter mother's full name"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mother's Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={motherMobile}
                  onChange={(e) => setMotherMobile(e.target.value)}
                  placeholder="Enter mobile number"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Education Details with Separate Image Upload for 10th, 12th, and Degree */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Education Details &amp; Certificates</h2>
                <p className="text-xs text-slate-500">
                  Fill your educational background with certificate image upload for each standard (JPG, PNG, JPEG only)
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* 1. 10th (Matriculation) Details Card */}
              <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-slate-50/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <span>10th (Matriculation) Details</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Secondary School</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={tenthSchool}
                        onChange={(e) => setTenthSchool(e.target.value)}
                        placeholder="School name"
                        required
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Board (A to Z) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tenthBoard}
                      onChange={(e) => setTenthBoard(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none truncate"
                      title={tenthBoard}
                    >
                      {INDIAN_BOARDS_A_TO_Z.map((board) => (
                        <option key={board} value={board}>
                          {board}
                        </option>
                      ))}
                    </select>
                    {tenthBoard === 'Other State / Recognized Board' && (
                      <input
                        type="text"
                        value={customTenthBoard}
                        onChange={(e) => setCustomTenthBoard(e.target.value)}
                        placeholder="Enter board name"
                        className="w-full mt-1.5 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Year of Passing <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={tenthYear}
                        onChange={(e) => setTenthYear(e.target.value)}
                        placeholder="YYYY"
                        required
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Percentage / CGPA <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={tenthScore}
                        onChange={(e) => setTenthScore(e.target.value)}
                        placeholder="e.g. 88%"
                        required
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dedicated 10th Certificate / Marksheet Image Upload */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        10th Marksheet / Certificate Image <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Upload photo or scan of your 10th marksheet (JPG, PNG, JPEG only)
                      </p>
                    </div>

                    <input
                      ref={tenthInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
                      onChange={(e) => handleSingleImageUpload(e, setTenthImage, '10th Marksheet')}
                      className="hidden"
                    />

                    {tenthImage ? (
                      tenthImage.isUploading ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-blue-800 truncate max-w-[150px]">
                              {tenthImage.name}
                            </p>
                            <span className="text-[10px] text-blue-600 font-medium">Uploading to ImgBB...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                                {tenthImage.name}
                              </p>
                              {tenthImage.imgbbUrl && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  ImgBB
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{tenthImage.size}</span>
                              {(tenthImage.imgbbUrl || tenthImage.dataUrl) && (
                                <a
                                  href={tenthImage.imgbbUrl || tenthImage.dataUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-semibold text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTenthImage(null)}
                            className="p-1 text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => tenthInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-700 text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                      >
                        <UploadCloud className="w-4 h-4 text-blue-600" />
                        <span>Upload 10th Certificate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. 12th / Plus Two Details Card */}
              <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-slate-50/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <span>Plus Two (+2 / 12th) Details</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Higher Secondary</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      College Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={twelfthCollege}
                        onChange={(e) => setTwelfthCollege(e.target.value)}
                        placeholder="College name"
                        required
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Board (A to Z) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={twelfthBoard}
                      onChange={(e) => setTwelfthBoard(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none truncate"
                      title={twelfthBoard}
                    >
                      {INDIAN_BOARDS_A_TO_Z.map((board) => (
                        <option key={board} value={board}>
                          {board}
                        </option>
                      ))}
                    </select>
                    {twelfthBoard === 'Other State / Recognized Board' && (
                      <input
                        type="text"
                        value={customTwelfthBoard}
                        onChange={(e) => setCustomTwelfthBoard(e.target.value)}
                        placeholder="Enter board name"
                        className="w-full mt-1.5 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Year of Passing <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={twelfthYear}
                        onChange={(e) => setTwelfthYear(e.target.value)}
                        placeholder="YYYY"
                        required
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Percentage / CGPA <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={twelfthScore}
                        onChange={(e) => setTwelfthScore(e.target.value)}
                        placeholder="e.g. 84%"
                        required
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dedicated 12th Certificate / Marksheet Image Upload */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        12th Marksheet / Certificate Image <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Upload photo or scan of your 12th marksheet (JPG, PNG, JPEG only)
                      </p>
                    </div>

                    <input
                      ref={twelfthInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
                      onChange={(e) => handleSingleImageUpload(e, setTwelfthImage, '12th Marksheet')}
                      className="hidden"
                    />

                    {twelfthImage ? (
                      twelfthImage.isUploading ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-blue-800 truncate max-w-[150px]">
                              {twelfthImage.name}
                            </p>
                            <span className="text-[10px] text-blue-600 font-medium">Uploading to ImgBB...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                                {twelfthImage.name}
                              </p>
                              {twelfthImage.imgbbUrl && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  ImgBB
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{twelfthImage.size}</span>
                              {(twelfthImage.imgbbUrl || twelfthImage.dataUrl) && (
                                <a
                                  href={twelfthImage.imgbbUrl || twelfthImage.dataUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-semibold text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTwelfthImage(null)}
                            className="p-1 text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => twelfthInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-700 text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                      >
                        <UploadCloud className="w-4 h-4 text-blue-600" />
                        <span>Upload 12th Certificate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Degree Details Card */}
              <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-slate-50/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[11px]">
                      3
                    </span>
                    <span>Degree (Graduation) Details</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Undergraduate / Postgrad</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      University / College (A to Z) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={degreeCollege}
                      onChange={(e) => setDegreeCollege(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none truncate"
                      title={degreeCollege}
                    >
                      {INDIAN_UNIVERSITIES_A_TO_Z.map((uni) => (
                        <option key={uni} value={uni}>
                          {uni}
                        </option>
                      ))}
                    </select>
                    {degreeCollege === 'Other University / College' && (
                      <input
                        type="text"
                        value={customDegreeCollege}
                        onChange={(e) => setCustomDegreeCollege(e.target.value)}
                        placeholder="Enter college / university name"
                        className="w-full mt-1.5 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Course / Degree (A to Z) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={degreeCourse}
                      onChange={(e) => setDegreeCourse(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none truncate"
                      title={degreeCourse}
                    >
                      {INDIAN_COURSES_A_TO_Z.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    {degreeCourse === 'Other Degree / Course' && (
                      <input
                        type="text"
                        value={customDegreeCourse}
                        onChange={(e) => setCustomDegreeCourse(e.target.value)}
                        placeholder="Enter course / degree name"
                        className="w-full mt-1.5 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Year of Passing <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={degreeYear}
                        onChange={(e) => setDegreeYear(e.target.value)}
                        placeholder="YYYY"
                        required
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Percentage / CGPA <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={degreeScore}
                        onChange={(e) => setDegreeScore(e.target.value)}
                        placeholder="e.g. 8.4 CGPA"
                        required
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dedicated Degree Certificate / Marksheet Image Upload */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        Degree Marksheet / Certificate Image <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Upload photo or scan of your graduation degree (JPG, PNG, JPEG only)
                      </p>
                    </div>

                    <input
                      ref={degreeInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
                      onChange={(e) => handleSingleImageUpload(e, setDegreeImage, 'Degree Marksheet')}
                      className="hidden"
                    />

                    {degreeImage ? (
                      degreeImage.isUploading ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-blue-800 truncate max-w-[150px]">
                              {degreeImage.name}
                            </p>
                            <span className="text-[10px] text-blue-600 font-medium">Uploading to ImgBB...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                                {degreeImage.name}
                              </p>
                              {degreeImage.imgbbUrl && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  ImgBB
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{degreeImage.size}</span>
                              {(degreeImage.imgbbUrl || degreeImage.dataUrl) && (
                                <a
                                  href={degreeImage.imgbbUrl || degreeImage.dataUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-semibold text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDegreeImage(null)}
                            className="p-1 text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => degreeInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-700 text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                      >
                        <UploadCloud className="w-4 h-4 text-blue-600" />
                        <span>Upload Degree Certificate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Subjects, Pricing & Availability */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Subjects, Pricing &amp; Availability</h2>
                <p className="text-xs text-slate-500">
                  Select your subjects, classes handled, hourly tuition fee, and available hours
                </p>
              </div>
            </div>

            {/* Subjects You Teach */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Subjects You Teach <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Mathematics',
                  'Science',
                  'English',
                  'Social Studies',
                  'Odia',
                  'Hindi',
                  'Computer Science',
                  'EVS'
                ].map((subject) => {
                  const isChecked = selectedSubjects.includes(subject);
                  return (
                    <button
                      type="button"
                      key={subject}
                      onClick={() => {
                        setSelectedSubjects((prev) =>
                          prev.includes(subject)
                            ? prev.filter((s) => s !== subject)
                            : [...prev, subject]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {subject}
                    </button>
                  );
                })}
              </div>
              {selectedSubjects.length === 0 && (
                <p className="text-[11px] text-red-500 mt-1">Please select at least one subject</p>
              )}
            </div>

            {/* Classes Handled */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Classes Handled <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  '1st Class',
                  '2nd Class',
                  '3rd Class',
                  '4th Class',
                  '5th Class',
                  '6th Class',
                  '7th Class',
                  '8th Class',
                  '9th Class',
                  '10th Class',
                  '1st - 6th Class'
                ].map((cls) => {
                  const isChecked = selectedClasses.includes(cls);
                  return (
                    <button
                      type="button"
                      key={cls}
                      onClick={() => {
                        setSelectedClasses((prev) =>
                          prev.includes(cls)
                            ? prev.filter((c) => c !== cls)
                            : [...prev, cls]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {cls}
                    </button>
                  );
                })}
              </div>
              {selectedClasses.length === 0 && (
                <p className="text-[11px] text-red-500 mt-1">Please select at least one class</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Teaching Experience */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Teaching Experience <span className="text-red-500">*</span>
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                >
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-8 years">5-8 years</option>
                  <option value="8+ years">8+ years</option>
                </select>
              </div>

              {/* Hourly Charges (₹ / hour) at student's house */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hourly Charges (₹ / hour) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-slate-400 font-bold absolute left-3 top-2.5 text-xs sm:text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="50"
                    value={hourlyCharges}
                    onChange={(e) => setHourlyCharges(e.target.value)}
                    placeholder="e.g. 400"
                    required
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 absolute right-3 top-3">
                    per hour / student house
                  </span>
                </div>
                {Number(hourlyCharges) > 0 && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <span>= ₹{(Number(hourlyCharges) * 30).toLocaleString('en-IN')} / month</span>
                    <span className="text-slate-500 font-normal">(calculated at 1 hour/day for 30 days = 30 hours)</span>
                  </p>
                )}
              </div>
            </div>

            {/* Languages Known */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Languages You Speak with Students
              </label>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={languages.english}
                    onChange={(e) =>
                      setLanguages((prev) => ({ ...prev, english: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>English</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={languages.hindi}
                    onChange={(e) =>
                      setLanguages((prev) => ({ ...prev, hindi: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Hindi</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={languages.odia}
                    onChange={(e) =>
                      setLanguages((prev) => ({ ...prev, odia: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Odia</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={languages.other}
                    onChange={(e) =>
                      setLanguages((prev) => ({ ...prev, other: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Other</span>
                </label>

                {languages.other && (
                  <input
                    type="text"
                    value={otherLanguageText}
                    onChange={(e) => setOtherLanguageText(e.target.value)}
                    placeholder="e.g. Telugu"
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-500 w-28"
                  />
                )}
              </div>
            </div>

            {/* 1-Hour Availability Checklist */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  Available Time Slots (1-Hour Intervals) <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select the hours when you can take home tuition sessions (6:00 AM to 9:00 PM)
                </p>
              </div>

              {/* 1-Hour Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {AVAILABLE_1HR_SLOTS.map((slot) => {
                  const isSelected = availableTimeSlots.includes(slot);
                  return (
                    <label
                      key={slot}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-semibold shadow-2xs'
                          : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSlot(slot)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                      <Clock
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{slot}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  Selected:{' '}
                  <strong className="text-blue-600 font-bold">{availableTimeSlots.length}</strong> of{' '}
                  {AVAILABLE_1HR_SLOTS.length} slots
                </span>
                {availableTimeSlots.length === 0 && (
                  <span className="text-amber-600 font-semibold">
                    Please select at least one hour slot
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 6: About Yourself */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">About Yourself</h2>
                <p className="text-xs text-slate-500">
                  Introduce your teaching style and philosophy to parents in Rayagada
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                About Yourself (Short Bio) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell parents and students about your pedagogical style, how you conduct homework revisions, and your experience..."
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                {bio.length} characters (min 30 recommended)
              </span>
            </div>
          </div>

          {/* SECTION 7: KYC Verification */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">KYC Verification</h2>
                <p className="text-xs text-slate-500">
                  Provide your Aadhaar ID and document for background verification in Rayagada
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aadhaar Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Aadhaar Number (12 Digits)
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={14}
                    value={aadhaarNumber}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = clean.replace(/(\d{4})/g, '$1 ').trim();
                      setAadhaarNumber(formatted);
                    }}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all tracking-wider font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Encrypted and securely stored for verified tutor badge.</p>
              </div>

              {/* Aadhaar Card Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Upload Aadhaar Card (Front/Back)
                </label>
                <input
                  type="file"
                  ref={aadhaarInputRef}
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleSingleImageUpload(e, setAadhaarImage, 'Aadhaar_Card')}
                  className="hidden"
                />

                {aadhaarImage ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate text-xs">
                        <span className="font-semibold text-slate-800 truncate block">{aadhaarImage.name}</span>
                        <span className="text-[10px] text-slate-400">{aadhaarImage.size}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAadhaarImage(null)}
                      className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => aadhaarInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-600 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Aadhaar Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>Close</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Profile...</span>
                </>
              ) : (
                <>
                  <span>Submit Profile for Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
