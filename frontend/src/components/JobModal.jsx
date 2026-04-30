import { useState } from 'react';
import { X, Briefcase, Building2, Calendar, FileText, ChevronDown } from 'lucide-react';
import { jobsAPI } from '../api/axiosConfig';
import toast from 'react-hot-toast';

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

const JobModal = ({ job, onClose, onSuccess }) => {
  const isEditing = Boolean(job?._id);

  const [formData, setFormData] = useState({
    company: job?.company || '',
    role: job?.role || '',
    status: job?.status || 'Applied',
    appliedDate: job?.appliedDate
      ? new Date(job.appliedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: job?.notes || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.role.trim()) newErrors.role = 'Job role is required';
    if (!formData.appliedDate) newErrors.appliedDate = 'Applied date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await jobsAPI.update(job._id, formData);
        toast.success('Job updated successfully! ✨');
      } else {
        await jobsAPI.create(formData);
        toast.success('Job added successfully! 🎯');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-card w-full max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Briefcase size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Application' : 'Add New Application'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Update your job details' : 'Track a new opportunity'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Building2 size={14} className="inline mr-1.5 text-indigo-500" />
              Company Name
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Google, Microsoft..."
              className={`input-field ${errors.company ? 'input-error' : ''}`}
            />
            {errors.company && (
              <p className="text-red-500 text-xs mt-1">{errors.company}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Briefcase size={14} className="inline mr-1.5 text-purple-500" />
              Job Role / Position
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Software Engineer, Product Manager..."
              className={`input-field ${errors.role ? 'input-error' : ''}`}
            />
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>

          {/* Status & Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field appearance-none pr-8 font-medium text-slate-700"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-white">
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Calendar size={14} className="inline mr-1.5 text-cyan-500" />
                Applied Date
              </label>
              <input
                type="date"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleChange}
                className={`input-field ${errors.appliedDate ? 'input-error' : ''}`}
              />
              {errors.appliedDate && (
                <p className="text-red-500 text-xs mt-1">{errors.appliedDate}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <FileText size={14} className="inline mr-1.5 text-emerald-500" />
              Notes{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes, interview details, or follow-up actions..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-2 justify-center"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                isEditing ? '✓ Save Changes' : '+ Add Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
