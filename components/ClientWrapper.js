'use client';

import { AppProvider } from '../context/AppContext';
import { Toaster } from 'react-hot-toast';

export default function ClientWrapper({ children }) {
  return (
    <AppProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
          },
        }}
      />
      {children}
    </AppProvider>
  );
}