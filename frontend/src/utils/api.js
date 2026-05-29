// Dynamic API client using standard fetch
const BASE_URL = "https://team-task-manager-production-1eae.up.railway.app"; // Proxied in Vite to http://localhost:5000 in dev

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  patch: (url, body) => request('PATCH', url, body),
  delete: (url) => request('DELETE', url)
};

async function request(method, url, body = null) {
  const token = localStorage.getItem('aether_jwt_token');
  
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Auto logout on token expiration/invalidation
      if (response.status === 401 && !url.includes('/api/auth/login')) {
        localStorage.removeItem('aether_jwt_token');
        window.dispatchEvent(new Event('auth-logout'));
      }
      
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${method} ${url}:`, error);
    throw error;
  }
}
