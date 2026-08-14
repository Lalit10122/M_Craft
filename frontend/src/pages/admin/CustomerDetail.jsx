import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`);
        setCustomer(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleToggleBlock = async () => {
    // In reality: await axios.put(`/api/admin/users/${id}/block`, { block: !customer.isBlocked })
    setCustomer({ ...customer, isBlocked: !customer.isBlocked });
    setShowBlockModal(false);
  };

  if (loading) return <div>Loading customer details...</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/admin/customers')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Customer Profile</h1>
          {customer.isBlocked && (
            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, background: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldAlert size={14} /> BLOCKED
            </span>
          )}
        </div>
        
        {customer.isBlocked ? (
          <button onClick={handleToggleBlock} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', borderColor: '#059669' }}>
            <ShieldCheck size={16} /> Unblock Customer
          </button>
        ) : (
          <button onClick={() => setShowBlockModal(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', borderColor: '#dc2626' }}>
            <ShieldAlert size={16} /> Block Customer
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Summary */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600 }}>
            {customer.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem' }}>{customer.name}</h2>
            <p style={{ margin: '0 0 4px', color: '#666' }}>{customer.email} | {customer.phone}</p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>Joined {new Date(customer.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Order History */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Order History ({customer.orderCount})</h3>
          
          {customer.orders.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No orders placed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {customer.orders.map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                  <div>
                    <Link to={`/admin/orders/${order.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>{order.id}</Link>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 600 }}>₹{order.total}</p>
                    <span style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626', marginBottom: '16px' }}>
              <ShieldAlert size={28} />
              <h3 style={{ margin: 0 }}>Block Customer</h3>
            </div>
            
            <p style={{ color: '#333', fontSize: '1.05rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to block <strong>{customer.name}</strong>?<br/><br/>
              They will no longer be able to log into their account or place new orders. You can unblock them later.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowBlockModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleToggleBlock} className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                Yes, Block Customer
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

export default CustomerDetail;
