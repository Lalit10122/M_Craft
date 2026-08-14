import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PDP.module.css';

const ProductGallery = ({ product }) => {
  const images = product?.images || [];
  const [activeImage, setActiveImage] = useState(images[0] || product?.firstImage);

  if (!images.length && !product?.firstImage) return null;

  const displayImages = images.length ? images : [product.firstImage];

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper}>
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImage}
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            src={activeImage} 
            alt={product?.name} 
            className={styles.mainImage}
            loading="lazy"
          />
        </AnimatePresence>
      </div>
      
      <div className={`no-scrollbar ${styles.thumbnailList}`}>
        {displayImages.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveImage(img)}
            className={`${styles.thumbnailBtn} ${activeImage === img ? styles.activeThumbnail : ''}`}
          >
            <img src={img} alt={`Thumb ${idx}`} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
