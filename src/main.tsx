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
      <AdminAnalyticsPage />
    ) : (
      <App />
    )}
  </StrictMode>,
);
