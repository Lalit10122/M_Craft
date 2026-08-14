import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

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

  const filteredReturns = statusFilter ? returns.filter(r => r.status === statusFilter) : returns;

  const handleAction = async (id, action) => {
    if (action === 'REFUND_COMPLETED') {
      const confirm = window.confirm("Are you sure you want to process this refund?");
      if (!confirm) return;
      try {
        const amountStr = prompt("Enter refund amount:");
        if (!amountStr) return;
        const refundAmount = parseFloat(amountStr);
        await api.put(`/admin/returns/${id}/refund`, { refundAmount });
        setReturns(returns.map(r => r.id === id ? { ...r, status: 'REFUND_COMPLETED' } : r));
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
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        await api.put(`/admin/returns/${id}/reject`, { reason });
      } else if (action === 'PICKUP_SCHEDULED') {
        await api.put(`/admin/returns/${id}/pickup`);
      }
      setReturns(returns.map(r => r.id === id ? { ...r, status: action } : r));
      alert(`Return status updated to ${action}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update return status');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Returns & Refunds</h1>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: 'white' }}
          >
            <option value="">All Statuses</option>
            <option value="REQUESTED">REQUESTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PICKUP_SCHEDULED">PICKUP SCHEDULED</option>
            <option value="REFUND_COMPLETED">REFUND COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Data Grid */}
        <div className="table-responsive-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
            <tr>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Return ID</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Requested Date</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center' }}>Loading return requests...</td></tr>
            ) : filteredReturns.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No return requests found.</td></tr>
            ) : (
              filteredReturns.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{req.id}</td>
                  <td style={{ padding: '12px 16px' }}>{req.order.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{req.order.user.name}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
                      background: req.status === 'COMPLETED' || req.status === 'REFUND_COMPLETED' ? '#dcfce7' : req.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                      color: req.status === 'COMPLETED' || req.status === 'REFUND_COMPLETED' ? '#166534' : req.status === 'REJECTED' ? '#991b1b' : '#92400e'
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {req.status === 'REQUESTED' && (
                        <>
                          <button onClick={() => handleAction(req.id, 'APPROVED')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', border: '1px solid #059669', color: '#059669' }}>Approve</button>
                          <button onClick={() => handleAction(req.id, 'REJECTED')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', border: '1px solid #dc2626', color: '#dc2626' }}>Reject</button>
                        </>
                      )}
                      {req.status === 'APPROVED' && (
                        <button onClick={() => handleAction(req.id, 'PICKUP_SCHEDULED')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', border: '1px solid #2563eb', color: '#2563eb' }}>Mark Picked Up</button>
                      )}
                      {req.status === 'PICKUP_SCHEDULED' && (
                        <button onClick={() => handleAction(req.id, 'REFUND_COMPLETED')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#059669', borderColor: '#059669' }}>Refund</button>
                      )}
                      <Link to={`/admin/returns/${req.id}`} style={{ padding: '6px 12px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#333', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Eye size={14} /> View
                      </Link>
                    </div>
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

export default Returns;
