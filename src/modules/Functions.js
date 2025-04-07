export const fetchResults = async (query, signal, apiEndpoint) => {
  const response = await fetch(apiEndpoint, {
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const renderResults = (results, container) => {
  if (!results?.length) {
    container.innerHTML = '<li class="no-results">No articles found</li>';
    return;
  }
  container.innerHTML = results.map(result => `
    <li class="result-item">
      <h3><a href="${result.url}" data-analytics="search-result">${result.title}</a></h3>
      <p>${result.excerpt}</p>
      <time datetime="${result.date}">${formatDate(result.date)}</time>
    </li>
  `).join('');
};

export const shouldSearch = (query, minLength, lastQuery, isFetching) => {
  return query.length >= minLength && query !== lastQuery && !isFetching;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const displayError = (container, message) => {
  container.innerHTML = `<li class="error-message">${message}</li>`;
};

export const clearResultsDOM = (container) => {
  container.innerHTML = '';
};
