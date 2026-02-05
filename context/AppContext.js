'use client';

import { StatsProvider } from './StatsContext';
import { FaucetModalProvider } from './FaucetModalContext';

// Componente que combina ambos proveedores de contexto
export const AppProvider = ({ children }) => {
  return (
    <StatsProvider>
      <FaucetModalProvider>
        {children}
      </FaucetModalProvider>
    </StatsProvider>
  );
};