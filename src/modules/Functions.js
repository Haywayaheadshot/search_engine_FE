export const endsWithFillerWord = (query) => {
  const fillerWords = [
    'a', 'the', 'and', 'or', 'but',
    'is', 'to', 'in', 'of', 'for',
    'on', 'at', 'by', 'with', 'from',
    'as', 'if', 'then', 'how', 'why',
    'what', 'when',
  ];

  if (!query) return false;
  const words = query.trim().toLowerCase().split(/\s+/);
  const lastWord = words[words.length - 1];
  return fillerWords.includes(lastWord);
};

export const shouldSearch = (query, minQueryLength, lastQuery, isSearching) => {
  if (query.length < minQueryLength) return false;
  if (isSearching) return false;
  if (lastQuery && query.startsWith(lastQuery) && query.length > lastQuery.length) {
    return false;
  }
  return true;
};
