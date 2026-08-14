import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  'PENDING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

const formatStep = (step) => {
  if (step === 'PENDING') return 'Order Placed';
  return step.replace(/_/g, ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
};

const OrderStatusTimeline = ({ currentStatus }) => {
  const statusToMatch = currentStatus === 'PAID' ? 'PENDING' : currentStatus;
  const currentIndex = steps.indexOf(statusToMatch);
  
  // If status is cancelled or refunded, we handle it separately
  if (['CANCELLED', 'REFUNDED'].includes(currentStatus)) {
    return (
      <div style={{ padding: 'var(--spacing-md)', background: '#ffeeee', borderRadius: '4px', color: 'var(--color-error)' }}>
        Order {formatStep(currentStatus)}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step} style={styles.stepWrapper}>
            <div style={{ ...styles.circle, ...(isCompleted ? styles.circleCompleted : {}), ...(isCurrent ? styles.circleCurrent : {}) }}>
              {isCompleted ? <Check size={14} color="white" /> : <div style={styles.innerDot} />}
            </div>
            
            <div style={{ ...styles.label, ...(isCompleted ? styles.labelCompleted : {}) }}>
              {formatStep(step)}
            </div>
            
            {index < steps.length - 1 && (
              <div style={{ ...styles.line, ...(index < currentIndex ? styles.lineCompleted : {}) }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 'var(--spacing-md) 0',
    position: 'relative'
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  circle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid var(--color-border)',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginBottom: '8px'
  },
  circleCompleted: {
    background: 'var(--color-success)',
    borderColor: 'var(--color-success)'
  },
  circleCurrent: {
    borderColor: 'var(--color-primary)'
  },
  innerDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'transparent' // could fill for current
  },
  line: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    width: '100%',
    height: '2px',
    background: 'var(--color-border)',
    zIndex: 1
  },
  lineCompleted: {
    background: 'var(--color-success)'
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    fontWeight: 500,
  },
  labelCompleted: {
    color: 'var(--color-text-main)'
  }
};

export default OrderStatusTimeline;
