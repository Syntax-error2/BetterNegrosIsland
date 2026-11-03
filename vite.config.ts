import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import portal from './portal.config.ts';
import { DEFAULT_API, shortNameOf } from './src/config.ts';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The portal's name and description in the HTML itself, for link previews and search engines. */
function portalHtml(api: string, siteUrl?: string): Plugin {
  const title = `${portal.name} · FY 2027 budget projects`;
  const description = `Published FY 2027 project records associated with ${shortNameOf(portal)} in the NEP and the House bill (House Bill 10858), with the source page for each, and the enacted budgets 2020–2026. Data from the BetterGov.ph Budget API.`;
  const url = siteUrl
    ? `<link rel="canonical" href="${escape(siteUrl)}" />\n    <meta property="og:url" content="${escape(siteUrl)}" />`
    : '';
  return {
    name: 'portal-html',
    transformIndexHtml: (html) =>
      html
        .replaceAll('%PORTAL_SHARE_IMAGE%', escape(siteUrl ? new URL('/brand/bni-regional-wordmark.png', siteUrl).href : '/brand/bni-regional-wordmark.png'))
        .replaceAll('%PORTAL_TITLE%', escape(title))
        .replaceAll('%PORTAL_NAME%', escape(portal.name))
        .replaceAll('%PORTAL_DESCRIPTION%', escape(description))
        .replaceAll('%PORTAL_API%', escape(api))
        .replaceAll('%PORTAL_URL_META%', url),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const api = (env.VITE_API_BASE || portal.api || DEFAULT_API).replace(/\/+$/, '');
  const siteUrl=env.VITE_SITE_URL||portal.siteUrl;
  if(siteUrl){const u=new URL(siteUrl);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('VITE_SITE_URL must be the HTTPS site origin, without credentials, a path, query or fragment.');}
  return {
    plugins: [react(), portalHtml(api,siteUrl)],
    server: {
      host: '0.0.0.0',
      // Reserved in ~/projects/ports.md (transparency-portal). strictPort so a
      // collision fails loudly instead of moving the URL.
      port: 5132,
      strictPort: true,
      allowedHosts: ['dev.neonplayground.com'],
    },
    preview: { host: '0.0.0.0', port: 5132, strictPort: true },
  };
});
