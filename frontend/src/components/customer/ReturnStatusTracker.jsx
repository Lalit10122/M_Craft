import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

const steps = [
  'REQUESTED',
  'APPROVED',
  'PICKED_UP',
  'REFUND_COMPLETED'
];

const formatStep = (step) => step.replace(/_/g, ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));

const ReturnStatusTracker = ({ returnRequest }) => {
  if (!returnRequest) return null;

  const { status, adminComment } = returnRequest;

  if (status === 'REJECTED') {
    return (
      <div style={styles.rejectedContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
          <AlertCircle size={20} />
          <strong style={{ fontSize: '1rem' }}>Return Request Rejected</strong>
        </div>
        <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
          <strong>Reason: </strong> {adminComment || 'No reason provided.'}
        </p>
      </div>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <div style={styles.trackerContainer}>
      <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Return Status</h4>
      <div style={styles.timeline}>
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step} style={styles.stepWrapper}>
              <div style={{ ...styles.circle, ...(isCompleted ? styles.circleCompleted : {}), ...(isCurrent ? styles.circleCurrent : {}) }}>
                {isCompleted ? <Check size={12} color="white" /> : <div style={styles.innerDot} />}
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
    </div>
  );
};

const styles = {
  trackerContainer: {
    padding: 'var(--spacing-lg)',
    background: '#f9f9fa',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    marginTop: 'var(--spacing-lg)'
  },
  rejectedContainer: {
    padding: 'var(--spacing-lg)',
    background: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '8px',
    marginTop: 'var(--spacing-lg)'
  },
  timeline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
    width: '20px',
    height: '20px',
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
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)'
  },
  circleCurrent: {
    borderColor: 'var(--color-secondary)'
  },
  innerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'transparent'
  },
  line: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    width: '100%',
    height: '2px',
    background: 'var(--color-border)',
    zIndex: 1
  },
  lineCompleted: {
    background: 'var(--color-primary)'
  },
  label: {
    fontSize: '0.7rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    fontWeight: 500,
  },
  labelCompleted: {
    color: 'var(--color-text-main)'
  }
};

export default ReturnStatusTracker;
