import React, { useState } from 'react';
import styles from './PDP.module.css';

const ProductVariants = ({ product }) => {
  // Mock variants for the UI since they aren't fully implemented in the backend yet
  const [selectedColor, setSelectedColor] = useState('Gold');
  const [selectedSize, setSelectedSize] = useState('Free Size');

  const colors = [
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Rose Gold', hex: '#B76E79' }
  ];
  const sizes = ['6', '7', '8', 'Free Size'];

  // Only show variants if it makes sense (e.g., Rings have sizes)
  const isRing = product?.categories?.some(c => c.name?.toLowerCase().includes('ring'));

  return (
    <div className={styles.variantsContainer}>
      <div className={styles.variantGroup}>
        <span className={styles.variantLabel}>Color: <strong>{selectedColor}</strong></span>
        <div className={styles.swatchList}>
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`${styles.colorSwatch} ${selectedColor === color.name ? styles.swatchActive : ''}`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select ${color.name}`}
            />
          ))}
        </div>
      </div>

      {isRing && (
        <div className={styles.variantGroup}>
          <span className={styles.variantLabel}>Ring Size: <strong>{selectedSize}</strong></span>
          <div className={styles.pillList}>
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`${styles.sizePill} ${selectedSize === size ? styles.pillActive : ''}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariants;
