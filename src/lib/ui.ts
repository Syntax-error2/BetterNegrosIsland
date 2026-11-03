/** URL and form helpers shared by browser pages and regression tests. */
/** Observe failures immediately, even if React discards the render before effects subscribe. */
export function observePromise<T>(promise: Promise<T>): Promise<T> {
  void promise.catch(() => {});
  return promise;
}
export function fragmentId(hash: string): string {
  try { return decodeURIComponent(hash.replace(/^#/, '')); } catch { return ''; }
}
export const PROJECT_FILTERS = ['q','program','status','why','office','min','max','lgu','sort','province','stage'] as const;
export function clearProjectFilters(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  PROJECT_FILTERS.forEach(key => next.delete(key));
  return next;
}
export function fundingError(min: string, max: string): string {
  if ([min,max].some(v => v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0))) return 'Enter a valid, non-negative peso amount.';
  if (min !== '' && max !== '' && Number(min) > Number(max)) return 'Minimum pesos must not exceed maximum pesos.';
  return '';
}
export function publicError(error: Error): string {
  if (/404|not found/i.test(error.message)) return 'This record is unavailable in the current source. Return to the project list to find another record.';
  if (/timeout|abort/i.test(error.message + error.name)) return 'The source is taking longer than expected. Please try again.';
  return 'We could not retrieve a complete response from the budget source. Please check your connection and try again. No estimated figures are shown.';
}
