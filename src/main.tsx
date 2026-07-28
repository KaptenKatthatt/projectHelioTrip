import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import { App } from './App';
import { lazyWithRecovery } from './lib/lazyImport';
import { initializeQuality } from './lib/quality/initializeQuality';
import { bindQualityPreference } from './lib/quality/bindQualityPreference';

registerSW({ immediate: true });

// Before React renders anything, so the scene never mounts at a level the
// machine cannot hold and then has to rebuild. The preference binding runs
// straight after, since a pinned level must win over the boot guess.
initializeQuality();
bindQualityPreference();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id="root" not found in index.html');
}

// Lazy so Clerk + recharts load only on the admin route.
const AdminRoot = lazyWithRecovery('admin', () =>
  import('./admin/AdminRoot').then((m) => ({ default: m.AdminRoot })),
);

createRoot(rootElement).render(
  <StrictMode>
    {window.location.pathname.startsWith('/admin/analytics') ? (
      <Suspense
        fallback={<div className="fixed inset-0 bg-[hsl(232_44%_6%)]" />}
      >
        <AdminRoot />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
