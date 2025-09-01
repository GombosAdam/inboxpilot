'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown,
  ChevronRight,
  Star,
  StarOff,
  Reply,
  Forward,
  Archive,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EmailData {
  id: string;
  sender: string;
  senderEmail?: string;
  subject: string;
  summary: string;
  fullContent?: string;
  priority: 'high' | 'medium' | 'low' | 'normal';
  categories: string[];
  date: string;
  read?: boolean;
  starred?: boolean;
  attachments?: number;
  suggestedReply?: string;
  promotionalData?: {
    type: 'newsletter' | 'sale' | 'product-launch' | 'coupon' | 'reminder' | 'survey' | 'event';
    discount?: string;
    expiryDate?: string;
    keyProducts?: string[];
    callToAction?: string;
    brandCategory?: 'retail' | 'saas' | 'media' | 'finance' | 'food' | 'travel' | 'other';
  };
}

interface ModernEmailListProps {
  emails: EmailData[];
  onEmailClick?: (email: EmailData) => void;
  onEmailAction?: (action: string, email: EmailData) => void;
  loading?: boolean;
  className?: string;
}

// Priority configurations
const priorityConfig = {
  high: {
    color: 'bg-red-500',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: 'High Priority'
  },
  medium: {
    color: 'bg-amber-500',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Medium Priority'
  },
  low: {
    color: 'bg-green-500',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: 'Low Priority'
  },
  normal: {
    color: 'bg-blue-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: <Info className="w-3.5 h-3.5" />,
    label: 'Normal'
  }
};

// Category configurations
const categoryConfig: { [key: string]: { bgColor: string; textColor: string; icon?: string } } = {
  personal: { bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: '👤' },
  work: { bgColor: 'bg-purple-100', textColor: 'text-purple-700', icon: '💼' },
  promotional: { bgColor: 'bg-pink-100', textColor: 'text-pink-700', icon: '📢' },
  finance: { bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', icon: '💰' },
  travel: { bgColor: 'bg-cyan-100', textColor: 'text-cyan-700', icon: '✈️' },
  social: { bgColor: 'bg-indigo-100', textColor: 'text-indigo-700', icon: '🌐' },
  other: { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: '📧' }
};

export function ModernEmailList({ 
  emails, 
  onEmailClick, 
  onEmailAction,
  loading = false,
  className = '' 
}: ModernEmailListProps) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 20;

  // Pagination logic
  const paginatedEmails = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return emails.slice(startIndex, endIndex);
  }, [emails, currentPage]);

  const totalPages = Math.ceil(emails.length / itemsPerPage);

  // Toggle email expansion
  const toggleExpanded = useCallback((emailId: string) => {
    setExpandedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  }, []);

  // Toggle email selection
  const toggleSelected = useCallback((emailId: string) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  }, []);

  // Select all/none functionality
  const selectAll = useCallback(() => {
    const allEmailIds = new Set(emails.map(email => email.id));
    setSelectedEmails(allEmailIds);
  }, [emails]);

  const selectNone = useCallback(() => {
    setSelectedEmails(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedEmails.size === emails.length) {
      selectNone();
    } else {
      selectAll();
    }
  }, [selectedEmails.size, emails.length, selectAll, selectNone]);

  // Calculate select all state
  const isAllSelected = selectedEmails.size === emails.length && emails.length > 0;
  const isSomeSelected = selectedEmails.size > 0 && selectedEmails.size < emails.length;

  // Skeleton loader component
  const SkeletonRow = () => (
    <div className="p-4 border-b border-gray-100 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  // Email row component
  const EmailRow = React.memo(({ 
    email, 
    index, 
    isExpanded, 
    isSelected 
  }: { 
    email: EmailData; 
    index: number;
    isExpanded: boolean;
    isSelected: boolean;
  }) => {
    const priority = priorityConfig[email.priority] || priorityConfig.normal;
    

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.03,
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className={`
          group relative border-b border-gray-100 transition-all duration-300 hover:bg-gray-50
          ${isSelected 
            ? 'bg-blue-100 border-l-4 border-l-blue-600 shadow-lg ring-1 ring-blue-300 transform scale-[1.01]' 
            : 'bg-white'
          }
          ${!email.read ? 'bg-gradient-to-r from-blue-50/50 to-transparent' : ''}
        `}
      >
        {/* Main Email Row */}
        <div className="p-4 cursor-pointer" onClick={() => toggleExpanded(email.id)}>
          <div className="flex items-start gap-4">
            {/* Read/Unread & Priority Indicator */}
            <motion.div 
              className="relative mt-2 flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.03 + 0.1, type: "spring", stiffness: 500 }}
            >
              {!email.read && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full transition-all duration-200 group-hover:scale-110"></div>
              )}
              <div className={`w-2 h-2 ${priority.color} rounded-full transition-all duration-200 group-hover:scale-110`}></div>
            </motion.div>

            {/* Checkbox */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelected(email.id);
              }}
              className={`
                w-5 h-5 rounded border-2 transition-all mt-1 shadow-sm
                ${isSelected 
                  ? 'bg-blue-600 border-blue-600 shadow-blue-200' 
                  : 'border-gray-400 hover:border-blue-400 bg-white'
                }
              `}
            >
              {isSelected && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </motion.button>

            {/* Email Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0 pr-4">
                  {/* Subject Line */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-gray-900 truncate ${!email.read ? 'font-bold' : ''}`}>
                      {email.subject}
                    </h3>
                    {email.attachments && email.attachments > 0 && (
                      <span className="text-gray-400 text-xs">📎 {email.attachments}</span>
                    )}
                  </div>

                  {/* Sender Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium">{email.sender}</span>
                    {email.senderEmail && (
                      <span className="text-gray-400">{email.senderEmail}</span>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="flex items-center gap-2 mb-2">
                    <AnimatePresence>
                      {email.categories.map((category, idx) => {
                        const config = categoryConfig[category.toLowerCase()] || categoryConfig.other;
                        return (
                          <motion.span
                            key={category}
                            initial={{ opacity: 0, scale: 0.8, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.03 + idx * 0.05 + 0.2 }}
                            className={`
                              inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                              ${config.bgColor} ${config.textColor}
                            `}
                          >
                            {config.icon && <span>{config.icon}</span>}
                            {category}
                          </motion.span>
                        );
                      })}
                    </AnimatePresence>

                    {/* Priority Badge (always visible) */}
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        ${priority.bgColor} ${priority.textColor} ${priority.borderColor} border
                      `}
                    >
                      {priority.icon}
                      {priority.label}
                    </span>
                  </div>

                  {/* Promotional Info */}
                  {email.promotionalData?.discount && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        🎉 {email.promotionalData.discount}
                        {email.promotionalData.expiryDate && (
                          <span className="text-green-600">
                            • Expires {new Date(email.promotionalData.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* AI Summary */}
                  <motion.p 
                    className="text-sm text-gray-600 line-clamp-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 + 0.3 }}
                  >
                    {email.summary}
                  </motion.p>

                  {/* Key Products for Promotional */}
                  {email.promotionalData?.keyProducts && email.promotionalData.keyProducts.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {email.promotionalData.keyProducts.slice(0, 3).map((product, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Section */}
                <div className="flex items-start gap-3">
                  {/* Date */}
                  <div className="text-right">
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(email.date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEmailAction?.('star', email);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {email.starred ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEmailAction?.('archive', email);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Archive className="w-4 h-4 text-gray-400" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEmailAction?.('delete', email);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  </div>

                  {/* Expand Indicator */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-gray-100 bg-gray-50"
            >
              <div className="p-6">
                {/* Full Summary */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded"></span>
                    AI Summary
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {email.fullContent || email.summary}
                  </p>
                </div>

                {/* Suggested Reply */}
                {email.suggestedReply && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-green-500 rounded"></span>
                      Suggested Reply
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 italic">
                        "{email.suggestedReply}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {!email.read && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onEmailAction?.('mark-as-read', email)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Mark as Read
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEmailAction?.('reply', email)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEmailAction?.('forward', email)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Forward className="w-4 h-4" />
                    Forward
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEmailClick?.(email)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    View in Gmail
                  </motion.button>
                </div>

                {/* Metadata */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(email.date).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {email.senderEmail || email.sender}
                  </div>
                  <div className="flex items-center gap-1">
                    ID: {email.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  });

  EmailRow.displayName = 'EmailRow';

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Select All Checkbox */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleSelectAll}
                className={`
                  w-5 h-5 rounded border-2 transition-all shadow-sm flex items-center justify-center
                  ${isAllSelected 
                    ? 'bg-blue-600 border-blue-600 shadow-blue-200' 
                    : isSomeSelected
                    ? 'bg-blue-600 border-blue-600 shadow-blue-200'
                    : 'border-gray-400 hover:border-blue-400 bg-white'
                  }
                `}
              >
                {isAllSelected && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
                {isSomeSelected && !isAllSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2.5 h-2.5 bg-white rounded-sm"
                  />
                )}
              </motion.button>
              <span className="text-sm text-gray-700 font-medium">
                {isAllSelected ? 'Deselect All' : isSomeSelected ? 'Select All' : 'Select All'}
              </span>
            </div>
            
            {selectedEmails.size > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm text-gray-600">
                  {selectedEmails.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const selectedEmailObjects = emails.filter(email => selectedEmails.has(email.id));
                      const selectedEmailIds = Array.from(selectedEmails);
                      onEmailAction?.('bulk-mark-as-read', selectedEmailObjects[0], selectedEmailIds);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark as Read
                  </button>
                  <button
                    onClick={() => setSelectedEmails(new Set())}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Clear
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {emails.length} emails
            </span>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          // Skeleton Loaders
          <>
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : paginatedEmails.length === 0 ? (
          // Empty State
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No emails found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or sync new emails
            </p>
          </div>
        ) : (
          // Email Rows
          paginatedEmails.map((email, index) => (
            <EmailRow 
              key={email.id} 
              email={email} 
              index={index}
              isExpanded={expandedEmails.has(email.id)}
              isSelected={selectedEmails.has(email.id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`
                      w-8 h-8 text-sm rounded-md transition-colors
                      ${currentPage === pageNum 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`
                      w-8 h-8 text-sm rounded-md transition-colors
                      ${currentPage === totalPages 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}