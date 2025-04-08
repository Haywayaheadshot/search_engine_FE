export const API_BASE = 'http://localhost:3000/api/v1';
export const SEARCH_ENDPOINT = `${API_BASE}/search`;

export const postQueryEndpoint = (query, ip) =>
  `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&ip=${encodeURIComponent(ip)}`;

export const getAnalyticsEndpoint = `${SEARCH_ENDPOINT}`;
