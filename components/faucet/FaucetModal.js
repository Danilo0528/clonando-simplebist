'use client';

import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Faucet from './Faucet'; // Importar el componente Faucet

const FaucetModal = ({ isOpen, onClose }) => {
  // Manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevenir scroll del fondo
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset'; // Restaurar scroll
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro semitransparente */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Contenido del modal */}
      <div 
        className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        style={{ zIndex: 60 }}
      >
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Crypto Faucet
          </h2>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            aria-label="Cerrar"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Contenido del cuerpo */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-400 mb-4 text-center">
              Claim your free Bits every hour. The higher your level, the bigger the reward!
            </p>
          </div>
          
          {/* Aquí se renderiza el componente Faucet real */}
          <div className="faucet-content">
            <Faucet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaucetModal;