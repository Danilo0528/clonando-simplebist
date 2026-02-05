'use client';

import { createContext, useContext, useState } from 'react';
import FaucetModal from '../components/faucet/FaucetModal';

// Crear el contexto
const FaucetModalContext = createContext();

// Proveedor del contexto
export const FaucetModalProvider = ({ children }) => {
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState(false);

  const openFaucetModal = () => {
    setIsFaucetModalOpen(true);
  };

  const closeFaucetModal = () => {
    setIsFaucetModalOpen(false);
  };

  return (
    <FaucetModalContext.Provider value={{ 
      isFaucetModalOpen, 
      openFaucetModal, 
      closeFaucetModal 
    }}>
      {children}
      <FaucetModal 
        isOpen={isFaucetModalOpen} 
        onClose={closeFaucetModal} 
      />
    </FaucetModalContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useFaucetModal = () => {
  const context = useContext(FaucetModalContext);
  if (!context) {
    throw new Error('useFaucetModal must be used within a FaucetModalProvider');
  }
  return context;
};