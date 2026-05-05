import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_PORT = process.env.API_PORT ?? '3001';
const NODE_MODULES_SEGMENT = 'node_modules';
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

export const resolveDreiChunk = (id: string): string => {
  if (id.includes('/core/')) {
    if (id.includes('/Stars')) return 'vendor-drei-stars';
    if (id.includes('/OrbitControls') || id.includes('/PointerLockControls')) {
      return 'vendor-drei-controls';
    }
    if (id.includes('/Html') || id.includes('/Line')) {
      return 'vendor-drei-ui3d';
    }
    if (id.includes('/Texture') || id.includes('/useTexture')) {
      return 'vendor-drei-textures';
    }
    return 'vendor-drei-core';
  }
  if (id.includes('/web/')) return 'vendor-drei-web';
  if (id.includes('/helpers/')) return 'vendor-drei-helpers';
  if (id.includes('/materials/')) return 'vendor-drei-materials';
  return 'vendor-drei-misc';
};

export const resolveManualChunk = (id: string): string | undefined => {
  if (!id.includes(NODE_MODULES_SEGMENT)) return undefined;

  if (id.includes('@react-three/drei')) return resolveDreiChunk(id);

  const rules: Array<[(moduleId: string) => boolean, string]> = [
    [(moduleId) => moduleId.includes('/three/'), 'vendor-three'],
    [(moduleId) => moduleId.includes('@react-three/fiber'), 'vendor-r3f'],
    [(moduleId) => moduleId.includes('/three-stdlib/'), 'vendor-stdlib'],
    [
      (moduleId) =>
        moduleId.includes('@react-three/postprocessing') ||
        moduleId.includes('/postprocessing/'),
      'vendor-postfx',
    ],
    [(moduleId) => moduleId.includes('@react-spring/three'), 'vendor-spring3d'],
    [
      (moduleId) =>
        moduleId.includes('/react/') ||
        moduleId.includes('/react-dom/') ||
        moduleId.includes('/zustand/'),
      'vendor-react',
    ],
    [(moduleId) => moduleId.includes('/lucide-react/'), 'vendor-ui'],
  ];

  for (const [matches, chunk] of rules) {
    if (matches(id)) return chunk;
  }

  return 'vendor-misc';
};

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
    ],
    build: {
      rolldownOptions: {
        output: {
          manualChunks: resolveManualChunk,
        },
      },
    },
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
