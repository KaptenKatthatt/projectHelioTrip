import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_PORT = process.env.API_PORT ?? '3001';

const normalizeHostUrl = (raw: string | undefined): string => {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return '';
  const noTrailingSlash = trimmed.replace(/\/$/, '');
  return noTrailingSlash.startsWith('http')
    ? noTrailingSlash
    : `https://${noTrailingSlash}`;
};

/** Open Graph / Twitter require absolute image URLs; Facebook rejects root-relative paths. */
function resolvePublicSiteOrigin(
  mode: string,
  env: Record<string, string>,
): string {
  const explicit = (
    env.VITE_PUBLIC_SITE_URL ??
    process.env.VITE_PUBLIC_SITE_URL ??
    ''
  ).replace(/\/$/, '');
  if (explicit) return explicit;

  // Stable production hostname (no scheme); set on all Vercel builds — good for og:image URLs.
  const vercelProduction = normalizeHostUrl(
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );
  if (vercelProduction) {
    return vercelProduction;
  }

  const cf = process.env.CF_PAGES_URL?.trim();
  if (cf) return cf.replace(/\/$/, '');

  const vercel = normalizeHostUrl(process.env.VERCEL_URL);
  if (vercel) {
    return vercel;
  }

  if (process.env.NETLIFY === 'true') {
    const netlify =
      process.env.DEPLOY_PRIME_URL?.trim() || process.env.URL?.trim();
    if (netlify) return netlify.replace(/\/$/, '');
  }

  if (mode === 'production') {
    throw new Error(
      'Absolute site URL is required for og:image (Facebook / X). Set VITE_PUBLIC_SITE_URL in .env to your origin without a trailing slash (e.g. https://heliotrip.example.com), or build on a host that sets VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL (Vercel), CF_PAGES_URL, or Netlify URL vars. See .env.example.',
    );
  }

  return '';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const publicSiteUrl = resolvePublicSiteOrigin(mode, env);

  return {
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'html-public-site-url',
      transformIndexHtml(html) {
        return html.replaceAll('__PUBLIC_SITE_URL__', publicSiteUrl);
      },
    },
  ],
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('/three/')) {
            return 'vendor-three';
          }

          if (id.includes('@react-three/fiber')) {
            return 'vendor-r3f';
          }

          if (id.includes('/three-stdlib/')) {
            return 'vendor-stdlib';
          }

          if (id.includes('@react-three/drei')) {
            if (id.includes('/core/')) {
              if (id.includes('/Stars')) return 'vendor-drei-stars';
              if (
                id.includes('/OrbitControls') ||
                id.includes('/PointerLockControls')
              ) {
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
            if (id.includes('/web/')) {
              return 'vendor-drei-web';
            }
            if (id.includes('/helpers/')) {
              return 'vendor-drei-helpers';
            }
            if (id.includes('/materials/')) {
              return 'vendor-drei-materials';
            }
            return 'vendor-drei-misc';
          }

          if (
            id.includes('@react-three/postprocessing') ||
            id.includes('/postprocessing/')
          ) {
            return 'vendor-postfx';
          }

          if (id.includes('@react-spring/three')) {
            return 'vendor-spring3d';
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/zustand/')
          ) {
            return 'vendor-react';
          }

          if (id.includes('/lucide-react/')) {
            return 'vendor-ui';
          }

          return 'vendor-misc';
        },
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
