import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import ProductWishlistButton from "./ProductWishlistButton";
import useWishlist from "../hooks/useWishlist";
import useColumnAnimation from "../hooks/useColumnAnimation";

const AnimatedColumn = ({ products, cardType, speed, direction, height }) => {
  const { isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef(null);
  const [measuredCycleHeight, setMeasuredCycleHeight] = useState(height || 0);

  // Handle insufficient products: if we have less than needed, cycle through existing ones
  const safeProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    // Ensure we have enough products for smooth animation by cycling if necessary
    const minProducts = 5; // Minimum for visual continuity
    if (products.length < minProducts) {
      const cyclesNeeded = Math.ceil(minProducts / products.length);
      return Array.from({ length: cyclesNeeded }, () => products).flat();
    }
    return products;
  }, [products]);

  // Duplication strategy:
  // For 'up': [...list1, ...list2] - duplicates at bottom, perfect for upward movement
  // For 'down': [...list1, ...list2] with negative start - duplicates appear at top visually
  const duplicatedProducts = useMemo(() => {
    // Same structure for both: [...list1, ...list2]
    // The difference is in the translateY offset for 'down' direction
    return [...safeProducts, ...safeProducts];
  }, [safeProducts]);

  // Measure height using ResizeObserver - recalculates when images load/resize
  useEffect(() => {
    if (!contentRef.current || safeProducts.length === 0) return;

    const node = contentRef.current;
    
    const updateHeight = () => {
      const full = node.scrollHeight;      // height of doubled list
      const half = Math.round(full / 2);  // cycle = half
      if (half > 0) {
        setMeasuredCycleHeight(half);
      }
    };

    // Use ResizeObserver to catch when content actually resizes (images loaded)
    const ro = new ResizeObserver(() => {
      updateHeight();
    });

    ro.observe(node);
    updateHeight(); // Initial measurement

    // Fallback: also listen for image load events (for older browsers)
    const imgs = node.querySelectorAll('img') ?? [];
    let loadedCount = 0;
    const totalImages = imgs.length;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages || loadedCount >= safeProducts.length) {
        updateHeight();
      }
    };

    imgs.forEach(img => {
      if (img.complete) {
        onImageLoad();
      } else {
        img.addEventListener('load', onImageLoad, { once: true });
        img.addEventListener('error', onImageLoad, { once: true });
      }
    });

    return () => {
      ro.disconnect();
      imgs.forEach(img => {
        img.removeEventListener('load', onImageLoad);
        img.removeEventListener('error', onImageLoad);
      });
    };
  }, [safeProducts.length, cardType, duplicatedProducts.length]);
  
  const baseTranslateY = useColumnAnimation(speed, direction, isHovered, measuredCycleHeight);

  // For 'down' direction: start at -height to show the end of the list (which is duplicate of start)
  // This way, when translateY moves from -height to 0, we see end→start transition
  // When it reaches height, it teleports back to 0, showing start again (which matches the end we saw)
  const translateY = direction === 'down' && measuredCycleHeight > 0
    ? baseTranslateY - measuredCycleHeight
    : baseTranslateY;

  // Функція для отримання URL зображення товару
  const getImageSrc = (product) => {
    if (product && product.images && product.images.length > 0) {
      return product.images[0].imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop&crop=center";
    }
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop&crop=center";
  };

  return (
    <div
      className={`product-card column-${cardType.split('-')[3]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        overflow: 'hidden',
        position: 'relative',
        height: `${height}px`
      }}
    >
      <div
        ref={contentRef}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          willChange: 'transform'
        }}
      >
        {duplicatedProducts.map((product, index) => (
          <div key={`${product.id}-${index}`} className={cardType}>
            <div className="product-card-content">
              <Link to={`/item?id=${product.id}`}>
                <img
                  className="image-source"
                  src={getImageSrc(product)}
                  alt={product.name}
                  loading="lazy"
                />
              </Link>
              <div className="product-card-actions">
                <ProductWishlistButton product={product} className={isInWishlist(product.id) ? "in-wishlist" : ""} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedColumn;