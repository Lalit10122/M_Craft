import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Download, FileText } from 'lucide-react';
import OrderStatusTimeline from '../../components/customer/OrderStatusTimeline';
import ReturnRequestForm from '../../components/customer/ReturnRequestForm';
import ReturnStatusTracker from '../../components/customer/ReturnStatusTracker';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [orderReturns, setOrderReturns] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const fetchedOrders = res.data.data?.orders || [];
      setOrders(fetchedOrders);
      
      // Fetch return status for delivered orders
      const deliveredOrders = fetchedOrders.filter(o => o.status === 'DELIVERED');
      for (const order of deliveredOrders) {
        try {
          const retRes = await api.get(`/orders/${order.id}/return-request`);
          if (retRes.data.data) {
            setOrderReturns(prev => ({ ...prev, [order.id]: retRes.data.data }));
          }
        } catch (e) {
          // 404 means no return requested yet
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async (orderId, returnData) => {
    try {
      const formData = new FormData();
      formData.append('reason', returnData.reason);
      if (returnData.comment) formData.append('comment', returnData.comment);
      if (returnData.file) formData.append('image', returnData.file);

      const res = await api.post(`/orders/${orderId}/return-request`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setOrderReturns(prev => ({ ...prev, [orderId]: res.data.data }));
        setReturnModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to submit return request', err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.post(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setReturnModalOpen(true);
  };

  if (loading) return <div className="container" style={{ padding: 'var(--spacing-xl) 0' }}>Loading orders...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xxl)', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3>No orders yet</h3>
          <p style={{ color: 'var(--color-text-muted)', margin: 'var(--spacing-md) 0' }}>You haven't placed any orders yet.</p>
          <a href="/shop" className="btn btn-primary">Start Shopping</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          {orders.map(order => {
            const isDelivered = order.status === 'DELIVERED';
            const hasReturn = !!orderReturns[order.id];
            
            return (
              <div key={order.id} className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Order #{order.id}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>₹{order.totalAmount}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid via Online'}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="table-responsive-wrapper" style={{ margin: 'var(--spacing-xl) 0' }}>
                  <OrderStatusTimeline currentStatus={order.status} />
                </div>

                {/* Items */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', background: '#f9f9f9', padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: '8px' }}>
                      <img src={item.product.images[0]} alt={item.product.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.product.name}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity} | ₹{item.priceAtPurchase}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions & Trackers */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                  {order.invoiceUrl && (
                    <a href={order.invoiceUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.9rem' }}>
                      <FileText size={16} /> Download Invoice
                    </a>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginLeft: 'auto' }}>
                    {order.status === 'PENDING' && (
                      <button className="btn btn-outline" onClick={() => handleCancelOrder(order.id)} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                        Cancel Order
                      </button>
                    )}
                    {isDelivered && !hasReturn && (
                      <button className="btn btn-secondary" onClick={() => openReturnModal(order)}>
                        Request Return
                      </button>
                    )}
                  </div>
                </div>

                {/* Return Status Tracker (If applicable) */}
                {hasReturn && (
                  <ReturnStatusTracker returnRequest={orderReturns[order.id].returnRequest || orderReturns[order.id]} />
                )}
              </div>
            );
          })}
        </div>
      )}


      {selectedOrder && (
        <ReturnRequestForm 
          isOpen={returnModalOpen}
          order={selectedOrder}
          onClose={() => setReturnModalOpen(false)}
          onSubmit={handleReturnRequest}
        />
      )}
    </div>
  );
};

export default OrderHistory;
