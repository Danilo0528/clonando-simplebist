'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const StatsContext = createContext();

// Calculate level based on experience points
const calculateLevelFromExp = (expPoints) => {
  let level = 0;
  let expRequired = 100; // Starting requirement for level 1
  let totalExpConsumed = 0;

  while (totalExpConsumed + expRequired <= expPoints) {
    totalExpConsumed += expRequired;
    level++;
    expRequired += 10; // Increase requirement by 10 for each level
  }

  // Calculate progress to next level
  const expForCurrentLevel = expPoints - totalExpConsumed;
  const expForNextLevel = expRequired;

  return {
    level,
    expForCurrentLevel,
    expForNextLevel,
    progressPercentage: expForNextLevel > 0 ? Math.min(100, Math.round((expForCurrentLevel / expForNextLevel) * 100)) : 100
  };
};

// Mock data for demonstration purposes
const mockUserData = {
  username: 'Kirito0528',
  isLoggedIn: true,
  balances: {
    simplebits: 3984.63,
    energy: 85,
    experience: 1250, // Current experience points
    ...calculateLevelFromExp(1250), // Calculate level and progress from experience
  },
  profile: {
    avatarInitials: 'KI',
  }
};

export const StatsProvider = ({ children }) => {
  const [userData, setUserData] = useState(mockUserData);
  const [loading, setLoading] = useState(true);

  // Simulate fetching user data from an API
  useEffect(() => {
    const fetchUserData = async () => {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      setUserData(prev => ({
        ...prev,
        balances: {
          ...prev.balances,
          simplebits: prev.balances.simplebits + Math.random() * 10, // Simulate slight balance changes
        }
      }));

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    // In a real app, this would be an API call to authenticate
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    setUserData({
      username: credentials.username || 'DemoUser',
      isLoggedIn: true,
      balances: {
        simplebits: 3984.63,
        energy: 85,
        experience: 1250, // Current experience points
        ...calculateLevelFromExp(1250), // Calculate level and progress from experience
      },
      profile: {
        avatarInitials: credentials.username?.substring(0, 2).toUpperCase() || 'DU',
      }
    });

    setLoading(false);
    return true;
  };

  const logout = async () => {
    setLoading(true);
    // In a real app, this would be an API call to invalidate the session
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    setUserData({
      username: '',
      isLoggedIn: false,
      balances: {
        simplebits: 0,
        energy: 0,
        level: 'Guest',
        levelProgress: 0,
      },
      profile: {
        avatarInitials: 'GU',
      }
    });

    setLoading(false);
  };

  const updateBalance = (tokenType, amount) => {
    setUserData(prev => ({
      ...prev,
      balances: {
        ...prev.balances,
        [tokenType]: prev.balances[tokenType] + amount
      }
    }));
  };

  const addExperience = (points) => {
    setUserData(prev => {
      const newExp = prev.balances.experience + points;
      const levelInfo = calculateLevelFromExp(newExp);

      return {
        ...prev,
        balances: {
          ...prev.balances,
          experience: newExp,
          level: levelInfo.level,
          expForCurrentLevel: levelInfo.expForCurrentLevel,
          expForNextLevel: levelInfo.expForNextLevel,
          progressPercentage: levelInfo.progressPercentage
        }
      };
    });
  };

  const earnExperience = (activity, amount = 1) => {
    let expPoints = 0;

    switch(activity) {
      case 'faucet':
        expPoints = 10; // 10 points for faucet claim
        break;
      case 'ptc':
        expPoints = 5; // 5 points for PTC
        break;
      case 'shortlink':
        expPoints = 7; // 7 points for shortlink
        break;
      case 'mining':
        // For mining, experience is proportional to energy spent
        expPoints = amount * 1.5; // 1.5 EXP per energy unit spent
        break;
      case 'energy_spent':
        // Direct energy spending gives experience
        expPoints = amount * 1.2; // 1.2 EXP per energy unit
        break;
      default:
        expPoints = 0;
    }

    addExperience(expPoints);
    return expPoints;
  };

  // Energy regeneration system
  useEffect(() => {
    if (!loading && userData.isLoggedIn) {
      const interval = setInterval(() => {
        setUserData(prev => {
          // Regenerate 1 energy every 5 seconds (adjust as needed)
          const newEnergy = Math.min(prev.balances.energy + 1, 100); // Max 100 energy
          return {
            ...prev,
            balances: {
              ...prev.balances,
              energy: newEnergy
            }
          };
        });
      }, 5000); // Every 5 seconds

      return () => clearInterval(interval);
    }
  }, [loading, userData.isLoggedIn]);

  const updateUserStats = (newStats) => {
    setUserData(prev => {
        const newExp = newStats.newXP ?? prev.balances.experience;
        const levelInfo = calculateLevelFromExp(newExp);

        return {
            ...prev,
            balances: {
                ...prev.balances,
                energy: newStats.newEnergy ?? prev.balances.energy,
                experience: newExp,
                level: newStats.newLevel ?? levelInfo.level,
                expForCurrentLevel: levelInfo.expForCurrentLevel,
                expForNextLevel: levelInfo.expForNextLevel,
                progressPercentage: levelInfo.progressPercentage
            }
        };
    });
  };

  const claimFaucet = async () => {
    // In a real app, this would be an API call to the faucet endpoint
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Generate random reward between 5-15 coins
    const faucetReward = 5 + Math.random() * 10;

    // Add energy as well (faucet typically gives some energy too)
    const energyReward = 5 + Math.random() * 10;

    // Earn experience for claiming faucet
    const expReward = 10; // Standard faucet XP

    setUserData(prev => {
      const newExp = prev.balances.experience + expReward;
      const levelInfo = calculateLevelFromExp(newExp);

      return {
        ...prev,
        balances: {
          ...prev.balances,
          simplebits: prev.balances.simplebits + faucetReward,
          energy: Math.min(prev.balances.energy + energyReward, 100), // Cap at max energy
          experience: newExp,
          level: levelInfo.level,
          expForCurrentLevel: levelInfo.expForCurrentLevel,
          expForNextLevel: levelInfo.expForNextLevel,
          progressPercentage: levelInfo.progressPercentage
        }
      };
    });

    return { reward: faucetReward, energyAdded: energyReward, expGained: expReward };
  };

  const value = {
    userData,
    loading,
    login,
    logout,
    updateBalance,
    addExperience,
    earnExperience,
    updateUserStats,
    claimFaucet
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};