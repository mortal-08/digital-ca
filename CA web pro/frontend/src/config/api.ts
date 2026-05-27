// Uses VITE_API_URL from Vercel env vars in production
// Falls back to localhost for local development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status === 401) {
    localStorage.removeItem('ca_user');
    window.location.href = '/login';
  }
  return res;
};

export default API_BASE;
