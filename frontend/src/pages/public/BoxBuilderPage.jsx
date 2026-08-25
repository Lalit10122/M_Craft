import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Check, X } from 'lucide-react';
import api from '../../utils/api';
import useCartStore from '../../store/useCartStore';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';

const BoxBuilderPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState([]); // array of product IDs

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get(`/box-builder/${slug}`);
        setConfig(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [slug]);

  const handleSelect = (product) => {
    if (selections.includes(product.id)) {
      setSelections(prev => prev.filter(id => id !== product.id));
    } else {
      if (selections.length < config.maxProducts) {
        setSelections(prev => [...prev, product.id]);
      }
    }
  };

  const handleAddToCart = () => {
    if (selections.length !== config.maxProducts) return;
    
    // Create a special bundle item
    const bundleItem = {
      id: `box-${config.id}-${Date.now()}`,
      name: config.name,
      basePrice: config.bundlePrice,
      firstImage: config.eligibleProducts[0]?.product?.firstImage,
      isBoxBuilder: true,
      boxBuilderConfigId: config.id,
      boxBuilderSelections: selections, // array of ids
      quantity: 1,
      // Create a description listing the selected products for the cart display
      description: selections.map(id => config.eligibleProducts.find(ep => ep.product.id === id)?.product.name).join(', ')
    };
    
    addItem(bundleItem);
    
    alert('Box added to cart!');
    navigate('/checkout');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading Box Builder...</div>;
  if (!config) return <div style={{ textAlign: 'center', padding: '100px' }}>Box Builder not found.</div>;

  return (
    <div className="container" style={{ paddingBottom: '150px' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', background: 'var(--color-surface)', borderRadius: '16px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>{config.name}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', margin: 0 }}>
          {config.description} • ₹{config.bundlePrice}
        </p>
      </div>

      <RevealGrid className="responsive-grid">
        {config.eligibleProducts.map((ep, index) => {
          const product = ep.product;
          const isSelected = selections.includes(product.id);
          
          return (
            <RevealCard key={product.id} index={index}>
              <div 
                style={{ 
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => handleSelect(product)}
              >
                <img src={product.firstImage} alt={product.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                <div style={{ padding: '15px' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>₹{product.basePrice}</p>
                </div>
                
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      style={{ position: 'absolute', top: 10, right: 10, background: 'var(--color-primary)', color: 'white', borderRadius: '50%', padding: '5px' }}
                    >
                      <Check size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </RevealCard>
          );
        })}
      </RevealGrid>

      {/* Floating Action Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'white',
        borderTop: '1px solid var(--color-border)',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h4 style={{ margin: 0 }}>Your Box</h4>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{selections.length} of {config.maxProducts} selected</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={selections.length !== config.maxProducts}
            style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Package size={18} /> {selections.length === config.maxProducts ? 'Add Box to Cart' : `Select ${config.maxProducts - selections.length} more`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxBuilderPage;
