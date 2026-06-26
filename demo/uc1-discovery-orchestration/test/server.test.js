import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp, azureConfigured, buildTargetIdPrompt, buildRankPrompt } from '../server.js';

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
    ranking: [{ id: 'AB-014', rank: 1, rationale: 'top' }],
    overallRecommendation: 'advance AB-014'
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
