import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { Truck, Package, Clock, RefreshCcw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

const SupplyChainDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics/supply-chain');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch supply chain analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '24px' }}>Loading supply chain data...</div>;
  if (!data) return <div style={{ padding: '24px' }}>Error loading data.</div>;

  const returnReasonsData = data.returnReasons.map((item, index) => ({
    name: item.reason,
    value: item.count
  }));

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Supply Chain & Fulfillment</h1>
      
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Avg Fulfillment Speed" value={data.fulfillmentSpeed} icon={<Truck />} color="#3b82f6" />
        <StatCard title="Inventory Turnover Ratio" value={data.inventoryTurnover} icon={<Package />} color="#10b981" />
        <StatCard title="Avg Supplier Lead Time" value={data.supplierLeadTimes} icon={<Clock />} color="#f59e0b" />
        <StatCard title="Total Return Reasons Logged" value={returnReasonsData.reduce((acc, curr) => acc + curr.value, 0)} icon={<RefreshCcw />} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
          <h3 style={{ marginBottom: '24px' }}>Return Reasons Breakdown</h3>
          <div style={{ height: '350px' }}>
            {returnReasonsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={returnReasonsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    dataKey="value"
                  >
                    {returnReasonsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Returns']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
                No return data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="admin-stat-card">
    <div>
      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 8px 0' }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#111' }}>{value}</h2>
    </div>
    <div style={{ background: `${color}15`, color: color, padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
  </div>
);

export default SupplyChainDashboard;
