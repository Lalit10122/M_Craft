import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ReviewsModeration = () => {
  const [reviews, setReviews] = useState([
    { id: 'rev_1', product: 'Aurelia Signature Necklace', rating: 5, comment: 'Absolutely stunning! The packaging was great too.', customer: 'Jane D.', date: '2024-03-01T12:00:00Z', status: 'PENDING' },
    { id: 'rev_2', product: 'Y2K Butterfly Pendant', rating: 1, comment: 'Broken on arrival.', customer: 'Mike T.', date: '2024-03-02T14:30:00Z', status: 'PENDING' }
  ]);

  const handleAction = (id, action) => {
    setReviews(reviews.filter(r => r.id !== id));
    // In reality: await axios.put(`/api/admin/reviews/${id}/approve`, { status: action })
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', margin: '0 0 24px 0' }}>Reviews Moderation</h1>

      {reviews.length === 0 ? (
        <div style={{ background: 'white', padding: '48px', borderRadius: '12px', border: '1px solid #eaeaea', textAlign: 'center', color: '#666' }}>
          <CheckCircle size={48} color="#059669" style={{ marginBottom: '16px' }} />
          <h3>All caught up!</h3>
          <p>There are no pending reviews to moderate.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {reviews.map(review => (
            <div key={review.id} className="mobile-stack" style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0 }}>{review.product}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div style={{ color: '#d97706', marginBottom: '8px', fontSize: '1.2rem', letterSpacing: '2px' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p style={{ margin: '0 0 8px', fontStyle: 'italic', color: '#444' }}>"{review.comment}"</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>- {review.customer}</p>
              </div>
              <div className="mobile-stack" style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => handleAction(review.id, 'APPROVED')} className="btn btn-primary" style={{ background: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
                  <CheckCircle size={16} /> Approve
                </button>
                <button onClick={() => handleAction(review.id, 'REJECTED')} className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsModeration;
