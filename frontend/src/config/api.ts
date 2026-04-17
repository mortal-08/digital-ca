// Uses VITE_API_URL from Vercel env vars in production
// Falls back to localhost for local development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default API_BASE;
