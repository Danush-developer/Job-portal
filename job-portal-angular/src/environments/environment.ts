export const environment = {
  production: false,
  apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8080' 
    : 'https://job-portal-8pf3.onrender.com'
};
  