import { useEffect, useRef, useState } from 'react';

// Advanced Intersection Observer hook for performance optimization
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};

// Hook for lazy loading images with Intersection Observer
export const useLazyImage = (src, options = {}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver(options);

  useEffect(() => {
    if (hasIntersected && src && !imageSrc) {
      setImageSrc(src);
    }
  }, [hasIntersected, src, imageSrc]);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setIsError(true);

  return {
    targetRef,
    imageSrc,
    isLoaded,
    isError,
    handleLoad,
    handleError,
    shouldLoad: hasIntersected,
  };
};

// Hook for infinite scrolling with Intersection Observer
export const useInfiniteScroll = (callback, options = {}) => {
  const [isFetching, setIsFetching] = useState(false);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    ...options,
  });

  useEffect(() => {
    if (isIntersecting && !isFetching) {
      setIsFetching(true);
      callback().finally(() => setIsFetching(false));
    }
  }, [isIntersecting, isFetching, callback]);

  return { targetRef, isFetching };
};

// Hook for prefetching data when element is near viewport
export const usePrefetch = (prefetchFn, options = {}) => {
  const [isPrefetched, setIsPrefetched] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '200px', // Prefetch when 200px away
    ...options,
  });

  useEffect(() => {
    if (hasIntersected && !isPrefetched && prefetchFn) {
      setIsPrefetched(true);
      prefetchFn();
    }
  }, [hasIntersected, isPrefetched, prefetchFn]);

  return { targetRef, isPrefetched };
};

export default useIntersectionObserver;