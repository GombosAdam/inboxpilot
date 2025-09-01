'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { PricingCard } from '@/components/PricingCard';

const FAQ_ITEMS = [
  {
    question: "How does billing work?",
    answer: "We bill monthly or annually. You can cancel anytime with no long-term commitments. Your subscription includes all features listed in your plan."
  },
  {
    question: "Is my email data secure?",
    answer: "Yes. We use secure Google OAuth access and never store your email content. All data is encrypted in transit and at rest. We only store AI-generated summaries and metadata. We only access Gmail to read and organize your emails."
  },
  {
    question: "What are the usage limits?",
    answer: "Free plans get 1,000 AI-processed emails. Professional plans have unlimited email processing with priority support."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. Cancel your subscription anytime from your dashboard. Your access continues until the end of your billing period."
  },
  {
    question: "What kind of support do you offer?",
    answer: "Free users get community support. Professional users get priority email support with faster response times and direct access to our team."
  },
  {
    question: "How long do you retain my data?",
    answer: "AI summaries and metadata are kept for the lifetime of your account. When you delete your account, all data is permanently removed within 30 days."
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero */}
      <Section className="pt-20 text-center relative">
        <div className="absolute inset-0 pattern-dots opacity-20"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h1 
            className="mb-6 gradient-text"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p 
            className="text-xl text-slate mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Start free and upgrade when you're ready. No hidden fees, no long-term contracts.
          </motion.p>
          
          {/* Toggle */}
          <motion.div 
            className="flex items-center justify-center mb-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.span 
              className={`mr-4 font-medium transition-all duration-300 ${!isAnnual ? 'text-ink scale-110' : 'text-slate scale-100'}`}
              whileHover={{ scale: 1.05 }}
            >
              Monthly
            </motion.span>
            <motion.button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-lg ${
                isAnnual ? 'bg-blue shadow-blue/30' : 'bg-line shadow-slate/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
                animate={{
                  x: isAnnual ? 20 : 4
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <motion.span 
              className={`ml-4 font-medium transition-all duration-300 flex items-center gap-2 ${isAnnual ? 'text-ink scale-110' : 'text-slate scale-100'}`}
              whileHover={{ scale: 1.05 }}
            >
              Annual
              <motion.span 
                className="text-sm bg-success/20 text-success px-3 py-1 rounded-full font-semibold shadow-sm"
                animate={{ scale: isAnnual ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5 }}
              >
                Save 20%
              </motion.span>
            </motion.span>
          </motion.div>
        </motion.div>
      </Section>

      {/* Pricing Cards */}
      <Section>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard 
            name="Free" 
            price="$0"
            blurb="1,000 emails free"
            items={[
              "AI Summaries",
              "Priority Detection", 
              "Auto Categorization"
            ]}
            ctaText="Get Started Free"
            ctaData="pricing-free"
          />
          <PricingCard 
            name="Professional" 
            price={isAnnual ? "$7" : "$9"}
            blurb={isAnnual ? "per month, billed annually" : "per month"}
            items={[
              "Everything in Free",
              "Unlimited emails",
              "Analytics", 
              "Priority support"
            ]}
            featured
            ctaText="Start Professional"
            ctaData="pricing-pro"
          />
        </div>
      </Section>

      {/* Comparison Table */}
      <Section className="bg-white">
        <div className="text-center mb-12">
          <h2 className="mb-4">Compare plans</h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-4 text-slate">Features</th>
                  <th className="text-center py-4">Free</th>
                  <th className="text-center py-4">Professional</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "AI Summaries", free: true, pro: true },
                  { feature: "Priority Detection", free: true, pro: true },
                  { feature: "Auto Categories", free: true, pro: true },
                  { feature: "Email Processing", free: "1,000/month", pro: "Unlimited" },
                  { feature: "Analytics", free: false, pro: true },
                  { feature: "Priority Support", free: false, pro: true },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-line">
                    <td className="py-4 font-medium text-ink">{row.feature}</td>
                    <td className="text-center py-4">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-slate">—</span>
                        )
                      ) : (
                        <span className="text-slate">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center py-4">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-slate">—</span>
                        )
                      ) : (
                        <span className="text-ink font-medium">{row.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-mist">
        <div className="text-center mb-12">
          <h2 className="mb-4">Frequently asked questions</h2>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="bg-white border border-line rounded-lg">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-mist transition-colors"
              >
                <span className="font-medium text-ink">{item.question}</span>
                <span className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4">
                  <p className="text-slate">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center">
        <h2 className="mb-4">Ready to get started?</h2>
        <p className="text-xl text-slate mb-8 max-w-lg mx-auto">
          Join thousands of professionals who've transformed their email workflow.
        </p>
        <CTAButton data-cta="pricing-bottom-cta" className="text-lg px-8 py-4">
          Start Free Today
        </CTAButton>
        <p className="text-sm text-slate mt-4">No credit card required</p>
      </Section>

      <Footer />
    </div>
  );
}