import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  threshold = 0.9,
  rootMargin = '100px',
  hasMore,
  loading,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const observe = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!hasMore || !node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            onLoadMore();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observerRef.current.observe(node);
    },
    [hasMore, loading, onLoadMore, threshold, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { loadMoreRef: observe };
}