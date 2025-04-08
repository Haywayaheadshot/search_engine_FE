const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  const debouncedFunc = function executedFunction(...args) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };

  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
  };

  return debouncedFunc;
};

export default debounce;
