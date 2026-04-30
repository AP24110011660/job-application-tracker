import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../api/axiosConfig';
import { 
  ArrowLeft, Camera, Edit2, Target, TrendingUp, Award, XCircle, User, Mail, ShieldCheck, X
} from 'lucide-react';

const STAT_CONFIG = [
  { key: 'Applied', label: 'Applied', icon: Target, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  { key: 'Interview', label: 'Interviews', icon: TrendingUp, iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  { key: 'Offer', label: 'Offers', icon: Award, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
  { key: 'Rejected', label: 'Rejected', icon: XCircle, iconColor: 'text-red-500', iconBg: 'bg-red-50' },
];

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Local state to mock updates without hitting the backend
  const [localUser, setLocalUser] = useState({
    name: user?.name || 'User Name',
    email: user?.email || 'email@example.com'
  });
  
  const [avatar, setAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: localUser.name, email: localUser.email });

  const [stats, setStats] = useState({ Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch actual dashboard stats to populate the profile metrics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await jobsAPI.getAll({});
        if (data?.stats) setStats(data.stats);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setLocalUser(editForm);
    setIsEditing(false);
  };

  return (
    <div className="animated-bg min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100 p-8 sm:p-10">
          
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
            
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-indigo-300">
                    {localUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white cursor-pointer group-hover:scale-105"
                title="Upload Photo"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{localUser.name}</h1>
                <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-green-100/80 text-green-700 text-xs font-semibold w-max mx-auto sm:mx-0 border border-green-200/50 shadow-sm">
                  <ShieldCheck size={14} /> Active
                </span>
              </div>
              
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 font-medium">
                <Mail size={16} className="text-slate-400" />
                <span>{localUser.email}</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-8" />

          {/* Activity Stats Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" /> Application Activity
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STAT_CONFIG.map(({ key, label, icon: Icon, iconColor, iconBg }) => (
                <div key={key} className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all flex flex-col items-center justify-center text-center group cursor-default">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-800">
                    {loadingStats ? '-' : stats[key]}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{label}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Edit Profile Modal (Overlay) */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Edit2 size={16} className="text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
              </div>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({ name: localUser.name, email: localUser.email }); // reset
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <User size={14} className="inline mr-1.5 text-indigo-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Mail size={14} className="inline mr-1.5 text-indigo-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: localUser.name, email: localUser.email });
                  }}
                  className="btn-secondary flex-1 justify-center py-2.5 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center py-2.5 rounded-xl font-medium shadow-md shadow-indigo-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
