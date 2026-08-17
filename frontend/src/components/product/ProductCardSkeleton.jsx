import React from 'react';
import Skeleton from '../common/Skeleton';

const ProductCardSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Image Skeleton */}
      <div style={{ aspectRatio: '3/4', width: '100%', borderRadius: '4px', overflow: 'hidden' }}>
        <Skeleton width="100%" height="100%" />
      </div>
      
      {/* Content Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="80%" height="20px" />
        <Skeleton width="40%" height="24px" />
        <Skeleton width="60%" height="16px" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
