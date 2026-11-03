export const SNAPSHOT_VERSION = /^\d{4}-\d{2}-\d{2}-[a-f0-9]{12,64}$/;
export function snapshotSelection(pathname: string) {
  const match = /^\/snapshots\/([^/]+)(?=\/|$)/.exec(pathname);
  if (!match) return { base: '', version: null as string | null, invalid: false };
  const version = match[1];
  return { base: '/snapshots/' + version, version, invalid: !SNAPSHOT_VERSION.test(version) };
}
export const currentSnapshot = () => snapshotSelection(typeof window === 'undefined' ? '/' : window.location.pathname);
export function snapshotPath(path: string, version: string): string {
  if (!SNAPSHOT_VERSION.test(version) || !path.startsWith('/') || path.startsWith('//') || /[\\\r\n]/.test(path)) throw Error('Invalid snapshot link');
  return '/snapshots/' + version + (path === '/' ? '/' : path);
}
export function selectedPath(path: string): string {
  const selected = currentSnapshot();
  return selected.version && !selected.invalid ? snapshotPath(path, selected.version) : path;
}
