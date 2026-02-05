import axios from 'axios';
import { getToken } from './tokenManager';

// Configurar un interceptor para incluir el token en cada solicitud
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log('Interceptando solicitud, token encontrado:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token agregado a la cabecera de autorización');
    } else {
      console.log('No se encontró token para agregar a la solicitud');
    }
    return config;
  },
  (error) => {
    console.error('Error en el interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Agregar interceptor de respuesta para ver qué está pasando
axios.interceptors.response.use(
  (response) => {
    // Loggear solo para solicitudes específicas si es necesario
    if (response.config.url.includes('/api/auth/me')) {
      console.log('Respuesta exitosa de /api/auth/me');
    }
    return response;
  },
  (error) => {
    if (error.config?.url?.includes('/api/auth/me')) {
      console.log('Error en la solicitud a /api/auth/me:', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default axios;