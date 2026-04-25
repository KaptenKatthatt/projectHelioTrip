import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { App } from './App';
import { AdminAnalyticsPage } from './admin/AdminAnalyticsPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id="root" not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route
          path="/admin/analytics/"
          element={<Navigate replace to="/admin/analytics" />}
        />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
