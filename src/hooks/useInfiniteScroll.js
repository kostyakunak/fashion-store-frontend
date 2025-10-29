import { useState, useEffect, useCallback } from 'react';
import { getChunkedProducts } from '../api/productApi';

const useInfiniteScroll = (initialPage = 0, limit = 20) => {
    const [chunks, setChunks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(initialPage);

    const loadMore = useCallback(async (direction = 'down') => {
        if (loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            const page = direction === 'up' ? Math.max(0, currentPage - 1) : currentPage;
            const data = await getChunkedProducts(page, direction, limit);

            if (data?.products && Array.isArray(data.products)) {
                const flattenedProducts = data.products.flat();
                setChunks(prevChunks => {
                    if (direction === 'up') {
                        return [flattenedProducts, ...prevChunks];
                    } else {
                        return [...prevChunks, flattenedProducts];
                    }
                });

                setCurrentPage(prevPage => direction === 'up' ? prevPage - 1 : prevPage + 1);

                // Assuming the backend returns hasMore flag
                if (data.hasMore !== undefined) {
                    setHasMore(data.hasMore);
                } else if (flattenedProducts.length < limit) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (err) {
            setError(err);
            console.error('Error loading more products:', err);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, currentPage, limit]);

    // Initial load
    useEffect(() => {
        loadMore('down');
    }, []); // Empty dependency array for initial load

    return {
        chunks,
        loadMore,
        loading,
        hasMore,
        error
    };
};

export default useInfiniteScroll;