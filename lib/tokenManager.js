// Token management utility to handle both localStorage and cookies consistently

// Get token from localStorage (primary) or cookies (fallback)
export const getToken = () => {
  if (typeof window === 'undefined') {
    console.log('getWindow es undefined, retornando null');
    return null;
  }
  
  // First try to get from localStorage
  let token = localStorage.getItem('token');
  console.log('Token desde localStorage:', token ? 'encontrado' : 'no encontrado');
  
  // If not in localStorage, try to get from cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    console.log('Cookies encontradas:', cookies.length);
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        token = value;
        console.log('Token encontrado en cookies, guardando en localStorage');
        // If found in cookies but not in localStorage, also save to localStorage
        localStorage.setItem('token', token);
        break;
      }
    }
  }
  
  console.log('getToken final:', token ? 'encontrado' : 'no encontrado');
  return token;
};

// Set token in both localStorage and cookies
export const setToken = (token) => {
  if (typeof window === 'undefined') return;
  
  // Save to localStorage
  localStorage.setItem('token', token);
  
  // Also save to cookie for backend compatibility
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
};

// Remove token from both localStorage and cookies
export const removeToken = () => {
  if (typeof window === 'undefined') return;
  
  // Remove from localStorage
  localStorage.removeItem('token');
  
  // Remove from cookies
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};