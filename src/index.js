import './styles/main.css';
import createSearch from './modules/Search';

const searchModule = createSearch({
  inputSelector: '#search-input',
  resultsSelector: '#results-list',
  minQueryLength: 3,
  debounceTime: 300,
});

searchModule.init();
