import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const LowStockPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await api.get('/admin/dashboard/low-stock');
        setProducts(res.data.data.products);
        setThreshold(res.data.data.threshold);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
        <AlertTriangle size={32} color="var(--color-warning)" />
        <h1 style={{ margin: 0 }}>Low Stock Alerts</h1>
      </div>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xl)' }}>
        Showing products with stock quantity at or below the threshold of <strong>{threshold}</strong>.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {products.map(product => (
          <div key={product.id} className="glass-panel" style={{ padding: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-md)' }}>
            <img src={product.firstImage} alt={product.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{product.name}</h4>
              <div style={{ display: 'inline-block', background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
                Only {product.stockQty} left in stock
              </div>
              <br/>
              <Link to={`/admin/products/${product.id}/edit`} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                Restock Item
              </Link>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-xxl)', background: 'white', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
            <h3 style={{ color: 'var(--color-success)' }}>Stock levels are healthy</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>No products are currently below the threshold.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockPage;
