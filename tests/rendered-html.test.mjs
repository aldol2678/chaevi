import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders CHAEVI", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>CHAEVI — AI Work Router<\/title>/i);
  assert.match(html, /CHAEVI · AI WORK ROUTER/);
  assert.match(html, /무슨 작업을 하려고 하나요/);
  assert.match(html, /목표에서 할 일 찾기/);
  assert.match(html, /추천 결과/);
  assert.match(html, /예상 산출물/);
  assert.match(html, /이 추천이 도움이 됐나요/);
});

test("keeps the public candidate free of private examples and starter metadata", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function routeTask/);
  assert.match(page, /function suggestTasks/);
  assert.match(page, /Website Builder/);
  assert.match(page, /FEEDBACK_STORAGE_KEY = "chaevi\.feedback\.v1"/);
  assert.match(layout, /CHAEVI — AI Work Router/);
  assert.match(packageJson, /"name": "chaevi"/);

  assert.doesNotMatch(page, /타래|LoreNode|컴활|ARAM/);
  assert.doesNotMatch(layout, /ai-work-router-aldol\.al-dori\.chatgpt\.site/);
  assert.doesNotMatch(packageJson, /site-creator-vinext-starter|drizzle/);
});

test("preserves the v0.3 routing settings while generalizing public terminology", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /type Balance = "speed" \| "balanced" \| "accuracy"/);
  assert.match(page, /type Saving = "saving" \| "balanced" \| "performance"/);
  assert.match(page, /type Importance = "low" \| "normal" \| "high"/);
  assert.match(page, /type Execution = "analysis" \| "execute"/);
  assert.match(page, /type Review = "none" \| "helpful" \| "required"/);
  assert.match(page, /function routeTask\(task: string, settings: Settings\)/);
  assert.match(page, /속도와 정확성/);
  assert.match(page, /사용량과 성능/);
  assert.match(page, /고급 설정/);
  assert.match(page, /중요도/);
  assert.match(page, /실제 실행/);
  assert.match(page, /독립 검증/);
  assert.match(page, /Template Creator/);
  assert.match(page, /Visualization/);
});

test("requires explicit continuation language before skipping early goal steps", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /const isProgressing = hasAny\(normalized, \["진행 중", "이어", "계속"\]\)/);
  assert.doesNotMatch(page, /const isProgressing = hasAny\([^;]+"개선"/);
});

test("keeps feedback local and free of raw task or goal input by default", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /window\.localStorage\.setItem\(FEEDBACK_STORAGE_KEY/);
  assert.match(page, /FEEDBACK_LIMIT = 100/);
  assert.doesNotMatch(page, /recommendation:\s*\{[^}]*submittedTask/s);
  assert.doesNotMatch(page, /recommendation:\s*\{[^}]*submittedGoal/s);
});
