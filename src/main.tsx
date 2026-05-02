import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { AdminAnalyticsPage } from './admin/AdminAnalyticsPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id="root" not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    {window.location.pathname.startsWith('/admin/analytics') ? (
      <div className="fixed inset-0 overflow-y-auto bg-[hsl(232_44%_6%)] text-[hsl(223_25%_91%)]">
        <AdminAnalyticsPage />
      </div>
    ) : (
      <App />
    )}
  </StrictMode>,
);
