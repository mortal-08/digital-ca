// In production (Render), frontend is served by the backend on the same origin
// In development, the Vite dev server proxies or we use localhost:5001
const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5001';

export default API_BASE;
