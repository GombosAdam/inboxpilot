'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PromotionalEmailCard } from './PromotionalEmailCard';
import { 
  Filter,
  SortDesc,
  Grid3X3,
  List,
  Clock,
  Percent,
  Gift,
  Calendar,
  Mail,
  TrendingUp
} from 'lucide-react';

interface PromotionalEmail {
  id: string;
  sender: string;
  subject: string;
  summary: string;
  date: string;
  promotionalData: {
    type: 'newsletter' | 'sale' | 'product-launch' | 'coupon' | 'reminder' | 'survey' | 'event';
    discount?: string;
    expiryDate?: string;
    keyProducts?: string[];
    callToAction?: string;
    brandCategory?: 'retail' | 'saas' | 'media' | 'finance' | 'food' | 'travel' | 'other';
  };
}

interface PromotionalEmailGridProps {
  emails: PromotionalEmail[];
  onEmailClick?: (email: PromotionalEmail) => void;
  className?: string;
}

type FilterType = 'all' | 'sale' | 'coupon' | 'newsletter' | 'product-launch' | 'reminder' | 'survey' | 'event';
type SortType = 'date' | 'discount' | 'expiry' | 'sender';
type ViewType = 'grid' | 'list';

const filterOptions = [
  { key: 'all' as FilterType, label: 'All Promotions', icon: <Mail className="w-4 h-4" />, count: 0 },
  { key: 'sale' as FilterType, label: 'Sales', icon: <Percent className="w-4 h-4" />, count: 0 },
  { key: 'coupon' as FilterType, label: 'Coupons', icon: <Gift className="w-4 h-4" />, count: 0 },
  { key: 'product-launch' as FilterType, label: 'New Products', icon: <TrendingUp className="w-4 h-4" />, count: 0 },
  { key: 'newsletter' as FilterType, label: 'Newsletters', icon: <Mail className="w-4 h-4" />, count: 0 },
  { key: 'event' as FilterType, label: 'Events', icon: <Calendar className="w-4 h-4" />, count: 0 },
];

export function PromotionalEmailGrid({
  emails,
  onEmailClick,
  className = ''
}: PromotionalEmailGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [viewType, setViewType] = useState<ViewType>('grid');

  // Calculate filter counts
  const filtersWithCounts = useMemo(() => {
    return filterOptions.map(option => ({
      ...option,
      count: option.key === 'all' 
        ? emails.length 
        : emails.filter(email => email.promotionalData.type === option.key).length
    }));
  }, [emails]);

  // Filter and sort emails
  const processedEmails = useMemo(() => {
    let filtered = emails;
    
    // Apply filter
    if (activeFilter !== 'all') {
      filtered = emails.filter(email => email.promotionalData.type === activeFilter);
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'discount':
          // Sort by discount amount (parse percentage or dollar amounts)
          const aDiscount = parseDiscountValue(a.promotionalData.discount);
          const bDiscount = parseDiscountValue(b.promotionalData.discount);
          return bDiscount - aDiscount;
        case 'expiry':
          if (!a.promotionalData.expiryDate && !b.promotionalData.expiryDate) return 0;
          if (!a.promotionalData.expiryDate) return 1;
          if (!b.promotionalData.expiryDate) return -1;
          return new Date(a.promotionalData.expiryDate).getTime() - new Date(b.promotionalData.expiryDate).getTime();
        case 'sender':
          return a.sender.localeCompare(b.sender);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [emails, activeFilter, sortBy]);

  // Helper function to parse discount values for sorting
  const parseDiscountValue = (discount?: string): number => {
    if (!discount) return 0;
    
    // Extract percentage (e.g., "50% off" -> 50)
    const percentMatch = discount.match(/(\d+)%/);
    if (percentMatch) return parseInt(percentMatch[1]);
    
    // Extract dollar amount (e.g., "$20 off" -> 20)
    const dollarMatch = discount.match(/\$(\d+)/);
    if (dollarMatch) return parseInt(dollarMatch[1]);
    
    return 0;
  };

  // Group emails by expiry urgency
  const emailsByUrgency = useMemo(() => {
    const now = new Date();
    const expiringSoon: PromotionalEmail[] = [];
    const regular: PromotionalEmail[] = [];
    
    processedEmails.forEach(email => {
      if (email.promotionalData.expiryDate) {
        const expiryDate = new Date(email.promotionalData.expiryDate);
        const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilExpiry > 0 && hoursUntilExpiry <= 48) {
          expiringSoon.push(email);
        } else {
          regular.push(email);
        }
      } else {
        regular.push(email);
      }
    });
    
    return { expiringSoon, regular };
  }, [processedEmails]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white rounded-lg border border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Promotional Emails</h2>
          <p className="text-gray-600">{processedEmails.length} promotions found</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewType === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-md transition-colors ${
                viewType === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="discount">Sort by Discount</option>
            <option value="expiry">Sort by Expiry</option>
            <option value="sender">Sort by Sender</option>
          </select>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 px-2">
        {filtersWithCounts.map((filter) => (
          <motion.button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeFilter === filter.key
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {filter.icon}
            <span>{filter.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === filter.key 
                ? 'bg-white/20 text-white' 
                : 'bg-white text-gray-600'
            }`}>
              {filter.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Expiring Soon Section */}
      {emailsByUrgency.expiringSoon.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Expiring Soon</h3>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
              {emailsByUrgency.expiringSoon.length}
            </span>
          </div>
          
          <div className={`
            grid gap-6 
            ${viewType === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
            }
          `}>
            <AnimatePresence>
              {emailsByUrgency.expiringSoon.map((email, index) => (
                <motion.div
                  key={`expiring-${email.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PromotionalEmailCard
                    {...email}
                    onClick={() => onEmailClick?.(email)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Regular Emails Section */}
      {emailsByUrgency.regular.length > 0 && (
        <div>
          {emailsByUrgency.expiringSoon.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">All Promotions</h3>
            </div>
          )}
          
          <div className={`
            grid gap-6 
            ${viewType === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
            }
          `}>
            <AnimatePresence>
              {emailsByUrgency.regular.map((email, index) => (
                <motion.div
                  key={`regular-${email.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <PromotionalEmailCard
                    {...email}
                    onClick={() => onEmailClick?.(email)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {processedEmails.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No promotional emails found</h3>
          <p className="text-gray-600">
            {activeFilter === 'all' 
              ? 'No promotional emails to display'
              : `No ${activeFilter} emails found. Try a different filter.`
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}