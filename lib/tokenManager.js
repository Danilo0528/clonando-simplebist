// Token management utility to handle both localStorage and cookies consistently

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  
  let token = localStorage.getItem('token');
  
  if (!token) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        token = value;
        localStorage.setItem('token', token);
        break;
      }
    }
  }
  
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