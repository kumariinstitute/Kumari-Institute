import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { INITIAL_TUTORS, Tutor, RAYAGADA_LOCALITIES, findClosestLocality } from "./src/data/tutorsData.js";
import {
  generateTenthMarksheetSvg,
  generateTwelfthMarksheetSvg,
  generateDegreeCertificateSvg,
  generateAadhaarCardSvg
} from "./src/data/certificateSamples.js";

const app = express();
const PORT = 3000;

// Enable JSON body parsing for API requests
app.use(express.json());

// Persistent File Paths
const USERS_DATA_FILE = path.join(process.cwd(), "data", "users.json");
const TEACHERS_DATA_FILE = path.join(process.cwd(), "data", "teachers.json");
const BOOKINGS_DATA_FILE = path.join(process.cwd(), "data", "bookings.json");
const DEMO_QUERIES_DATA_FILE = path.join(process.cwd(), "data", "demo_queries.json");
const GALLERY_DATA_FILE = path.join(process.cwd(), "data", "gallery.json");
const SUCCESS_STORIES_DATA_FILE = path.join(process.cwd(), "data", "success_stories.json");
const ACTIVITY_LOGS_DATA_FILE = path.join(process.cwd(), "data", "activity_logs.json");
const HERO_BANNERS_DATA_FILE = path.join(process.cwd(), "data", "hero_banners.json");
const PARENTS_DATA_FILE = path.join(process.cwd(), "data", "parents.json");

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Hero Banners Store
export interface ServerHeroBanner {
  id: string;
  url: string;
  active: boolean;
  createdAt: string;
}

function loadSavedHeroBanners(): ServerHeroBanner[] {
  try {
    if (fs.existsSync(HERO_BANNERS_DATA_FILE)) {
      const raw = fs.readFileSync(HERO_BANNERS_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("[Server Hero Banners Store] Read notice:", err);
  }
  return [
    {
      id: "banner-default-01",
      url: "/src/assets/images/tutor_hero_guidance_1789370512786.jpg",
      active: true,
      createdAt: new Date().toISOString()
    }
  ];
}

function saveHeroBanners(banners: ServerHeroBanner[]) {
  try {
    ensureDirectoryExists(HERO_BANNERS_DATA_FILE);
    fs.writeFileSync(HERO_BANNERS_DATA_FILE, JSON.stringify(banners, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server Hero Banners Store] Write notice:", err);
  }
}

let heroBannersDatabase: ServerHeroBanner[] = loadSavedHeroBanners();

// Helper to exclude only true dummy placeholders (preserving all real parents)
function isFakeParentRecord(u: any): boolean {
  if (!u) return true;
  // If not a parent record, return false so usersDatabase never drops teachers or admins
  if (u.role && u.role !== 'parent') return false;

  const name = String(u.fullName || u.name || '').toLowerCase().trim();
  const email = String(u.email || '').toLowerCase().trim();
  const phone = String(u.phone || u.mobile || '').trim();

  // Keep any user that has a name, email, or phone
  if (!name && !email && !phone) {
    return true;
  }

  // Only exclude obvious dummy test placeholders
  if (name === 'sample parent' || name === 'dummy parent' || name === 'test parent dummy') {
    return true;
  }
  const uid = String(u.uid || u.id || '').toLowerCase();
  if (uid.includes('dummy_parent') || uid.includes('sample_mock') || uid.includes('demo_sample_dummy')) {
    return true;
  }

  return false;
}

// 1. Users Store
function loadSavedUsers(): Record<string, any> {
  try {
    if (fs.existsSync(USERS_DATA_FILE)) {
      const content = fs.readFileSync(USERS_DATA_FILE, "utf-8");
      const parsed = JSON.parse(content) || {};
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (!isFakeParentRecord(v)) {
          clean[k] = v;
        }
      }
      return clean;
    }
  } catch (err) {
    console.warn("[Server User Store] Read notice:", err);
  }
  return {};
}

function persistUsers(usersMap: Record<string, any>) {
  try {
    ensureDirectoryExists(USERS_DATA_FILE);
    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify(usersMap, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server User Store] Write notice:", err);
  }
}

let usersDatabase: Record<string, any> = loadSavedUsers();

// Parents Store (Exclusively Registered Parents)
function loadSavedParents(): Record<string, any> {
  try {
    if (fs.existsSync(PARENTS_DATA_FILE)) {
      const content = fs.readFileSync(PARENTS_DATA_FILE, "utf-8");
      const parsed = JSON.parse(content) || {};
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (!isFakeParentRecord(v) && (v as any)?.role === 'parent') {
          clean[k] = v;
        }
      }
      return clean;
    }
  } catch (err) {
    console.warn("[Server Parent Store] Read notice:", err);
  }
  return {};
}

function persistParents(parentsMap: Record<string, any>) {
  try {
    ensureDirectoryExists(PARENTS_DATA_FILE);
    fs.writeFileSync(PARENTS_DATA_FILE, JSON.stringify(parentsMap, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server Parent Store] Write notice:", err);
  }
}

let parentsDatabase: Record<string, any> = loadSavedParents();

// 2. Teachers Store (Preserving Verification, Certificates & Booking status)
function loadSavedTeachers(): Tutor[] {
  try {
    if (fs.existsSync(TEACHERS_DATA_FILE)) {
      const raw = fs.readFileSync(TEACHERS_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((t) => {
            const id = (t.id || '').toLowerCase();
            const name = (t.name || '').toLowerCase().trim();
            if (
              !name ||
              name === 'educator' ||
              name.includes('educator') ||
              id.includes('educator')
            ) {
              return false;
            }
            return !(
              id.includes('priya-sharma') ||
              id.includes('rakesh-tripathy') ||
              id.includes('sneha-patel') ||
              id.includes('sagar-das') ||
              id.includes('anita-mohanty')
            );
          })
          .map((t) => enrichTeacherCertificates(t));
      }
    }
  } catch (err) {
    console.warn("[Server Teachers Store] Read notice:", err);
  }

  // Fallback to collect from usersDatabase
  const fromUsers: Tutor[] = [];
  const seenIds = new Set<string>();
  Object.values(usersDatabase).forEach((u: any) => {
    if (u && u.role === "teacher" && u.uid && !seenIds.has(u.uid)) {
      const uidLower = u.uid.toLowerCase();
      const rawName = (u.fullName || u.name || '').trim();
      if (
        !rawName ||
        rawName.toLowerCase() === 'educator' ||
        rawName.toLowerCase().includes('educator') ||
        uidLower.includes('educator')
      ) {
        return;
      }
      if (
        uidLower.includes('priya-sharma') ||
        uidLower.includes('rakesh-tripathy') ||
        uidLower.includes('sneha-patel') ||
        uidLower.includes('sagar-das') ||
        uidLower.includes('anita-mohanty')
      ) {
        return;
      }
      seenIds.add(u.uid);
      const tutor: Tutor = {
        id: u.uid,
        name: rawName,
        qualification: u.highestQualification || u.qualification || "",
        experienceYears: typeof u.experienceYears === "number" ? u.experienceYears : 0,
        experienceText: u.experienceYears ? `${u.experienceYears}+ Yrs Exp` : "New Tutor",
        subjects: Array.isArray(u.subjects) ? u.subjects : [],
        distanceKm: 0,
        availabilityText: "Available",
        availabilityType: "available_now",
        availabilityBadge: u.badge || "Verified Home Tutor",
        rating: typeof u.rating === "number" ? u.rating : 0,
        reviewCount: typeof u.reviewCount === "number" ? u.reviewCount : 0,
        monthlyFee: (typeof u.hourlyRate === "number" && u.hourlyRate > 0) || (typeof u.hourlyCharges === "number" && u.hourlyCharges > 0)
          ? ((typeof u.hourlyRate === "number" && u.hourlyRate > 0 ? u.hourlyRate : (u.hourlyCharges as number)) * 30)
          : (typeof u.monthlyFee === "number" && u.monthlyFee > 0 ? u.monthlyFee : 3000),
        hourlyRate: typeof u.hourlyRate === "number" && u.hourlyRate > 0
          ? u.hourlyRate
          : (typeof u.hourlyCharges === "number" && u.hourlyCharges > 0
              ? u.hourlyCharges
              : (typeof u.monthlyFee === "number" && u.monthlyFee > 0 ? Math.round(u.monthlyFee / 30) : 100)),
        bio: u.bio || "",
        avatar: u.avatar || u.photoUrl || "",
        gender: u.gender === "male" ? "male" : "female",
        teacherType: u.teacherType || "home",
        classesHandled: Array.isArray(u.classesHandled) ? u.classesHandled : [],
        boardsSupported: Array.isArray(u.boardsSupported) ? u.boardsSupported : [],
        locationArea: u.locality || u.locationArea || "",
        addressSnippet: u.address || u.locality || "",
        verified: Boolean(u.verified || u.isApproved),
        status: u.status || (u.isApproved ? "approved" : "pending"),
        isApproved: Boolean(u.isApproved),
        isBooked: Boolean(u.isBooked),
        latitude: typeof u.latitude === "number" ? u.latitude : 19.1691,
        longitude: typeof u.longitude === "number" ? u.longitude : 83.4150,
        teachingHighlights: Array.isArray(u.teachingHighlights) ? u.teachingHighlights : [],
        reviews: Array.isArray(u.reviews) ? u.reviews : []
      };
      fromUsers.push(enrichTeacherCertificates(tutor));
    }
  });
  return fromUsers;
}

function enrichTeacherCertificates(t: Tutor): Tutor {
  const tenthScore = t.educationDetails?.tenth?.score || '91.2%';
  const tenthYear = t.educationDetails?.tenth?.year || '2016';
  const twelfthScore = t.educationDetails?.twelfth?.score || '88.4%';
  const twelfthYear = t.educationDetails?.twelfth?.year || '2018';
  const degreeYear = t.educationDetails?.degree?.year || '2021';
  const degreeName = t.qualification || 'Bachelor of Science (B.Sc)';

  return {
    ...t,
    status: t.status || (t.isApproved ? 'approved' : 'pending'),
    isApproved: Boolean(t.isApproved || t.status === 'approved'),
    isBooked: Boolean(t.isBooked),
    bookingStatus: t.isBooked ? 'booked' : 'available',
    certificates: {
      tenth: {
        name: t.educationDetails?.tenth?.marksheetName || `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_10th_marksheet.jpg`,
        url: t.educationDetails?.tenth?.marksheetUrl || generateTenthMarksheetSvg(t.name, tenthYear, tenthScore, t.educationDetails?.tenth?.school || 'Rayagada High School'),
        score: tenthScore,
        year: tenthYear,
        board: t.educationDetails?.tenth?.board || 'Board of Secondary Education, Odisha'
      },
      twelfth: {
        name: t.educationDetails?.twelfth?.marksheetName || `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_12th_marksheet.jpg`,
        url: t.educationDetails?.twelfth?.marksheetUrl || generateTwelfthMarksheetSvg(t.name, twelfthYear, twelfthScore, t.educationDetails?.twelfth?.college || 'Rayagada Autonomous College'),
        score: twelfthScore,
        year: twelfthYear,
        board: t.educationDetails?.twelfth?.board || 'Council of Higher Secondary Education, Odisha'
      },
      degree: {
        name: t.educationDetails?.degree?.marksheetName || `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_degree_certificate.jpg`,
        url: t.educationDetails?.degree?.marksheetUrl || generateDegreeCertificateSvg(t.name, degreeName, t.educationDetails?.degree?.university || 'Berhampur University', degreeYear),
        score: t.educationDetails?.degree?.score || '85.0%',
        year: degreeYear,
        course: degreeName,
        university: t.educationDetails?.degree?.university || 'Berhampur University'
      },
      idProof: {
        name: `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_aadhaar_card.jpg`,
        url: t.aadhaarDocUrl || generateAadhaarCardSvg(t.name, t.aadhaarNumber || '8492 1048 3921', t.locationArea || 'Rayagada'),
        docNumber: t.aadhaarNumber || '8492 1048 3921',
        type: 'Aadhaar Card (Govt. of India)'
      }
    }
  };
}

function saveTeachersToFile(teachers: Tutor[]) {
  try {
    ensureDirectoryExists(TEACHERS_DATA_FILE);
    fs.writeFileSync(TEACHERS_DATA_FILE, JSON.stringify(teachers, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server Teachers Store] Write notice:", err);
  }
}

let teachersDatabase: Tutor[] = loadSavedTeachers();

// 3. Bookings Store
function loadSavedBookings(): any[] {
  try {
    if (fs.existsSync(BOOKINGS_DATA_FILE)) {
      const raw = fs.readFileSync(BOOKINGS_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[Server Bookings Store] Read notice:", err);
  }
  return [];
}

function persistBookings(bookings: any[]) {
  try {
    ensureDirectoryExists(BOOKINGS_DATA_FILE);
    fs.writeFileSync(BOOKINGS_DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server Bookings Store] Write notice:", err);
  }
}

let bookingsDatabase: any[] = loadSavedBookings();

// 4. Offline Demo Queries Store
function loadSavedDemoQueries(): any[] {
  try {
    if (fs.existsSync(DEMO_QUERIES_DATA_FILE)) {
      const raw = fs.readFileSync(DEMO_QUERIES_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[Server Demo Queries Store] Read notice:", err);
  }
  return [];
}

function persistDemoQueries(queries: any[]) {
  try {
    ensureDirectoryExists(DEMO_QUERIES_DATA_FILE);
    fs.writeFileSync(DEMO_QUERIES_DATA_FILE, JSON.stringify(queries, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server Demo Queries Store] Write notice:", err);
  }
}

let demoQueriesDatabase: any[] = loadSavedDemoQueries();

// 5. Gallery Store
function loadSavedGallery(): any[] {
  try {
    if (fs.existsSync(GALLERY_DATA_FILE)) {
      const raw = fs.readFileSync(GALLERY_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[Server Gallery Store] Read notice:", err);
  }
  return [];
}

function persistGallery(items: any[]) {
  try {
    ensureDirectoryExists(GALLERY_DATA_FILE);
    fs.writeFileSync(GALLERY_DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server Gallery Store] Write notice:", err);
  }
}

let galleryDatabase: any[] = loadSavedGallery();

// 6. Success Stories Store
function loadSavedSuccessStories(): any[] {
  try {
    if (fs.existsSync(SUCCESS_STORIES_DATA_FILE)) {
      const raw = fs.readFileSync(SUCCESS_STORIES_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[Server Success Stories Store] Read notice:", err);
  }
  return [];
}

function persistSuccessStories(stories: any[]) {
  try {
    ensureDirectoryExists(SUCCESS_STORIES_DATA_FILE);
    fs.writeFileSync(SUCCESS_STORIES_DATA_FILE, JSON.stringify(stories, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server Success Stories Store] Write notice:", err);
  }
}

let successStoriesDatabase: any[] = loadSavedSuccessStories();

// 7. Activity Logs Store (Audit Trail for Admin Actions & Received Payments)
function getDefaultSeedActivityLogs(): any[] {
  return [];
}

function loadSavedActivityLogs(): any[] {
  try {
    if (fs.existsSync(ACTIVITY_LOGS_DATA_FILE)) {
      const raw = fs.readFileSync(ACTIVITY_LOGS_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[Server Activity Logs Store] Read notice:", err);
  }
  return [];
}

function persistActivityLogs(logs: any[]) {
  try {
    ensureDirectoryExists(ACTIVITY_LOGS_DATA_FILE);
    fs.writeFileSync(ACTIVITY_LOGS_DATA_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server Activity Logs Store] Write notice:", err);
  }
}

let activityLogsDatabase: any[] = loadSavedActivityLogs();

function recordActivityLog(logData: any) {
  const fullLog = {
    id: logData.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    adminName: logData.adminName || "Admin Chandini Kurumoju",
    adminEmail: logData.adminEmail || "chandinikurumoju424@gmail.com",
    adminAvatar: logData.adminAvatar || "/src/assets/images/student_rohit_1788779382685.jpg",
    actionType: logData.actionType,
    category: logData.category || "tutors",
    title: logData.title,
    description: logData.description,
    targetId: logData.targetId || "",
    targetName: logData.targetName || "",
    studentName: logData.studentName || "",
    parentName: logData.parentName || "",
    parentPhone: logData.parentPhone || "",
    tutorName: logData.tutorName || "",
    courseTitle: logData.courseTitle || "",
    amount: typeof logData.amount === "number" ? logData.amount : undefined,
    paymentMethod: logData.paymentMethod || undefined,
    transactionId: logData.transactionId || undefined,
    receiptNo: logData.receiptNo || undefined,
    status: logData.status || "completed",
    notes: logData.notes || "",
    timestamp: logData.timestamp || new Date().toISOString()
  };

  activityLogsDatabase.unshift(fullLog);
  persistActivityLogs(activityLogsDatabase);
  console.log(`[Audit Log] Recorded: [${fullLog.actionType}] by ${fullLog.adminName}: ${fullLog.title}`);
  return fullLog;
}


/**
 * Haversine Formula:
 * Calculates the great-circle distance between two points on the Earth's surface
 * using their latitude and longitude in kilometers.
 * 
 * Formula:
 * a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
 * c = 2 * atan2(√a, √(1−a))
 * d = R * c
 * (where R = 6371 km Earth radius)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place (e.g., 1.4 km)
  return Math.round(distance * 10) / 10;
}

// ---------------------------------------------------------------------------
// REST API ENDPOINTS
// ---------------------------------------------------------------------------

// 1. Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "TutorConnect Location & Matching Engine",
    timestamp: new Date().toISOString(),
    totalRegisteredTeachers: teachersDatabase.length,
  });
});

// 2. Get All Approved Teachers for Public "Find Home Tutor" Search
// STRICT RULE: Only genuine tutors accepted by admin (isApproved === true) are visible to parents!
app.get("/api/teachers", (req, res) => {
  const { subject, classLevel } = req.query;
  const currentTeachers = loadSavedTeachers();
  // Strictly filter to genuine approved tutors only
  let filtered = currentTeachers.filter((t) => {
    const id = (t.id || '').toLowerCase();
    const name = (t.name || '').toLowerCase().trim();
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
      id.includes('anita-mohanty')
    ) {
      return false;
    }
    return (t.isApproved === true || t.status === "approved") && t.verified === true && t.status !== "rejected";
  });

  if (subject && typeof subject === "string" && subject !== "All Subjects") {
    filtered = filtered.filter((t) =>
      t.subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase()))
    );
  }

  if (classLevel && typeof classLevel === "string" && !classLevel.includes("All")) {
    filtered = filtered.filter((t) =>
      t.classesHandled.some((c) => c.toLowerCase().includes(classLevel.toLowerCase()))
    );
  }

  res.json({
    success: true,
    count: filtered.length,
    teachers: filtered,
  });
});

// 2b. Admin Endpoint: Get All Teachers (Pending, Approved & Rejected with full certificates)
app.get("/api/admin/teachers", (_req, res) => {
  const currentTeachers = loadSavedTeachers();
  const realTeachers = currentTeachers.filter((t) => {
    const id = (t.id || '').toLowerCase();
    return !(
      id.includes('priya-sharma') ||
      id.includes('rakesh-tripathy') ||
      id.includes('sneha-patel') ||
      id.includes('sagar-das') ||
      id.includes('anita-mohanty')
    );
  });
  res.json({
    success: true,
    total: realTeachers.length,
    pendingCount: realTeachers.filter((t) => t.status === "pending" || !t.isApproved).length,
    approvedCount: realTeachers.filter((t) => (t.status === "approved" || t.isApproved) && t.verified).length,
    teachers: realTeachers,
  });
});

// 2c. Admin Endpoint: Verify / Accept Tutor as Genuine or Reject
app.post("/api/admin/teachers/:id/verify", (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body; // status: 'approved' | 'rejected'

  const idx = teachersDatabase.findIndex((t) => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Teacher not found in database." });
  }

  const isApproved = status === "approved";
  const teacherName = teachersDatabase[idx].name;

  if (!isApproved) {
    const updatedTeacher: Tutor = {
      ...teachersDatabase[idx],
      status: "rejected",
      isApproved: false,
      verified: false,
      verificationStatus: "Rejected",
      rejectionReason: notes || "Documents require revision",
      updatedAt: new Date().toISOString()
    };
    teachersDatabase[idx] = updatedTeacher;
    saveTeachersToFile(teachersDatabase);

    if (usersDatabase[id]) {
      usersDatabase[id] = {
        ...usersDatabase[id],
        isApproved: false,
        verified: false,
        status: "rejected",
        verificationStatus: "Rejected",
      };
      persistUsers(usersDatabase);
    }

    recordActivityLog({
      adminName: req.body.adminName || "Admin Chandini Kurumoju",
      adminEmail: req.body.adminEmail || "chandinikurumoju424@gmail.com",
      actionType: "tutor_rejected",
      category: "tutors",
      title: `Tutor ${teacherName} Verification Rejected`,
      description: `Verification status set to Rejected for tutor ${teacherName}. Reason: ${notes || "Documents require revision"}.`,
      targetId: id,
      targetName: teacherName,
      tutorName: teacherName,
      status: "flagged",
      notes: notes || "Documents require revision"
    });

    console.log(`[Admin Action] Tutor ${teacherName} (${id}) status updated to Rejected in database.`);
    return res.json({
      success: true,
      message: `Tutor ${teacherName} verification status updated to Rejected directly in database.`,
      teacher: updatedTeacher
    });
  }

  const updatedTeacher: Tutor = {
    ...teachersDatabase[idx],
    status: "approved",
    isApproved: true,
    verified: true,
    kycStatus: "approved",
    verificationStatus: "Verified Genuine Tutor",
    approvedAt: new Date().toISOString(),
    rejectionReason: undefined
  };

  teachersDatabase[idx] = updatedTeacher;
  saveTeachersToFile(teachersDatabase);

  // Sync to usersDatabase if exists
  Object.keys(usersDatabase).forEach((uid) => {
    const u = usersDatabase[uid];
    if (
      uid === id ||
      u.id === id ||
      (u.email && updatedTeacher.email && u.email.toLowerCase() === updatedTeacher.email.toLowerCase()) ||
      (u.phone && updatedTeacher.phone && u.phone === updatedTeacher.phone)
    ) {
      usersDatabase[uid] = {
        ...u,
        isApproved: true,
        verified: true,
        status: "approved",
        kycStatus: "approved",
        verificationStatus: "Verified Genuine Tutor"
      };
    }
  });
  persistUsers(usersDatabase);

  // Record Admin Activity Log for auditability
  recordActivityLog({
    adminName: req.body.adminName || "Admin Chandini Kurumoju",
    adminEmail: req.body.adminEmail || "chandinikurumoju424@gmail.com",
    actionType: "tutor_approved",
    category: "tutors",
    title: `Tutor ${updatedTeacher.name} Approved Genuine`,
    description: `Audited credentials & verified tutor ${updatedTeacher.name} for subjects: ${updatedTeacher.subjects.join(', ')}.`,
    targetId: updatedTeacher.id,
    targetName: updatedTeacher.name,
    tutorName: updatedTeacher.name,
    status: "completed",
    notes: notes || "Aadhaar & educational certificates validated."
  });

  console.log(`[Admin Action] Tutor ${updatedTeacher.name} (${id}) status set to approved`);
  res.json({
    success: true,
    message: `Tutor ${updatedTeacher.name} accepted as genuine home tutor!`,
    teacher: updatedTeacher,
  });
});

// 2d. Admin Endpoint: Add Authentic Review / Testimonial for Tutor
app.post("/api/admin/teachers/:id/reviews", (req, res) => {
  const { id } = req.params;
  const { parentName, relation, rating, comment, studentGrade, schoolName, verifiedBooking } = req.body;

  if (!parentName || !comment) {
    return res.status(400).json({ success: false, error: "Parent name and review comment are required." });
  }

  const idx = teachersDatabase.findIndex((t) => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Tutor not found in database." });
  }

  const tutor = teachersDatabase[idx];
  const currentReviews = Array.isArray(tutor.reviews) ? [...tutor.reviews] : [];

  const newReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    parentName: parentName.trim(),
    relation: relation?.trim() || `Parent of ${studentGrade || "student"}`,
    rating: Number(rating) || 5,
    date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    comment: comment.trim(),
    studentGrade: studentGrade?.trim() || "Primary Class",
    schoolName: schoolName?.trim() || "Rayagada",
    verifiedBooking: verifiedBooking !== false,
  };

  currentReviews.unshift(newReview);
  const avgRating =
    Math.round((currentReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / currentReviews.length) * 10) / 10;

  teachersDatabase[idx] = {
    ...tutor,
    reviews: currentReviews,
    rating: avgRating,
    reviewCount: currentReviews.length,
  };
  saveTeachersToFile(teachersDatabase);

  // Sync to usersDatabase if registered
  if (usersDatabase[id]) {
    usersDatabase[id] = {
      ...usersDatabase[id],
      reviews: currentReviews,
      rating: avgRating,
      reviewCount: currentReviews.length,
    };
    persistUsers(usersDatabase);
  }

  recordActivityLog({
    adminName: req.body.adminName || "Admin Chandini Kurumoju",
    adminEmail: req.body.adminEmail || "chandinikurumoju424@gmail.com",
    actionType: "tutor_approved",
    category: "tutors",
    title: `New Verified Review Published for ${tutor.name}`,
    description: `Added review from ${parentName} (${newReview.rating}★): "${comment.slice(0, 80)}..."`,
    targetId: tutor.id,
    targetName: tutor.name,
    tutorName: tutor.name,
    status: "completed",
    notes: `Rating: ${newReview.rating} Stars`
  });

  res.json({
    success: true,
    message: `Review added successfully for Tutor ${tutor.name}!`,
    review: newReview,
    teacher: teachersDatabase[idx],
  });
});

// 2e. Admin Endpoint: Delete Review from Tutor
app.delete("/api/admin/teachers/:id/reviews/:reviewId", (req, res) => {
  const { id, reviewId } = req.params;

  const idx = teachersDatabase.findIndex((t) => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Tutor not found." });
  }

  const tutor = teachersDatabase[idx];
  const currentReviews = Array.isArray(tutor.reviews) ? tutor.reviews.filter((r) => r.id !== reviewId) : [];
  const avgRating =
    currentReviews.length > 0
      ? Math.round((currentReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / currentReviews.length) * 10) / 10
      : 5.0;

  teachersDatabase[idx] = {
    ...tutor,
    reviews: currentReviews,
    rating: avgRating,
    reviewCount: currentReviews.length,
  };
  saveTeachersToFile(teachersDatabase);

  res.json({
    success: true,
    message: "Review removed.",
    teacher: teachersDatabase[idx],
  });
});

// 3. Parent Proximity Search: Live-Location Nearby Teachers
// Accepts parent GPS coordinates (lat, lng), radius in km (default 20 km), and filters.
// STRICT RULE: Only genuine tutors accepted by admin (isApproved === true) are matched and shown!
app.get("/api/teachers/nearby", (req, res) => {
  const latStr = req.query.lat as string;
  const lngStr = req.query.lng as string;
  const radiusStr = (req.query.radius as string) || "20";
  const subject = req.query.subject as string;
  const classLevel = req.query.classLevel as string;

  if (!latStr || !lngStr) {
    res.status(400).json({
      success: false,
      error: "Missing required query parameters: 'lat' and 'lng' are required.",
    });
    return;
  }

  const parentLat = parseFloat(latStr);
  const parentLng = parseFloat(lngStr);
  const radiusKm = parseFloat(radiusStr);

  if (isNaN(parentLat) || isNaN(parentLng)) {
    res.status(400).json({
      success: false,
      error: "Invalid coordinates provided. 'lat' and 'lng' must be valid floating point numbers.",
    });
    return;
  }

  // Strictly filter to genuine approved teachers ONLY
  const currentTeachers = loadSavedTeachers();
  const approvedTeachers = currentTeachers.filter((t) => {
    const id = (t.id || '').toLowerCase();
    const name = (t.name || '').toLowerCase().trim();
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
      id.includes('anita-mohanty')
    ) {
      return false;
    }
    return (t.isApproved === true || t.status === "approved") && t.verified === true && t.status !== "rejected";
  });

  // Calculate Haversine distance for approved teachers
  const teachersWithDistance = approvedTeachers.map((teacher) => {
    const distanceKm = calculateHaversineDistance(
      parentLat,
      parentLng,
      teacher.latitude,
      teacher.longitude
    );

    // Approximate travel time estimation (assuming typical 20 km/h city scooter / e-rickshaw speed in Rayagada)
    const travelTimeMinutes = Math.max(2, Math.round((distanceKm / 20) * 60));

    return {
      ...teacher,
      distanceKm,
      travelTimeMinutes,
    };
  });

  // Apply subject & class filters if specified
  let matchedTeachers = teachersWithDistance;

  if (subject && subject !== "All Subjects") {
    matchedTeachers = matchedTeachers.filter((t) =>
      t.subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase()))
    );
  }

  if (classLevel && !classLevel.includes("All") && !classLevel.includes("1st to 6th")) {
    matchedTeachers = matchedTeachers.filter((t) =>
      t.classesHandled.some((c) => c.toLowerCase().includes(classLevel.toLowerCase()))
    );
  }

  // Filter teachers strictly within the specified radius
  const withinRadius = matchedTeachers.filter(
    (teacher) => teacher.distanceKm <= radiusKm
  );

  // Sort strictly from closest to farthest
  withinRadius.sort((a, b) => a.distanceKm - b.distanceKm);

  // If none or few within tight radius, also get the next closest 3 teachers for recommendation
  const allSorted = [...matchedTeachers].sort((a, b) => a.distanceKm - b.distanceKm);
  const nextClosestTeachers =
    withinRadius.length === 0
      ? allSorted.slice(0, 3)
      : allSorted.filter((t) => t.distanceKm > radiusKm).slice(0, 2);

  res.json({
    success: true,
    parentLocation: {
      latitude: parentLat,
      longitude: parentLng,
    },
    searchRadiusKm: radiusKm,
    totalMatchingInRadius: withinRadius.length,
    teachers: withinRadius,
    nextClosestTeachers: nextClosestTeachers,
    totalRegisteredTeachers: approvedTeachers.length,
  });
});

// 4. Teacher Live Location & Profile Registration
// When a teacher registers or updates their profile, their status goes to 'pending' first.
// The admin previews their uploaded details with certificates before accepting as genuine.
app.post("/api/teachers/register-location", (req, res) => {
  const {
    name,
    email,
    phone,
    latitude,
    longitude,
    address,
    locationArea,
    qualification,
    experienceYears,
    subjects,
    classesHandled,
    monthlyFee,
    hourlyRate,
    bio,
    gender,
    teacherType,
    educationDetails,
    aadhaarNumber,
    aadhaarDocUrl,
    availableTimeSlots
  } = req.body;

  if (!name || typeof name !== "string") {
    res.status(400).json({ success: false, error: "Teacher name is required." });
    return;
  }

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    res.status(400).json({
      success: false,
      error: "Valid GPS coordinates (latitude and longitude numbers) are required.",
    });
    return;
  }

  // Check if teacher already exists (by email or phone)
  const existingIndex = teachersDatabase.findIndex(
    (t) => (email && t.email === email) || (email && t.bio?.includes(email)) || t.name.toLowerCase() === name.toLowerCase()
  );

  const teacherId =
    existingIndex >= 0
      ? teachersDatabase[existingIndex].id
      : `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  const rawTeacher: Tutor = {
    id: teacherId,
    name: name.trim(),
    email: email || (existingIndex >= 0 ? teachersDatabase[existingIndex].email : undefined),
    phone: phone || (existingIndex >= 0 ? teachersDatabase[existingIndex].phone : undefined),
    qualification: qualification || "",
    experienceYears: Number(experienceYears) || 0,
    experienceText: experienceYears ? `${experienceYears} Years Experience` : "Verified Home Tutor",
    subjects: Array.isArray(subjects) ? subjects : [],
    distanceKm: 0,
    latitude: latitude,
    longitude: longitude,
    availabilityText: "Awaiting Admin Verification",
    availabilityType: "available_now",
    availabilityBadge: "Pending Verification",
    rating: 0,
    reviewCount: 0,
    hourlyRate: Number(hourlyRate) > 0 ? Number(hourlyRate) : (Number(monthlyFee) > 0 ? Math.round(Number(monthlyFee) / 30) : 100),
    monthlyFee: Number(hourlyRate) > 0 ? Number(hourlyRate) * 30 : (Number(monthlyFee) > 0 ? Number(monthlyFee) : 3000),
    bio: bio || "",
    avatar:
      req.body.avatar ||
      req.body.photoUrl ||
      (existingIndex >= 0 ? teachersDatabase[existingIndex].avatar : "/src/assets/images/tutor_priya_sharma_1789370534007.jpg"),
    gender: gender === "female" ? "female" : "male",
    teacherType: teacherType || "home",
    classesHandled: Array.isArray(classesHandled) ? classesHandled : [],
    boardsSupported: Array.isArray(req.body.boardsSupported) ? req.body.boardsSupported : [],
    locationArea: locationArea || "",
    addressSnippet: address || locationArea || "",
    verified: false,
    status: "pending",
    isApproved: false,
    isBooked: false,
    bookingStatus: "available",
    verificationStatus: "Pending Verification",
    submittedAt: new Date().toISOString(),
    aadhaarNumber: aadhaarNumber || "",
    aadhaarDocUrl: aadhaarDocUrl || "",
    availableTimeSlots: Array.isArray(availableTimeSlots) ? availableTimeSlots : ["4:00 PM - 5:00 PM", "5:00 PM - 6:00 PM"],
    educationDetails: educationDetails || (existingIndex >= 0 ? teachersDatabase[existingIndex].educationDetails : {}),
    teachingHighlights: Array.isArray(req.body.teachingHighlights) ? req.body.teachingHighlights : [
      "GPS Verified Location",
      "Certificates Submitted for Admin Review"
    ],
    reviews: [],
  };

  const enriched = enrichTeacherCertificates(rawTeacher);

  if (existingIndex >= 0) {
    teachersDatabase[existingIndex] = {
      ...teachersDatabase[existingIndex],
      ...enriched,
    };
  } else {
    teachersDatabase.unshift(enriched);
  }

  saveTeachersToFile(teachersDatabase);

  console.log(`[Teacher Registration] Registered ${enriched.name}. Status: PENDING admin certificate preview.`);
  res.status(201).json({
    success: true,
    message: "Teacher profile & certificates registered! Awaiting admin verification before appearing on Find Tutors.",
    teacher: enriched,
    totalTeachers: teachersDatabase.length,
  });
});

// ---------------------------------------------------------------------------
// 4B. PARENT HOME TUTOR BOOKINGS & ADMIN ASSIGNMENT API
// ---------------------------------------------------------------------------

// Get all bookings (for Admin Panel & notifications)
app.get("/api/bookings", (_req, res) => {
  res.json({
    success: true,
    total: bookingsDatabase.length,
    pendingCount: bookingsDatabase.filter((b) => b.status === "pending").length,
    bookings: bookingsDatabase,
  });
});

// Parent submits a Home Tutor booking request (exclusively for Home Tutor!)
app.post("/api/bookings", (req, res) => {
  const {
    parentUid,
    parentName,
    parentPhone,
    parentEmail,
    studentName,
    studentGrade,
    subjects,
    address,
    locality,
    preferredTimeSlot,
    requestedTutorId,
    requestedTutorName,
    requestedTutorMonthlyFee,
    requestedTutorAvatar,
  } = req.body;

  if (!parentPhone || !studentName || !requestedTutorId) {
    return res.status(400).json({
      success: false,
      message: "Parent phone, student name, and requested tutor are required.",
    });
  }

  const bookingId = `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newBooking = {
    id: bookingId,
    parentUid: parentUid || "",
    parentName: parentName || "Parent",
    parentPhone,
    parentEmail: parentEmail || "",
    studentName,
    studentGrade: studentGrade || "Primary Class",
    subjects: Array.isArray(subjects) ? subjects : ["Home Tuition"],
    address: address || locality || "Rayagada",
    locality: locality || "Rayagada",
    preferredTimeSlot: preferredTimeSlot || "5:00 PM - 6:00 PM",
    requestedTutorId,
    requestedTutorName: requestedTutorName || "Home Tutor",
    requestedTutorMonthlyFee: Number(requestedTutorMonthlyFee) || 3000,
    requestedTutorAvatar: requestedTutorAvatar || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  bookingsDatabase.unshift(newBooking);
  persistBookings(bookingsDatabase);

  // Register bookedTimeSlots on teacher in teachersDatabase
  const tIndex = teachersDatabase.findIndex((t) => t.id === requestedTutorId);
  if (tIndex >= 0 && newBooking.preferredTimeSlot) {
    const curBooked = Array.isArray((teachersDatabase[tIndex] as any).bookedTimeSlots)
      ? [...(teachersDatabase[tIndex] as any).bookedTimeSlots]
      : [];
    if (!curBooked.includes(newBooking.preferredTimeSlot)) {
      curBooked.push(newBooking.preferredTimeSlot);
      (teachersDatabase[tIndex] as any).bookedTimeSlots = curBooked;
      saveTeachersToFile(teachersDatabase);
    }
  }

  console.log(`[Booking Notification] Parent ${newBooking.parentName} booked Home Tutor ${newBooking.requestedTutorName}. Notification sent to Admin.`);
  res.status(201).json({
    success: true,
    message: "Home tutor booking submitted! Admin has been notified to verify schedule and confirm your assignment.",
    booking: newBooking,
  });
});

// Admin accepts booking and assigns requested tutor OR re-assigns a new tutor as requested!
app.post("/api/admin/bookings/:id/accept", (req, res) => {
  const { id } = req.params;
  const { assignedTutorId, notes } = req.body;

  const bookingIndex = bookingsDatabase.findIndex((b) => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking request not found." });
  }

  const booking = bookingsDatabase[bookingIndex];
  // Determine target tutor (either re-assigned new tutor or requested tutor)
  const targetTutorId = assignedTutorId || booking.requestedTutorId;
  const targetTutor = teachersDatabase.find((t) => t.id === targetTutorId);

  if (!targetTutor) {
    return res.status(404).json({ success: false, message: `Selected tutor (${targetTutorId}) not found in database.` });
  }

  // 1. Mark target tutor as booked and update assignedStudents in teachersDatabase
  const tutorIndex = teachersDatabase.findIndex((t) => t.id === targetTutorId);
  const targetHourly = Number(targetTutor.hourlyRate) || (targetTutor.monthlyFee ? Math.round(targetTutor.monthlyFee / 30) : 100);
  const targetMonthlyFee = targetHourly > 0 ? targetHourly * 30 : (targetTutor.monthlyFee || 3000);

  const assignedStudentData = {
    id: `std-${booking.id}`,
    bookingId: booking.id,
    name: booking.studentName,
    studentName: booking.studentName,
    grade: booking.studentGrade || "Primary Class",
    parentName: booking.parentName,
    parentPhone: booking.parentPhone,
    parentEmail: booking.parentEmail || "",
    address: booking.address,
    locality: booking.locality || "Rayagada",
    subjects: booking.subjects || targetTutor.subjects,
    timing: booking.preferredTimeSlot || "5:00 PM - 6:00 PM",
    monthlyFee: targetMonthlyFee,
    assignedAt: new Date().toISOString(),
    status: "Active"
  };

  if (tutorIndex >= 0) {
    const curStudents = Array.isArray(teachersDatabase[tutorIndex].assignedStudents)
      ? [...(teachersDatabase[tutorIndex].assignedStudents as any[])]
      : [];
    const cleanBId = booking.id.replace(/^std-/, '').trim();
    const filtered = curStudents.filter((s) => {
      const sId = (s.bookingId || s.id || '').toString().replace(/^std-/, '').trim();
      if (cleanBId && sId && cleanBId === sId) return false;
      if (s.studentName && booking.studentName && s.studentName.toLowerCase() === booking.studentName.toLowerCase()) {
        if (!s.parentPhone || !booking.parentPhone || s.parentPhone === booking.parentPhone) return false;
      }
      return true;
    });
    filtered.unshift(assignedStudentData);

    const curBooked = Array.isArray((teachersDatabase[tutorIndex] as any).bookedTimeSlots)
      ? [...(teachersDatabase[tutorIndex] as any).bookedTimeSlots]
      : [];
    if (booking.preferredTimeSlot && !curBooked.includes(booking.preferredTimeSlot)) {
      curBooked.push(booking.preferredTimeSlot);
    }

    teachersDatabase[tutorIndex] = {
      ...teachersDatabase[tutorIndex],
      isBooked: true,
      bookingStatus: "booked",
      bookedByStudentName: booking.studentName,
      bookedByParentName: booking.parentName,
      bookedByParentPhone: booking.parentPhone,
      assignedStudents: filtered,
      bookedTimeSlots: curBooked
    };
    saveTeachersToFile(teachersDatabase);
  }

  // Also update in usersDatabase for teacher if registered with UID
  if (usersDatabase[targetTutorId]) {
    const tUser = usersDatabase[targetTutorId];
    const uStudents = Array.isArray(tUser.assignedStudents) ? [...tUser.assignedStudents] : [];
    const cleanBId = booking.id.replace(/^std-/, '').trim();
    const filteredU = uStudents.filter((s: any) => {
      const sId = (s.bookingId || s.id || '').toString().replace(/^std-/, '').trim();
      if (cleanBId && sId && cleanBId === sId) return false;
      if (s.studentName && booking.studentName && s.studentName.toLowerCase() === booking.studentName.toLowerCase()) {
        if (!s.parentPhone || !booking.parentPhone || s.parentPhone === booking.parentPhone) return false;
      }
      return true;
    });
    filteredU.unshift(assignedStudentData);
    usersDatabase[targetTutorId] = {
      ...tUser,
      isBooked: true,
      assignedStudents: filteredU
    };
    persistUsers(usersDatabase);
  }

  // 2. Update the booking status to accepted / reassigned
  const isReassigned = Boolean(assignedTutorId && assignedTutorId !== booking.requestedTutorId);
  const updatedBooking = {
    ...booking,
    status: isReassigned ? "reassigned" : "accepted",
    assignedTutorId: targetTutor.id,
    assignedTutorName: targetTutor.name,
    assignedTutorPhone: targetTutor.phone || "+91 94371 88201",
    assignedTutorFee: targetMonthlyFee,
    assignedTutorAvatar: targetTutor.avatar,
    reassignedNotes: notes || (isReassigned ? `Assigned dedicated mentor ${targetTutor.name} by Admin.` : "Confirmed by Admin"),
    updatedAt: new Date().toISOString(),
  };

  bookingsDatabase[bookingIndex] = updatedBooking;
  persistBookings(bookingsDatabase);

  // 3. Update Parent's User Profile in usersDatabase (Assigned Educator & Hired Tutors list)
  const parentKey = booking.parentUid || booking.parentEmail?.toLowerCase();
  if (parentKey && usersDatabase[parentKey]) {
    const parent = usersDatabase[parentKey];
    const hiredList = Array.isArray(parent.hiredTutors) ? [...parent.hiredTutors] : [];
    
    // Check if not already added
    const alreadyHired = hiredList.some((h) => h.tutorId === targetTutor.id);
    if (!alreadyHired) {
      hiredList.unshift({
        id: `hired-${Date.now()}`,
        tutorId: targetTutor.id,
        tutorName: targetTutor.name,
        subjects: targetTutor.subjects,
        monthlyFee: targetMonthlyFee,
        phone: targetTutor.phone || "+91 94371 88201",
        locationArea: targetTutor.locationArea || "Rayagada",
        hiredAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "Confirmed",
      });
    }

    usersDatabase[parentKey] = {
      ...parent,
      hiredTutors: hiredList,
      assignedEducator: {
        id: targetTutor.id,
        name: targetTutor.name,
        subjects: targetTutor.subjects,
        phone: targetTutor.phone || "+91 94371 88201",
        monthlyFee: targetMonthlyFee,
        rating: targetTutor.rating || 5.0,
        avatar: targetTutor.avatar,
        status: "Active",
      },
    };
    persistUsers(usersDatabase);
  }

  // Record Admin Activity Log
  recordActivityLog({
    adminName: req.body.adminName || "Admin Chandini Kurumoju",
    adminEmail: req.body.adminEmail || "chandinikurumoju424@gmail.com",
    actionType: isReassigned ? "booking_reassigned" : "booking_accepted",
    category: "bookings",
    title: isReassigned ? `Tutor Reassigned & Confirmed` : `Home Tutor Booking Accepted`,
    description: `Assigned Home Tutor ${targetTutor.name} to student ${booking.studentName} (${booking.studentGrade || "Grade School"}) for ${Array.isArray(booking.subjects) ? booking.subjects.join(", ") : "Tuition"}.`,
    targetId: booking.id,
    targetName: booking.studentName,
    studentName: booking.studentName,
    parentName: booking.parentName,
    parentPhone: booking.parentPhone,
    tutorName: targetTutor.name,
    amount: targetTutor.monthlyFee,
    status: "completed",
    notes: notes || "Tuition schedule and home address confirmed."
  });

  console.log(`[Admin Assignment] Booking ${id} accepted! Assigned Home Tutor ${targetTutor.name} to student ${booking.studentName}.`);
  res.json({
    success: true,
    message: `Home Tutor ${targetTutor.name} assigned & confirmed for student ${booking.studentName}!`,
    booking: updatedBooking,
    assignedTutor: targetTutor,
  });
});

// Admin declines parent home tutor booking request
app.post("/api/admin/bookings/:id/decline", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const bookingIndex = bookingsDatabase.findIndex((b) => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking request not found." });
  }

  const booking = bookingsDatabase[bookingIndex];
  const updatedBooking = {
    ...booking,
    status: "declined",
    declineReason: reason || "Tutor schedule currently unavailable for requested slot.",
    declinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookingsDatabase[bookingIndex] = updatedBooking;
  persistBookings(bookingsDatabase);

  // Record Admin Activity Log
  recordActivityLog({
    adminName: req.body.adminName || "Admin Chandini Kurumoju",
    adminEmail: req.body.adminEmail || "chandinikurumoju424@gmail.com",
    actionType: "booking_declined",
    category: "bookings",
    title: `Home Tutor Booking Declined`,
    description: `Declined booking for student ${booking.studentName} with tutor ${booking.requestedTutorName}. Reason: ${updatedBooking.declineReason}`,
    targetId: booking.id,
    targetName: booking.studentName,
    studentName: booking.studentName,
    parentName: booking.parentName,
    parentPhone: booking.parentPhone,
    tutorName: booking.requestedTutorName,
    status: "completed",
    notes: updatedBooking.declineReason
  });

  console.log(`[Admin Action] Booking ${id} for student ${booking.studentName} was declined. Reason: ${updatedBooking.declineReason}`);
  res.json({
    success: true,
    message: `Booking request for ${booking.studentName} has been declined.`,
    booking: updatedBooking,
  });
});

// ---------------------------------------------------------------------------
// 4C. OFFLINE DEMO CLASS QUERIES (Admin queries for offline coaching classes)
// ---------------------------------------------------------------------------
app.get("/api/admin/demo-queries", (_req, res) => {
  res.json({
    success: true,
    total: demoQueriesDatabase.length,
    queries: demoQueriesDatabase,
  });
});

app.post("/api/demo-queries", (req, res) => {
  const { studentName, parentName, phone, email, grade, subject, preferredDate, preferredTime, notes } = req.body;
  if (!studentName || !phone) {
    return res.status(400).json({ success: false, message: "Student name and phone are required." });
  }

  const query = {
    id: `query-offline-${Date.now()}`,
    studentName,
    parentName: parentName || "Parent",
    phone,
    email: email || "",
    grade: grade || "Primary / Middle School",
    subject: subject || "Offline Coaching",
    preferredDate: preferredDate || new Date().toISOString().split("T")[0],
    preferredTime: preferredTime || "5:00 PM",
    notes: notes || "Inquiry for offline classroom coaching at Indira Nagar campus.",
    queryType: "offline_coaching",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  demoQueriesDatabase.unshift(query);
  persistDemoQueries(demoQueriesDatabase);

  console.log(`[Offline Demo Query] Received offline class inquiry from ${studentName} (${phone})`);
  res.status(201).json({ success: true, message: "Demo query recorded successfully!", query });
});

app.post("/api/admin/demo-queries/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'contacted' | 'scheduled' | 'enrolled' | 'closed'
  const idx = demoQueriesDatabase.findIndex((q) => q.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Demo query not found." });
  }

  demoQueriesDatabase[idx].status = status;
  persistDemoQueries(demoQueriesDatabase);

  const q = demoQueriesDatabase[idx];
  recordActivityLog({
    adminName: req.body.adminName || "Admin Rajesh Panda",
    adminEmail: req.body.adminEmail || "rajesh.panda.coord@kumari.edu.in",
    actionType: status === "scheduled" ? "demo_booking_scheduled" : "demo_booking_handled",
    category: "demo_bookings",
    title: status === "scheduled" ? `Offline Demo Class Scheduled` : `Demo Query Status: ${String(status).toUpperCase()}`,
    description: `Handled offline demo class inquiry for student ${q.studentName} (${q.grade}, ${q.subject}) - marked as ${status}.`,
    targetId: q.id,
    targetName: q.studentName,
    studentName: q.studentName,
    parentName: q.parentName,
    parentPhone: q.phone,
    status: "completed",
    notes: `Demo query status updated to ${status} by admin.`
  });

  res.json({ success: true, query: demoQueriesDatabase[idx] });
});

// ---------------------------------------------------------------------------
// 4D. GALLERY MANAGEMENT (Admin can add & delete gallery images)
// ---------------------------------------------------------------------------
app.get("/api/gallery", (_req, res) => {
  res.json({ success: true, count: galleryDatabase.length, items: galleryDatabase });
});

app.post("/api/gallery", (req, res) => {
  const { title, subtitle, category, image, alt, iconType } = req.body;
  if (!title || !image) {
    return res.status(400).json({ success: false, message: "Title and image URL are required." });
  }

  const newItem = {
    id: `gallery-${Date.now()}`,
    category: category || "students",
    title,
    subtitle: subtitle || "Kumari Institute Rayagada",
    image,
    alt: alt || title,
    iconType: iconType || "user",
    createdAt: new Date().toISOString(),
  };

  galleryDatabase.unshift(newItem);
  persistGallery(galleryDatabase);
  res.status(201).json({ success: true, message: "Image added to gallery!", item: newItem });
});

app.delete("/api/gallery/:id", (req, res) => {
  const { id } = req.params;
  const initialLen = galleryDatabase.length;
  galleryDatabase = galleryDatabase.filter((item) => item.id !== id);
  if (galleryDatabase.length === initialLen) {
    return res.status(404).json({ success: false, message: "Gallery item not found." });
  }

  persistGallery(galleryDatabase);
  res.json({ success: true, message: "Gallery image removed." });
});

// ---------------------------------------------------------------------------
// 4E. SUCCESS STORIES MANAGEMENT (Admin can add & delete success stories)
// ---------------------------------------------------------------------------
app.get("/api/success-stories", (_req, res) => {
  res.json({ success: true, count: successStoriesDatabase.length, stories: successStoriesDatabase });
});

app.post("/api/success-stories", (req, res) => {
  const { studentName, score, exam, school, parentName, testimonial, image, year, badge } = req.body;
  if (!studentName || !testimonial) {
    return res.status(400).json({ success: false, message: "Student name and testimonial quote are required." });
  }

  const newStory = {
    id: `story-${Date.now()}`,
    studentName,
    score: score || "Distinction",
    exam: exam || "Annual Examination",
    school: school || "Rayagada",
    parentName: parentName || "",
    testimonial,
    image: image || "/src/assets/images/student_rohit_1788779382685.jpg",
    year: year || "2024",
    badge: badge || "Star Student",
    createdAt: new Date().toISOString(),
  };

  successStoriesDatabase.unshift(newStory);
  persistSuccessStories(successStoriesDatabase);
  res.status(201).json({ success: true, message: "Success story added successfully!", story: newStory });
});

app.delete("/api/success-stories/:id", (req, res) => {
  const { id } = req.params;
  const initialLen = successStoriesDatabase.length;
  successStoriesDatabase = successStoriesDatabase.filter((s) => s.id !== id);
  if (successStoriesDatabase.length === initialLen) {
    return res.status(404).json({ success: false, message: "Story not found." });
  }

  persistSuccessStories(successStoriesDatabase);
  res.json({ success: true, message: "Success story removed." });
});

// ---------------------------------------------------------------------------
// 4F. ACTIVITY & AUDIT LOGS MANAGEMENT
// Tracks actions taken by admins: tutor approvals, demo bookings, received payments (Way 1: Home Tutors, Way 2: Courses)
// ---------------------------------------------------------------------------
app.get("/api/admin/activity-logs", (req, res) => {
  const { category, actionType, admin, search } = req.query;

  let filtered = [...activityLogsDatabase];

  if (category && typeof category === "string" && category !== "all") {
    filtered = filtered.filter((log) => log.category === category);
  }

  if (actionType && typeof actionType === "string" && actionType !== "all") {
    filtered = filtered.filter((log) => log.actionType === actionType);
  }

  if (admin && typeof admin === "string" && admin !== "all") {
    filtered = filtered.filter((log) =>
      log.adminName.toLowerCase().includes(admin.toLowerCase()) ||
      (log.adminEmail && log.adminEmail.toLowerCase().includes(admin.toLowerCase()))
    );
  }

  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((log) =>
      log.title.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q) ||
      (log.studentName && log.studentName.toLowerCase().includes(q)) ||
      (log.tutorName && log.tutorName.toLowerCase().includes(q)) ||
      (log.courseTitle && log.courseTitle.toLowerCase().includes(q)) ||
      (log.transactionId && log.transactionId.toLowerCase().includes(q)) ||
      (log.receiptNo && log.receiptNo.toLowerCase().includes(q))
    );
  }

  // Calculate audit statistics
  const totalActions = activityLogsDatabase.length;
  const tutorApprovals = activityLogsDatabase.filter((l) => l.actionType === "tutor_approved" || l.actionType === "tutor_rejected").length;
  const demoBookingsHandled = activityLogsDatabase.filter((l) => l.category === "demo_bookings").length;

  const homeTutorPayments = activityLogsDatabase.filter((l) => l.category === "payment_home_tutors" || l.actionType === "payment_home_tutor");
  const homeTutorPaymentsTotal = homeTutorPayments.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const homeTutorPaymentsCount = homeTutorPayments.length;

  const coursePayments = activityLogsDatabase.filter((l) => l.category === "payment_courses" || l.actionType === "payment_course");
  const coursePaymentsTotal = coursePayments.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const coursePaymentsCount = coursePayments.length;

  const totalRevenueCollected = homeTutorPaymentsTotal + coursePaymentsTotal;

  res.json({
    success: true,
    total: filtered.length,
    logs: filtered,
    metrics: {
      totalActions,
      tutorApprovals,
      demoBookingsHandled,
      homeTutorPaymentsTotal,
      homeTutorPaymentsCount,
      coursePaymentsTotal,
      coursePaymentsCount,
      totalRevenueCollected
    }
  });
});

app.post("/api/admin/activity-logs", (req, res) => {
  const {
    adminName,
    adminEmail,
    adminAvatar,
    actionType,
    category,
    title,
    description,
    targetId,
    targetName,
    studentName,
    parentName,
    parentPhone,
    tutorName,
    courseTitle,
    amount,
    paymentMethod,
    transactionId,
    receiptNo,
    status,
    notes,
    timestamp
  } = req.body;

  if (!title || !actionType) {
    return res.status(400).json({ success: false, message: "Title and actionType are required." });
  }

  const newLog = recordActivityLog({
    adminName: adminName || "Admin Chandini Kurumoju",
    adminEmail: adminEmail || "chandinikurumoju424@gmail.com",
    adminAvatar: adminAvatar || "/src/assets/images/student_rohit_1788779382685.jpg",
    actionType,
    category: category || (actionType.includes("payment_course") ? "payment_courses" : actionType.includes("payment") ? "payment_home_tutors" : "tutors"),
    title,
    description: description || title,
    targetId,
    targetName,
    studentName,
    parentName,
    parentPhone,
    tutorName,
    courseTitle,
    amount: typeof amount === "number" ? amount : (amount ? Number(amount) : undefined),
    paymentMethod: paymentMethod || "UPI / QR",
    transactionId: transactionId || (amount ? `TXN-${Date.now().toString().slice(-6)}` : undefined),
    receiptNo: receiptNo || (amount ? `KIR-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
    status: status || "completed",
    notes,
    timestamp: timestamp || new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: "Admin activity logged successfully!",
    log: newLog
  });
});

app.delete("/api/admin/activity-logs/:id", (req, res) => {
  const { id } = req.params;
  const initialLen = activityLogsDatabase.length;
  activityLogsDatabase = activityLogsDatabase.filter((l) => l.id !== id);
  if (activityLogsDatabase.length === initialLen) {
    return res.status(404).json({ success: false, message: "Activity log not found." });
  }
  persistActivityLogs(activityLogsDatabase);
  res.json({ success: true, message: "Activity log archived/deleted." });
});

// 5. Client IP Location Detection (Fallback only, sanitized to Indian coordinates)
app.get("/api/location/detect-ip", async (req, res) => {
  const forwardIp = req.headers["x-forwarded-for"] as string;
  const clientIp = forwardIp ? forwardIp.split(",")[0].trim() : req.socket.remoteAddress;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = clientIp && !clientIp.includes("127.0.0.1") && !clientIp.includes("::1")
      ? `https://freeipapi.com/api/json/${clientIp}`
      : "https://freeipapi.com/api/json";

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as any;
      // Only accept if within India; never return foreign datacenter coordinates (e.g. Canada/US)
      if (data.latitude && data.longitude && data.countryName === "India") {
        return res.json({
          success: true,
          latitude: data.latitude,
          longitude: data.longitude,
          cityName: data.cityName || "Rayagada Area",
          regionName: data.regionName || "Odisha",
          countryName: "India",
          ip: data.ipAddress || clientIp,
          source: "ip_network"
        });
      }
    }
  } catch (err: any) {
    console.warn("[Server IP Location] Primary detection notice:", err.message);
  }

  // Baseline Rayagada Hub fallback if IP lookup fails or is a foreign cloud IP
  res.json({
    success: true,
    latitude: 19.1691,
    longitude: 83.4150,
    cityName: "Rayagada",
    regionName: "Odisha",
    countryName: "India",
    source: "default_hub"
  });
});

// 6. Reverse Geocoding via OpenStreetMap Nominatim with local Rayagada landmark matching
app.get("/api/location/reverse", async (req, res) => {
  const lat = req.query.lat as string;
  const lng = req.query.lng as string;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng parameters are required" });
  }

  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);

  if (isNaN(numLat) || isNaN(numLng)) {
    return res.status(400).json({ error: "Valid numeric lat and lng are required" });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${numLat}&lon=${numLng}&zoom=18&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "KumariInstituteRayagadaApp/1.0",
        "Accept": "application/json"
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as any;
      const addr = data.address || {};
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || addr.hamlet || addr.quarter || "";
      const city = addr.town || addr.city || addr.municipality || addr.county || addr.state_district || "Rayagada";
      const state = addr.state || "Odisha";

      let cleanName = suburb ? `${suburb}, ${city}` : city;
      if (state && !cleanName.includes(state)) {
        cleanName = `${cleanName}, ${state}`;
      }

      return res.json({
        success: true,
        displayName: cleanName,
        fullAddress: data.display_name,
        details: {
          suburb,
          city,
          state,
          postcode: addr.postcode || "765001"
        }
      });
    }
  } catch (err: any) {
    console.warn("[Server Reverse Geocode] Notice:", err.message);
  }

  // Precise fallback based on verified Rayagada localities
  const dToRayagada = calculateHaversineDistance(numLat, numLng, 19.1691, 83.4150);
  const closest = findClosestLocality(numLat, numLng);
  const distToClosest = calculateHaversineDistance(numLat, numLng, closest.latitude, closest.longitude);

  let fallbackName = "Rayagada";
  if (distToClosest <= 1.5) {
    fallbackName = `${closest.name}, Rayagada`;
  } else if (dToRayagada < 5) {
    fallbackName = "Rayagada Town Area";
  } else if (dToRayagada < 25) {
    fallbackName = "Greater Rayagada";
  } else {
    fallbackName = `${numLat.toFixed(4)}° N, ${numLng.toFixed(4)}° E`;
  }

  res.json({
    success: true,
    displayName: fallbackName,
    fullAddress: `${fallbackName}, Odisha`,
    details: {
      suburb: closest.name,
      city: "Rayagada",
      state: "Odisha",
      postcode: "765001"
    }
  });
});

// 7. Forward Geocoding via OpenStreetMap Nominatim for searching any city, area or street
app.get("/api/location/search", async (req, res) => {
  const query = (req.query.q as string || "").trim();
  if (!query || query.length < 2) {
    return res.json({ success: true, results: [] });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "KumariInstituteTutorsApp/1.0",
        "Accept": "application/json"
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as any[];
      const results = data.map((item) => {
        const addr = item.address || {};
        const shortName = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || item.display_name.split(',')[0];
        const state = addr.state || "";
        const label = state ? `${shortName}, ${state}` : shortName;

        return {
          displayName: label,
          fullAddress: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          type: item.type
        };
      });
      return res.json({ success: true, results });
    }
  } catch (err: any) {
    console.warn("[Server Forward Geocode] Notice:", err.message);
  }

  res.json({ success: true, results: [] });
});

// 8. Persistent User Account Storage & Sync APIs
// Stores every registered user, tasks, and progress permanently
app.post("/api/users", (req, res) => {
  const user = req.body;
  if (!user || (!user.uid && !user.email)) {
    return res.status(400).json({ success: false, message: "User uid or email is required." });
  }

  const userKey = user.uid || user.email.toLowerCase();
  const existing = usersDatabase[userKey] || {};

  const wasApproved = Boolean(
    existing.isApproved === true ||
    existing.kycStatus === 'approved' ||
    existing.kycStatus === 'verified' ||
    existing.status === 'approved' ||
    existing.verified === true ||
    existing.verificationStatus === 'Verified Genuine Tutor'
  );

  const updatedUser = {
    ...existing,
    ...user,
    ...(wasApproved ? {
      isApproved: true,
      verified: true,
      status: 'approved',
      kycStatus: 'approved',
      verificationStatus: 'Verified Genuine Tutor'
    } : {}),
    updatedAt: new Date().toISOString()
  };

  usersDatabase[userKey] = updatedUser;
  // Also index by email for instant lookup
  if (user.email) {
    usersDatabase[user.email.toLowerCase()] = updatedUser;
  }
  persistUsers(usersDatabase);

  // If this user is a teacher, sync with teachersDatabase
  if (updatedUser.role === 'teacher') {
    const teacherId = updatedUser.uid || `teacher-${Date.now()}`;
    const existingIdx = teachersDatabase.findIndex(
      (t) => t.id === teacherId || (updatedUser.email && t.bio?.includes(updatedUser.email))
    );
    const teacherObj: Tutor = {
      id: teacherId,
      name: updatedUser.fullName || updatedUser.name || "Home Tutor",
      qualification: updatedUser.highestQualification || updatedUser.qualification || "",
      experienceYears: typeof updatedUser.experienceYears === 'number' ? updatedUser.experienceYears : 0,
      experienceText: updatedUser.experienceYears ? `${updatedUser.experienceYears}+ Yrs Exp` : "New Tutor",
      subjects: Array.isArray(updatedUser.subjects) ? updatedUser.subjects : [],
      distanceKm: 0,
      latitude: typeof updatedUser.latitude === 'number' ? updatedUser.latitude : 19.1691,
      longitude: typeof updatedUser.longitude === 'number' ? updatedUser.longitude : 83.4150,
      availabilityText: "Available",
      availabilityType: "available_now",
      availabilityBadge: updatedUser.badge || "Verified Home Tutor",
      rating: typeof updatedUser.rating === 'number' ? updatedUser.rating : 0,
      reviewCount: typeof updatedUser.reviewCount === 'number' ? updatedUser.reviewCount : 0,
      monthlyFee: (typeof updatedUser.hourlyRate === 'number' && updatedUser.hourlyRate > 0) || (typeof updatedUser.hourlyCharges === 'number' && updatedUser.hourlyCharges > 0)
        ? ((typeof updatedUser.hourlyRate === 'number' && updatedUser.hourlyRate > 0 ? updatedUser.hourlyRate : (updatedUser.hourlyCharges as number)) * 30)
        : (typeof updatedUser.monthlyFee === 'number' && updatedUser.monthlyFee > 0 ? updatedUser.monthlyFee : 3000),
      hourlyRate: typeof updatedUser.hourlyRate === 'number' && updatedUser.hourlyRate > 0
        ? updatedUser.hourlyRate
        : (typeof updatedUser.hourlyCharges === 'number' && updatedUser.hourlyCharges > 0
            ? updatedUser.hourlyCharges
            : (typeof updatedUser.monthlyFee === 'number' && updatedUser.monthlyFee > 0 ? Math.round(updatedUser.monthlyFee / 30) : 100)),
      bio: updatedUser.bio || "",
      avatar: updatedUser.avatar || updatedUser.photoUrl || "",
      gender: updatedUser.gender === "male" ? "male" : "female",
      teacherType: updatedUser.teacherType || "home",
      classesHandled: Array.isArray(updatedUser.classesHandled) ? updatedUser.classesHandled : [],
      boardsSupported: Array.isArray(updatedUser.boardsSupported) ? updatedUser.boardsSupported : [],
      locationArea: updatedUser.locality || updatedUser.locationArea || "",
      addressSnippet: updatedUser.address || updatedUser.locality || "",
      verified: Boolean(updatedUser.verified),
      teachingHighlights: Array.isArray(updatedUser.teachingHighlights) ? updatedUser.teachingHighlights : [],
      reviews: Array.isArray(updatedUser.reviews) ? updatedUser.reviews : []
    };

    if (existingIdx >= 0) {
      teachersDatabase[existingIdx] = { ...teachersDatabase[existingIdx], ...teacherObj };
    } else {
      teachersDatabase.unshift(teacherObj);
    }
    saveTeachersToFile(teachersDatabase);
  }

  // If this user is a parent, also sync to parentsDatabase
  if (updatedUser.role === 'parent') {
    const parentKey = updatedUser.uid || userKey;
    parentsDatabase[parentKey] = {
      ...(parentsDatabase[parentKey] || {}),
      ...updatedUser,
      role: 'parent',
      updatedAt: new Date().toISOString()
    };
    persistParents(parentsDatabase);
  }

  console.log(`[User Store] Saved user ${user.name || userKey} (${user.email}) to persistent storage.`);
  res.json({ success: true, user: updatedUser });
});

app.get("/api/users/:identifier", (req, res) => {
  const { identifier } = req.params;
  const lower = identifier.toLowerCase();
  const user = usersDatabase[identifier] || usersDatabase[lower];

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found in persistent store." });
  }
  res.json({ success: true, user });
});

app.get("/api/admin/parents", (_req, res) => {
  const parentsMap = loadSavedParents();
  const parentsList: any[] = [];
  const seenUids = new Set<string>();

  Object.values(parentsMap).forEach((p: any) => {
    if (p && p.role === "parent" && p.uid && !seenUids.has(p.uid) && !isFakeParentRecord(p)) {
      seenUids.add(p.uid);
      parentsList.push(p);
    }
  });

  // Also include any verified parent in usersDatabase with role === "parent"
  Object.values(usersDatabase).forEach((u: any) => {
    if (u && u.role === "parent" && u.uid && !seenUids.has(u.uid) && !isFakeParentRecord(u)) {
      seenUids.add(u.uid);
      parentsList.push(u);
      parentsDatabase[u.uid] = u;
    }
  });

  res.json({ success: true, count: parentsList.length, parents: parentsList });
});

app.post("/api/parents", (req, res) => {
  const parent = req.body;
  if (!parent || !parent.uid) {
    return res.status(400).json({ success: false, message: "Valid parent record with UID is required." });
  }

  const parentKey = parent.uid;
  parentsDatabase[parentKey] = {
    ...parent,
    role: "parent",
    updatedAt: new Date().toISOString()
  };
  persistParents(parentsDatabase);
  res.json({ success: true, parent: parentsDatabase[parentKey] });
});

app.get("/api/users", (_req, res) => {
  // Deduplicate users by uid
  const uniqueUsers = Object.values(
    Object.values(usersDatabase).reduce((acc: Record<string, any>, u: any) => {
      if (u.uid) acc[u.uid] = u;
      return acc;
    }, {})
  );
  res.json({ success: true, count: uniqueUsers.length, users: uniqueUsers });
});

// ---------------------------------------------------------------------------
// HERO BANNERS MANAGEMENT API
// ---------------------------------------------------------------------------
app.get("/api/hero-banners", (_req, res) => {
  const activeBanners = heroBannersDatabase.filter((b) => b.active !== false);
  res.json({ success: true, banners: activeBanners });
});

app.get("/api/admin/hero-banners", (_req, res) => {
  res.json({ success: true, banners: heroBannersDatabase });
});

app.post("/api/admin/hero-banners", (req, res) => {
  // Support bulk adding multiple banners at once
  if (Array.isArray(req.body.banners) && req.body.banners.length > 0) {
    const addedBanners: ServerHeroBanner[] = [];
    for (const b of req.body.banners) {
      if (b && typeof b.url === 'string' && b.url.trim()) {
        const item: ServerHeroBanner = {
          id: `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: b.url.trim(),
          active: b.active !== false,
          createdAt: new Date().toISOString()
        };
        addedBanners.push(item);
        heroBannersDatabase.unshift(item);
      }
    }
    saveHeroBanners(heroBannersDatabase);
    return res.json({ success: true, count: addedBanners.length, banners: heroBannersDatabase });
  }

  const { url, active } = req.body;
  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ success: false, message: "A valid image URL is required." });
  }

  const newBanner: ServerHeroBanner = {
    id: `banner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url: url.trim(),
    active: active !== false,
    createdAt: new Date().toISOString()
  };

  heroBannersDatabase.unshift(newBanner);
  saveHeroBanners(heroBannersDatabase);
  res.json({ success: true, banner: newBanner, banners: heroBannersDatabase });
});

app.put("/api/admin/hero-banners/:id", (req, res) => {
  const { id } = req.params;
  const { active, url } = req.body;
  const idx = heroBannersDatabase.findIndex((b) => b.id === id);
  if (idx < 0) {
    return res.status(404).json({ success: false, message: "Banner image not found." });
  }

  heroBannersDatabase[idx] = {
    ...heroBannersDatabase[idx],
    ...(active !== undefined ? { active: Boolean(active) } : {}),
    ...(url !== undefined && url ? { url: String(url).trim() } : {})
  };

  saveHeroBanners(heroBannersDatabase);
  res.json({ success: true, banner: heroBannersDatabase[idx], banners: heroBannersDatabase });
});

app.delete("/api/admin/hero-banners/:id", (req, res) => {
  const { id } = req.params;
  heroBannersDatabase = heroBannersDatabase.filter((b) => b.id !== id);
  saveHeroBanners(heroBannersDatabase);
  res.json({ success: true, banners: heroBannersDatabase });
});

// ---------------------------------------------------------------------------
// VITE MIDDLEWARE SETUP
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TutorConnect Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
