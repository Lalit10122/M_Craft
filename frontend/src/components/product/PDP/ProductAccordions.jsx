import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './PDP.module.css';

const AccordionItem = ({ title, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.accordionItem}>
      <button 
        className={styles.accordionHeader} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={20} />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.accordionContent}>
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductAccordions = ({ product }) => {
  return (
    <div className={styles.accordionsContainer}>
      <AccordionItem 
        title="Description" 
        content={<p>{product?.description || 'This beautiful piece is crafted with care, designed to be the perfect addition to your collection.'}</p>}
        defaultOpen={true}
      />
      
      <AccordionItem 
        title="Materials & Care" 
        content={
          <ul className={styles.bulletList}>
            <li>Premium quality materials</li>
            <li>Hypoallergenic and skin-friendly</li>
            <li>Keep away from water, perfume, and harsh chemicals</li>
            <li>Store in a cool, dry place when not in use</li>
          </ul>
        }
      />

      <AccordionItem 
        title="Shipping & Returns" 
        content={
          <ul className={styles.bulletList}>
            <li>Free shipping on all prepaid orders</li>
            <li>Delivery within 3-5 business days</li>
            <li>7-day easy returns & exchanges</li>
          </ul>
        }
      />
    </div>
  );
};

export default ProductAccordions;
