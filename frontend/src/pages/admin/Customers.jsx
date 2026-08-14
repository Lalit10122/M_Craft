import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { Search, Eye, ShieldAlert } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/users');
      setCustomers(res.data.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Customers</h1>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search by name or email" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #ccc', borderRadius: '6px' }} 
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="table-responsive-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
            <tr>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Customer Name</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Joined</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Orders</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center' }}>Loading customers...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No customers found.</td></tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #eaeaea', opacity: customer.isBlocked ? 0.6 : 1 }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {customer.isBlocked && <ShieldAlert size={16} color="#dc2626" />}
                    {customer.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{customer.email}</td>
                  <td style={{ padding: '12px 16px' }}>{new Date(customer.joinedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>{customer.orderCount} orders</td>
                  <td style={{ padding: '12px 16px' }}>
                    {customer.isBlocked ? (
                      <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>BLOCKED</span>
                    ) : (
                      <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: '#dcfce7', color: '#166534' }}>ACTIVE</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link to={`/admin/customers/${customer.id}`} style={{ padding: '6px 12px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#333', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
