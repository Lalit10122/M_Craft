import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import RevealCard from './RevealCard';

const RevealGrid = React.forwardRef(({ children, className = '', style = {} }, ref) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={{ once: true, margin: "-50px" }}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { index });
        }
        return child;
      })}
    </motion.div>
  );
});

RevealGrid.displayName = 'RevealGrid';

export default RevealGrid;
