import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--color-border)',
        ...style
      }}
      animate={
        shouldReduceMotion 
          ? {} 
          : { opacity: [0.4, 0.8, 0.4] }
      }
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export default Skeleton;
