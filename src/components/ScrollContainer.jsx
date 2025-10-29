import React, { useEffect, useRef } from 'react';

const ScrollContainer = ({ children, onLoadMore, loading, hasMore, rootMargin = '100px' }) => {
    const sentinelRef = useRef(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loading) {
                    onLoadMore();
                }
            },
            {
                rootMargin: rootMargin,
                threshold: 0.1
            }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [onLoadMore, loading, hasMore, rootMargin]);

    return (
        <div style={{ position: 'relative' }}>
            {children}
            {hasMore && (
                <div
                    ref={sentinelRef}
                    style={{
                        height: '20px',
                        width: '100%',
                        background: 'transparent'
                    }}
                />
            )}
            {loading && (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: '16px',
                    color: '#666'
                }}>
                    Loading more products...
                </div>
            )}
        </div>
    );
};

export default ScrollContainer;