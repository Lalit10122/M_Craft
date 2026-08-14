import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';

const FaqItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', padding: '20px 0' }}>
      <button 
        style={{ 
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
          fontSize: '1.1rem', fontWeight: 600, color: isOpen ? 'var(--color-primary)' : 'var(--color-text)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {faq.question}
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/pages/faq');
        setFaqs(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const categories = ['ALL', ...new Set(faqs.map(f => f.category).filter(Boolean))];
  
  const filteredFaqs = activeCategory === 'ALL' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem' }}>Frequently Asked Questions</h1>
      <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '40px' }}>
        Find answers to common questions about our jewelry, shipping, returns, and more.
      </p>

      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveCategory(cat)}
              style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : filteredFaqs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No FAQs found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredFaqs.map(faq => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FaqPage;
