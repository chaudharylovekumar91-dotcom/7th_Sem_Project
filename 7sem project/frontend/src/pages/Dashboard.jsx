import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Loader2, Activity, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Soft purple/blue gradients matching Tailwind aesthetic
  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#f43f5e'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/analytics/1`); // hardcoded user_id 1
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-indigo-400">
        <Loader2 size={48} className="animate-spin" />
        <p className="text-lg font-medium">Crunching your emotional data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-400 text-lg">No analytics data available. Detect your mood to generate data!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Mood Analytics Dashboard</h2>
        <p className="text-slate-400">Insights into your emotional journey and music preferences.</p>
      </div>

      {/* Line Chart: Mood History */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Mood Positivity Over Time</h3>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Happy (+1) • Neutral (0) • Sad/Angry (-1)</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.mood_history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[-1.5, 1.5]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Line
                type="monotone"
                dataKey="positivity"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart: Frequent Emotions */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
              <PieChartIcon size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Emotional Profile</h3>
          </div>
          <div className="h-[300px] w-full flex justify-center">
            {analytics.frequent_emotions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.frequent_emotions}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {analytics.frequent_emotions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No data to display</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Feedback Stats */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Song Interactions</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.feedback_stats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                  {
                    analytics.feedback_stats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === 'Likes' ? '#10b981' : entry.name === 'Skips' ? '#f43f5e' : '#3b82f6'}
                      />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
