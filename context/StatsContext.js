'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken } from '../lib/tokenManager';
import { useMultipleCounters } from '../hooks/useAnimatedCounter';

// Create the context
const StatsContext = createContext();

// Stats Provider Component
export const StatsProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Mark as client-side after mount to avoid hydration issues
    useEffect(() => {
        setIsClient(true);
    }, []);

    // ✅ FUNCIÓN: Cargar datos del usuario (se llama cada 30s para sincronización)
    const loadUserData = useCallback(async () => {
        if (!isClient) return;

        try {
            const token = getToken();
            if (!token) {
                setUserData({
                    balances: {
                        simplebits: 0,
                        sc: 0,
                        energy: 100,
                        level: 1,
                        maxEnergy: 100,
                        tokenBalance: 0,
                        boundTokenBalance: 0,
                    },
                    levelInfo: {
                        level: 1,
                        xp: 0,
                        xpInCurrentLevel: 0,
                        xpNeededForNextLevel: 100,
                        progressPercentage: 0,
                    },
                    energyRegenerationRate: 8,
                    lastEnergyUpdate: new Date().toISOString(),
                    miningStatus: {
                        accumulatedReward: 0,
                        canClaimMining: false,
                    },
                });
                setHasLoaded(true);
                setLoading(false);
                return;
            }

            const res = await fetch('/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();

                const transformedData = {
                    ...data,
                    balances: {
                        simplebits: data.balance || 0,
                        sc: data.balance || 0,
                        energy: data.energyPoints || 0,
                        level: data.level || 1,
                        maxEnergy: data.maxEnergy || 100,
                        tokenBalance: data.tokenBalance || 0,
                        boundTokenBalance: data.boundTokenBalance || 0,
                    },
                    levelInfo: {
                        level: data.level || 1,
                        xp: data.xp || 0,
                        xpInCurrentLevel: data.xpInCurrentLevel || 0,
                        xpNeededForNextLevel: data.xpNeededForNextLevel || 100,
                        progressPercentage: data.progressPercentage || 0,
                    },
                    energyRegenerationRate: data.energyRegenerationRate || 8,
                    lastEnergyUpdate: data.lastEnergyUpdate || new Date().toISOString(),
                    miningStatus: {
                        accumulatedReward: data.accumulatedReward || 0,
                        canClaimMining: data.canClaimMining || false,
                    },
                };

                const updatedUserData = calculateCurrentEnergy(transformedData);
                setUserData(updatedUserData);
                setHasLoaded(true);
            } else if (res.status === 401) {
                console.log('Token expired in StatsContext, cleaning up...');
                const { removeToken } = await import('../lib/tokenManager');
                removeToken();
                setHasLoaded(true);
            } else {
                setUserData({
                    balances: {
                        simplebits: 0,
                        sc: 0,
                        energy: 100,
                        level: 1,
                        maxEnergy: 100,
                        tokenBalance: 0,
                        boundTokenBalance: 0,
                    },
                    levelInfo: {
                        level: 1,
                        xp: 0,
                        xpInCurrentLevel: 0,
                        xpNeededForNextLevel: 100,
                        progressPercentage: 0,
                    },
                    energyRegenerationRate: 8,
                    lastEnergyUpdate: new Date().toISOString(),
                    miningStatus: {
                        accumulatedReward: 0,
                        canClaimMining: false,
                    },
                });
                setHasLoaded(true);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setUserData({
                balances: {
                    simplebits: 0,
                    sc: 0,
                    energy: 100,
                    level: 1,
                    maxEnergy: 100,
                    tokenBalance: 0,
                    boundTokenBalance: 0,
                },
                levelInfo: {
                    level: 1,
                    xp: 0,
                    xpInCurrentLevel: 0,
                    xpNeededForNextLevel: 100,
                    progressPercentage: 0,
                },
                energyRegenerationRate: 8,
                lastEnergyUpdate: new Date().toISOString(),
                miningStatus: {
                    accumulatedReward: 0,
                    canClaimMining: false,
                },
            });
            setHasLoaded(true);
        } finally {
            setLoading(false);
        }
    }, [isClient]);

    // ✅ NUEVO: Sincronización ligera cada 30 segundos (solo balances, sin recarga completa)
    const syncBalances = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) return;

            const res = await fetch('/api/user/balances', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                
                setUserData(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        balances: {
                            ...prev.balances,
                            simplebits: data.balance || prev.balances.simplebits,
                            sc: data.balance || prev.balances.sc,
                            energy: data.energyPoints || prev.balances.energy,
                            tokenBalance: data.tokenBalance || prev.balances.tokenBalance,
                            boundTokenBalance: data.boundTokenBalance || prev.balances.boundTokenBalance,
                        },
                        miningStatus: {
                            accumulatedReward: data.accumulatedReward || prev.miningStatus?.accumulatedReward || 0,
                            canClaimMining: data.canClaimMining || false,
                        },
                    };
                });
            }
        } catch (error) {
            console.error('Error syncing balances:', error);
        }
    }, []);

    // Configurar sincronización automática cada 30 segundos
    useEffect(() => {
        if (!isClient || !hasLoaded) return;

        const syncInterval = setInterval(syncBalances, 30000); // ✅ Cada 30 segundos
        
        return () => clearInterval(syncInterval);
    }, [isClient, hasLoaded, syncBalances]);

    // Función para calcular la energía actual considerando regeneración
    const calculateCurrentEnergy = (userData) => {
        const lastUpdate = new Date(userData.lastEnergyUpdate);
        const now = new Date();
        const timeDiff = now - lastUpdate;

        const minutesPassed = timeDiff / (1000 * 60);
        const fiveMinuteCycles = Math.floor(minutesPassed / 5);
        const energyRegenerated = fiveMinuteCycles * (userData.energyRegenerationRate || 8);
        const maxEnergy = 100 + ((userData.levelInfo?.level || 1) * 10);
        const currentEnergy = Math.min(
            (userData.balances?.energy || 0) + energyRegenerated,
            maxEnergy
        );

        return {
            ...userData,
            balances: {
                ...userData.balances,
                energy: currentEnergy
            }
        };
    };

    // Update balance function
    const updateBalance = useCallback((resource, amount) => {
        setUserData(prevData => {
            if (!prevData) return prevData;

            const newBalances = { ...prevData.balances };
            newBalances[resource] = (newBalances[resource] || 0) + amount;

            if (resource === 'energy' && newBalances.energy < 0) {
                newBalances.energy = 0;
            }

            const updatedData = { ...prevData, balances: newBalances };
            if (resource === 'energy') {
                updatedData.lastEnergyUpdate = new Date().toISOString();
            }

            return updatedData;
        });

        window.dispatchEvent(new CustomEvent('balanceUpdated'));
    }, []);

    // Refresh user data function (recarga completa)
    const refreshUserData = useCallback(async () => {
        setHasLoaded(false);
        await loadUserData();
    }, [loadUserData]);

    // Load user data on mount
    useEffect(() => {
        if (isClient) {
            loadUserData();
        }
    }, [isClient, loadUserData]);

    const value = {
        userData,
        loading,
        updateBalance,
        refreshUserData,
        syncBalances, // ✅ Exponer sincronización manual
    };

    return (
        <StatsContext.Provider value={value}>
            {children}
        </StatsContext.Provider>
    );
};

// Custom hook to use the stats context
export const useStats = () => {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useStats must be used within a StatsProvider');
    }
    return context;
};