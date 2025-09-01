'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brand } from './Brand';
import { CTAButton } from './CTAButton';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'nav-blur shadow-luxury' 
          : 'bg-white border-b border-line'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Brand />
          </motion.div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { name: 'Features', href: '/#features' },
              { name: 'Pricing', href: '/pricing' },
              { name: 'Dashboard', href: '/dashboard' },
              { name: 'Emails', href: '/emails' }
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.1 + (index * 0.1),
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <Link 
                  href={item.href}
                  className="text-slate hover:text-ink transition-all duration-200 relative group"
                >
                  {item.name}
                  <motion.span
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue group-hover:w-full transition-all duration-300"
                    whileHover={{ width: '100%' }}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link 
              href="/auth/signin" 
              className="text-slate hover:text-ink transition-all duration-200 hidden sm:block relative group"
            >
              Sign in
              <motion.span
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate group-hover:w-full transition-all duration-300"
                whileHover={{ width: '100%' }}
              />
            </Link>
            <CTAButton data-cta="header-get-started">
              Get Started
            </CTAButton>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}