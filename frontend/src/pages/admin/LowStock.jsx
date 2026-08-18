import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { AlertTriangle, Edit2 } from 'lucide-react';

const LowStock = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const res = await api.get('/admin/dashboard/low-stock');
      setLowStockProducts(res.data.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading low stock alerts...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#dc2626' }}>
        <AlertTriangle size={32} />
        <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Low Stock Alerts</h1>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <p style={{ margin: '0 0 24px', color: '#666' }}>
          These products have fallen below your configured low-stock threshold and require immediate restocking.
        </p>

        {lowStockProducts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#059669', background: '#dcfce7', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ margin: '0 0 8px' }}>Inventory Healthy</h3>
            <p style={{ margin: 0 }}>No products are currently low on stock.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Current Stock</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Threshold</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={product.images?.[0] || 'https://via.placeholder.com/48'} alt={product.name} style={{ width: 48, height: 48, borderRadius: '6px', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 500, color: '#111' }}>{product.name}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 700,
                      background: product.stockQty === 0 ? '#fee2e2' : '#fef3c7',
                      color: product.stockQty === 0 ? '#991b1b' : '#92400e'
                    }}>
                      {product.stockQty} {product.stockQty === 0 && '(Out of Stock)'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>5</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link 
                      to={`/admin/products/${product.id}/edit`} 
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                    >
                      <Edit2 size={14} /> Restock
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default LowStock;
