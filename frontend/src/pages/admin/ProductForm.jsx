import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    material: '',
    color: '',
    basePrice: '',
    mrp: '',
    stockQty: '',
    isActive: true,
    isBestSeller: false,
    attributes: {}
  });

  const [categoryAttributes, setCategoryAttributes] = useState([]);

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    // Fetch categories and collections
    Promise.all([
      api.get('/categories'),
      api.get('/collections')
    ]).then(([catRes, colRes]) => {
      setCategories(catRes.data.data || []);
      setAllCollections(colRes.data.data || []);
    }).catch(console.error);

    if (isEditMode) {
      // Fetch product data
      api.get(`/admin/products/${id}`)
        .then(res => {
          const p = res.data.data;
          setFormData({
            name: p.name,
            slug: p.slug,
            description: p.description || '',
            basePrice: p.basePrice || '',
            mrp: p.mrp || '',
            stockQty: p.stockQty || '',
            isActive: p.isActive,
            isBestSeller: p.isBestSeller,
            attributes: p.attributes || {}
          });
          // Assuming variants are passed in response if they exist
          if (p.variants) setVariants(p.variants);
          if (p.images) setImages(p.images);
          if (p.collections) setSelectedCollectionIds(p.collections.map(c => c.collectionId));
          if (p.categories) setSelectedCategoryIds(p.categories.map(c => c.id));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load product');
          navigate('/admin/products');
        });
    }
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    if (selectedCategoryIds.length > 0) {
      api.get(`/admin/category-attributes?categoryId=${selectedCategoryIds[0]}`)
        .then(res => setCategoryAttributes(res.data.data || []))
        .catch(console.error);
    } else {
      setCategoryAttributes([]);
    }
  }, [selectedCategoryIds]);

  // Live computed discount
  const basePriceNum = parseFloat(formData.basePrice) || 0;
  const mrpNum = parseFloat(formData.mrp) || 0;
  const discountPercent = mrpNum > basePriceNum ? Math.round(((mrpNum - basePriceNum) / mrpNum) * 100) : 0;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + pendingFiles.length + files.length > 5) {
      alert('You can only upload a maximum of 5 images per product.');
      return;
    }

    if (!isEditMode) {
      setPendingFiles([...pendingFiles, ...files]);
      e.target.value = null;
      return;
    }

    setUploadingImages(true);
    const uploadData = new FormData();
    files.forEach(file => uploadData.append('images', file));

    try {
      const res = await api.post(`/admin/products/${id}/images`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages(res.data.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      e.target.value = null; // reset input
    }
  };

  const handleDeleteImage = async (imageUrl, index) => {
    if (!isEditMode) {
      setPendingFiles(pendingFiles.filter((_, i) => i !== index));
      return;
    }

    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(`/admin/products/${id}/images`, { data: { imageUrl } });
      setImages(images.filter(img => img !== imageUrl));
    } catch (err) {
      console.error(err);
      alert('Failed to delete image');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        mrp: parseFloat(formData.mrp) || parseFloat(formData.basePrice),
        stockQty: parseInt(formData.stockQty) || 0,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        variants,
        collectionIds: selectedCollectionIds,
        categoryIds: selectedCategoryIds
      };

      let newProductId = null;
      if (isEditMode) {
        await api.put(`/admin/products/${id}`, payload);
        alert('Product updated successfully!');
      } else {
        const res = await api.post('/admin/products', payload);
        newProductId = res.data.data.id;
      }

      if (!isEditMode && pendingFiles.length > 0 && newProductId) {
        setUploadingImages(true);
        const uploadData = new FormData();
        pendingFiles.forEach(file => uploadData.append('images', file));
        try {
          await api.post(`/admin/products/${newProductId}/images`, uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (imgErr) {
          console.error(imgErr);
          alert('Product created, but some images failed to upload.');
        } finally {
          setUploadingImages(false);
        }
      }

      if (!isEditMode) {
        alert('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const addVariant = () => {
    setVariants([...variants, { label: '', priceModifier: 0, stock: 0, isDefault: variants.length === 0 }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/admin/products')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Basic Info */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>Basic Info</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.label}>Product Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input} required />
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.label}>Description</label>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={styles.input} />
            </div>

            <div>
              <label style={styles.label}>Categories</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px', borderRadius: '8px' }}>
                {categories.length === 0 ? (
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>No categories found</span>
                ) : categories.map(cat => (
                  <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                        } else {
                          setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cat.id));
                        }
                      }}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label style={styles.label}>Collections</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px', borderRadius: '8px' }}>
                {allCollections.length === 0 ? (
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>No collections found</span>
                ) : allCollections.map(col => (
                  <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedCollectionIds.includes(col.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCollectionIds([...selectedCollectionIds, col.id]);
                        } else {
                          setSelectedCollectionIds(selectedCollectionIds.filter(id => id !== col.id));
                        }
                      }}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                    />
                    {col.name}
                  </label>
                ))}
              </div>
            </div>
            
            {categoryAttributes.map(attr => (
              <div key={attr.id}>
                <label style={styles.label}>{attr.name} {attr.isRequired && '*'}</label>
                {attr.type === 'SELECT' || attr.type === 'MULTISELECT' ? (
                  <select 
                    style={styles.input} 
                    value={formData.attributes[attr.name] || ''} 
                    onChange={e => setFormData({
                      ...formData, 
                      attributes: { ...formData.attributes, [attr.name]: e.target.value }
                    })}
                    required={attr.isRequired}
                  >
                    <option value="">Select {attr.name}</option>
                    {attr.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : attr.type === 'BOOLEAN' ? (
                  <div style={{ display: 'flex', alignItems: 'center', height: '42px', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={!!formData.attributes[attr.name]} 
                      onChange={e => setFormData({
                        ...formData, 
                        attributes: { ...formData.attributes, [attr.name]: e.target.checked }
                      })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '0.9rem' }}>Yes</span>
                  </div>
                ) : (
                  <input 
                    type={attr.type === 'NUMBER' ? 'number' : 'text'} 
                    value={formData.attributes[attr.name] || ''} 
                    onChange={e => setFormData({
                      ...formData, 
                      attributes: { ...formData.attributes, [attr.name]: e.target.value }
                    })} 
                    style={styles.input} 
                    required={attr.isRequired}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing & Stock */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>Pricing & Inventory</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={styles.label}>Selling Price (Base) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }}>₹</span>
                <input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} style={{...styles.input, paddingLeft: '28px'}} required />
              </div>
            </div>
            
            <div>
              <label style={styles.label}>MRP (Compare at Price)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }}>₹</span>
                <input type="number" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} style={{...styles.input, paddingLeft: '28px'}} />
              </div>
            </div>

            <div>
              {discountPercent > 0 && (
                <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '6px', fontWeight: 600, textAlign: 'center', border: '1px solid #bbf7d0' }}>
                  Preview: {discountPercent}% OFF
                </div>
              )}
            </div>

            <div>
              <label style={styles.label}>Current Stock Quantity *</label>
              <input type="number" value={formData.stockQty} onChange={e => setFormData({...formData, stockQty: e.target.value})} style={styles.input} required />
            </div>
          </div>
        </section>

        {/* Images */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>Images ({isEditMode ? images.length : pendingFiles.length}/5)</h3>
            {!isEditMode && <span style={{ fontSize: '0.85rem', color: '#888' }}>* Images will be uploaded when you save</span>}
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {[...Array(5)].map((_, idx) => {
                const currentImages = isEditMode ? images : pendingFiles;
                let imgUrl = null;
                
                if (currentImages[idx]) {
                  imgUrl = isEditMode ? currentImages[idx] : URL.createObjectURL(currentImages[idx]);
                }

                const isCardSlot = idx < 2;
                
                return (
                  <div key={idx} style={{ 
                    aspectRatio: '3/4', 
                    background: '#f1f1f1', 
                    borderRadius: '8px', 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: imgUrl ? 'none' : '2px dashed #ccc',
                    overflow: 'hidden'
                  }}>
                    {imgUrl ? (
                      <>
                        <img src={imgUrl} alt={`Product view ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={() => handleDeleteImage(isEditMode ? imgUrl : null, idx)}
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', color: '#dc2626', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                          title="Delete Image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '12px', color: '#888' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                          {isCardSlot ? `Card ${idx === 0 ? 'Primary' : 'Hover'}` : `Extra ${idx - 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {(isEditMode ? images.length : pendingFiles.length) < 5 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f9f9f9', padding: '16px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                <UploadCloud size={24} color="#666" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>Upload more images</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>You can select up to {5 - (isEditMode ? images.length : pendingFiles.length)} more files (JPG/PNG).</p>
                </div>
                <label style={{ ...styles.button, background: 'white', color: '#333', border: '1px solid #ccc', padding: '8px 16px', display: 'inline-block', cursor: 'pointer', marginTop: 0 }}>
                  {uploadingImages ? 'Uploading...' : 'Select Files'}
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImages} />
                </label>
              </div>
            )}
          </div>
        </section>

        {/* Variants */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>Variants (Optional)</h3>
            <button type="button" onClick={addVariant} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              <Plus size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p style={{ color: '#888', fontSize: '0.9rem' }}>No variants added. This product has only one size/color.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {variants.map((variant, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <input type="text" placeholder="e.g. Size 7, Rose Gold" value={variant.label} onChange={(e) => { const v = [...variants]; v[idx].label = e.target.value; setVariants(v); }} style={{ ...styles.input, flex: 2 }} />
                  <input type="number" placeholder="+₹ Modifier" value={variant.priceModifier} onChange={(e) => { const v = [...variants]; v[idx].priceModifier = e.target.value; setVariants(v); }} style={{ ...styles.input, flex: 1 }} />
                  <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => { const v = [...variants]; v[idx].stock = e.target.value; setVariants(v); }} style={{ ...styles.input, flex: 1 }} />
                  <button type="button" onClick={() => removeVariant(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', position: 'sticky', bottom: '24px', background: 'rgba(255,255,255,0.9)', padding: '16px', borderRadius: '8px', border: '1px solid #eaeaea', backdropFilter: 'blur(8px)' }}>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Product</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '0.95rem',
    background: '#fff'
  }
};

export default ProductForm;
