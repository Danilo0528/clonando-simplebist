'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken } from '../lib/tokenManager'; // Usar nuestro tokenManager

// Create the context
const StatsContext = createContext();

// Stats Provider Component
export const StatsProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false); // Flag to prevent reloading

    // Load user data from API
    const loadUserData = useCallback(async () => {
        if (hasLoaded) return; // Prevent multiple loads
        
        try {
            setLoading(true);
            const token = getToken();
            if (!token) {
                // Set default user data if no token
                setUserData({
                    balances: {
                        sc: 0,
                        energy: 100,
                        level: 1
                    },
                    levelInfo: {
                        level: 1,
                        xp: 0,
                        xpInCurrentLevel: 0,
                        xpNeededForNextLevel: 100,
                        progressPercentage: 0
                    },
                    // Añadir información de regeneración de energía
                    energyRegenerationRate: 8, // 8 puntos cada 5 minutos
                    lastEnergyUpdate: new Date().toISOString()
                });
                setHasLoaded(true);
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

                // Transform flat API response into nested structure expected by components
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
                };

                // Calcular energía actual considerando regeneración desde la última actualización
                const updatedUserData = calculateCurrentEnergy(transformedData);
                setUserData(updatedUserData);
                setHasLoaded(true);
            } else {
                // Set default user data if API call fails
                setUserData({
                    balances: {
                        sc: 0,
                        energy: 100,
                        level: 1,
                        maxEnergy: 100
                    },
                    levelInfo: {
                        level: 1,
                        xp: 0,
                        xpInCurrentLevel: 0,
                        xpNeededForNextLevel: 100,
                        progressPercentage: 0
                    },
                    energyRegenerationRate: 8,
                    lastEnergyUpdate: new Date().toISOString()
                });
                setHasLoaded(true);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // Set default user data on error
            setUserData({
                balances: {
                    sc: 0,
                    energy: 100,
                    level: 1,
                    maxEnergy: 100
                },
                levelInfo: {
                    level: 1,
                    xp: 0,
                    xpInCurrentLevel: 0,
                    xpNeededForNextLevel: 100,
                    progressPercentage: 0
                },
                energyRegenerationRate: 8,
                lastEnergyUpdate: new Date().toISOString()
            });
            setHasLoaded(true);
        } finally {
            setLoading(false);
        }
    }, [hasLoaded]); // Add hasLoaded as dependency

    // Función para calcular la energía actual considerando regeneración
    // IMPORTANTE: Esta función NO debe actualizar lastEnergyUpdate para evitar ciclos infinitos
    const calculateCurrentEnergy = (userData) => {
        const lastUpdate = new Date(userData.lastEnergyUpdate);
        const now = new Date();
        const timeDiff = now - lastUpdate; // en milisegundos
        
        // Convertir a minutos para calcular regeneración
        const minutesPassed = timeDiff / (1000 * 60);
        
        // Calcular cuántos ciclos de 5 minutos han pasado
        const fiveMinuteCycles = Math.floor(minutesPassed / 5);
        
        // Calcular energía regenerada
        const energyRegenerated = fiveMinuteCycles * (userData.energyRegenerationRate || 8);
        
        // Calcular energía máxima basada en nivel
        const maxEnergy = 100 + ((userData.levelInfo?.level || 1) * 10);
        
        // Actualizar energía (sin sobrepasar el límite)
        const currentEnergy = Math.min(
            (userData.balances?.energy || 0) + energyRegenerated, 
            maxEnergy
        );
        
        // Retorna los datos sin actualizar lastEnergyUpdate para evitar ciclos
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
            
            // Ensure energy doesn't go below 0
            if (resource === 'energy' && newBalances.energy < 0) {
                newBalances.energy = 0;
            }
            
            // Actualizar la última fecha de actualización de energía solo si es energía
            const updatedData = { ...prevData, balances: newBalances };
            if (resource === 'energy') {
                updatedData.lastEnergyUpdate = new Date().toISOString();
            }
            
            return updatedData;
        });
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
    }, []);

    // Earn experience function
    const earnExperience = useCallback((activity, amount) => {
        const expEarned = amount || 10; // Default to 10 XP if no amount specified
        
        setUserData(prevData => {
            if (!prevData) return prevData;
            
            const currentLevelInfo = prevData.levelInfo || {
                level: 1,
                xp: 0,
                xpInCurrentLevel: 0,
                xpNeededForNextLevel: 100,
                progressPercentage: 0
            };
            
            const newXp = currentLevelInfo.xp + expEarned;
            const newXpInCurrentLevel = currentLevelInfo.xpInCurrentLevel + expEarned;
            const newXpNeededForNextLevel = currentLevelInfo.xpNeededForNextLevel;
            
            let newLevel = currentLevelInfo.level;
            let finalXpInCurrentLevel = newXpInCurrentLevel;
            let finalXpNeededForNextLevel = newXpNeededForNextLevel;
            
            // Check if leveled up
            if (finalXpInCurrentLevel >= newXpNeededForNextLevel) {
                newLevel += 1;
                finalXpInCurrentLevel = finalXpInCurrentLevel - newXpNeededForNextLevel;
                // Calculate new XP needed for next level based on new level
                finalXpNeededForNextLevel = Math.floor(100 * Math.pow(newLevel, 1.5)); // Using the formula from getExpForLevel
            }
            
            // Calculate progress percentage
            const progressPercentage = finalXpNeededForNextLevel > 0 ? (finalXpInCurrentLevel / finalXpNeededForNextLevel) * 100 : 0;
            
            const newLevelInfo = {
                ...currentLevelInfo,
                level: newLevel,
                xp: newXp,
                xpInCurrentLevel: finalXpInCurrentLevel,
                xpNeededForNextLevel: finalXpNeededForNextLevel,
                progressPercentage: progressPercentage
            };
            
            // Update max energy if level changed
            const updatedData = { ...prevData, levelInfo: newLevelInfo };
            if (newLevel !== currentLevelInfo.level) {
                updatedData.balances = {
                    ...updatedData.balances,
                    level: newLevel,
                    maxEnergy: 100 + (newLevel * 10)
                };
            }
            
            return updatedData;
        });
        
        return expEarned;
    }, []);

    // Refresh user data function
    const refreshUserData = useCallback(async () => {
        setHasLoaded(false); // Reset the loaded flag to allow reload
        await loadUserData();
    }, [loadUserData]);

    // Load user data on mount - only once
    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    // Provide context values
    const value = {
        userData,
        loading,
        updateBalance,
        earnExperience,
        refreshUserData
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