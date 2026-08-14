import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { Megaphone, ShoppingCart, Tag, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketingDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics/marketing');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch marketing analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '24px' }}>Loading marketing data...</div>;
  if (!data) return <div style={{ padding: '24px' }}>Error loading data.</div>;

  const trafficData = Object.keys(data.trafficSources).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    visitors: data.trafficSources[key]
  }));

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Marketing & Conversion</h1>
      
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Cart Abandonment Rate" value={`${data.cartAbandonmentRate}%`} icon={<ShoppingCart />} color="#f59e0b" />
        <StatCard title="Customer Acquisition Cost (CAC)" value={`₹${data.customerAcquisitionCost}`} icon={<Users />} color="#10b981" />
        <StatCard title="Promo Codes Used" value={data.promoCodePerformance.usageCount} icon={<Tag />} color="#8b5cf6" />
        <StatCard title="Promo Revenue" value={`₹${data.promoCodePerformance.revenue.toLocaleString()}`} icon={<Megaphone />} color="#0369a1" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
          <h3 style={{ marginBottom: '24px' }}>Traffic Sources (Simulated %)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip cursor={{ fill: '#f8f9fa' }} formatter={(val) => `${val}%`} />
                <Bar dataKey="visitors" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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

export default MarketingDashboard;
