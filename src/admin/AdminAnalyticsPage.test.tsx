// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAnalyticsPage } from "./AdminAnalyticsPage";
import { ClerkProvider } from "@clerk/clerk-react";

// Mock the clerk hooks and components to simulate being signed in
vi.mock("@clerk/clerk-react", async () => {
  const actual = await vi.importActual<typeof import("@clerk/clerk-react")>("@clerk/clerk-react");
  return {
    ...actual,
    useAuth: () => ({
      getToken: vi.fn().mockResolvedValue("mock-token"),
    }),
    SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SignedOut: () => null,
    UserButton: () => <div data-testid="user-button" />,
  };
});

const renderComponent = () => {
  return render(
    <ClerkProvider publishableKey="pk_test_bW9jay1jbGVyay1rZXkuY2xlcmsuYWNjb3VudHMuZGV2JA">
      <AdminAnalyticsPage />
    </ClerkProvider>
  );
};

describe("AdminAnalyticsPage error handling", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    // Mock URL to avoid isMock check logic
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'http://localhost/',
        pathname: '/',
      },
      writable: true
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should display server error for 500 response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Could not load analytics: Server error while loading analytics.")).toBeInTheDocument();
    });
  });

  it("should display API not found error for 404 response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Could not load analytics: API not found (check deployment / GET /api/health).")).toBeInTheDocument();
    });
  });

  it("should display admin login not configured error for 503 response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 503 }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Could not load analytics: Admin login is not configured on the server.")).toBeInTheDocument();
    });
  });

  it("should handle invalid JSON payload correctly", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ bad: "data" }), { status: 200 }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Could not load analytics: invalid_analytics_summary_payload")).toBeInTheDocument();
    });
  });

  it("should handle network failure gracefully", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Could not load analytics: Network Error")).toBeInTheDocument();
    });
  });

  it("should handle 403 response without displaying an error block", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 403 }));

    renderComponent();

    // The fetch happens in useEffect so we need to wait for it to complete.
    // Waiting for something that IS present helps ensure we're done rendering.
    await waitFor(() => {
      expect(screen.getByText("HelioTrip Analytics")).toBeInTheDocument();
    });

    const errorBlocks = screen.queryAllByRole("alert");
    expect(errorBlocks.length).toBe(0);
  });
});
