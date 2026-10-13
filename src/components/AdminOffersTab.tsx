import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Tag,
  Sparkles,
  Link as LinkIcon,
  X,
  Loader2,
  Check
} from 'lucide-react';
import {
  OfferItem,
  subscribeToAllOffersAdmin,
  saveOfferToFirestore,
  updateOfferInFirestore,
  deleteOfferFromFirestore,
  purgeExpiredOffersFromFirestore,
  isOfferExpired
} from '../services/offerService';

export const AdminOffersTab: React.FC = () => {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formBadge, setFormBadge] = useState('SPECIAL OFFER');
  const [formDescription, setFormDescription] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [formActionType, setFormActionType] = useState<'demo' | 'enquiry' | 'tutors' | 'courses' | 'none'>('enquiry');
  const [formActive, setFormActive] = useState(true);

  // Subscribe to all offers in Firestore
  useEffect(() => {
    const unsub = subscribeToAllOffersAdmin((list) => {
      setOffers(list);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formTitle.trim()) {
      setFormError('Please enter offer text for the marquee ticker.');
      return;
    }
    if (!formExpiryDate) {
      setFormError('Please select an expiry date for this offer.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveOfferToFirestore({
        title: formTitle.trim(),
        badge: formBadge.trim().toUpperCase() || 'OFFER',
        description: formDescription.trim() || undefined,
        expiryDate: formExpiryDate,
        active: formActive,
        actionType: formActionType
      });

      showToast('✓ New offer published and stored in Cloud Firestore!');
      setIsAddingOffer(false);
      setFormTitle('');
      setFormDescription('');
      setFormBadge('SPECIAL OFFER');
      setFormError(null);
    } catch (err: any) {
      console.error('Error creating offer:', err);
      setFormError(err?.message || 'Failed to save offer to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (offer: OfferItem) => {
    try {
      await updateOfferInFirestore(offer.id, { active: !offer.active });
      showToast(`Offer "${offer.title.slice(0, 20)}..." ${!offer.active ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await deleteOfferFromFirestore(id);
      showToast('Offer removed from Cloud Firestore.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handlePurgeExpired = async () => {
    setIsPurging(true);
    try {
      const count = await purgeExpiredOffersFromFirestore();
      showToast(`Cleaned up ${count} expired offers from Cloud Firestore.`);
    } catch (err) {
      console.error('Purge error:', err);
    } finally {
      setIsPurging(false);
    }
  };

  // Preset badge options
  const badgePresets = ['20% OFF', 'FREE DEMO', 'SPECIAL OFFER', 'ADMISSIONS OPEN', 'LIMITED SEATS', 'SCHOLARSHIP'];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Offers &amp; Marquee Manager
              </h2>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Cloud Firestore Synced • Mobile Marquee
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Create time-sensitive promotional offers that scroll continually in the marquee bar directly beneath the top navbar. When an offer reaches its expiry date, it automatically un-publishes and is purged from the database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="admin-create-offer-btn"
            onClick={() => setIsAddingOffer(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Offer</span>
          </button>

          <button
            type="button"
            onClick={handlePurgeExpired}
            disabled={isPurging}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            title="Purge all expired offers from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isPurging ? 'animate-spin' : ''}`} />
            <span>Clean Expired</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          LIVE MARQUEE TICKER SIMULATION (Shows how it appears under navbar on mobile)
         ========================================================================= */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Home Page Ticker Preview (Directly beneath Top Navbar)</span>
          </span>
          <span className="text-[10px] text-amber-300 font-mono">
            {offers.filter((o) => o.active && !isOfferExpired(o.expiryDate)).length} Active in Marquee
          </span>
        </div>

        {/* The exact preview marquee bar */}
        <div className="rounded-xl overflow-hidden border border-amber-500/25 bg-[#03132B] flex items-center h-10 px-3 shadow-inner">
          <div className="shrink-0 flex items-center pr-3 z-10">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-xs">
              <Flame className="w-3 h-3 fill-slate-950" />
              <span>OFFERS</span>
            </div>
          </div>
          <div className="h-4 w-[1px] bg-amber-500/30 shrink-0 mr-3" />
          <div className="flex-1 overflow-hidden">
            {/* @ts-ignore */}
            <marquee behavior="scroll" direction="left" scrollamount="6" className="text-xs font-medium text-slate-100">
              <span className="inline-flex items-center gap-8">
                {offers.filter((o) => o.active && !isOfferExpired(o.expiryDate)).length === 0 ? (
                  <span className="text-slate-400 italic">No active offers. Click "Create New Offer" to add one!</span>
                ) : (
                  offers
                    .filter((o) => o.active && !isOfferExpired(o.expiryDate))
                    .map((o) => (
                      <span key={o.id} className="inline-flex items-center gap-2 text-white">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
                          {o.badge || 'OFFER'}
                        </span>
                        <span>{o.title}</span>
                        <span className="text-amber-400 text-xs font-bold mx-2">✦</span>
                      </span>
                    ))
                )}
              </span>
            </marquee>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CREATE NEW OFFER MODAL / FORM
         ========================================================================= */}
      {isAddingOffer && (
        <form
          onSubmit={handleCreateOffer}
          className="bg-slate-800 rounded-3xl p-6 border border-amber-500/40 space-y-4 shadow-2xl animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Create Promotional Offer</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingOffer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Offer Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Offer Title / Moving Marquee Text <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Navodaya Entrance 2026 Batch: Get Flat 25% Off for Early Admissions This Week!"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This exact text will continually scroll horizontally in the marquee bar on mobile &amp; desktop.
              </p>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Tag / Offer Badge (e.g. 20% OFF, FREE DEMO) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
                placeholder="e.g. 25% OFF"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {badgePresets.map((bp) => (
                  <button
                    key={bp}
                    type="button"
                    onClick={() => setFormBadge(bp)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 hover:bg-slate-750 text-amber-300 border border-slate-700 cursor-pointer"
                  >
                    {bp}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry Date (Date Picker) */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Expiry Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={formExpiryDate}
                onChange={(e) => setFormExpiryDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[11px] text-amber-300/90 mt-1">
                ⚡ When this date passes, the offer automatically disappears from the home page marquee.
              </p>
            </div>

            {/* Action on Click */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Action When User Clicks on Offer
              </label>
              <select
                value={formActionType}
                onChange={(e) => setFormActionType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="enquiry">Opens "Enquiry / Request Callback" Modal</option>
                <option value="demo">Opens "Book Free Demo" Modal</option>
                <option value="tutors">Navigates to "Find Home Tutors" Page</option>
                <option value="courses">Navigates to "Courses &amp; Exam Prep" Page</option>
                <option value="none">Opens Details Popup</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Offer Description / Terms (Optional)
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional details shown when parents tap the offer..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setIsAddingOffer(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
              <span>Save &amp; Publish to Firestore</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          ALL OFFERS IN CLOUD FIRESTORE TABLE
         ========================================================================= */}
      <div className="bg-slate-800/70 rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-700/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">All Promotional Offers ({offers.length})</h3>
            <p className="text-xs text-slate-400">
              Active offers scroll continually on mobile and desktop. Expired offers are auto-hidden.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3.5 px-4">Offer Tag &amp; Text</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Click Action</th>
                <th className="py-3.5 px-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No offers created yet. Click "Create New Offer" above!
                  </td>
                </tr>
              ) : (
                offers.map((offer) => {
                  const expired = isOfferExpired(offer.expiryDate);

                  return (
                    <tr key={offer.id} className="hover:bg-slate-750/50 transition-colors">
                      {/* Tag & Text */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-tight">
                            {offer.badge || 'OFFER'}
                          </span>
                        </div>
                        <div className="font-bold text-white text-xs leading-snug">
                          {offer.title}
                        </div>
                        {offer.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {offer.description}
                          </p>
                        )}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span className={expired ? 'text-rose-400 line-through' : 'text-white'}>
                            {offer.expiryDate}
                          </span>
                        </div>
                        {expired ? (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase mt-0.5">
                            Expired (Hidden)
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                            Active in Marquee
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(offer)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            offer.active && !expired
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {offer.active && !expired ? '✓ Active' : '✕ Disabled'}
                        </button>
                      </td>

                      {/* Click Action */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-slate-300 font-semibold">
                          {offer.actionType || 'Enquiry'}
                        </span>
                      </td>

                      {/* Manage */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete offer from Cloud Firestore"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
