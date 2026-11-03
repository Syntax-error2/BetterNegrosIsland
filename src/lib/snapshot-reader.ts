import type { Manifest } from './snapshot';
import { SNAPSHOT_VERSION } from './snapshot-selection';

export function validatePinnedManifest(value: unknown, version: string): Manifest {
  const m = value as Manifest;
  if (!m || m.version !== version || !SNAPSHOT_VERSION.test(version) || !Number.isFinite(Date.parse(m.retrieved_at))) throw Error('Snapshot manifest identity mismatch');
  for (const field of ['scope','overview','districts','history','nep','summary','coverage'] as const) {
    const url = `/data/snapshots/${version}/${field}.json`;
    if (m[field] !== url || !/^[a-f0-9]{64}$/.test(m.checksums?.[url] ?? '')) throw Error('Snapshot manifest has incomplete or unsafe references');
  }
  return m;
}

export function createSnapshotReader(version: string | null, fetcher: typeof fetch = (...args) => fetch(...args)) {
  const cache = new Map<string, Promise<unknown>>();
  const prefix = version ? '/data/snapshots/'+version : '';
  const manifestPath = version ? prefix+'/manifest.json' : '/data/manifest.json';
  function read<T>(input: string): Promise<T> {
    if (version && !SNAPSHOT_VERSION.test(version)) return Promise.reject(Error('Invalid requested snapshot'));
    if (!/^\/data\/[a-zA-Z0-9/_.-]+\.json$/.test(input) || input.split('/').some(p => p === '.' || p === '..')) return Promise.reject(Error('Invalid snapshot path'));
    if (version && /^\/data\/(hearings|update-history|refresh-status)\.json$/.test(input)) return Promise.reject(Error('This supporting index is not archived in the selected budget snapshot'));
    const url = input === '/data/manifest.json' ? manifestPath : input;
    if (version && url.startsWith('/data/snapshots/') && !url.startsWith(prefix+'/')) return Promise.reject(Error('Mixed snapshot request blocked'));
    if (version && !url.startsWith(prefix+'/') && url !== '/data/corrections.json') return Promise.reject(Error('Unarchived data request blocked'));
    let promise = cache.get(url);
    if (!promise) {
      promise = (async () => {
        const response = await fetcher(url, { signal: AbortSignal.timeout(20000), credentials:'omit', referrerPolicy:'no-referrer', cache: /\/(manifest|refresh-status|update-history|hearings|corrections)\.json$/.test(url) ? 'no-cache' : 'default' });
        if (!response.ok || !/\bapplication\/(?:[a-z0-9.-]+\+)?json\b/i.test(response.headers.get('content-type') ?? '')) throw Error('Snapshot unavailable or not JSON');
        const text = await response.text();
        if (version && url.startsWith(prefix+'/') && url !== manifestPath) {
          const manifest = await read<Manifest>('/data/manifest.json');
          const expected = manifest.checksums?.[url];
          if (!expected) throw Error('Unverified snapshot file');
          const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(v=>v.toString(16).padStart(2,'0')).join('');
          if (digest !== expected) throw Error('Snapshot checksum mismatch');
        }
        const result: unknown = JSON.parse(text);
        return version && url === manifestPath ? validatePinnedManifest(result,version) : result;
      })();
      promise.catch(() => cache.delete(url));
      cache.set(url,promise);
    }
    return promise as Promise<T>;
  }
  return read;
}
