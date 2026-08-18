import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Search, X } from 'lucide-react';
import api from '../../utils/api';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [addingProducts, setAddingProducts] = useState(false);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/collections/${id}`);
      setCollection(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load collection');
      navigate('/admin/collections');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    setSelectedProductIds([]);
    setSearchQuery('');
    try {
      const res = await api.get('/admin/products');
      setAllProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm('Remove this product from the collection?')) return;
    try {
      await api.delete(`/admin/products/${productId}/collections`, { data: { collectionId: id } });
      fetchCollection();
    } catch (err) {
      console.error(err);
      alert('Failed to remove product');
    }
  };

  const handleAddSelected = async () => {
    if (selectedProductIds.length === 0) return;
    setAddingProducts(true);
    try {
      await api.post(`/admin/collections/${id}/products`, { productIds: selectedProductIds });
      setShowAddModal(false);
      fetchCollection();
    } catch (err) {
      console.error(err);
      alert('Failed to add products');
    } finally {
      setAddingProducts(false);
    }
  };

  if (loading || !collection) return <div>Loading...</div>;

  const currentProductIds = new Set(collection.products?.map(p => p.id) || []);
  
  // Filter products for the modal
  const availableProducts = allProducts.filter(p => !currentProductIds.has(p.id));
  const filteredAvailableProducts = availableProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/admin/collections')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 4px 0' }}>{collection.name}</h1>
            <span style={{ color: '#666', fontSize: '0.9rem', fontFamily: 'monospace' }}>/{collection.slug}</span>
          </div>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Products
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '16px' }}>Products in Collection ({collection.products?.length || 0})</h3>
        
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Stock</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collection.products?.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No products in this collection yet.</td></tr>
              ) : (
                collection.products?.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} style={{ width: 48, height: 48, borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: '6px', background: '#f0f0f0' }}></div>
                      )}
                      <span style={{ fontWeight: 500, color: '#111' }}>{product.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{product.category?.name || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>₹{product.basePrice}</td>
                    <td style={{ padding: '12px 16px' }}>{product.stockQty}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleRemoveProduct(product.id)}
                        style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}
                        title="Remove from collection"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Add Products to {collection.name}</h2>
              <button onClick={() => setShowAddModal(false)} className="iconBtn" style={{ border: 'none', background: 'none' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }} size={20} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #eaeaea', width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={filteredAvailableProducts.length > 0 && selectedProductIds.length === filteredAvailableProducts.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProductIds(filteredAvailableProducts.map(p => p.id));
                          else setSelectedProductIds([]);
                        }}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                      />
                    </th>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #eaeaea', color: '#555', fontWeight: 600 }}>Product</th>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #eaeaea', color: '#555', fontWeight: 600 }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvailableProducts.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No available products found.</td></tr>
                  ) : (
                    filteredAvailableProducts.map(product => (
                      <tr key={product.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedProductIds.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedProductIds([...selectedProductIds, product.id]);
                              else setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                            }}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                          />
                        </td>
                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} style={{ width: 32, height: 32, borderRadius: '4px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#f0f0f0' }}></div>
                          )}
                          <span style={{ fontWeight: 500, color: '#111' }}>{product.name}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{product.category?.name || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Cancel</button>
              <button 
                onClick={handleAddSelected} 
                disabled={addingProducts || selectedProductIds.length === 0} 
                className="btn btn-primary"
              >
                {addingProducts ? 'Adding...' : `Add Selected (${selectedProductIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;
