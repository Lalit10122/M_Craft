import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const PageTransition = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 15,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1]
      }
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -10,
      transition: {
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
