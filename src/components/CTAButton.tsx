'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CTAButtonProps {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'data-cta'?: string;
}

export function CTAButton({ 
  variant = 'primary', 
  children, 
  className = '',
  onClick,
  disabled,
  type = 'button',
  'data-cta': dataCta
}: CTAButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default action: navigate to sign-in page
      router.push('/auth/signin');
    }
  };
  const baseClasses = "inline-flex items-center justify-center rounded-md px-6 py-3.5 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue/20";
  
  const variants = {
    primary: "premium-button text-white shadow-luxury",
    ghost: "luxury-ghost-button text-ink"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ 
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      type={type}
      data-cta={dataCta}
    >
      <motion.span
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}