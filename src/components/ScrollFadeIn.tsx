import React from 'react';
import { motion } from 'motion/react';

interface ScrollFadeInProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  direction?: 'up' | 'none';
  duration?: number;
}

export const ScrollFadeIn: React.FC<ScrollFadeInProps> = ({
  children,
  className = '',
  id,
  delay = 0,
  direction = 'up',
  duration = 0.6,
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: direction === 'up' ? 20 : 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Smooth editorial cubic-bezier
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
