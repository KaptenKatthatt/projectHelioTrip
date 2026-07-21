import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const API_PORT = process.env.API_PORT ?? '3001';
const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');

export const normalizeHostUrl = (raw: string | undefined): string => {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return '';
  const noTrailingSlash = trimTrailingSlash(trimmed);
  return noTrailingSlash.startsWith('http')
    ? noTrailingSlash
    : `https://${noTrailingSlash}`;
};

const resolveHostProviderOrigin = (): string => {
  const vercelProduction = normalizeHostUrl(
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );
  if (vercelProduction) return vercelProduction;

  const cloudflare = normalizeHostUrl(process.env.CF_PAGES_URL);
  if (cloudflare) return cloudflare;

  const vercelPreview = normalizeHostUrl(process.env.VERCEL_URL);
  if (vercelPreview) return vercelPreview;

  if (process.env.NETLIFY === 'true') {
    const netlifyRaw =
      process.env.DEPLOY_PRIME_URL?.trim() || process.env.URL?.trim();
    const netlify = normalizeHostUrl(netlifyRaw);
    if (netlify) return netlify;
  }

  return '';
};

/** Open Graph / Twitter require absolute image URLs; Facebook rejects root-relative paths. */
export function resolvePublicSiteOrigin(
  mode: string,
  env: Record<string, string>,
): string {
  const explicit = (
    env.VITE_PUBLIC_SITE_URL ??
    process.env.VITE_PUBLIC_SITE_URL ??
    ''
  ).trim();
  if (explicit) return trimTrailingSlash(explicit);

  const providerOrigin = resolveHostProviderOrigin();
  if (providerOrigin) return providerOrigin;

  const localFallbackOrigin = trimTrailingSlash(
    (
      env.VITE_LOCAL_SITE_URL ??
      process.env.VITE_LOCAL_SITE_URL ??
      'http://localhost:5173'
    ).trim(),
  );
  const hasCustomLocalFallback =
    Boolean((env.VITE_LOCAL_SITE_URL ?? '').trim()) ||
    Boolean((process.env.VITE_LOCAL_SITE_URL ?? '').trim());
  const isCiBuild = process.env.CI === 'true';
  if (mode === 'production') {
    if (isCiBuild) {
      throw new Error(
        'Absolute site URL is required for og:image (Facebook / X). Set VITE_PUBLIC_SITE_URL in .env to your origin without a trailing slash (e.g. https://heliotrip.example.com), or build on a host that sets VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL (Vercel), CF_PAGES_URL, or Netlify URL vars. See .env.example.',
      );
    }
    const fallbackSource = hasCustomLocalFallback
      ? 'VITE_LOCAL_SITE_URL'
      : 'default local fallback';
    console.warn(
      `VITE_PUBLIC_SITE_URL is not set; falling back to ${localFallbackOrigin} (${fallbackSource}) for local production builds.`,
    );
    return localFallbackOrigin;
  }

  return '';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const publicSiteUrl = resolvePublicSiteOrigin(mode, env);
  const facebookAppId = (
    env.VITE_FACEBOOK_APP_ID ??
    process.env.VITE_FACEBOOK_APP_ID ??
    ''
  ).trim();
  const isValidFacebookAppId = /^\d+$/.test(facebookAppId);
  if (facebookAppId && !isValidFacebookAppId) {
    console.warn(
      'Ignoring VITE_FACEBOOK_APP_ID because it is not a numeric Facebook App ID.',
    );
  }
  const facebookAppIdMeta =
    facebookAppId && isValidFacebookAppId
      ? `<meta property="fb:app_id" content="${facebookAppId}" />`
      : '';

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-public-site-url',
        transformIndexHtml(html) {
          return html
            .replaceAll('__PUBLIC_SITE_URL__', publicSiteUrl)
            .replace('__FB_APP_ID_META__', facebookAppIdMeta);
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'HelioTrip',
          short_name: 'HelioTrip',
          description:
            'Fly through the solar system in first-person 3D. Edutainment for all ages: planets, moons, orbits, and constellations — UI in English and Swedish. Works on desktop and mobile.',
          id: '/',
          start_url: '/',
          display: 'standalone',
          orientation: 'any',
          theme_color: '#0b1020',
          background_color: '#0b1020',
          lang: 'en',
          categories: ['education'],
          icons: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache the app shell only; the heavy media (textures, GLB
          // models) is runtime-cached on first use instead. The admin chunk
          // is excluded too: it is dead weight for every non-admin install,
          // and the admin route needs the network anyway (Clerk + no-store
          // analytics API).
          globPatterns: [
            '**/*.{js,css,html,svg}',
            'pwa-*.png',
            'apple-touch-icon.png',
          ],
          globIgnores: [
            '**/node_modules/**',
            'International*/**',
            '**/AdminRoot-*.js',
          ],
          // vendor-three exceeds Workbox's 2MB precache default.
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin &&
                (url.pathname.startsWith('/textures/') ||
                  /\.(webp|png|jpg)$/.test(url.pathname)),
              handler: 'CacheFirst',
              options: {
                cacheName: 'heliotrip-textures',
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 30 * 24 * 3600,
                },
                // Same-origin only, so opaque responses (status 0) cannot occur.
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && url.pathname.endsWith('.glb'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'heliotrip-models',
                expiration: {
                  maxEntries: 12,
                  maxAgeSeconds: 30 * 24 * 3600,
                },
                cacheableResponse: { statuses: [200] },
              },
            },
            // No /api/ route on purpose: analytics stays network-only and
            // already degrades gracefully offline.
          ],
        },
      }),
    ],
    // No manualChunks: Rolldown's default chunking splits per async
    // boundary, which keeps lazy-only libraries (drei, postprocessing,
    // Clerk, recharts) out of the eager modulepreload graph. Named vendor
    // groups made Rolldown hoist shared helpers into them, dragging
    // ~240KB gzip of lazy-only code into every first load.
    build: {},
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${API_PORT}`,
          changeOrigin: true,
        },
      },
    },
  };
});
