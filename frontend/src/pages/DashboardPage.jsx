import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase, Plus, Search, LogOut, User, Filter,
  Trash2, Edit2, TrendingUp, Target, Award, XCircle,
  LayoutGrid, List, ChevronDown, RefreshCw, Calendar,
  Building2, FileText, ArrowUpDown, Download
} from 'lucide-react';
import { jobsAPI } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import JobModal from '../components/JobModal';
import KanbanBoard from '../components/KanbanBoard';
import JobAnalytics from '../components/JobAnalytics';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'company', label: 'Company A-Z' },
  { value: 'status', label: 'By Status' },
];

const STAT_CONFIG = [
  {
    key: 'Applied',
    label: 'Applied',
    icon: Target,
    color: 'bg-white',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    border: 'border-slate-200',
    glow: '',
  },
  {
    key: 'Interview',
    label: 'Interviews',
    icon: TrendingUp,
    color: 'bg-white',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    border: 'border-slate-200',
    glow: '',
  },
  {
    key: 'Offer',
    label: 'Offers',
    icon: Award,
    color: 'bg-white',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    border: 'border-slate-200',
    glow: '',
  },
  {
    key: 'Rejected',
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-white',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    border: 'border-slate-200',
    glow: '',
  },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);         // Source of truth — full API data, never mutated
  const [filteredJobs, setFilteredJobs] = useState([]); // Derived display data
  const [stats, setStats] = useState({ Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // URL synced state parameters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sort, setSort] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync Search state with Debounce delay natively protecting APIs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Seamlessly keep URL fully synced with logical UI properties dynamically!
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    
    setSearchParams(params, { replace: true });
  }, [statusFilter, debouncedSearch, setSearchParams]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch ALL jobs — filtering is done client-side to avoid
      // extra API round-trips and ensure instant filter updates
      const { data } = await jobsAPI.getAll({ sort });
      setJobs(data.jobs);
      setStats(data.stats);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleDeleteClick = (job) => {
    setDeletingJob(job);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingJob) return;
    try {
      await jobsAPI.remove(deletingJob._id);
      toast.success('Application deleted');
      setConfirmDelete(false);
      setDeletingJob(null);
      fetchJobs();
    } catch (err) {
      toast.error('Failed to delete application');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingJob(null);
  };

  const handleModalSuccess = () => {
    fetchJobs();
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    // Optimistic UI state update dragging natively
    const previousJobs = [...jobs];
    
    setJobs(jobs.map(job => 
      job._id === jobId ? { ...job, status: newStatus } : job
    ));

    try {
      await jobsAPI.update(jobId, { status: newStatus });
      toast.success('Status updated successfully');
      fetchJobs(); // Keep dashboard top stats in sync seamlessly after a drop
    } catch (err) {
      toast.error('Failed to update status');
      setJobs(previousJobs); // Revert on failure
    }
  };

  // Client-side filtering: derives filteredJobs from jobs whenever
  // the source data, search term, or status filter changes
  useEffect(() => {
    let result = [...jobs]; // Never mutate the original array

    // 1. Filter by status
    if (statusFilter !== 'All') {
      result = result.filter((j) => j.status === statusFilter);
    }

    // 2. Filter by search (case-insensitive match on company OR role)
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (j) =>
          j.company.toLowerCase().includes(term) ||
          j.role.toLowerCase().includes(term)
      );
    }

    setFilteredJobs(result);
  }, [jobs, statusFilter, debouncedSearch]);

  // --- CSV Export ---
  // Exports the currently visible (filtered) jobs as a downloadable .csv file.
  // Pure client-side: builds a data URI and triggers a hidden anchor click.
  const exportCSV = () => {
    if (filteredJobs.length === 0) {
      toast.error('No data to export — adjust your filters first.');
      return;
    }

    const HEADERS = ['Company', 'Role', 'Status', 'Applied Date', 'Notes'];

    // Safely escape a cell value: wrap in quotes and double any internal quotes
    const escapeCell = (val) => {
      const str = val == null ? '' : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredJobs.map((job) => [
      escapeCell(job.company),
      escapeCell(job.role),
      escapeCell(job.status),
      escapeCell(
        new Date(job.appliedDate).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        })
      ),
      escapeCell(job.notes || ''),
    ]);

    const csv = [HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href     = url;
    link.download = `jobflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredJobs.length} application${filteredJobs.length !== 1 ? 's' : ''} to CSV`);
  };

  const totalJobs = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="animated-bg min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                <Briefcase size={18} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-800">JobFlow</span>
                <span className="hidden sm:block text-xs text-slate-500 -mt-1">
                  {totalJobs} application{totalJobs !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* User info + logout */}
            <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
              <div 
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center">
                  <User size={14} className="text-indigo-600" />
                </div>
                <span className="text-sm text-slate-700 font-medium">{user?.name}</span>
                <ChevronDown size={14} className="text-slate-500 ml-1" />
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User size={14} /> Profile
                    </button>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, iconColor, iconBg, border, glow }) => (
            <div
              key={key}
              className={`stat-card glass-card p-5 ${color} border ${border} ${glow} cursor-pointer`}
              onClick={() => setStatusFilter(key)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
                  <Icon size={20} />
                </div>
                <span className="text-3xl font-bold text-slate-800">{stats[key]}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{label}</p>
              {totalJobs > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1.5 rounded-full bg-slate-100 flex-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${iconBg.replace('bg-', 'bg-').replace('50', '500')}`}
                      style={{ width: `${Math.round((stats[key] / totalJobs) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium w-8 text-right">
                    {Math.round((stats[key] / totalJobs) * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data-Driven Analytics Dashboard Injection */}
        <JobAnalytics stats={stats} />

        {/* Controls Bar */}
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Search companies or roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
                id="search-input"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                    statusFilter === s
                      ? 'bg-indigo-600 text-white border-transparent'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {s}
                  {s !== 'All' && stats[s] > 0 && (
                    <span className="ml-1 opacity-70">({stats[s]})</span>
                  )}
                </button>
              ))}

              {/* Native Client Reset Button cleanly mapping inline! */}
              {(search || statusFilter !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter('All'); }}
                  className="px-3 py-1.5 ml-2 rounded-lg text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-all border border-transparent"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field pr-8 py-2 text-xs appearance-none min-w-[130px] font-medium text-slate-600"
                id="sort-select"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-white">
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>

            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 shadow-sm p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 rounded-md ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Table view"
                id="table-view-btn"
              >
                <List size={14} /> Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 rounded-md ${
                  viewMode === 'kanban'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Kanban view"
                id="kanban-view-btn"
              >
                <LayoutGrid size={14} /> Kanban
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchJobs}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm transition-all"
              title="Refresh data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Export CSV */}
            <button
              id="export-csv-btn"
              onClick={exportCSV}
              disabled={filteredJobs.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              title={`Export ${filteredJobs.length} visible job${filteredJobs.length !== 1 ? 's' : ''} to CSV`}
            >
              <Download size={14} /> Export CSV
            </button>

            {/* Add Job */}
            <button
              id="add-job-btn"
              onClick={() => { setEditingJob(null); setShowModal(true); }}
              className="btn-primary whitespace-nowrap"
            >
              <Plus size={16} /> Add Job
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="glass-card p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-14 w-full" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="glass-card p-16 text-center fade-in bg-white border border-slate-200">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="text-indigo-400 opacity-80" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {search || statusFilter !== 'All'
                ? 'No applications match your filters'
                : 'No applications yet'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {search || statusFilter !== 'All'
                ? 'Try adjusting filters or clearing the search'
                : 'Start tracking your job hunt — add your first application!'}
            </p>
            {(search || statusFilter !== 'All') ? (
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                <Plus size={16} /> Add Your First Job
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="glass-card overflow-hidden fade-in bg-white border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} /> Company
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={12} /> Role
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} /> Applied
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <FileText size={12} /> Notes
                      </div>
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredJobs.map((job, idx) => (
                    <tr
                      key={job._id}
                      className="table-row transition-colors"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{job.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(job.appliedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-xs">
                        <span className="truncate block max-w-[200px]">
                          {job.notes || <span className="text-slate-400 italic">No notes</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(job)}
                            className="btn-secondary py-1.5"
                            title="Edit"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(job)}
                            className="btn-danger py-1.5"
                            title="Delete"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-xl">
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredJobs.length} of {jobs.length} application{jobs.length !== 1 ? 's' : ''}
                {(statusFilter !== 'All' || debouncedSearch) ? ' (filtered)' : ''}
              </span>
            </div>
          </div>
        ) : (
          /* KANBAN VIEW NATIVELY DRAGGABLE */
          <KanbanBoard
            jobs={filteredJobs}
            onStatusChange={handleStatusUpdate}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Job Add/Edit Modal */}
      {showModal && (
        <JobModal
          job={editingJob}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content glass-card p-6 w-full max-w-sm text-center shadow-xl border-slate-200">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Application?</h3>
            <p className="text-slate-600 text-sm mb-1">
              <span className="text-slate-900 font-semibold">{deletingJob?.company}</span>
              {' '}–{' '}
              {deletingJob?.role}
            </p>
            <p className="text-slate-500 text-xs mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmDelete(false); setDeletingJob(null); }}
                className="btn-secondary flex-1 py-2 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                id="confirm-delete-btn"
                className="btn-danger flex-1 py-2 justify-center"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
