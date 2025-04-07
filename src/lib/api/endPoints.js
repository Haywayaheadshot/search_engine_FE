// Base configuration
const API_BASE = 'http://localhost:3000/api/v1';

export const SEARCH_ENDPOINT = `${API_BASE}/search`;

export const getSearchEndpoint = (query) => `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&limit=10`;