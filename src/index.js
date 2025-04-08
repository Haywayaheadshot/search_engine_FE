import './styles/main.css';
import createSearch from './modules/Search';
import createAnalytics from './modules/Analytics';

const analyticsModule = createAnalytics({
  analyticsSelector: '#analytics-list',
  buttonSelector: '#fetch-analytics-button',
});

const searchModule = createSearch({
  inputSelector: '#search-input',
  analyticsSelector: '#analytics-container',
  minQueryLength: 3,
  debounceTime: 3000,
  onSearchSuccess: () => analyticsModule.refresh(),
});

searchModule.init();
analyticsModule.init();
