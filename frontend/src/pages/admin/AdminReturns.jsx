import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { AlertCircle, CheckCircle, Package } from 'lucide-react';

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await api.get('/admin/returns');
      setReturns(res.data.data.returns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (action === 'REFUND_COMPLETED') {
      const confirm = window.confirm("Are you sure you want to process this refund?");
      if (!confirm) return;
      try {
        const amountStr = prompt("Enter refund amount:");
        if (!amountStr) return;
        const refundAmount = parseFloat(amountStr);
        await api.put(`/admin/returns/${id}/refund`, { refundAmount });
        setReturns(returns.map(r => r.id === id ? { ...r, status: 'REFUND_COMPLETED', refundAmount } : r));
        alert('Refund processed successfully');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to process refund');
      }
      return;
    }

    try {
      if (action === 'APPROVED') {
        await api.put(`/admin/returns/${id}/approve`);
      } else if (action === 'REJECTED') {
        await api.put(`/admin/returns/${id}/reject`, { reason: 'Rejected by admin' });
      } else if (action === 'PICKUP_SCHEDULED') {
        await api.put(`/admin/returns/${id}/pickup`);
      }
      setReturns(returns.map(r => r.id === id ? { ...r, status: action } : r));
      alert(`Return status updated to ${action}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update return status');
    }
  };

  if (loading) return <div>Loading returns...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Returns Management</h1>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f4f6f8', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: 'var(--spacing-md)' }}>ID</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Order & Customer</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Reason</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Status</th>
              <th style={{ padding: 'var(--spacing-md)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map(ret => (
              <tr key={ret.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--spacing-md)' }}>{ret.id}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <strong>{ret.order.id}</strong><br/>
                  <small style={{ color: 'var(--color-text-muted)' }}>{ret.order.user.name}</small>
                </td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <strong>{ret.reason}</strong><br/>
                  <small style={{ color: 'var(--color-text-muted)' }}>{ret.comment}</small>
                </td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                    background: ret.status === 'REFUND_COMPLETED' || ret.status === 'COMPLETED' ? '#d4edda' : '#fff3cd',
                    color: ret.status === 'REFUND_COMPLETED' || ret.status === 'COMPLETED' ? '#155724' : '#856404'
                  }}>
                    {ret.status}
                  </span>
                </td>
                <td style={{ padding: 'var(--spacing-md)' }}>
                  {ret.status === 'REQUESTED' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAction(ret.id, 'APPROVED')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}><CheckCircle size={14}/> Approve</button>
                      <button onClick={() => handleAction(ret.id, 'REJECTED')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--color-error)' }}><AlertCircle size={14}/> Reject</button>
                    </div>
                  )}
                  {ret.status === 'APPROVED' && (
                    <button onClick={() => handleAction(ret.id, 'PICKUP_SCHEDULED')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}><Package size={14}/> Mark Picked Up</button>
                  )}
                  {ret.status === 'PICKUP_SCHEDULED' && (
                    <button onClick={() => handleAction(ret.id, 'REFUND_COMPLETED')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'var(--color-success)' }}>Process Refund</button>
                  )}
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr><td colSpan="5" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>No returns found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReturns;
