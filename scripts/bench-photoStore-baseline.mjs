import { chromium } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL);

  const result = await page.evaluate(async () => {
    const { savePhoto, loadAllPhotos } = await import('/src/lib/photoStore.ts');

    // Setup: save 1000 photos
    for (let i = 0; i < 1000; i++) {
      await savePhoto({
        id: `bench_${i}`,
        dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        timestampMs: Date.now(),
        locationLabel: 'Bench'
      });
    }

    // Benchmark
    const start = performance.now();
    await loadAllPhotos();
    const end = performance.now();

    // Cleanup
    const { keys, del } = await import('idb-keyval');
    const allKeys = await keys();
    for (const key of allKeys) {
      if (typeof key === 'string' && key.startsWith('heliotrip_photo_bench_')) {
        await del(key);
      }
    }

    return end - start;
  });

  console.log(`Time taken to load 1000 photos: ${result.toFixed(2)} ms`);
  await browser.close();
};

run().catch(console.error);
