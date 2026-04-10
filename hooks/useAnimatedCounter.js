'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ✅ Hook personalizado para contadores con "falsa progresión"
 * 
 * Características:
 * - Muestra progresión suave en el cliente (animación fluida)
 * - Se sincroniza con el servidor cada syncInterval ms (default 30s)
 * - Reduce peticiones innecesarias a la base de datos
 * - Mantiene consistencia con el valor real del servidor
 * 
 * @param {Function} fetchFn - Función asíncrona que obtiene el valor real del servidor
 * @param {number} initialValue - Valor inicial del contador
 * @param {number} syncInterval - Intervalo de sincronización en ms (default 30000)
 * @returns {Object} - { displayValue, realValue, isSyncing }
 */
export const useAnimatedCounter = (fetchFn, initialValue = 0, syncInterval = 30000) => {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [realValue, setRealValue] = useState(initialValue);
  const [isSyncing, setIsSyncing] = useState(false);
  const animationFrameRef = useRef(null);
  const targetValueRef = useRef(initialValue);
  const lastSyncRef = useRef(Date.now());

  // ✅ Función de animación suave (interpolación lineal)
  const animateToTarget = useCallback(() => {
    const animate = () => {
      const current = displayValue;
      const target = targetValueRef.current;
      const diff = target - current;
      
      // Si la diferencia es muy pequeña, ir directo al target
      if (Math.abs(diff) < 0.001) {
        setDisplayValue(target);
        return;
      }
      
      // Mover 10% hacia el target por frame (suave)
      const step = diff * 0.1;
      setDisplayValue(prev => prev + step);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Cancelar animación anterior si existe
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animate();
  }, [displayValue]);

  // ✅ Sincronizar con el servidor
  const syncWithServer = useCallback(async () => {
    try {
      setIsSyncing(true);
      const serverValue = await fetchFn();
      
      if (serverValue !== null && serverValue !== undefined) {
        setRealValue(serverValue);
        targetValueRef.current = serverValue;
        
        // Iniciar animación hacia el nuevo valor
        animateToTarget();
        
        lastSyncRef.current = Date.now();
      }
    } catch (error) {
      console.error('Error syncing counter with server:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchFn, animateToTarget]);

  // ✅ Efecto para sincronización periódica
  useEffect(() => {
    // Sincronización inicial
    syncWithServer();
    
    // Configurar intervalo de sincronización
    const intervalId = setInterval(syncWithServer, syncInterval);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [syncWithServer, syncInterval]);

  // ✅ Cleanup en desmontaje
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    displayValue,
    realValue,
    isSyncing,
    syncWithServer, // Exponer para sincronización manual si es necesario
  };
};

/**
 * ✅ Hook para múltiples contadores con sincronización
 * 
 * @param {Function} fetchFn - Función que retorna objeto con múltiples valores
 * @param {Object} initialValues - Valores iniciales { balance: 0, energy: 0, ... }
 * @param {number} syncInterval - Intervalo de sincronización
 * @returns {Object} - Contadores con animación
 */
export const useMultipleCounters = (fetchFn, initialValues = {}, syncInterval = 30000) => {
  const [counters, setCounters] = useState(initialValues);
  const [displayCounters, setDisplayCounters] = useState(initialValues);
  const [isSyncing, setIsSyncing] = useState(false);
  const animationFrameRef = useRef(null);

  // ✅ Animación suave para todos los contadores
  const animateCounters = useCallback((targetCounters) => {
    const animate = () => {
      let needsAnimation = false;
      
      setDisplayCounters(prev => {
        const next = { ...prev };
        
        for (const key in targetCounters) {
          const current = prev[key] || 0;
          const target = targetCounters[key] || 0;
          const diff = target - current;
          
          if (Math.abs(diff) >= 0.001) {
            needsAnimation = true;
            next[key] = current + (diff * 0.1);
          } else {
            next[key] = target;
          }
        }
        
        return next;
      });
      
      if (needsAnimation) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animate();
  }, []);

  // ✅ Sincronizar con servidor
  const syncWithServer = useCallback(async () => {
    try {
      setIsSyncing(true);
      const serverValues = await fetchFn();
      
      if (serverValues && typeof serverValues === 'object') {
        setCounters(serverValues);
        animateCounters(serverValues);
      }
    } catch (error) {
      console.error('Error syncing counters with server:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchFn, animateCounters]);

  // ✅ Sincronización periódica
  useEffect(() => {
    syncWithServer();
    
    const intervalId = setInterval(syncWithServer, syncInterval);
    
    return () => {
      clearInterval(intervalId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [syncWithServer, syncInterval]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    counters,
    displayCounters,
    isSyncing,
    syncWithServer,
  };
};

// ✅ Componente helper para formatear números con animación
export const AnimatedNumber = ({ value, decimals = 2, prefix = '', suffix = '', className = '' }) => {
  const formattedValue = typeof value === 'number' ? value.toFixed(decimals) : '0';
  
  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

export default useAnimatedCounter;
