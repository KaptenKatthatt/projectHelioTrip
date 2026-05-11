import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { SummaryCards } from "./analytics/SummaryCards";
import { DailyVolumeChart } from "./analytics/DailyVolumeChart";
import { BreakdownCharts } from "./analytics/BreakdownCharts";
import { EventList } from "./analytics/EventList";
import { SignIn, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { useAnalyticsData } from "./analytics/useAnalyticsData";

const AnalyticsDashboard = ({ getToken, userButton }: { getToken: () => Promise<string | null>; userButton?: React.ReactNode; }) => {
  useEffect(() => { document.title = "HelioTrip analytics"; }, []);

  const {
    summary,
    error,
    loading,
    expandedEvents,
    fetchSummary,
    toggleEventExpanded,
    byEvent,
    total14d,
    total30d,
    dailyChart,
    topPlanets,
    modeData,
    missionFunnel,
  } = useAnalyticsData(getToken);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="ds-eyebrow">Anonymous usage</p>
          <h1 className="text-3xl font-semibold leading-9 text-[hsl(223_25%_91%)]">
            HelioTrip Analytics
          </h1>
          <p className="text-sm leading-5 text-[hsl(225_16%_68%)] max-w-xl">
            Aggregated event counts only. No user ids, accounts, or fingerprints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchSummary()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[hsl(230_30%_15%)] px-4 py-2 text-sm font-medium text-[hsl(223_25%_91%)] transition-colors hover:border-[hsl(232_89%_66%)]/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Refresh
          </button>
          {userButton}
        </div>
      </header>

      {error ? (
        <p className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100 shadow-sm" role="alert">
          Could not load analytics: {error}
        </p>
      ) : null}

      {summary ? (
        <div className="space-y-6">
          <SummaryCards summary={summary} total14d={total14d} total30d={total30d} />
          <DailyVolumeChart data={dailyChart} />
          <BreakdownCharts topPlanets={topPlanets} missionFunnel={missionFunnel} modeData={modeData} />
          <EventList events={byEvent} expandedEvents={expandedEvents} onToggleExpand={toggleEventExpanded} updatedAt={summary.updatedAt} />
        </div>
      ) : null}
    </main>
  );
};

const SignedInAnalyticsDashboard = () => {
  const { getToken } = useAuth();
  return (
    <AnalyticsDashboard 
      getToken={getToken} 
      userButton={
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9",
            },
          }}
        />
      }
    />
  );
};

export const AdminAnalyticsPage = () => {
  const isMock = window.location.search.includes("mock_auth=true");

  if (isMock) {
    return <AnalyticsDashboard getToken={() => Promise.resolve("mock-token")} />;
  }

  return (
    <>
      <SignedIn>
        <SignedInAnalyticsDashboard />
      </SignedIn>
      <SignedOut>
        <div className="ds-panel flex justify-center p-8">
          <SignIn routing="hash" forceRedirectUrl="/admin/analytics" />
        </div>
      </SignedOut>
    </>
  );
};
