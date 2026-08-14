import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Orders</h1>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }} />
            <input type="text" placeholder="Search by Order ID or Customer" style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
          <select style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: 'white' }}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
          </select>
          <select style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: 'white' }}>
            <option value="">All Payment Methods</option>
            <option value="COD">COD</option>
            <option value="RAZORPAY">Razorpay</option>
          </select>
        </div>

        {/* Data Grid */}
        <div className="table-responsive-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
            <tr>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Total</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Payment</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center' }}>Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No orders found.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{order.id}</td>
                  <td style={{ padding: '12px 16px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{order.user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{order.user.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{order.totalAmount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                      background: order.paymentMethod === 'COD' ? '#f3e8ff' : '#e0e7ff',
                      color: order.paymentMethod === 'COD' ? '#7e22ce' : '#4338ca'
                    }}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select 
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #ccc', cursor: 'pointer',
                        background: order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'SHIPPED' ? '#fef9c3' : '#f3f4f6',
                        color: order.status === 'DELIVERED' ? '#166534' : order.status === 'SHIPPED' ? '#854d0e' : '#374151'
                      }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link to={`/admin/orders/${order.id}`} style={{ padding: '6px 12px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#333', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
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

export default Orders;
