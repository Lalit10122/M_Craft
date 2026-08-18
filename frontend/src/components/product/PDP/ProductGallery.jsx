import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import styles from './PDP.module.css';

const ProductGallery = ({ product }) => {
  const images = product?.images || [];
  const [activeImage, setActiveImage] = useState(images[0] || product?.firstImage);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);

  const displayImages = images.length ? images : [product?.firstImage].filter(Boolean);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Handle scroll-based active index for mobile carousel
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || !isMobile) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const width = el.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
      if (displayImages[index]) {
        setActiveImage(displayImages[index]);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [isMobile, displayImages]);

  if (!displayImages.length) return null;

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Mobile: Full-width swipeable carousel
  if (isMobile) {
    return (
      <div className={styles.galleryContainer}>
        <div className={styles.mobileGalleryWrapper}>
          {/* Slide counter */}
          <div className={styles.slideCounter}>
            {activeIndex + 1}/{displayImages.length}
          </div>

          {/* Share button */}
          <button className={styles.shareBtn} onClick={handleShare} aria-label="Share">
            <Share2 size={18} />
          </button>

          {/* Swipeable carousel */}
          <div ref={carouselRef} className={styles.mobileCarousel}>
            {displayImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product?.name} ${idx + 1}`}
                className={styles.carouselImage}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>

          {/* Dot indicators */}
          {displayImages.length > 1 && (
            <div className={styles.dotIndicators}>
              {displayImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`${styles.dot} ${idx === activeIndex ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop: Main image + thumbnails
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
            onClick={() => { setActiveImage(img); setActiveIndex(idx); }}
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
