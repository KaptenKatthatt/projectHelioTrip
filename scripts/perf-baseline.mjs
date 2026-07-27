import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

/**
 * Frame-time profiler for the 3D scene.
 *
 * By default this builds nothing but *serves the production build itself* via
 * `vite preview`. Profiling the dev server measures Vite, not the app:
 * unminified React with dev-only warnings, the HMR client, no tree shaking and
 * a per-module network waterfall. Every baseline committed before this change
 * was captured that way and reads ~1.2 FPS, which says nothing about the app.
 *
 * Env knobs:
 * - `PERF_BASE_URL`   profile an already-running server instead of spawning one
 * - `PERF_QUALITY`    pin the graphics quality level (see `?quality=`); without
 *                     this the adaptive controller is what gets measured, and
 *                     no two runs are comparable
 * - `PERF_SOFTWARE=1` render through SwiftShader, i.e. a reproducible weak GPU
 * - `PERF_SAMPLE_MS`, `PERF_WARMUP_MS`, `PERF_HEADLESS`
 */

const PREVIEW_PORT = Number(process.env.PERF_PREVIEW_PORT ?? "4173");
const EXTERNAL_BASE_URL = process.env.PERF_BASE_URL ?? "";
const SAMPLE_MS = Number(process.env.PERF_SAMPLE_MS ?? "30000");
const WARMUP_MS = Number(process.env.PERF_WARMUP_MS ?? "5000");
const HEADLESS = process.env.PERF_HEADLESS === "1";
const SOFTWARE_GPU = process.env.PERF_SOFTWARE === "1";
const QUALITY = process.env.PERF_QUALITY ?? "";
const SCENE_READY_TIMEOUT_MS = 60_000;

const distIndexPath = path.join(process.cwd(), "dist", "index.html");

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const waitForServer = async (url, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) return;
    } catch {
      // Server not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url} to accept connections.`);
};

/** Serves `dist/` for the duration of the run. Returns a stop function. */
const startPreviewServer = async () => {
  if (!(await fileExists(distIndexPath))) {
    throw new Error(
      'No production build found at dist/index.html. Run "npm run build" first, ' +
        "or set PERF_BASE_URL to profile an already-running server.",
    );
  }

  const child = spawn(
    "npx",
    ["vite", "preview", "--port", String(PREVIEW_PORT), "--strictPort"],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk);
  });
  child.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.error(`vite preview exited with code ${code}\n${stderr}`);
    }
  });

  const url = `http://localhost:${PREVIEW_PORT}`;
  try {
    await waitForServer(url, 30_000);
  } catch (error) {
    child.kill("SIGTERM");
    throw error;
  }

  return {
    url,
    stop: () =>
      new Promise((resolve) => {
        if (child.exitCode !== null) {
          resolve();
          return;
        }
        child.once("exit", () => resolve());
        child.kill("SIGTERM");
      }),
  };
};

const buildTargetUrl = (baseUrl) => {
  if (!QUALITY) return baseUrl;
  const url = new URL(baseUrl);
  url.searchParams.set("quality", QUALITY);
  return url.toString();
};

const launchArgs = () => {
  const args = [
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
  ];
  if (SOFTWARE_GPU) {
    // A deterministic stand-in for a weak GPU on any machine.
    args.push("--use-gl=angle", "--use-angle=swiftshader");
  }
  return args;
};

const collectFrameStats = async (page, sampleMs) =>
  page.evaluate(async (windowMs) => {
    const frames = [];
    const longTasks = [];
    let rafId = 0;
    let done = false;
    let previousTs = performance.now();
    const start = previousTs;
    let elapsed = 0;

    const observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        longTasks.push(entry.duration);
      }
    });

    observer.observe({ entryTypes: ["longtask"] });

    const tick = (timestamp) => {
      if (done) return;
      const delta = timestamp - previousTs;
      previousTs = timestamp;
      elapsed = timestamp - start;
      if (delta > 0) frames.push(delta);
      if (elapsed >= windowMs) {
        done = true;
        observer.disconnect();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    await new Promise((resolve) => setTimeout(resolve, windowMs + 50));
    cancelAnimationFrame(rafId);

    const sorted = [...frames].sort((a, b) => a - b);
    const percentile = (p) => {
      if (sorted.length === 0) return 0;
      const idx = Math.floor(p * (sorted.length - 1));
      return sorted[idx];
    };

    const avgFrameMs =
      frames.length === 0
        ? 0
        : frames.reduce((sum, frameMs) => sum + frameMs, 0) / frames.length;
    const averageFps = avgFrameMs > 0 ? 1000 / avgFrameMs : 0;
    const p99FrameMs = percentile(0.99);
    const onePercentLowFps = p99FrameMs > 0 ? 1000 / p99FrameMs : 0;

    return {
      capturedFrames: frames.length,
      averageFps,
      onePercentLowFps,
      avgFrameMs,
      // p50/p90 mirror what the adaptive controller reasons about at runtime,
      // so harness output and controller decisions speak the same language.
      p50FrameMs: percentile(0.5),
      p90FrameMs: percentile(0.9),
      p95FrameMs: percentile(0.95),
      p99FrameMs,
      maxFrameMs: sorted.at(-1) ?? 0,
      jankOver16: frames.filter((ms) => ms > 16.7).length,
      jankOver50: frames.filter((ms) => ms > 50).length,
      longTaskCount: longTasks.length,
      longTasksTotalMs: longTasks.reduce((sum, ms) => sum + ms, 0),
      longTasksMaxMs: longTasks.length ? Math.max(...longTasks) : 0,
    };
  }, sampleMs);

const run = async () => {
  const server = EXTERNAL_BASE_URL ? null : await startPreviewServer();
  const baseUrl = EXTERNAL_BASE_URL || server.url;
  const targetUrl = buildTargetUrl(baseUrl);

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: launchArgs(),
  });

  let result;
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);

    // `networkidle` never fires: scheduleDeferredTexturePreloads keeps warming
    // textures in the background for as long as the page is open. Wait for the
    // renderer to exist instead.
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => window.__HELIOTRIP_SCENE_READY__ === true,
      undefined,
      { timeout: SCENE_READY_TIMEOUT_MS },
    );
    await page.waitForTimeout(WARMUP_MS);

    await cdp.send("Profiler.enable");
    await cdp.send("Profiler.start");
    const frameStats = await collectFrameStats(page, SAMPLE_MS);
    const profile = await cdp.send("Profiler.stop");
    await cdp.send("Profiler.disable");

    const nodes = profile.profile.nodes ?? [];
    const totalSamples = profile.profile.samples?.length ?? 0;
    const topHotspots = nodes
      .map((node) => ({
        functionName: node.callFrame?.functionName || "(anonymous)",
        url: node.callFrame?.url || "",
        hitCount: node.hitCount ?? 0,
      }))
      .filter((node) => node.hitCount > 0)
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10)
      .map((node) => ({
        ...node,
        hitPct: totalSamples > 0 ? (node.hitCount / totalSamples) * 100 : 0,
      }));

    result = {
      baseUrl: targetUrl,
      servedFrom: server ? "vite preview (production build)" : "external",
      renderer: SOFTWARE_GPU ? "swiftshader" : "default",
      qualityLevel: QUALITY || "adaptive",
      sampleMs: SAMPLE_MS,
      warmupMs: WARMUP_MS,
      measuredAt: new Date().toISOString(),
      frameStats,
      cpuProfile: { totalSamples, topHotspots },
    };
  } finally {
    await browser.close();
    if (server) await server.stop();
  }

  const outDir = path.join(process.cwd(), "docs", "perf");
  await fs.mkdir(outDir, { recursive: true });
  const date = result.measuredAt.slice(0, 10);
  const stamp = result.measuredAt
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z")
    .replace("T", "-");
  const suffix = `${SOFTWARE_GPU ? "-swiftshader" : ""}${QUALITY ? `-q${QUALITY}` : ""}`;
  const jsonPath = path.join(outDir, `baseline-${stamp}${suffix}.json`);
  await fs.writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  const mdLines = [
    `# Performance Baseline ${date}`,
    "",
    `- URL: \`${result.baseUrl}\``,
    `- Served from: ${result.servedFrom}`,
    `- Renderer: ${result.renderer}`,
    `- Quality level: ${result.qualityLevel}`,
    `- Warmup: ${result.warmupMs} ms`,
    `- Sample window: ${result.sampleMs} ms`,
    `- Captured at: ${result.measuredAt}`,
    "",
    "## Frame metrics",
    "",
    `- Average FPS: ${result.frameStats.averageFps.toFixed(1)}`,
    `- 1% low FPS: ${result.frameStats.onePercentLowFps.toFixed(1)}`,
    `- Avg frame: ${result.frameStats.avgFrameMs.toFixed(2)} ms`,
    `- P50 frame: ${result.frameStats.p50FrameMs.toFixed(2)} ms`,
    `- P90 frame: ${result.frameStats.p90FrameMs.toFixed(2)} ms`,
    `- P95 frame: ${result.frameStats.p95FrameMs.toFixed(2)} ms`,
    `- P99 frame: ${result.frameStats.p99FrameMs.toFixed(2)} ms`,
    `- Max frame: ${result.frameStats.maxFrameMs.toFixed(2)} ms`,
    `- Jank >16.7ms: ${result.frameStats.jankOver16}`,
    `- Jank >50ms: ${result.frameStats.jankOver50}`,
    `- Long tasks: ${result.frameStats.longTaskCount}`,
    `- Long-task total: ${result.frameStats.longTasksTotalMs.toFixed(2)} ms`,
    `- Long-task max: ${result.frameStats.longTasksMaxMs.toFixed(2)} ms`,
    "",
    "## CPU hotspots",
    "",
    ...result.cpuProfile.topHotspots.map(
      (hotspot, index) =>
        `${index + 1}. \`${hotspot.functionName}\` - ${hotspot.hitCount} samples (${hotspot.hitPct.toFixed(2)}%)` +
        (hotspot.url ? ` - ${hotspot.url}` : ""),
    ),
    "",
  ];

  const mdPath = path.join(outDir, `baseline-${stamp}${suffix}.md`);
  await fs.writeFile(mdPath, mdLines.join("\n"), "utf8");

  console.log(JSON.stringify(result, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
