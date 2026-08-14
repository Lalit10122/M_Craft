import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ArrowLeft, CheckCircle, XCircle, Package, RefreshCcw, AlertTriangle } from 'lucide-react';

const ReturnDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchReturn = async () => {
      try {
        const res = await api.get('/admin/returns');
        const found = res.data.data.returns.find(r => r.id === id);
        setReturnReq(found || res.data.data.returns[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReturn();
  }, [id]);

  const handleAction = async (action, payload = {}) => {
    try {
      await api.put(`/admin/returns/${id}/${action}`, payload);
      const newStatus = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : action === 'pickup' ? 'PICKUP_SCHEDULED' : 'REFUND_COMPLETED';
      setReturnReq({ ...returnReq, status: newStatus });
      setShowRefundModal(false);
      setShowRejectModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to perform action');
    }
  };

  if (loading) return <div>Loading return details...</div>;
  if (!returnReq) return <div>Return not found</div>;

  const isCod = returnReq.order.paymentMethod === 'COD';

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/admin/returns')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Return {returnReq.id}</h1>
          <span style={{ 
            padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
            background: returnReq.status === 'COMPLETED' || returnReq.status === 'REFUND_COMPLETED' ? '#dcfce7' : returnReq.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
            color: returnReq.status === 'COMPLETED' || returnReq.status === 'REFUND_COMPLETED' ? '#166534' : returnReq.status === 'REJECTED' ? '#991b1b' : '#92400e'
          }}>
            {returnReq.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Request Info */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Request Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <p style={{ margin: '0 0 4px', color: '#666', fontSize: '0.9rem' }}>Reason</p>
              <p style={{ margin: '0 0 16px', fontWeight: 500 }}>{returnReq.reason}</p>
              
              <p style={{ margin: '0 0 4px', color: '#666', fontSize: '0.9rem' }}>Customer Comment</p>
              <p style={{ margin: 0 }}>{returnReq.comment || 'No additional comments.'}</p>
            </div>
            
            {returnReq.imageUrl && (
              <div>
                <p style={{ margin: '0 0 4px', color: '#666', fontSize: '0.9rem' }}>Customer Photo</p>
                <img src={returnReq.imageUrl} alt="Defect" style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', border: '1px solid #eaeaea' }} />
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>Order Summary</h3>
            <button onClick={() => navigate(`/admin/orders/${returnReq.order.id}`)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              View Full Order
            </button>
          </div>
          <p style={{ margin: '0 0 8px' }}><strong>Order ID:</strong> {returnReq.order.id}</p>
          <p style={{ margin: '0 0 8px' }}><strong>Customer:</strong> {returnReq.order.user.name} ({returnReq.order.user.email})</p>
          <p style={{ margin: '0 0 8px' }}><strong>Payment Method:</strong> {returnReq.order.paymentMethod}</p>
          <p style={{ margin: 0 }}><strong>Total Amount:</strong> ₹{returnReq.order.totalAmount}</p>
        </div>

        {/* Actions */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Actions</h3>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            {returnReq.status === 'REQUESTED' && (
              <>
                <button onClick={() => handleAction('approve')} className="btn btn-primary" style={{ background: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Approve Return
                </button>
                <button onClick={() => setShowRejectModal(true)} className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <XCircle size={18} /> Reject
                </button>
              </>
            )}

            {returnReq.status === 'APPROVED' && (
              <button onClick={() => handleAction('pickup')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} /> Mark as Picked Up
              </button>
            )}

            {returnReq.status === 'PICKUP_SCHEDULED' && (
              <button onClick={() => setShowRefundModal(true)} className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCcw size={18} /> Initiate Refund
              </button>
            )}

            {(returnReq.status === 'COMPLETED' || returnReq.status === 'REFUND_COMPLETED' || returnReq.status === 'REJECTED') && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No further actions available. Request is closed.</p>
            )}
          </div>
        </div>

      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Reject Return Request</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>Please provide a reason for rejecting this return. This will be sent to the customer.</p>
            <textarea 
              rows={4} 
              value={rejectReason} 
              onChange={e => setRejectReason(e.target.value)} 
              placeholder="E.g., Item shows signs of wear, past 7-day window..." 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowRejectModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={() => handleAction('reject', { reason: rejectReason })} className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>Reject Return</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b45309', marginBottom: '16px' }}>
              <AlertTriangle size={28} />
              <h3 style={{ margin: 0 }}>Confirm Refund</h3>
            </div>
            
            {isCod ? (
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '24px' }}>
                <p style={{ margin: 0, color: '#92400e', fontWeight: 500 }}>Manual Refund Required</p>
                <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#92400e' }}>
                  This was a Cash on Delivery order. There is no online payment to reverse. You must manually contact the customer for bank details and initiate an NEFT/UPI transfer for <strong>₹{returnReq.order.totalAmount}</strong>.
                </p>
              </div>
            ) : (
              <p style={{ color: '#333', fontSize: '1.05rem', marginBottom: '24px', lineHeight: 1.5 }}>
                This will instantly refund <strong>₹{returnReq.order.totalAmount}</strong> via Razorpay back to the customer's original payment method.<br/><br/>
                <strong>This action cannot be undone.</strong>
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowRefundModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={() => handleAction('refund')} className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
                {isCod ? 'Mark Refund Completed manually' : 'Yes, Process Razorpay Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  }
};

export default ReturnDetail;
