import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.PERF_BASE_URL ?? "http://localhost:5173";
const SAMPLE_MS = Number(process.env.PERF_SAMPLE_MS ?? "30000");
const WARMUP_MS = Number(process.env.PERF_WARMUP_MS ?? "5000");
const HEADLESS = process.env.PERF_HEADLESS === "1";

const run = async () => {
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: [
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
    ],
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(WARMUP_MS);

  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.start");

  const sample = await page.evaluate(async (sampleMs) => {
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
      if (elapsed >= sampleMs) {
        done = true;
        observer.disconnect();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    await new Promise((resolve) => setTimeout(resolve, sampleMs + 50));
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
    const jankOver16 = frames.filter((ms) => ms > 16.7).length;
    const jankOver50 = frames.filter((ms) => ms > 50).length;
    const longTasksTotalMs = longTasks.reduce((sum, ms) => sum + ms, 0);

    return {
      capturedFrames: frames.length,
      averageFps,
      onePercentLowFps,
      avgFrameMs,
      p95FrameMs: percentile(0.95),
      p99FrameMs,
      maxFrameMs: sorted.at(-1) ?? 0,
      jankOver16,
      jankOver50,
      longTaskCount: longTasks.length,
      longTasksTotalMs,
      longTasksMaxMs: longTasks.length ? Math.max(...longTasks) : 0,
    };
  }, SAMPLE_MS);

  const profile = await cdp.send("Profiler.stop");

  await cdp.send("Profiler.disable");
  await browser.close();

  const nodes = profile.profile.nodes ?? [];
  const totalSamples = profile.profile.samples?.length ?? 0;
  const hotspotRows = nodes
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

  const result = {
    baseUrl: BASE_URL,
    sampleMs: SAMPLE_MS,
    warmupMs: WARMUP_MS,
    measuredAt: new Date().toISOString(),
    frameStats: sample,
    cpuProfile: {
      totalSamples,
      topHotspots: hotspotRows,
    },
  };

  const outDir = path.join(process.cwd(), "docs", "perf");
  await fs.mkdir(outDir, { recursive: true });
  const date = result.measuredAt.slice(0, 10);
  const stamp = result.measuredAt
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z")
    .replace("T", "-");
  const jsonPath = path.join(outDir, `baseline-${stamp}.json`);
  await fs.writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  const mdLines = [
    `# Performance Baseline ${date}`,
    "",
    `- URL: \`${result.baseUrl}\``,
    `- Warmup: ${result.warmupMs} ms`,
    `- Sample window: ${result.sampleMs} ms`,
    `- Captured at: ${result.measuredAt}`,
    "",
    "## Frame metrics",
    "",
    `- Average FPS: ${result.frameStats.averageFps.toFixed(1)}`,
    `- 1% low FPS: ${result.frameStats.onePercentLowFps.toFixed(1)}`,
    `- Avg frame: ${result.frameStats.avgFrameMs.toFixed(2)} ms`,
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

  const mdPath = path.join(outDir, `baseline-${stamp}.md`);
  await fs.writeFile(mdPath, mdLines.join("\n"), "utf8");

  console.log(JSON.stringify(result, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
