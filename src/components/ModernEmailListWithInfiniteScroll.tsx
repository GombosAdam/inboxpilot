'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModernEmailList } from './ModernEmailList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Loader2 } from 'lucide-react';

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
}

interface ModernEmailListWithInfiniteScrollProps {
  initialEmails: EmailData[];
  onLoadMore?: (page: number) => Promise<EmailData[]>;
  pageSize?: number;
}

export function ModernEmailListWithInfiniteScroll({
  initialEmails,
  onLoadMore,
  pageSize = 20,
}: ModernEmailListWithInfiniteScrollProps) {
  const [emails, setEmails] = useState<EmailData[]>(initialEmails);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load more emails
  const loadMoreEmails = useCallback(async () => {
    if (loading || !hasMore || !onLoadMore) return;

    setLoading(true);
    setError(null);

    try {
      const newEmails = await onLoadMore(page + 1);
      
      if (newEmails.length === 0) {
        setHasMore(false);
      } else {
        setEmails(prev => [...prev, ...newEmails]);
        setPage(prev => prev + 1);
        
        if (newEmails.length < pageSize) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError('Failed to load more emails');
      console.error('Error loading emails:', err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, onLoadMore, pageSize]);

  // Infinite scroll hook
  const { loadMoreRef } = useInfiniteScroll({
    hasMore: hasMore && !loading,
    loading,
    onLoadMore: loadMoreEmails,
  });

  // Update emails when initial emails change
  useEffect(() => {
    setEmails(initialEmails);
    setPage(1);
    setHasMore(true);
  }, [initialEmails]);

  return (
    <div className="relative">
      <ModernEmailList
        emails={emails}
        onEmailClick={(email) => console.log('Email clicked:', email)}
        onEmailAction={(action, email) => console.log('Email action:', action, email)}
      />

      {/* Infinite Scroll Trigger */}
      {onLoadMore && hasMore && (
        <div 
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
        >
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-gray-500"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading more emails...</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 text-center"
        >
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadMoreEmails}
            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Try again
          </button>
        </motion.div>
      )}

      {/* End of List */}
      {!hasMore && emails.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center text-sm text-gray-500"
        >
          You've reached the end of your emails
        </motion.div>
      )}
    </div>
  );
}