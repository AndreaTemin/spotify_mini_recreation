import axios from 'axios';

const api = axios.create({
  // We use localhost:8000 because our React app (in its container)
  // is accessing the backend via the port mapped to the *host* machine.
  baseURL: 'http://localhost:8000',
});

// We'll add an interceptor here later to automatically add
// our JWT token to every request.

export default api;