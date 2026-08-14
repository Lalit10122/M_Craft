import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { DollarSign, TrendingDown, Percent, CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const FinancialDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics/financial');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch financial analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '24px' }}>Loading financial data...</div>;
  if (!data) return <div style={{ padding: '24px' }}>Error loading data.</div>;

  const pieData = [
    { name: 'Net Profit', value: data.netProfit },
    { name: 'COGS', value: data.cogs },
    { name: 'Refunds', value: data.totalRefunds },
    { name: 'Gateway Fees', value: data.gatewayFees },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Financial & Profitability</h1>
      
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Gross Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} icon={<DollarSign />} color="#0369a1" />
        <StatCard title="Net Profit" value={`₹${data.netProfit.toLocaleString()}`} icon={<DollarSign />} color="#10b981" />
        <StatCard title="Avg Order Value" value={`₹${data.aov.toLocaleString(undefined, {maximumFractionDigits: 2})}`} icon={<CreditCard />} color="#8b5cf6" />
        <StatCard title="Refund Losses" value={`₹${data.totalRefunds.toLocaleString()}`} icon={<TrendingDown />} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
          <h3 style={{ marginBottom: '24px' }}>Revenue Breakdown (Simulated)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
          <h3 style={{ marginBottom: '24px' }}>Expense Details</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
              <span style={{ color: '#555', fontWeight: 500 }}>Cost of Goods Sold (30% est)</span>
              <span style={{ fontWeight: 600 }}>₹{data.cogs.toLocaleString()}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
              <span style={{ color: '#555', fontWeight: 500 }}>Payment Gateway Fees (2.9% est)</span>
              <span style={{ fontWeight: 600 }}>₹{data.gatewayFees.toLocaleString()}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
              <span style={{ color: '#555', fontWeight: 500 }}>Refunds Processed</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>₹{data.totalRefunds.toLocaleString()}</span>
            </li>
          </ul>
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

export default FinancialDashboard;
