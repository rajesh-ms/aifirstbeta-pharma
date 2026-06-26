import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp, azureConfigured, callAzureJSON, buildTargetIdPrompt, buildRankPrompt } from '../server.js';

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

test('azureConfigured() is false when env is missing', () => {
  delete process.env.AZURE_OPENAI_ENDPOINT;
  delete process.env.AZURE_OPENAI_API_KEY;
  delete process.env.AZURE_OPENAI_DEPLOYMENT;
  assert.equal(azureConfigured(), false);
});

test('POST /api/target-id returns 501 when Azure is not configured', async () => {
  delete process.env.AZURE_OPENAI_API_KEY;
  const app = buildApp();
  const { server, base } = await startServer(app);
  try {
    const res = await fetch(`${base}/api/target-id`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ diseaseArea: 'immuno-oncology' })
    });
    assert.equal(res.status, 501);
    const body = await res.json();
    assert.equal(body.error, 'azure-not-configured');
  } finally { server.close(); }
});

test('POST /api/rank returns a live-shaped body when the azure caller succeeds', async () => {
  process.env.AZURE_OPENAI_ENDPOINT = 'https://x.openai.azure.com';
  process.env.AZURE_OPENAI_API_KEY = 'k';
  process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
  const fakeAzure = async () => ({
    data: { ranking: [{ id: 'AB-014', rank: 1, rationale: 'top' }], overallRecommendation: 'advance AB-014' },
    usage: { prompt_tokens: 1000, completion_tokens: 200, total_tokens: 1200 }
  });
  const app = buildApp({ azureCall: fakeAzure });
  const { server, base } = await startServer(app);
  try {
    const res = await fetch(`${base}/api/rank`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ target: 'PVRIG (CD112R)', candidates: [] })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.mode, 'live');
    assert.equal(body.stage, 5);
    assert.equal(typeof body.latencyMs, 'number');
    assert.equal(body.ranking[0].id, 'AB-014');
    assert.equal(body.provenance.mode, 'live');
    assert.equal(body.provenance.tokens.total, 1200);
    assert.equal(typeof body.provenance.model, 'string');
    assert.match(body.provenance.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.ok(body.provenance.requestId.length >= 8);
  } finally { server.close(); }
});

test('POST /api/rank returns 502 when the azure caller throws', async () => {
  process.env.AZURE_OPENAI_ENDPOINT = 'https://x.openai.azure.com';
  process.env.AZURE_OPENAI_API_KEY = 'k';
  process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
  const app = buildApp({ azureCall: async () => { throw new Error('boom'); } });
  const { server, base } = await startServer(app);
  try {
    const res = await fetch(`${base}/api/rank`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ target: 'PVRIG (CD112R)', candidates: [] })
    });
    assert.equal(res.status, 502);
  } finally { server.close(); }
});

test('prompt builders mention "json" so Azure JSON mode is satisfied', () => {
  assert.match(buildTargetIdPrompt({ diseaseArea: 'io' }).user.toLowerCase(), /json/);
  assert.match(buildRankPrompt({ target: 'PVRIG', candidates: [] }).user.toLowerCase(), /json/);
});

test('POST /api/target-id returns a live stage-1 body when the azure caller succeeds', async () => {
  process.env.AZURE_OPENAI_ENDPOINT = 'https://x.openai.azure.com';
  process.env.AZURE_OPENAI_API_KEY = 'k';
  process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
  const fakeAzure = async () => ({
    data: { name: 'PVRIG (CD112R)', mechanism: 'inhibitory receptor', evidence: ['a', 'b', 'c'],
      confidence: 0.78, recommendation: 'go', recommendationText: 'advance' },
    usage: { prompt_tokens: 900, completion_tokens: 150, total_tokens: 1050 }
  });
  const app = buildApp({ azureCall: fakeAzure });
  const { server, base } = await startServer(app);
  try {
    const res = await fetch(`${base}/api/target-id`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ diseaseArea: 'immuno-oncology' })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.mode, 'live');
    assert.equal(body.stage, 1);
    assert.equal(typeof body.latencyMs, 'number');
    assert.equal(body.target.name, 'PVRIG (CD112R)');
    assert.equal(body.target.recommendation, 'go');
    assert.equal(body.provenance.tokens.total, 1050);
    assert.equal(body.provenance.promptTemplate, 'target-id@v1.3');
  } finally { server.close(); }
});

test('callAzureJSON builds the Azure URL, sends JSON-mode body, and returns parsed content', async () => {
  process.env.AZURE_OPENAI_ENDPOINT = 'https://x.openai.azure.com/';
  process.env.AZURE_OPENAI_API_KEY = 'secret-key';
  process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
  process.env.AZURE_OPENAI_API_VERSION = '2024-10-21';
  let captured;
  const fetchImpl = async (url, opts) => {
    captured = { url, opts };
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"x":1}' } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } }) };
  };
  const out = await callAzureJSON({ system: 's', user: 'u' }, { fetchImpl });
  assert.deepEqual(out.data, { x: 1 });
  assert.equal(out.usage.total_tokens, 15);
  assert.match(captured.url, /\/openai\/deployments\/gpt-4o\/chat\/completions\?api-version=2024-10-21$/);
  assert.ok(captured.url.startsWith('https://x.openai.azure.com/openai/'), 'trailing slash on endpoint is trimmed');
  assert.equal(captured.opts.headers['api-key'], 'secret-key');
  const reqBody = JSON.parse(captured.opts.body);
  assert.equal(reqBody.response_format.type, 'json_object');
  assert.equal(reqBody.temperature, 0.2);
});

test('callAzureJSON throws azure-http-<status> on a non-2xx response', async () => {
  process.env.AZURE_OPENAI_ENDPOINT = 'https://x.openai.azure.com';
  process.env.AZURE_OPENAI_API_KEY = 'k';
  process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
  const fetchImpl = async () => ({ ok: false, status: 429, json: async () => ({}) });
  await assert.rejects(
    () => callAzureJSON({ system: 's', user: 'u' }, { fetchImpl }),
    /azure-http-429/
  );
});
