export const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const renderResults = (results, container) => {
  if (!results?.length) {
    container.innerHTML = '<li class="no-results">No articles found</li>';
    return;
  }
  container.innerHTML = results.map((result) => `
    <li class="result-item">
      <h3><a href="${result.url}" data-analytics="search-result">${result.title}</a></h3>
      <p>${result.excerpt}</p>
      <time datetime="${result.date}">${formatDate(result.date)}</time>
    </li>
  `).join('');
};


export const fillerWords = [
  'a', 'the', 'and', 'or', 'but',
  'is', 'to', 'in', 'of', 'for',
  'on', 'at', 'by', 'with', 'from',
  'as', 'if', 'then', 'how', 'why',
  'what', 'when'
];


export const endsWithFillerWord = (query) => {
  if (!query) return false;
  const words = query.trim().toLowerCase().split(/\s+/);
  const lastWord = words[words.length - 1];
  return fillerWords.includes(lastWord);
};

export const postQuery = async (query, signal, apiEndpoint) => {
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

export const getAnalytics = async (signal, analyticsEndpoint) => {
  const response = await fetch(analyticsEndpoint, {
    method: 'GET',
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const shouldSearch = (
  query, minLength, lastQuery, isFetching,
) => query.length >= minLength && query !== lastQuery && !isFetching;

export const displayError = (container, message) => {
  container.innerHTML = `<li class="error-message">${message}</li>`;
};

export const clearResultsDOM = (container) => {
  container.innerHTML = '';
};

