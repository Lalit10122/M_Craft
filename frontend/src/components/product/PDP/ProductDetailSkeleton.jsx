import React from 'react';
import Skeleton from '../../common/Skeleton';

const ProductDetailSkeleton = () => {
  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Breadcrumb Skeleton */}
      <Skeleton width="120px" height="20px" style={{ marginBottom: '32px' }} />

      <div className="mobile-stack" style={{ display: 'flex', gap: 'var(--spacing-xxl)' }}>
        {/* Left Column: Gallery Skeleton */}
        <div style={{ flex: '1 1 50%' }}>
          {/* Main Image Skeleton */}
          <Skeleton width="100%" height="auto" style={{ aspectRatio: '3/4', marginBottom: '16px', borderRadius: '4px' }} />
          {/* Thumbnails Skeleton */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="80px" height="80px" borderRadius="4px" />
            <Skeleton width="80px" height="80px" borderRadius="4px" />
            <Skeleton width="80px" height="80px" borderRadius="4px" />
          </div>
        </div>

        {/* Right Column: Details Skeleton */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Title & Brand */}
          <div>
            <Skeleton width="40%" height="16px" style={{ marginBottom: '8px' }} />
            <Skeleton width="80%" height="40px" style={{ marginBottom: '16px' }} />
            <Skeleton width="60%" height="24px" />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

          {/* Description */}
          <div>
            <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
            <Skeleton width="95%" height="16px" style={{ marginBottom: '8px' }} />
            <Skeleton width="90%" height="16px" />
          </div>

          {/* Variants / Options */}
          <div>
            <Skeleton width="30%" height="16px" style={{ marginBottom: '12px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <Skeleton width="60px" height="40px" borderRadius="4px" />
              <Skeleton width="60px" height="40px" borderRadius="4px" />
              <Skeleton width="60px" height="40px" borderRadius="4px" />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '16px' }}>
            <Skeleton width="100%" height="54px" borderRadius="4px" style={{ marginBottom: '12px' }} />
            <Skeleton width="100%" height="54px" borderRadius="4px" />
          </div>

          {/* Trust Badges / Accordions */}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton width="100%" height="48px" borderRadius="4px" />
            <Skeleton width="100%" height="48px" borderRadius="4px" />
            <Skeleton width="100%" height="48px" borderRadius="4px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
