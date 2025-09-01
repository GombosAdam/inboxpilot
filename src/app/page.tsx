'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Zap, FolderTree, Shield } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { FeatureCard } from '@/components/FeatureCard';
import { StepDiagram } from '@/components/StepDiagram';
import { StatBadge } from '@/components/StatBadge';
import { ScreenshotFrame } from '@/components/ScreenshotFrame';
import { TestimonialCard } from '@/components/TestimonialCard';
import { PricingCard } from '@/components/PricingCard';
import { HERO_TITLE, HERO_SUB, CTA_PRIMARY, FEATURES, HOW, SECURITY, TESTIMONIALS, PRICING, STATS } from '@/lib/copy';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <Section className="pt-20 pb-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.16, 1, 0.3, 1],
              staggerChildren: 0.1
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="mb-6 gradient-text">{HERO_TITLE}</h1>
            </motion.div>
            
            <motion.p 
              className="text-xl text-slate mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {HERO_SUB}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <CTAButton data-cta="hero-get-started">
                {CTA_PRIMARY}
              </CTAButton>
              <CTAButton 
                variant="ghost"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                <motion.span 
                  className="flex items-center gap-2"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  See it in action
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.span>
              </CTAButton>
            </motion.div>

            <motion.div 
              className="flex items-center gap-6 text-sm text-slate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { icon: 'Google OAuth', color: 'success' },
                { icon: 'Secure Gmail access', color: 'blue' },
                { icon: 'Nothing stored', color: 'slate' }
              ].map((item, index) => (
                <motion.div 
                  key={item.icon}
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className={`w-2 h-2 bg-${item.color} rounded-full mr-3`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  ></motion.div>
                  <span>{item.icon}</span>
                  {index < 2 && <span className="ml-6 text-line">•</span>}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <motion.div 
              className="luxury-card rounded-xl p-3 ml-auto max-w-lg relative floating"
              whileHover={{ 
                scale: 1.02,
                rotateY: 5,
                rotateX: 5 
              }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg aspect-[4/3] relative overflow-hidden p-6">
                {/* Dashboard Visualization */}
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  {/* Grid lines */}
                  <defs>
                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background grid */}
                  {[...Array(10)].map((_, i) => (
                    <line key={`h-${i}`} x1="30" y1={30 + i * 24} x2="370" y2={30 + i * 24} stroke="#E5E7EB" strokeWidth="0.5" />
                  ))}
                  {[...Array(12)].map((_, i) => (
                    <line key={`v-${i}`} x1={30 + i * 32} y1="30" x2={30 + i * 32} y2="270" stroke="#E5E7EB" strokeWidth="0.5" />
                  ))}
                  
                  {/* Bar chart */}
                  <motion.rect x="60" y="180" width="30" height="90" fill="url(#barGradient)" rx="4"
                    initial={{ height: 0, y: 270 }}
                    animate={{ height: 90, y: 180 }}
                    transition={{ duration: 0.8, delay: 1 }} />
                  <motion.rect x="110" y="120" width="30" height="150" fill="url(#barGradient)" rx="4"
                    initial={{ height: 0, y: 270 }}
                    animate={{ height: 150, y: 120 }}
                    transition={{ duration: 0.8, delay: 1.1 }} />
                  <motion.rect x="160" y="150" width="30" height="120" fill="url(#barGradient)" rx="4"
                    initial={{ height: 0, y: 270 }}
                    animate={{ height: 120, y: 150 }}
                    transition={{ duration: 0.8, delay: 1.2 }} />
                  <motion.rect x="210" y="100" width="30" height="170" fill="url(#barGradient)" rx="4"
                    initial={{ height: 0, y: 270 }}
                    animate={{ height: 170, y: 100 }}
                    transition={{ duration: 0.8, delay: 1.3 }} />
                  
                  {/* Line chart overlay */}
                  <motion.polyline
                    points="60,200 110,140 160,160 210,110 260,130 310,90"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1.5 }}
                  />
                  
                  {/* Data points */}
                  {[[60,200], [110,140], [160,160], [210,110], [260,130], [310,90]].map(([x, y], i) => (
                    <motion.circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#10B981"
                      stroke="white"
                      strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.7 + i * 0.1 }}
                    />
                  ))}
                  
                  {/* Stats cards */}
                  <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}>
                    <rect x="260" y="180" width="100" height="40" fill="white" rx="6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                    <text x="275" y="198" fontSize="11" fill="#64748B">Processed</text>
                    <text x="275" y="212" fontSize="16" fontWeight="bold" fill="#1E293B">12,458</text>
                  </motion.g>
                  
                  <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }}>
                    <rect x="260" y="230" width="100" height="40" fill="white" rx="6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                    <text x="275" y="248" fontSize="11" fill="#64748B">Time Saved</text>
                    <text x="275" y="262" fontSize="16" fontWeight="bold" fill="#1E293B">48.5 hrs</text>
                  </motion.g>
                </svg>
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-blue rounded-full flex items-center justify-center text-white text-sm"
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                ✨
              </motion.div>
            </motion.div>
            
            {/* Background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue/20 to-purple/20 rounded-xl blur-3xl -z-10"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </Section>

      {/* Features Section */}
      <Section id="features" className="bg-white relative">
        <div className="text-center mb-16">
          <h2 className="mb-4">How InboxPilot Works</h2>
          <p className="text-xl text-slate max-w-2xl mx-auto">
            Our AI understands your email patterns and helps you stay organized without changing how you work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="luxury-card p-8 rounded-xl text-center group cursor-pointer hover:shadow-luxury transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue/10 to-blue/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue/20 group-hover:to-blue/30 transition-colors duration-300">
                {index === 0 && <FileText className="h-8 w-8 text-blue" />}
                {index === 1 && <Zap className="h-8 w-8 text-blue" />}
                {index === 2 && <FolderTree className="h-8 w-8 text-blue" />}
              </div>
              
              <h3 className="text-xl font-semibold text-ink mb-4 group-hover:text-blue transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-slate leading-relaxed">
                {feature.body}
              </p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-20">
          <StepDiagram steps={HOW} />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {STATS.map((stat, index) => (
            <div
              key={index}
              className="hover:scale-105 transition-transform duration-300"
            >
              <StatBadge stat={stat} />
            </div>
          ))}
        </div>
      </Section>

      {/* Screenshots Section */}
      <Section className="bg-mist relative">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Email Dashboard Visual */}
          <div className="luxury-card p-3 group cursor-pointer hover:shadow-luxury transition-all duration-300">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg aspect-[4/3] relative overflow-hidden p-6">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                <defs>
                  <linearGradient id="emailGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* Email list items */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.g key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}>
                    <rect x="20" y={20 + i * 70} width="360" height="60" fill="white" rx="8" 
                      filter="drop-shadow(0 1px 3px rgba(0,0,0,0.1))" />
                    
                    {/* Priority indicator */}
                    <circle cx="45" cy={50 + i * 70} r="8" fill={i === 0 ? '#EF4444' : i === 1 ? '#F59E0B' : '#10B981'} opacity="0.8" />
                    
                    {/* Email preview lines */}
                    <rect x="70" y={35 + i * 70} width="120" height="8" fill="#1E293B" rx="4" opacity="0.8" />
                    <rect x="70" y={50 + i * 70} width="200" height="6" fill="#64748B" rx="3" opacity="0.4" />
                    
                    {/* Category badge */}
                    <rect x="290" y={40 + i * 70} width="70" height="20" fill="url(#emailGrad1)" rx="10" />
                    <text x="325" y={53 + i * 70} fontSize="10" fill="#6366F1" textAnchor="middle">
                      {i === 0 ? 'Urgent' : i === 1 ? 'Meeting' : i === 2 ? 'Review' : 'Info'}
                    </text>
                  </motion.g>
                ))}
                
                {/* Stats overlay */}
                <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}>
                  <rect x="250" y="15" width="130" height="35" fill="white" rx="8" 
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
                  <text x="265" y="30" fontSize="10" fill="#64748B">Today's Summary</text>
                  <text x="265" y="44" fontSize="14" fontWeight="bold" fill="#1E293B">24 processed</text>
                  <circle cx="355" cy="33" r="12" fill="#10B981" opacity="0.2" />
                  <text x="355" y="37" fontSize="10" fill="#10B981" textAnchor="middle">✓</text>
                </motion.g>
              </svg>
            </div>
            <p className="text-sm text-slate text-center mt-4 group-hover:text-ink transition-colors duration-300">
              Smart dashboard with AI-processed emails
            </p>
          </div>
          
          {/* Email Detail Visual */}
          <div className="luxury-card p-3 group cursor-pointer hover:shadow-luxury transition-all duration-300">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg aspect-[4/3] relative overflow-hidden p-6">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                <defs>
                  <linearGradient id="detailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                
                {/* Email header */}
                <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <rect x="20" y="20" width="360" height="50" fill="url(#detailGrad)" rx="8" />
                  <circle cx="45" cy="45" r="12" fill="#6366F1" opacity="0.8" />
                  <text x="45" y="49" fontSize="12" fill="white" textAnchor="middle">JD</text>
                  <text x="70" y="40" fontSize="12" fontWeight="bold" fill="#1E293B">John Doe</text>
                  <text x="70" y="55" fontSize="10" fill="#64748B">Project Update - Q4 Review</text>
                </motion.g>
                
                {/* AI Summary Card */}
                <motion.g initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
                  <rect x="20" y="85" width="360" height="80" fill="white" rx="8" 
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="35" y="105" fontSize="11" fontWeight="bold" fill="#6366F1">AI Summary</text>
                  <rect x="35" y="115" width="330" height="4" fill="#E5E7EB" rx="2" />
                  <rect x="35" y="125" width="280" height="4" fill="#E5E7EB" rx="2" />
                  <rect x="35" y="135" width="310" height="4" fill="#E5E7EB" rx="2" />
                  <rect x="35" y="145" width="250" height="4" fill="#E5E7EB" rx="2" />
                </motion.g>
                
                {/* Action items */}
                <motion.g initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
                  <rect x="20" y="180" width="175" height="100" fill="white" rx="8" 
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="35" y="200" fontSize="11" fontWeight="bold" fill="#10B981">Action Items</text>
                  <circle cx="35" cy="220" r="3" fill="#10B981" />
                  <rect x="45" y="217" width="120" height="4" fill="#E5E7EB" rx="2" />
                  <circle cx="35" cy="235" r="3" fill="#10B981" />
                  <rect x="45" y="232" width="100" height="4" fill="#E5E7EB" rx="2" />
                  <circle cx="35" cy="250" r="3" fill="#10B981" />
                  <rect x="45" y="247" width="110" height="4" fill="#E5E7EB" rx="2" />
                </motion.g>
                
                {/* Categories */}
                <motion.g initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}>
                  <rect x="205" y="180" width="175" height="100" fill="white" rx="8" 
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="220" y="200" fontSize="11" fontWeight="bold" fill="#8B5CF6">Categories</text>
                  <rect x="220" y="215" width="60" height="20" fill="#EEF2FF" rx="10" />
                  <text x="250" y="228" fontSize="9" fill="#6366F1" textAnchor="middle">Project</text>
                  <rect x="285" y="215" width="50" height="20" fill="#FEF3C7" rx="10" />
                  <text x="310" y="228" fontSize="9" fill="#F59E0B" textAnchor="middle">Review</text>
                  <rect x="220" y="240" width="70" height="20" fill="#DCFCE7" rx="10" />
                  <text x="255" y="253" fontSize="9" fill="#10B981" textAnchor="middle">Important</text>
                </motion.g>
              </svg>
            </div>
            <p className="text-sm text-slate text-center mt-4 group-hover:text-ink transition-colors duration-300">
              Detailed AI summaries and categorization
            </p>
          </div>
        </div>
      </Section>

      {/* Security Section */}
      <Section id="security">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-blue mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="mb-4">{SECURITY.title}</h3>
            <ul className="space-y-2">
              {SECURITY.bullets.map((bullet, index) => (
                <li key={index} className="text-slate flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue rounded-full mr-3"></div>
                  {bullet}
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <a href="/privacy" className="text-blue hover:underline">Privacy & Security →</a>
            </p>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="bg-white">
        <div className="text-center mb-16">
          <h2 className="mb-4">Loved by professionals</h2>
          <p className="text-xl text-slate">Join thousands who've transformed their email workflow</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="luxury-card p-6 rounded-xl hover:shadow-luxury transition-all duration-300"
            >
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing Preview */}
      <Section className="bg-mist">
        <div className="text-center mb-12">
          <h2 className="mb-4">Simple, transparent pricing</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <PricingCard 
            name="Free" 
            {...PRICING.free}
            ctaData="landing-pricing-free"
          />
          <PricingCard 
            name="Professional" 
            {...PRICING.pro}
            featured
            ctaData="landing-pricing-pro"
          />
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="text-center">
        <h2 className="mb-4">Triage less. Ship more.</h2>
        <p className="text-xl text-slate mb-8 max-w-lg mx-auto">
          Join thousands of professionals who've already transformed their email workflow.
        </p>
        <CTAButton data-cta="final-cta" className="text-lg px-8 py-4">
          Start Free
        </CTAButton>
        <p className="text-sm text-slate mt-4">1,000 emails free to process</p>
      </Section>

      <Footer />
    </div>
  );
}