import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, AlertTriangle, RefreshCcw, Calendar } from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, stockRes] = await Promise.all([
          api.get(`/admin/dashboard/stats?range=${range}`),
          api.get('/admin/dashboard/low-stock')
        ]);
        setStats(statsRes.data.data);
        setLowStock(stockRes.data.data.products.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [range]);

  const totalSales = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const pendingReturns = stats?.pendingReturns ?? 0;
  const lowStockCount = stats?.lowStockProducts ?? 0;
  
  const revenueChartData = stats?.revenueChartData ?? [];
  const categoryChartData = stats?.categoryChartData ?? [];
  const topProductsChartData = stats?.topProductsChartData ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Dashboard Overview</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <Calendar size={18} color="#666" />
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: '0.95rem', fontWeight: 500, outline: 'none', cursor: 'pointer' }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="ytd">Year to Date</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Total Sales" value={`₹${totalSales.toLocaleString()}`} icon={<TrendingUp />} color="#0369a1" loading={loading} />
        <StatCard title="Total Orders" value={totalOrders} icon={<ShoppingBag />} color="#059669" loading={loading} />
        <StatCard title="Pending Returns" value={pendingReturns} icon={<RefreshCcw />} color="#d97706" loading={loading} />
        <StatCard title="Low Stock Items" value={lowStockCount} icon={<AlertTriangle />} color="#dc2626" loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Revenue Chart */}
        <div className="glass-panel" style={{ padding: '24px', background: 'white', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '24px' }}>Revenue Over Time</h3>
          <div style={{ height: '300px', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} tickFormatter={val => `₹${val/1000}k`} />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{r: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
          <h3 style={{ marginBottom: '24px' }}>Top Selling Products</h3>
          <div style={{ height: '250px', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {topProductsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                  <XAxis type="number" tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: '#555'}} axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    formatter={(value) => [value, 'Units Sold']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>No data for this period</div>
            )}
          </div>
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
          <h3 style={{ marginBottom: '24px' }}>Sales by Category</h3>
          <div style={{ height: '250px', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>No data for this period</div>
            )}
          </div>
        </div>

        {/* Low Stock Preview */}
        <div className="glass-panel" style={{ padding: '24px', background: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Low Stock Preview</h3>
            <Link to="/admin/low-stock" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>View All</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {lowStock.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={item.firstImage} alt={item.name} style={{ width: 40, height: 40, borderRadius: '4px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>Only {item.stockQty} left</p>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: '32px' }}>Inventory levels are healthy.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, loading }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', border: '1px solid #eaeaea', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
    <div>
      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 8px 0' }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#111' }}>{loading ? '...' : value}</h2>
    </div>
    <div style={{ background: `${color}15`, color: color, padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
