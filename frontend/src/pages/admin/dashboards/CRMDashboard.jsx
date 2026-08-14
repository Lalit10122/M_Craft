import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { Users, Heart, Star, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899'];

const CRMDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics/crm');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch CRM analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '24px' }}>Loading CRM data...</div>;
  if (!data) return <div style={{ padding: '24px' }}>Error loading data.</div>;

  const customerRatioData = [
    { name: 'New Customers (1 Order)', value: data.customerRatio.new },
    { name: 'Returning Customers (>1 Order)', value: data.customerRatio.returning }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Customer Insights (CRM)</h1>
      
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Total New Customers" value={data.customerRatio.new} icon={<Users />} color="#8b5cf6" />
        <StatCard title="Total Returning" value={data.customerRatio.returning} icon={<Heart />} color="#ec4899" />
        <StatCard title="Customer Lifetime Value" value={`₹${data.clv.toLocaleString(undefined, {maximumFractionDigits: 2})}`} icon={<Star />} color="#10b981" />
        <StatCard title="Avg Review Rating" value={`${data.reviewSentiment.averageRating.toFixed(1)} / 5.0`} icon={<Star />} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Customer Retention Chart */}
        <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
          <h3 style={{ marginBottom: '24px' }}>Customer Retention</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerRatioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Customers']} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Spenders / VIPs */}
        <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Top Spenders (VIPs)</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.topSpenders.map((spender, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontWeight: 600 }}>
                  {spender.user?.name ? spender.user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{spender.user?.name || 'Deleted User'}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{spender.user?.email || 'N/A'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#10b981' }}>₹{spender.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {data.topSpenders.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>No spenders yet.</p>}
          </div>

          {/* Pending Reviews Alert */}
          {data.reviewSentiment.pendingCount > 0 && (
            <div style={{ marginTop: '24px', padding: '16px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock color="#d97706" size={20} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#92400e' }}>Reviews waiting for moderation</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309' }}>You have {data.reviewSentiment.pendingCount} pending reviews.</p>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', border: '1px solid #eaeaea' }}>
    <div>
      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 8px 0' }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#111' }}>{value}</h2>
    </div>
    <div style={{ background: `${color}15`, color: color, padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
  </div>
);

export default CRMDashboard;
