import axios from 'axios';
import { getToken } from './tokenManager';

// Configurar un interceptor para incluir el token en cada solicitud
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en el interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Agregar interceptor de respuesta para manejar 401 (token expirado)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar credenciales
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Token expired, cleaning up...');
          localStorage.removeItem('token');
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
          // Redirigir al login solo si no estamos ya allí
          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axios;