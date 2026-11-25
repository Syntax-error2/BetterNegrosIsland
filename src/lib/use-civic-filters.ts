import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const CIVIC_PAGE_SIZE = 15;

export function useCivicFilters(focusKey = 'id') {
  const [params, setParams] = useSearchParams();
  const [expanded, setExpanded] = useState({ query: '', limit: CIVIC_PAGE_SIZE });
  const query = params.toString();
  const limit = expanded.query === query ? expanded.limit : CIVIC_PAGE_SIZE;
  function change(name: string, value: string, clear: string[] = []) {
    const next = new URLSearchParams(params);
    next.delete(focusKey);
    for (const key of clear) next.delete(key);
    if (value) next.set(name, value);
    else next.delete(name);
    setExpanded({ query: next.toString(), limit: CIVIC_PAGE_SIZE });
    setParams(next, { replace: name === 'q' });
  }
  function reset() {
    setParams({});
    setExpanded({ query: '', limit: CIVIC_PAGE_SIZE });
  }
  return { params, change, reset, limit, more: () => setExpanded({ query, limit: limit + CIVIC_PAGE_SIZE }) };
}
