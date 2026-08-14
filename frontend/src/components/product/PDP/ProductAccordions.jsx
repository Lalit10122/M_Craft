import React, { useState } from 'react';
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
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isOpen && (
        <div className={styles.accordionContent}>
          {content}
        </div>
      )}
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
