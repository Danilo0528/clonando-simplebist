'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ✅ Componente de Lazy Loading para listas largas
 * 
 * Características:
 * - Carga elementos progresivamente al hacer scroll
 * - Reduce la carga inicial de renderizado
 * - Optimiza el rendimiento con listas grandes
 * 
 * @param {Array} items - Lista completa de elementos
 * @param {Function} renderItem - Función que renderiza cada elemento
 * @param {number} initialLoad - Cantidad inicial de elementos a cargar (default 20)
 * @param {number} loadMore - Cantidad de elementos a cargar por scroll (default 20)
 * @param {string} emptyMessage - Mensaje cuando no hay elementos
 * @param {string} loadingMessage - Mensaje de carga
 */
export const LazyList = ({ 
  items = [], 
  renderItem, 
  initialLoad = 20, 
  loadMore = 20,
  emptyMessage = 'No items to display',
  loadingMessage = 'Loading...',
}) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef(null);

  // ✅ Cargar elementos iniciales
  useEffect(() => {
    setVisibleItems(items.slice(0, initialLoad));
    setHasMore(items.length > initialLoad);
  }, [items, initialLoad]);

  // ✅ Callback para observar el último elemento visible
  const lastElementObserver = useCallback(
    (node) => {
      if (isLoading) return;
      
      if (observerTarget.current) {
        observerTarget.current.disconnect();
      }

      observerTarget.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreItems();
        }
      });

      if (node) {
        observerTarget.current.observe(node);
      }
    },
    [hasMore, isLoading]
  );

  // ✅ Cargar más elementos
  const loadMoreItems = () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);

    // Simular carga asíncrona para no bloquear el renderizado
    setTimeout(() => {
      const currentLength = visibleItems.length;
      const nextBatch = items.slice(currentLength, currentLength + loadMore);
      
      setVisibleItems(prev => [...prev, ...nextBatch]);
      setHasMore(currentLength + loadMore < items.length);
      setIsLoading(false);
    }, 50); // Pequeño delay para permitir renderizado suave
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {visibleItems.map((item, index) => {
        const isLastElement = index === visibleItems.length - 1;
        return (
          <div
            key={item.id || index}
            ref={isLastElement ? lastElementObserver : null}
          >
            {renderItem(item, index)}
          </div>
        );
      })}

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-2">{loadingMessage}</p>
        </div>
      )}

      {!hasMore && visibleItems.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">All items loaded</p>
        </div>
      )}
    </div>
  );
};

/**
 * ✅ Hook para VirtualScroll (optimización avanzada)
 * 
 * Solo renderiza los elementos visibles en el viewport
 * Ideal para listas con miles de elementos
 * 
 * @param {number} itemHeight - Altura de cada elemento en px
 * @param {number} containerHeight - Altura del contenedor en px
 * @returns {Object} - { scrollTop, visibleStart, visibleEnd }
 */
export const useVirtualScroll = (itemHeight = 100, containerHeight = 600) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    Infinity
  );

  const offsetY = visibleStart * itemHeight;

  return {
    containerRef,
    handleScroll,
    visibleStart,
    visibleEnd,
    offsetY,
  };
};

/**
 * ✅ Componente VirtualScroll List
 * 
 * @param {Array} items - Lista completa de elementos
 * @param {Function} renderItem - Función que renderiza cada elemento
 * @param {number} itemHeight - Altura estimada de cada elemento
 * @param {number} containerHeight - Altura del contenedor
 */
export const VirtualScrollList = ({
  items = [],
  renderItem,
  itemHeight = 100,
  containerHeight = 600,
}) => {
  const { containerRef, handleScroll, visibleStart, visibleEnd, offsetY } = 
    useVirtualScroll(itemHeight, containerHeight);

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No items to display</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: `${containerHeight}px`, overflow: 'auto' }}
      className="relative"
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={item.id || visibleStart + index}
              style={{ height: `${itemHeight}px` }}
            >
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LazyList;
