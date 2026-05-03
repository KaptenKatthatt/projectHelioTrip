import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import { App } from './App';
import { AdminAnalyticsPage } from './admin/AdminAnalyticsPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id="root" not found in index.html');
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(rootElement).render(
  <StrictMode>
    {window.location.pathname.startsWith('/admin/analytics') ? (
      PUBLISHABLE_KEY ? (
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY} 
          afterSignOutUrl="/admin/analytics"
          signInFallbackRedirectUrl="/admin/analytics"
          signUpFallbackRedirectUrl="/admin/analytics"
        >
          <div className="fixed inset-0 overflow-y-auto bg-[hsl(232_44%_6%)] text-[hsl(223_25%_91%)]">
            <AdminAnalyticsPage />
          </div>
        </ClerkProvider>
      ) : (
        <div className="p-8 text-white">Missing VITE_CLERK_PUBLISHABLE_KEY</div>
      )
    ) : (
      <App />
    )}
  </StrictMode>,
);
