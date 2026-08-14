import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ArrowLeft, Download, RefreshCcw, Truck, FileText } from 'lucide-react';
import OrderStatusTimeline from '../../components/customer/OrderStatusTimeline';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/admin/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div>Loading order details...</div>;
  if (!order) return <div>Order not found</div>;

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Order {order.id}</h1>
          <span style={{ 
            padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
            background: order.paymentMethod === 'COD' ? '#f3e8ff' : '#e0e7ff',
            color: order.paymentMethod === 'COD' ? '#7e22ce' : '#4338ca'
          }}>
            {order.paymentMethod}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} /> Regenerate Invoice
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Download Invoice
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Timeline */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Order Status</h3>
              <select 
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="PACKED">PACKED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>
            <OrderStatusTimeline status={order.status} />
          </div>

          {/* Items */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    📦
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{item.product?.name || 'Product'}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    ₹{item.priceAtPurchase * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ borderTop: '1px solid #eaeaea', marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>₹{order.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                <span style={{ color: '#666' }}>Shipping</span>
                <span>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', fontWeight: 600, fontSize: '1.1rem', marginTop: '8px' }}>
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Customer & Shipping */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Customer</h3>
            <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{order.user.name}</p>
            <p style={{ margin: '0 0 16px', color: '#666', fontSize: '0.9rem' }}>{order.user.email}</p>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', borderTop: '1px solid #eaeaea', paddingTop: '16px' }}>Shipping Address</h3>
            <p style={{ margin: 0, color: '#444', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Jane Doe<br/>
              123 Main St, Apt 4B<br/>
              Mumbai, Maharashtra<br/>
              400001<br/>
              Phone: 9876543210
            </p>
          </div>

          {/* Payment Info */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Payment Info</h3>
            <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}><strong>Method:</strong> {order.paymentMethod}</p>
            {order.paymentMethod === 'RAZORPAY' && (
              <>
                <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontFamily: 'monospace' }}><strong>ID:</strong> pay_29dn39dk2n</p>
              </>
            )}
            <p style={{ margin: '0', fontSize: '0.9rem' }}>
              <strong>Status:</strong> <span style={{ color: order.status !== 'PENDING' ? '#166534' : '#b45309' }}>{order.status === 'PENDING' ? 'Unpaid' : 'Paid'}</span>
            </p>
          </div>

          {/* Optional Return Summary Card */}
          <div style={{ background: '#fffbeb', padding: '24px', borderRadius: '12px', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', marginBottom: '12px' }}>
              <RefreshCcw size={18} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Return Requested</h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#92400e' }}>Customer has initiated a return for this order.</p>
            <button onClick={() => navigate('/admin/returns')} style={{ width: '100%', padding: '8px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '4px', color: '#92400e', fontWeight: 600, cursor: 'pointer' }}>
              View Return Request
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
