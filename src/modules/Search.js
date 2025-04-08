import debounce from '../utils/debounce';
import { postQueryEndpoint, updateQueryEndPoint } from '../lib/api/endPoints';
import getUserIp from '../services/ipService';
import { shouldSearch, endsWithFillerWord } from './Functions';

let userIp = null;

(async function initializeIp() {
  userIp = await getUserIp();
}());

const createSearch = (config) => {
  const {
    inputSelector, analyticsSelector, minQueryLength, debounceTime, onSearchSuccess = () => {},
  } = config;

  let searchInput;
  let analyticsContainer;
  let currentController = null;
  let lastQuery = '';
  let isSearching = false;
  let loadingIndicator;
  let searchSessionId = null;

  const abortCurrentRequest = () => {
    if (currentController) {
      currentController.abort();
      currentController = null;
    }
  };

  const postQuery = async (signal, apiEndpoint) => {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const updateSearchQuery = async (apiEndpoint, query) => {
    const url = `${apiEndpoint()}?q=${query}&ip=${userIp}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const showNotification = (type, message) => {
    const notificationContainer = document.getElementById('notifications');
    const successContainer = document.querySelector('.success-notification');
    const errorContainer = document.querySelector('.error-notification');

    if (type === 'success') {
      successContainer.innerText = message;
      successContainer.style.display = 'block';
      errorContainer.style.display = 'none';
    } else {
      errorContainer.innerText = message;
      errorContainer.style.display = 'block';
      successContainer.style.display = 'none';
    }

    notificationContainer.style.display = 'flex';

    setTimeout(() => {
      notificationContainer.style.display = 'none';
      successContainer.innerText = '';
      errorContainer.innerText = '';
    }, 5000);
  };

  const handleInput = async (event) => {
    const query = event.target.value.trim();
    if (!shouldSearch(query, minQueryLength, lastQuery, isSearching)) return;
    if (endsWithFillerWord(query)) return;

    lastQuery = query;

    if (!userIp) {
      userIp = await getUserIp();
    }

    try {
      isSearching = true;
      loadingIndicator.style.display = 'block';
      abortCurrentRequest();
      currentController = new AbortController();

      const endpoint = postQueryEndpoint(query, userIp);
      const results = await postQuery(currentController.signal, endpoint);

      if (results.status === 200) {
        const msg = results.message || 'Search recorded successfully.';
        showNotification('success', msg);
        searchSessionId = results.searchId;
        onSearchSuccess();
      }
    } catch (error) {
      const msg = error.message || 'Something went wrong. Please try again.';
      showNotification('error', msg);
    } finally {
      isSearching = false;
      loadingIndicator.style.display = 'none';
      currentController = null;
    }
  };

  const postQueryLogic = async (query) => {
    if (!userIp) {
      userIp = await getUserIp();
    }

    try {
      isSearching = true;
      loadingIndicator.style.display = 'block';
      abortCurrentRequest();
      currentController = new AbortController();

      let results = {};

      if (searchSessionId && query.startsWith(lastQuery)) {
        results = await updateSearchQuery(updateQueryEndPoint, query);
      } else {
        const endpoint = postQueryEndpoint(query, userIp);
        results = await postQuery(currentController.signal, endpoint);
      }

      if (results.status === 200) {
        const msg = results.message || 'Search recorded successfully.';
        showNotification('success', msg);
        searchSessionId = results.searchId;
        onSearchSuccess();
      }
    } catch (error) {
      const msg = error.message || 'Something went wrong. Please try again.';
      showNotification('error', msg);
    } finally {
      isSearching = false;
      loadingIndicator.style.display = 'none';
      currentController = null;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      searchInput.value = '';
      abortCurrentRequest();
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const query = searchInput.value.trim();

      if (query && !endsWithFillerWord(query) && query !== lastQuery) {
        if (query.startsWith(lastQuery)) {
          updateSearchQuery(updateQueryEndPoint, query)
            .then((result) => {
              if (result.status === 200) {
                const msg = result.message || 'Search query updated successfully.';
                showNotification('success', msg);
                searchSessionId = result.searchId;
                onSearchSuccess();
              }
            })
            .catch((error) => {
              const msg = error.message || 'Something went wrong. Please try again.';
              showNotification('error', msg);
            });
          return;
        }
        postQueryLogic(query);
      }
    }
  };

  const cacheDOM = () => {
    searchInput = document.querySelector(inputSelector);
    analyticsContainer = document.querySelector(analyticsSelector);
    loadingIndicator = document.getElementById('loading-indicator');

    if (!searchInput || !analyticsContainer || !loadingIndicator) {
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
