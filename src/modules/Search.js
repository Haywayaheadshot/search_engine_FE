import debounce from '../utils/debounce';
import { getSearchEndpoint } from '../lib/api/endPoints';
// import { trackSearch } from './Analytics';
import { fetchResults, renderResults, shouldSearch, displayError, clearResultsDOM } from './Functions';

const createSearch = (config) => {
  const {
    inputSelector = '#search-input',
    resultsSelector = '#results-list',
    minQueryLength = 3,
    debounceTime = 300,
  } = config;

  let searchInput;
  let resultsContainer;
  let currentController = null;
  let lastQuery = '';
  let isFetching = false;

  const init = () => {
    cacheDOM();
    setupEventListeners();
    return { destroy: cleanup };
  };

  const cacheDOM = () => {
    searchInput = document.querySelector(inputSelector);
    resultsContainer = document.querySelector(resultsSelector);
    if (!searchInput || !resultsContainer) {
      throw new Error('Required search elements not found');
    }
  };

  const setupEventListeners = () => {
    searchInput.addEventListener('input', debounce(handleInput, debounceTime));
    searchInput.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', abortCurrentRequest);
  };

  const handleInput = async (event) => {
    const query = event.target.value.trim();
    if (!shouldSearch(query, minQueryLength, lastQuery, isFetching)) return;
    
    lastQuery = query;
    // trackSearch(query);
    
    try {
        isFetching = true;
        abortCurrentRequest();
        currentController = new AbortController();
        const endpoint = getSearchEndpoint(query);
        const results = await fetchResults(query, currentController.signal, endpoint);
        renderResults(results, resultsContainer);
      } catch (error) {
        handleError(error);
      } finally {
        isFetching = false;
        currentController = null;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      searchInput.value = '';
      clearResults();
      abortCurrentRequest();
    }
  };

  const handleError = (error) => {
    if (error.name === 'AbortError') return;
    console.error('Search error:', error);
    displayError(resultsContainer, 'Failed to load results. Please try again later.');
  };

  const cleanup = () => {
    searchInput.removeEventListener('input', handleInput);
    searchInput.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('beforeunload', abortCurrentRequest);
    abortCurrentRequest();
  };

  const abortCurrentRequest = () => {
    if (currentController) {
      currentController.abort();
      currentController = null;
    }
  };

  const clearResults = () => {
    clearResultsDOM(resultsContainer);
    lastQuery = '';
  };

  return { init, performSearch: (query) => handleInput({ target: { value: query } }) };
};

export default createSearch;