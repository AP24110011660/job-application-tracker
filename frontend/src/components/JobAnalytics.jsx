import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

const COLORS = {
  Applied: '#3b82f6', // blue-500
  Interview: '#f59e0b', // amber-500
  Offer: '#10b981', // emerald-500
  Rejected: '#ef4444' // red-500
};

const JobAnalytics = ({ stats }) => {
  const total = Object.values(stats || {}).reduce((a, b) => a + b, 0);

  if (!stats || total === 0) {
    return (
      <div className="glass-card p-12 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col items-center justify-center text-center space-y-3 fade-in mt-6">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-xs mb-2">
          <PieIcon size={24} className="text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">No analytics yet</h3>
          <p className="text-sm text-slate-500 mt-1">Add your first application to generate data-driven pipeline insights.</p>
        </div>
      </div>
    );
  }

  const data = [
    { name: 'Applied', value: stats.Applied || 0 },
    { name: 'Interview', value: stats.Interview || 0 },
    { name: 'Offer', value: stats.Offer || 0 },
    { name: 'Rejected', value: stats.Rejected || 0 },
  ].filter(item => item.value > 0); // Only show statuses currently active

  const barData = [
    { name: 'Applied', count: stats.Applied || 0 },
    { name: 'Interview', count: stats.Interview || 0 },
    { name: 'Offer', count: stats.Offer || 0 },
    { name: 'Rejected', count: stats.Rejected || 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in mt-6">
      
      {/* Distribution Pie Chart */}
      <div className="glass-card p-6 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <PieIcon size={18} className="text-indigo-500" />
          <h3 className="text-base font-bold text-slate-800">Pipeline Distribution</h3>
        </div>
        <div className="flex-1 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="transparent"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 600, color: '#1e293b' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Activity */}
      <div className="glass-card p-6 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <BarChart3 size={18} className="text-purple-500" />
          <h3 className="text-base font-bold text-slate-800">Activity Overview</h3>
        </div>
        <div className="flex-1 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 6, 6]} maxBarSize={45}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default JobAnalytics;
