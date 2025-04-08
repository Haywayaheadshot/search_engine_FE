import './styles/main.css';
import createSearch from './modules/Search';
import createAnalytics from './modules/Analytics';

const searchModule = createSearch({
  inputSelector: '#search-input',
  analyticsSelector: '#analytics-container',
  minQueryLength: 3,
  debounceTime: 3000,
  onSearchSuccess: () => analyticsModule.refresh(),
});

const analyticsModule = createAnalytics({
  analyticsSelector: '#analytics-list',
  buttonSelector: '#fetch-analytics-button',
});

searchModule.init();
analyticsModule.init();
