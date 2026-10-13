import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface OfferItem {
  id: string;
  title: string;
  badge?: string; // e.g. "FLAT 20% OFF", "FREE TRIAL", "LIMITED PERIOD"
  description?: string;
  expiryDate: string; // Format: "YYYY-MM-DD"
  active: boolean;
  actionType?: 'demo' | 'enquiry' | 'tutors' | 'courses' | 'none';
  createdAt: string;
  updatedAt?: string;
}

const LOCAL_OFFERS_KEY = 'kumari_live_offers_registry';

// Default initial offers if collection is empty
const INITIAL_PRESET_OFFERS: OfferItem[] = [
  {
    id: 'offer-preset-1',
    title: 'Special Navodaya & Board Prep Batch 2026: Get 20% Early Bird Scholarship on New Enrollments!',
    badge: '20% OFF',
    description: 'Flat 20% scholarship for the first 30 admissions in Rayagada.',
    expiryDate: '2026-11-30',
    active: true,
    actionType: 'enquiry',
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-preset-2',
    title: 'Verified Home Tutors in Rayagada: Book 1-on-1 Free Demo Session with Zero Registration Fee!',
    badge: 'FREE DEMO',
    description: 'Try a trial home tuition class with verified subject specialists.',
    expiryDate: '2026-12-15',
    active: true,
    actionType: 'demo',
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-preset-3',
    title: 'Class 1 to 10 Foundation Coaching: Personalized Mentoring & Weekly Test Series in Indira Nagar!',
    badge: 'ADMISSIONS OPEN',
    description: 'Special weekend doubts clearance and personalized mentor guidance.',
    expiryDate: '2026-12-31',
    active: true,
    actionType: 'courses',
    createdAt: new Date().toISOString()
  }
];

function getLocalOffers(): OfferItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_OFFERS_KEY);
    if (!raw) return INITIAL_PRESET_OFFERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRESET_OFFERS;
  } catch {
    return INITIAL_PRESET_OFFERS;
  }
}

function saveLocalOffers(list: OfferItem[]) {
  try {
    localStorage.setItem(LOCAL_OFFERS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Error saving local offers:', err);
  }
}

/**
 * Checks whether an offer has passed its expiry date
 */
export function isOfferExpired(expiryDateStr: string): boolean {
  if (!expiryDateStr) return false;
  try {
    // If format is YYYY-MM-DD, set end of day 23:59:59
    const endOfDay = new Date(`${expiryDateStr}T23:59:59`);
    const now = new Date();
    return endOfDay.getTime() < now.getTime();
  } catch {
    return false;
  }
}

/**
 * Filter out expired offers and optionally delete them from Firestore
 */
export async function purgeExpiredOffersFromFirestore(): Promise<number> {
  let count = 0;
  try {
    const colRef = collection(db, 'offers');
    const snapshot = await getDocs(colRef);
    const deletePromises: Promise<any>[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as OfferItem;
      if (data.expiryDate && isOfferExpired(data.expiryDate)) {
        deletePromises.push(deleteDoc(doc(db, 'offers', docSnap.id)));
        count++;
      }
    });

    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('purgeExpiredOffers notice:', err);
  }
  return count;
}

/**
 * Real-time listener for public active, unexpired offers for the homepage marquee
 */
export function subscribeToActiveOffers(
  callback: (offers: OfferItem[]) => void
): () => void {
  // Emit non-expired local offers immediately
  const emitLocal = () => {
    const list = getLocalOffers();
    const activeUnexpired = list.filter((o) => o.active && !isOfferExpired(o.expiryDate));
    callback(activeUnexpired.length > 0 ? activeUnexpired : INITIAL_PRESET_OFFERS);
  };

  emitLocal();

  try {
    const colRef = collection(db, 'offers');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const remoteOffers: OfferItem[] = [];
        snapshot.forEach((docSnap) => {
          const item = { id: docSnap.id, ...docSnap.data() } as OfferItem;
          remoteOffers.push(item);
        });

        if (remoteOffers.length > 0) {
          saveLocalOffers(remoteOffers);
          // Filter strictly: active AND unexpired
          const activeUnexpired = remoteOffers.filter(
            (o) => o.active !== false && !isOfferExpired(o.expiryDate)
          );

          // If any expired offers exist in remote, clean them up asynchronously
          remoteOffers.forEach((o) => {
            if (isOfferExpired(o.expiryDate)) {
              deleteDoc(doc(db, 'offers', o.id)).catch(() => {});
            }
          });

          callback(activeUnexpired.length > 0 ? activeUnexpired : INITIAL_PRESET_OFFERS);
        } else {
          // If Firestore is empty, seed initial preset offers into Firestore
          INITIAL_PRESET_OFFERS.forEach((initOffer) => {
            setDoc(doc(db, 'offers', initOffer.id), initOffer).catch(() => {});
          });
          emitLocal();
        }
      },
      (err) => {
        console.warn('Active offers listener notice:', err);
        emitLocal();
      }
    );

    return () => unsubscribe();
  } catch (err) {
    console.warn('Setup offers listener error:', err);
    return () => {};
  }
}

/**
 * Real-time listener for all offers for Admin Panel management
 */
export function subscribeToAllOffersAdmin(
  callback: (offers: OfferItem[]) => void
): () => void {
  const emitLocal = () => {
    callback(getLocalOffers());
  };

  emitLocal();

  try {
    const colRef = collection(db, 'offers');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const remoteOffers: OfferItem[] = [];
        snapshot.forEach((docSnap) => {
          const item = { id: docSnap.id, ...docSnap.data() } as OfferItem;
          remoteOffers.push(item);
        });

        if (remoteOffers.length > 0) {
          saveLocalOffers(remoteOffers);
          callback(remoteOffers);
        } else {
          INITIAL_PRESET_OFFERS.forEach((initOffer) => {
            setDoc(doc(db, 'offers', initOffer.id), initOffer).catch(() => {});
          });
          emitLocal();
        }
      },
      (err) => {
        console.warn('Admin offers listener notice:', err);
        emitLocal();
      }
    );

    return () => unsubscribe();
  } catch (err) {
    console.warn('Admin setup offers error:', err);
    return () => {};
  }
}

/**
 * Save new offer to Firestore
 */
export async function saveOfferToFirestore(
  payload: Omit<OfferItem, 'id' | 'createdAt'>
): Promise<OfferItem> {
  const id = 'offer-' + Date.now().toString(36) + '-' + Math.floor(100 + Math.random() * 900);
  const now = new Date().toISOString();

  const newOffer: OfferItem = {
    ...payload,
    id,
    createdAt: now,
    updatedAt: now
  };

  // 1. Update local cache
  const list = getLocalOffers();
  const updated = [newOffer, ...list];
  saveLocalOffers(updated);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'offers', id);
    await setDoc(docRef, newOffer);
  } catch (err) {
    console.warn('saveOfferToFirestore error:', err);
  }

  return newOffer;
}

/**
 * Update an existing offer in Firestore
 */
export async function updateOfferInFirestore(
  id: string,
  updates: Partial<OfferItem>
): Promise<void> {
  const list = getLocalOffers();
  const updatedList = list.map((o) => (o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o));
  saveLocalOffers(updatedList);

  try {
    const docRef = doc(db, 'offers', id);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('updateOfferInFirestore error:', err);
  }
}

/**
 * Delete offer from Firestore
 */
export async function deleteOfferFromFirestore(id: string): Promise<void> {
  const list = getLocalOffers();
  const updatedList = list.filter((o) => o.id !== id);
  saveLocalOffers(updatedList);

  try {
    const docRef = doc(db, 'offers', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('deleteOfferFromFirestore error:', err);
  }
}
