import { chromium } from "playwright";

const BASE = "http://localhost:4321";
const browser = await chromium
  .launch({ executablePath: "/opt/pw-browsers/chromium" })
  .catch(() => chromium.launch());

async function measure(label, viewport, throttle) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();

  const requests = [];
  page.on("response", async (r) => {
    try {
      const h = await r.allHeaders();
      requests.push({
        url: r.url(),
        type: r.request().resourceType(),
        bytes: Number(h["content-length"] ?? 0),
      });
    } catch {
      /* ignore */
    }
  });

  if (throttle) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150, // Slow 4G
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }

  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: "load" });

  const vitals = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const out = { lcp: 0, cls: 0, fcp: 0, ttfb: 0, longTasks: 0, tbt: 0 };
        const nav = performance.getEntriesByType("navigation")[0];
        if (nav) out.ttfb = Math.round(nav.responseStart);

        new PerformanceObserver((l) => {
          const e = l.getEntries();
          out.lcp = Math.round(e[e.length - 1].startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });

        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });

        new PerformanceObserver((l) => {
          const p = l.getEntriesByName("first-contentful-paint")[0];
          if (p) out.fcp = Math.round(p.startTime);
        }).observe({ type: "paint", buffered: true });

        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            out.longTasks++;
            out.tbt += Math.max(0, e.duration - 50);
          }
        }).observe({ type: "longtask", buffered: true });

        setTimeout(() => {
          out.cls = Number(out.cls.toFixed(4));
          out.tbt = Math.round(out.tbt);
          resolve(out);
        }, 4500);
      })
  );

  const loadMs = Date.now() - t0;

  // Interaction responsiveness: time to react to a real click.
  await page.evaluate(() => document.getElementById("leistungen").scrollIntoView());
  await page.waitForTimeout(600);
  // The slider arrows are desktop-only; on mobile measure the menu button,
  // which is the equivalent primary interaction there.
  const target = viewport.width >= 1024
    ? "[data-slider-next]"
    : "[data-menu-button]";
  if (viewport.width < 1024) await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const inpStart = Date.now();
  await page.click(target);
  await page.waitForTimeout(60);
  const inp = Date.now() - inpStart;

  const total = requests.reduce((a, r) => a + r.bytes, 0);
  const byType = {};
  for (const r of requests) byType[r.type] = (byType[r.type] ?? 0) + r.bytes;

  await ctx.close();
  return { label, vitals, loadMs, inp, requests: requests.length, total, byType };
}

const runs = [
  await measure("Desktop, no throttling", { width: 1440, height: 900 }, false),
  await measure("Mobile 390px, Slow 4G + 4x CPU", { width: 390, height: 844 }, true),
];

for (const r of runs) {
  console.log(`\n=== ${r.label} ===`);
  console.log(`  TTFB                ${r.vitals.ttfb} ms`);
  console.log(`  FCP                 ${r.vitals.fcp} ms`);
  console.log(`  LCP                 ${r.vitals.lcp} ms   (good < 2500)`);
  console.log(`  CLS                 ${r.vitals.cls}      (good < 0.1)`);
  console.log(`  Total Blocking Time ${r.vitals.tbt} ms   (good < 200)`);
  console.log(`  long tasks          ${r.vitals.longTasks}`);
  console.log(`  click response      ~${r.inp} ms  (INP good < 200)`);
  console.log(`  requests            ${r.requests}`);
  console.log(`  transferred         ${Math.round(r.total / 1024)} KB`);
  for (const [k, v] of Object.entries(r.byType).sort((a, b) => b[1] - a[1]))
    if (v > 0) console.log(`     ${k.padEnd(12)} ${Math.round(v / 1024)} KB`);
}

await browser.close();
