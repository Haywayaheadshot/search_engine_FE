import debounce from '../utils/debounce';
import { postQueryEndpoint } from '../lib/api/endPoints';
import { getUserIp } from '../services/ipService';
// import { trackSearch } from './Analytics';
import {
  postQuery,
  renderResults,
  shouldSearch,
  displayError,
  clearResultsDOM,
  endsWithFillerWord,
} from './Functions';

let userIp = null;

(async function initializeIp() {
  userIp = await getUserIp();
})();

const createSearch = (config) => {
  const {
    inputSelector = '#search-input',
    resultsSelector = '#results-list',
    minQueryLength = 3,
    debounceTime = 5000,
  } = config;

  let searchInput;
  let resultsContainer;
  let currentController = null;
  let lastQuery = '';
  let isFetching = false;

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

  const handleError = (error) => {
    if (error.name === 'AbortError') return;
    displayError(resultsContainer, 'Failed to load results. Please try again later.');
  };

  const handleInput = async (event) => {
    const query = event.target.value.trim();
    if (!shouldSearch(query, minQueryLength, lastQuery, isFetching)) return;
    if (endsWithFillerWord(query)) {
      return;
    }

    lastQuery = query;
    // trackSearch(query);
    if (!userIp) {
      userIp = await getUserIp();
    }

    try {
      isFetching = true;
      abortCurrentRequest();
      currentController = new AbortController();

      const endpoint = postQueryEndpoint(query, userIp);
      const results = await postQuery(query, currentController.signal, endpoint);

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

  const cleanup = () => {
    searchInput.removeEventListener('input', handleInput);
    searchInput.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('beforeunload', abortCurrentRequest);
    abortCurrentRequest();
  };

  const init = () => {
    cacheDOM();
    setupEventListeners();
    return { destroy: cleanup };
  };

  return {
    init,
    performSearch: (query) => handleInput({ target: { value: query } }),
  };
};

export default createSearch;
