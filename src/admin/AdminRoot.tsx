import { ClerkProvider } from '@clerk/clerk-react';
import { AdminAnalyticsPage } from './AdminAnalyticsPage';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Entry for /admin/analytics. Lazy-loaded from main.tsx so Clerk, recharts
 * and the dashboard never enter the main app's eager bundle.
 */
export const AdminRoot = () => {
  if (window.location.search.includes('mock_auth=true')) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-[hsl(232_44%_6%)] text-[hsl(223_25%_91%)]">
        <AdminAnalyticsPage />
      </div>
    );
  }

  if (!PUBLISHABLE_KEY) {
    return <div className="p-8 text-white">Missing VITE_CLERK_PUBLISHABLE_KEY</div>;
  }

  return (
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
  );
};
