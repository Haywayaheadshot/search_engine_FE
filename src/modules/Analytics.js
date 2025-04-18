import { getAnalyticsEndpoint } from '../lib/api/endPoints';
import getUserIp from '../services/ipService';

const getAnalytics = async (endpoint) => {
  const response = await fetch(endpoint, {
    method: 'GET',
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

const renderQuerySlice = (queries, start, end) => queries.slice(start, end).map((record) => `
    <li class="analytics-record">
      <p><strong>Query:</strong> ${record.query}</p>
      <p><strong>IP:</strong> ${record.ip}</p>
      <p><strong>Date:</strong> ${record.date}</p>
    </li>
  `).join('');

const renderAnalytics = (analytics, container) => {
  if (!analytics) {
    container.innerHTML = '<li class="no-analytics">No analytics available</li>';
    return;
  }

  const mostSearchedWordsTable = `
    <table class="analytics-table">
      <thead>
        <tr class="analytics-table-header-rows">
          <th>Word</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody class="scrollable-body">
        ${Object.entries(analytics.most_searched_words).map(([word, count]) => `
          <tr>
            <td>${word}</td>
            <td>${count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const mostSearchedQueriesTable = `
  <div class="analytics-table-wrapper">
    <table class="analytics-table">
      <thead>
        <tr class="analytics-table-header-rows">
          <th>Query</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody class="scrollable-body">
        ${Object.entries(analytics.most_searched_queries).map(([query, count]) => `
          <tr>
            <td>${query}</td>
            <td>${count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
`;

  container.innerHTML = `
    <div class="analytics-data-list">
      <section class="analytics-data-header">
        <h2>Your IP: ${analytics.ip}</h2>
        <span>Total Queries: <strong>${analytics.total_logs}</strong></span>
      </section>

      <section class="analytics-tables">
        <div>
          <h3>Most Searched Words</h3>
          ${mostSearchedWordsTable}
        </div>
        <div>
          <h3>Most Searched Queries</h3>
          ${mostSearchedQueriesTable}
        </div>
      </section>

      <section class="query-list-section">
        <h3>Query Log</h3>
        <ul id="query-list" class="query-list-data"></ul>
      </section>

      <section class="load-more-section">
        <button id="load-more-btn">Load More</button>
      </section>
    </div>
  `;

  const queryListEl = document.getElementById('query-list');
  const loadMoreBtn = document.getElementById('load-more-btn');

  let visibleCount = 0;
  const increment = 10;
  const total = analytics.queries.length;

  if (total <= increment) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-block';
  }

  const loadNextBatch = () => {
    const next = visibleCount + increment;
    const newHtml = renderQuerySlice(analytics.queries, visibleCount, next);
    queryListEl.insertAdjacentHTML('beforeend', newHtml);
    visibleCount = next;

    if (visibleCount >= total) {
      loadMoreBtn.style.display = 'none';
    }
  };

  loadMoreBtn.addEventListener('click', loadNextBatch);
  loadNextBatch();
};

export default function createAnalytics({ analyticsSelector, buttonSelector }) {
  const container = document.querySelector(analyticsSelector);
  const button = document.querySelector(buttonSelector);

  const fetchAndRender = async () => {
    try {
      const ip = await getUserIp();
      const url = `${getAnalyticsEndpoint()}?ip=${ip}`;
      const data = await getAnalytics(url);
      renderAnalytics(data, container);
    } catch (error) {
      container.innerHTML = '<li class="error">Failed to load analytics.</li>';
    }
  };

  const init = () => {
    if (!button) return;
    button.addEventListener('click', fetchAndRender);
  };

  return { init, refresh: fetchAndRender };
}
