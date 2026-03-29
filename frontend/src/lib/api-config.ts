// Dynamically determine API URL based on environment
export const getApiUrl = (): string => {
  // Check if we have an environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl && envUrl !== 'http://localhost:5000/api') {
    return envUrl;
  }

  // If running on localhost, use it
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  // For network access, use the current hostname with port 5000
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = 5000;
  
  return `${protocol}//${hostname}:${port}/api`;
};

export const API_BASE_URL = getApiUrl();

console.log('API URL:', API_BASE_URL);
