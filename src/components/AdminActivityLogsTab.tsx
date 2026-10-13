import React from 'react';
import {
  History,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Home,
  BookOpen,
  Filter,
  Search,
  Plus,
  Download,
  RefreshCw,
  Receipt,
  UserCheck,
  CheckCircle2,
  Clock,
  User,
  Phone,
  AlertCircle,
  ExternalLink,
  Ban,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AdminActivityLog, ActivityCategory } from '../types';

interface AdminActivityLogsTabProps {
  activityLogs: AdminActivityLog[];
  isLoading: boolean;
  onRefresh: () => void;
  onRecordPaymentClick: () => void;
  onExport: () => void;
  onSelectLogForDetail: (log: AdminActivityLog) => void;
  tutorApprovalsCount: number;
  demoBookingsHandledCount: number;
  homeTutorPaymentsTotal: number;
  homeTutorPaymentsCount: number;
  coursePaymentsTotal: number;
  coursePaymentsCount: number;
  totalAuditedRevenue: number;
  totalAuditActionsCount: number;
  activityCategoryFilter: ActivityCategory;
  setActivityCategoryFilter: (c: ActivityCategory) => void;
  activityAdminFilter: string;
  setActivityAdminFilter: (a: string) => void;
  activityTimeFilter: 'all' | 'today' | 'week' | 'month';
  setActivityTimeFilter: (t: 'all' | 'today' | 'week' | 'month') => void;
  activitySearch: string;
  setActivitySearch: (s: string) => void;
  filteredActivityLogs: AdminActivityLog[];
  uniqueAdmins: string[];
}

export const AdminActivityLogsTab: React.FC<AdminActivityLogsTabProps> = ({
  activityLogs,
  isLoading,
  onRefresh,
  onRecordPaymentClick,
  onExport,
  onSelectLogForDetail,
  tutorApprovalsCount,
  demoBookingsHandledCount,
  homeTutorPaymentsTotal,
  homeTutorPaymentsCount,
  coursePaymentsTotal,
  coursePaymentsCount,
  totalAuditedRevenue,
  totalAuditActionsCount,
  activityCategoryFilter,
  setActivityCategoryFilter,
  activityAdminFilter,
  setActivityAdminFilter,
  activityTimeFilter,
  setActivityTimeFilter,
  activitySearch,
  setActivitySearch,
  filteredActivityLogs,
  uniqueAdmins
}) => {
  // Format relative time
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Administrative Activity Logs &amp; Audit Trail
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Real-time audit log tracking actions taken by administrators, such as verifying &amp; approving tutors,
            handling offline demo bookings, and reconciling received payments from{' '}
            <strong className="text-emerald-400">Way 1 (Home Tutors)</strong> and{' '}
            <strong className="text-amber-400">Way 2 (Course Programs)</strong>.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onExport}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onRecordPaymentClick}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment / Audit Action</span>
          </button>
        </div>
      </div>

      {/* Audit Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Actions */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Audited</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalAuditActionsCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Admin actions logged</div>
          </div>
        </div>

        {/* Tutor Approvals */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tutors Verified</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{tutorApprovalsCount}</div>
            <div className="text-[11px] text-emerald-400/90 font-medium mt-0.5">Academic marksheets audited</div>
          </div>
        </div>

        {/* Demo Bookings Handled */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Demo Handled</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{demoBookingsHandledCount}</div>
            <div className="text-[11px] text-purple-400/90 font-medium mt-0.5">Trials scheduled &amp; contacted</div>
          </div>
        </div>

        {/* WAY 1: Home Tutor Payments */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-800/90 to-slate-800/90 rounded-2xl p-4 border border-emerald-500/30 flex flex-col justify-between shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Way 1: Home Tutors</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              ₹{homeTutorPaymentsTotal.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-0.5">
              {homeTutorPaymentsCount} tuition fee receipts
            </div>
          </div>
        </div>

        {/* WAY 2: Course Payments */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-800/90 to-slate-800/90 rounded-2xl p-4 border border-amber-500/30 flex flex-col justify-between shadow-lg shadow-amber-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Way 2: Courses</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              ₹{coursePaymentsTotal.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-0.5">
              {coursePaymentsCount} course enrollments
            </div>
          </div>
        </div>

        {/* Total Audited Collections */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Total Audited Rev</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">
              ₹{totalAuditedRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-cyan-400/90 font-medium mt-0.5">Combined collections</div>
          </div>
        </div>
      </div>

      {/* TWO-WAY AUDIT CLARITY BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-emerald-500/30 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Home className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Payment Channel 1: Home Tutors
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ₹{homeTutorPaymentsTotal.toLocaleString('en-IN')} Audited
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monthly tuition fees collected from parents for assigned home tutors in Rayagada (Class 1-12 CBSE, ICSE, BSE Odisha).
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-2xl border border-amber-500/30 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Payment Channel 2: Course Programs
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ₹{coursePaymentsTotal.toLocaleString('en-IN')} Audited
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admissions &amp; coaching batch enrollment payments for Navodaya JNVST 6th, Secondary Foundation, Science Olympiads &amp; Board exam boosters.
            </p>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH BAR */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActivityCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap ${
              activityCategoryFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Activities ({activityLogs.length})
          </button>

          <button
            type="button"
            onClick={() => setActivityCategoryFilter('payment_home_tutors')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activityCategoryFilter === 'payment_home_tutors'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-emerald-400'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Way 1: Home Tutor Payments ({homeTutorPaymentsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivityCategoryFilter('payment_courses')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activityCategoryFilter === 'payment_courses'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-amber-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Way 2: Course Payments ({coursePaymentsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivityCategoryFilter('tutors')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activityCategoryFilter === 'tutors'
                ? 'bg-blue-500 text-slate-950 font-black shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-blue-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tutor Approvals ({tutorApprovalsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivityCategoryFilter('demo_bookings')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activityCategoryFilter === 'demo_bookings'
                ? 'bg-purple-500 text-slate-950 font-black shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-purple-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Demo Bookings ({demoBookingsHandledCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivityCategoryFilter('bookings')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activityCategoryFilter === 'bookings'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-teal-400'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Bookings Handled ({activityLogs.filter(l => l.category === 'bookings' || l.actionType.startsWith('booking_')).length})</span>
          </button>
        </div>

        {/* Dropdowns & Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student, tutor, course, admin, transaction ID or receipt..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {activitySearch && (
              <button
                type="button"
                onClick={() => setActivitySearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Admin Filter */}
          <div className="sm:col-span-3">
            <select
              value={activityAdminFilter}
              onChange={(e) => setActivityAdminFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="all">All Administrators</option>
              {uniqueAdmins.map((admin) => (
                <option key={admin} value={admin}>
                  {admin}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="sm:col-span-3">
            <select
              value={activityTimeFilter}
              onChange={(e) => setActivityTimeFilter(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="all">All Time History</option>
              <option value="today">Today's Actions</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVITY LOGS LIST / TABLE */}
      {filteredActivityLogs.length === 0 ? (
        <div className="bg-slate-800/40 rounded-3xl p-12 text-center border border-slate-700/60 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No activity logs found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No audit records match your selected filter criteria. Try clearing the search or category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setActivityCategoryFilter('all');
              setActivityAdminFilter('all');
              setActivityTimeFilter('all');
              setActivitySearch('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivityLogs.map((log) => {
            const isWay1 =
              log.category === 'payment_home_tutors' || log.actionType === 'payment_home_tutor';
            const isWay2 =
              log.category === 'payment_courses' || log.actionType === 'payment_course';
            const isTutorApproval =
              log.actionType === 'tutor_approved' || log.category === 'tutors';
            const isDemo =
              log.category === 'demo_bookings' || log.actionType.includes('demo');
            const isBooking =
              log.category === 'bookings' || log.actionType.startsWith('booking_');

            return (
              <div
                key={log.id}
                className={`bg-slate-800/80 rounded-2xl p-4 sm:p-5 border transition-all hover:bg-slate-800 hover:shadow-xl ${
                  isWay1
                    ? 'border-emerald-500/40 hover:border-emerald-500/80'
                    : isWay2
                    ? 'border-amber-500/40 hover:border-amber-500/80'
                    : isTutorApproval
                    ? 'border-blue-500/40 hover:border-blue-500/80'
                    : isDemo
                    ? 'border-purple-500/40 hover:border-purple-500/80'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Icon + Admin identity + Action Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Action Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isWay1
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isWay2
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : isTutorApproval
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : isDemo
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      }`}
                    >
                      {isWay1 ? (
                        <Home className="w-5 h-5" />
                      ) : isWay2 ? (
                        <BookOpen className="w-5 h-5" />
                      ) : isTutorApproval ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : isDemo ? (
                        <Calendar className="w-5 h-5" />
                      ) : (
                        <UserCheck className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Top Pill Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Channel Badge */}
                        {isWay1 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Way 1: Home Tutor Payment
                          </span>
                        )}
                        {isWay2 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Way 2: Course Payment
                          </span>
                        )}
                        {isTutorApproval && !isWay1 && !isWay2 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            Tutor Approval &amp; Verification
                          </span>
                        )}
                        {isDemo && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Demo Booking Handled
                          </span>
                        )}
                        {isBooking && !isWay1 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                            Booking Assignment
                          </span>
                        )}

                        {/* Admin Badge */}
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          <span>{log.adminName}</span>
                        </span>

                        <span className="text-[11px] text-slate-500">•</span>

                        {/* Relative Timestamp */}
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{getRelativeTime(log.timestamp)}</span>
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4 className="font-bold text-white text-sm sm:text-base leading-snug">
                        {log.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                        {log.description}
                      </p>

                      {/* Associated Details Badges */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        {log.studentName && (
                          <div className="flex items-center gap-1 font-semibold text-slate-200">
                            <User className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Student: {log.studentName}</span>
                          </div>
                        )}

                        {log.tutorName && (
                          <div className="flex items-center gap-1 font-semibold text-emerald-300">
                            <Home className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tutor: {log.tutorName}</span>
                          </div>
                        )}

                        {log.courseTitle && (
                          <div className="flex items-center gap-1 font-semibold text-amber-300">
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>Course: {log.courseTitle}</span>
                          </div>
                        )}

                        {log.parentPhone && (
                          <div className="flex items-center gap-1 font-mono text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{log.parentPhone}</span>
                          </div>
                        )}
                      </div>

                      {/* Audit Note */}
                      {log.notes && (
                        <div className="text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80 inline-block mt-1 italic">
                          Audit Memo: "{log.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Financial Figures + Voucher Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-700/60 shrink-0">
                    {typeof log.amount === 'number' && log.amount > 0 ? (
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Reconciled Amount
                        </span>
                        <span className="text-lg sm:text-xl font-black text-emerald-400 font-sans">
                          ₹{log.amount.toLocaleString('en-IN')}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {log.paymentMethod || 'UPI'} • {log.receiptNo || log.transactionId?.slice(-8)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-left sm:text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-cyan-300 border border-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>Audit Verified</span>
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectLogForDetail(log)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    >
                      <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View Voucher</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
