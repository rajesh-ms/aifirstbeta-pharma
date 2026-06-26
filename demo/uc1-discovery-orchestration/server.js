import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function azureConfigured() {
  return Boolean(
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_DEPLOYMENT
  );
}

export function buildTargetIdPrompt(body) {
  const { diseaseArea = 'immuno-oncology', intent = 'refill the pipeline after Keytruda', targetHint = 'PVRIG' } = body || {};
  return {
    system: 'You are a drug-discovery target-validation assistant. Respond ONLY with a JSON object.',
    user: `Validate a next-generation immuno-oncology antibody target for ${diseaseArea}. Intent: ${intent}. Candidate target: ${targetHint} (PVRIG / CD112R). ` +
      'Return a JSON object with keys: name (string), mechanism (string), evidence (array of 3 short strings), ' +
      'confidence (number 0..1), recommendation (one of "go","no-go","investigate"), recommendationText (string).'
  };
}

export function buildRankPrompt(body) {
  const { target = 'PVRIG (CD112R)', candidates = [] } = body || {};
  return {
    system: 'You are a discovery ranking assistant. Respond ONLY with a JSON object.',
    user: `Rank these antibody candidates against ${target} for advancement to wet-lab. ` +
      'Lower kdNm is stronger; higher developabilityScore and interfaceScore are better; non-empty toxFlags are penalties. ' +
      `Candidates JSON: ${JSON.stringify(candidates)}. ` +
      'Return a JSON object with keys: ranking (array of {id, rank, rationale}) covering every candidate id with unique ranks 1..N, ' +
      'and overallRecommendation (string).'
  };
}

export async function callAzureJSON({ system, user }, { fetchImpl = fetch } = {}) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, '');
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const resp = await fetchImpl(url, {
    method: 'POST',
    headers: { 'api-key': process.env.AZURE_OPENAI_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }),
    signal: AbortSignal.timeout(8000)
  });
  if (!resp.ok) throw new Error(`azure-http-${resp.status}`);
  const data = await resp.json();
  return JSON.parse(data.choices[0].message.content);
}

function makeHandler({ stage, buildPrompt, shape, azureCall }) {
  return async (req, res) => {
    if (!azureConfigured()) return res.status(501).json({ error: 'azure-not-configured' });
    const started = Date.now();
    try {
      const out = await azureCall(buildPrompt(req.body));
      res.json({ mode: 'live', stage, latencyMs: Date.now() - started, ...shape(out) });
    } catch (err) {
      res.status(502).json({ error: String(err.message || err) });
    }
  };
}

export function buildApp({ azureCall = callAzureJSON } = {}) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));
  app.post('/api/target-id', makeHandler({
    stage: 1, buildPrompt: buildTargetIdPrompt, azureCall,
    shape: (out) => ({ target: out })
  }));
  app.post('/api/rank', makeHandler({
    stage: 5, buildPrompt: buildRankPrompt, azureCall,
    shape: (out) => ({ ranking: out.ranking, overallRecommendation: out.overallRecommendation })
  }));
  return app;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const port = process.env.PORT || 3000;
  buildApp().listen(port, () => {
    const mode = azureConfigured() ? 'LIVE Azure OpenAI' : 'SIMULATED (no Azure key)';
    console.log(`UC1 demo running at http://localhost:${port}  [mode: ${mode}]`);
  });
}
