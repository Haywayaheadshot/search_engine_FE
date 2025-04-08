const API_BASE = 'https://searchenginebe-production.up.railway.app/api/v1';

const SEARCH_ENDPOINT = `${API_BASE}/search`;
const ANALYTICS_ENDPOINT = `${API_BASE}/analytics`;

export const postQueryEndpoint = (query, ip) => `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&ip=${encodeURIComponent(ip)}`;

export const getAnalyticsEndpoint = () => `${ANALYTICS_ENDPOINT}`;

export const updateQueryEndPoint = () => `${ANALYTICS_ENDPOINT}/update`;
