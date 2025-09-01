'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, 
  Clock, 
  Percent, 
  Gift, 
  Zap, 
  Calendar,
  ShoppingBag,
  Star,
  TrendingUp,
  Mail,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PromotionalData {
  type: 'newsletter' | 'sale' | 'product-launch' | 'coupon' | 'reminder' | 'survey' | 'event';
  discount?: string;
  expiryDate?: string;
  keyProducts?: string[];
  callToAction?: string;
  brandCategory?: 'retail' | 'saas' | 'media' | 'finance' | 'food' | 'travel' | 'other';
}

interface PromotionalEmailCardProps {
  id: string;
  sender: string;
  subject: string;
  summary: string;
  date: string;
  promotionalData: PromotionalData;
  onClick?: () => void;
  className?: string;
}

const typeConfig = {
  newsletter: { 
    icon: <Mail className="w-4 h-4" />, 
    color: 'bg-blue-500', 
    bgColor: 'bg-blue-50', 
    textColor: 'text-blue-700',
    label: 'Newsletter'
  },
  sale: { 
    icon: <Percent className="w-4 h-4" />, 
    color: 'bg-red-500', 
    bgColor: 'bg-red-50', 
    textColor: 'text-red-700',
    label: 'Sale'
  },
  'product-launch': { 
    icon: <Zap className="w-4 h-4" />, 
    color: 'bg-purple-500', 
    bgColor: 'bg-purple-50', 
    textColor: 'text-purple-700',
    label: 'New Product'
  },
  coupon: { 
    icon: <Gift className="w-4 h-4" />, 
    color: 'bg-green-500', 
    bgColor: 'bg-green-50', 
    textColor: 'text-green-700',
    label: 'Coupon'
  },
  reminder: { 
    icon: <Clock className="w-4 h-4" />, 
    color: 'bg-amber-500', 
    bgColor: 'bg-amber-50', 
    textColor: 'text-amber-700',
    label: 'Reminder'
  },
  survey: { 
    icon: <TrendingUp className="w-4 h-4" />, 
    color: 'bg-indigo-500', 
    bgColor: 'bg-indigo-50', 
    textColor: 'text-indigo-700',
    label: 'Survey'
  },
  event: { 
    icon: <Calendar className="w-4 h-4" />, 
    color: 'bg-cyan-500', 
    bgColor: 'bg-cyan-50', 
    textColor: 'text-cyan-700',
    label: 'Event'
  }
};

const brandIcons = {
  retail: '🛍️',
  saas: '💻',
  media: '📺',
  finance: '💳',
  food: '🍕',
  travel: '✈️',
  other: '🏢'
};

export function PromotionalEmailCard({
  id,
  sender,
  subject,
  summary,
  date,
  promotionalData,
  onClick,
  className = ''
}: PromotionalEmailCardProps) {
  const config = typeConfig[promotionalData.type];
  const isExpiring = promotionalData.expiryDate && 
    new Date(promotionalData.expiryDate) < new Date(Date.now() + 48 * 60 * 60 * 1000); // expires in 48h

  return (
    <motion.div
      onClick={onClick}
      className={`
        group relative p-6 bg-white border border-gray-200 rounded-lg cursor-pointer
        hover:shadow-lg hover:border-blue-300 transition-all duration-300
        ${isExpiring ? 'ring-2 ring-amber-200 bg-amber-50/30' : ''}
        ${className}
      `}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Expiring Badge */}
      {isExpiring && (
        <motion.div 
          className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Expiring Soon
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Brand Category Icon */}
          <div className="text-2xl">
            {brandIcons[promotionalData.brandCategory || 'other']}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {sender}
              </h3>
              
              {/* Type Badge */}
              <span className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${config.bgColor} ${config.textColor}
              `}>
                {config.icon}
                {config.label}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-1">
              {subject}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </div>
      </div>

      {/* Discount Highlight */}
      {promotionalData.discount && (
        <motion.div 
          className="mb-4 p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-lg">{promotionalData.discount}</div>
                <div className="text-xs text-green-100">Limited Time Offer</div>
              </div>
            </div>
            
            {promotionalData.expiryDate && (
              <div className="text-right">
                <div className="text-xs text-green-100">Expires</div>
                <div className="text-sm font-medium">
                  {new Date(promotionalData.expiryDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">
        {summary}
      </p>

      {/* Key Products */}
      {promotionalData.keyProducts && promotionalData.keyProducts.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Featured Items</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {promotionalData.keyProducts.slice(0, 3).map((product, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Call to Action */}
        {promotionalData.callToAction && (
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-sm font-medium">{promotionalData.callToAction}</span>
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button 
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Star"
          >
            <Star className="w-4 h-4 text-gray-400" />
          </motion.button>
          
          <motion.button 
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Archive"
          >
            <Tag className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}