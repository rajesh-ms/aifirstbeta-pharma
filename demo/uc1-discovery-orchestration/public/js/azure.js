// Single client-owned fallback contract.
// Live JSON is used only when the response is OK and JSON; otherwise we load
// bundled canned fixtures (works identically for a keyless local server -> 501
// and for GitHub Pages static hosting -> 404), and flag mode:'simulated'.

export function decideFallback({ ok, contentType }) {
  if (!ok) return true;
  if (!contentType || !contentType.includes('application/json')) return true;
  return false;
}

const CANNED = {
  '/api/target-id': './fixtures/canned-stage1.json',
  '/api/rank': './fixtures/canned-stage5.json'
};

async function loadCanned(apiPath) {
  const res = await fetch(CANNED[apiPath]);
  const data = await res.json();
  return { ...data, mode: 'simulated' };
}

export async function runStage(apiPath, body, { timeoutMs = 8000 } = {}) {
  try {
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (decideFallback({ ok: res.ok, contentType: res.headers.get('content-type') })) {
      return await loadCanned(apiPath);
    }
    const data = await res.json();
    return { ...data, mode: data.mode || 'live' };
  } catch {
    return await loadCanned(apiPath);
  }
}
