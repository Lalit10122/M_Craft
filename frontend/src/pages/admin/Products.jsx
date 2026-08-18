import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Use standard api (no /admin prefix for read unless defined, but the public endpoint returns all if no filter)
      const res = await api.get('/products');
      setProducts(res.data.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/products/${id}`, { isActive: !currentStatus });
      setProducts(products.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (err) {
      alert('Failed to update product status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="admin-header-row">
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        
        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
          </div>
          <select style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: 'white' }}>
            <option value="">All Categories</option>
            <option value="necklaces">Necklaces</option>
            <option value="earrings">Earrings</option>
          </select>
        </div>

        {/* Data Grid */}
        <div className="table-responsive-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
            <tr>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Product</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Price</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Stock</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Active</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center' }}>Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No products found.</td></tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={product.firstImage} alt={product.name} style={{ width: 48, height: 48, borderRadius: '6px', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 500, color: '#111' }}>{product.name}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{product.category?.name || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <strong>₹{product.basePrice}</strong>
                    {product.mrp > product.basePrice && <span style={{ marginLeft: '8px', color: '#888', textDecoration: 'line-through', fontSize: '0.85rem' }}>₹{product.mrp}</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
                      background: product.stockQty <= 5 ? '#fee2e2' : '#e0f2fe',
                      color: product.stockQty <= 5 ? '#dc2626' : '#0369a1'
                    }}>
                      {product.stockQty} in stock
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={product.isActive} 
                        onChange={() => handleToggleActive(product.id, product.isActive)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} 
                      />
                    </label>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        style={{ padding: '6px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#555' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}
                      >
                        <Trash2 size={16} />
                      </button>
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

export default Products;
