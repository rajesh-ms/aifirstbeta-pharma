import { runStage } from './azure.js';

const run = {
  scenario: null,
  candidates: [],
  activeLens: 'executive',
  status: 'idle',            // idle | running | gate | approved
  stageStatus: {},           // id -> pending | running | done
  startedAt: 0,
  clockTimer: null,
  mode: 'live',              // flips to 'simulated' if any real stage falls back
  targetResult: null,
  rankResult: null,
  gate: { reviewer: null, approver: null },
  trace: [],
  audit: []
};

const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (v) => String(v).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function init() {
  const [scenario, candData] = await Promise.all([
    fetch('./fixtures/scenario-pvrig.json').then((r) => r.json()),
    fetch('./fixtures/candidates.json').then((r) => r.json())
  ]);
  run.scenario = scenario;
  run.candidates = candData.candidates;

  $('#program-title').textContent = scenario.program.title;
  $('#program-subtitle').textContent = scenario.program.subtitle;
  $('#hero-trad').textContent = `${scenario.speed.traditionalYears - 2}–${scenario.speed.traditionalYears} years`;
  $('#hero-ai').textContent = `~${scenario.speed.acceleratedMonths} months`;
  $('#hero-headline').textContent =
    `${scenario.speed.speedMultiplier}× faster · ${scenario.speed.yearsSaved} yrs saved`;
  $('#funnel-value').textContent = `${scenario.funnel.generated} → ${scenario.funnel.advanced}`;

  renderPipeline();
  renderSources();
  wireControls();
}

function renderPipeline() {
  const html = run.scenario.stages.map((s) => {
    run.stageStatus[s.id] = 'pending';
    return `<article class="stage" data-id="${s.id}" data-state="pending">
      <div class="stage-icon">${s.icon}</div>
      ${s.real ? '<span class="stage-real badge badge-real">REAL · Azure</span>' : ''}
      <div class="stage-label">${s.label}</div>
      <div class="stage-time">${s.traditional} → <b>${s.accelerated}</b></div>
      <div class="stage-headline" data-headline></div>
    </article>`;
  }).join('');
  $('#pipeline').innerHTML = html;
}

function renderSources() {
  const refs = run.scenario.references || [];
  $('#sources-list').innerHTML = refs.map((r) =>
    `<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.label)}</a></li>`
  ).join('');
}

function renderProvenance(sel, res) {
  const el = $(sel);
  if (!el) return;
  const p = res && res.provenance;
  if (!p) { el.innerHTML = ''; return; }
  const items = [
    ['model', p.model],
    ['api', p.apiVersion],
    ['prompt', p.promptTemplate],
    ['tokens', p.tokens ? p.tokens.total : '—'],
    ['latency', `${p.latencyMs != null ? p.latencyMs : (res.latencyMs ?? '—')} ms`],
    ['req', String(p.requestId || '').slice(0, 8)],
    ['mode', p.mode || res.mode]
  ];
  el.innerHTML = items.map(([k, v]) => `<span class="prov-item"><b>${esc(k)}</b>${esc(v)}</span>`).join('');
}

function wireControls() {
  $('#lens-exec').addEventListener('click', () => setLens('executive'));
  $('#lens-tech').addEventListener('click', () => setLens('technical'));
  $('#run-btn').addEventListener('click', startRun);
  $('#reset-btn').addEventListener('click', () => location.reload());
}

function setLens(lens) {
  run.activeLens = lens;
  document.body.dataset.lens = lens;
  $('#lens-exec').classList.toggle('is-active', lens === 'executive');
  $('#lens-tech').classList.toggle('is-active', lens === 'technical');
}

function setStatus(status) {
  run.status = status;
  document.body.dataset.status = status;
}

function addTrace(msg) {
  run.trace.push(msg);
  const li = document.createElement('li');
  li.textContent = msg;
  $('#trace').appendChild(li);
}

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function addAudit(actor, role, action, reason) {
  const prevHash = run.audit.length ? run.audit[run.audit.length - 1].hash : 'GENESIS';
  const entry = { actor, role, action, reason: reason || '', ts: new Date().toISOString() };
  entry.hash = await sha256Hex(prevHash + JSON.stringify(entry));
  run.audit.push(entry);
  renderAudit();
}

function renderAudit() {
  const el = $('#audit');
  el.hidden = false;
  el.innerHTML = `<h3>Audit trail <small>21 CFR Part 11 · EU GMP Annex 11 · ALCOA+ · hash-chained</small></h3>` +
    `<ol class="audit-list">` + run.audit.map((e) =>
      `<li><span class="ts">${esc(e.ts)}</span> <b>${esc(e.actor)}</b> <span class="role">(${esc(e.role)})</span> — ${esc(e.action)}` +
      `${e.reason ? ` · <em>${esc(e.reason)}</em>` : ''} <code class="hash">${esc(e.hash.slice(0, 12))}</code></li>`
    ).join('') + `</ol>`;
}

function startClock() {
  run.startedAt = Date.now();
  run.clockTimer = setInterval(() => {
    const s = Math.floor((Date.now() - run.startedAt) / 1000);
    $('#clock').textContent =
      `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }, 250);
}
function stopClock() { clearInterval(run.clockTimer); }

function markMode(stageResult) {
  if (stageResult.mode === 'simulated') {
    run.mode = 'simulated';
    const badge = $('#mode-badge');
    badge.hidden = false;
    badge.textContent = 'simulated';
  }
}

function setStage(id, state, headline) {
  run.stageStatus[id] = state;
  const el = $(`.stage[data-id="${id}"]`);
  el.dataset.state = state;
  if (headline !== undefined) {
    el.querySelector('[data-headline]').innerHTML =
      state === 'running' ? '<span class="spinner"></span> ' + headline : headline;
  }
}

async function startRun() {
  if (run.status !== 'idle') return;
  $('#run-btn').disabled = true;
  setStatus('running');
  startClock();
  addTrace('Orchestrator: pipeline run started (PVRIG / CD112R).');

  for (const stage of run.scenario.stages) {
    setStage(stage.id, 'running', stage.headline);
    addTrace(`Stage ${stage.id} (${stage.label}) — ${stage.real ? 'REAL Azure call' : 'simulated'} started.`);

    if (stage.id === 1) {
      const res = await runStage('/api/target-id', {
        diseaseArea: 'immuno-oncology',
        intent: 'refill the pipeline after Keytruda',
        targetHint: 'PVRIG'
      });
      markMode(res);
      run.targetResult = res;
      $('#payload-stage1').textContent = JSON.stringify(res, null, 2);
      renderProvenance('#prov-stage1', res);
      setStage(stage.id, 'done', `Target validated: ${esc(res.target.name)} — ${esc(String(res.target.recommendation).toUpperCase())}`);
    } else if (stage.id === 5) {
      const res = await runStage('/api/rank', {
        target: run.scenario.program.target,
        candidates: run.candidates
      });
      markMode(res);
      run.rankResult = res;
      $('#payload-stage5').textContent = JSON.stringify(res, null, 2);
      renderProvenance('#prov-stage5', res);
      setStage(stage.id, 'done', `Ranked ${res.ranking.length} candidates — awaiting human gate`);
      await sleep(400);
      openGate();   // defined in Task 8
      return;
    } else {
      await sleep(stage.animationMs);
      if (stage.id === 4) $('#funnel-value').textContent =
        `${run.scenario.funnel.generated} → ${run.scenario.funnel.advanced}`;
      setStage(stage.id, 'done', stage.headline);
    }
    await sleep(300);
  }
}

function candidateById(id) { return run.candidates.find((c) => c.id === id); }

function metricChips(c) {
  const m = c.metrics || {};
  const chips = [];
  if (m.kdNm != null) chips.push(`KD ${esc(m.kdNm)} nM`);
  if (m.tmC != null) chips.push(`Tm ${esc(m.tmC)}°C`);
  if (m.hmwPct != null) chips.push(`%HMW ${esc(m.hmwPct)}`);
  if (m.immunogenicity) chips.push(`immuno ${esc(m.immunogenicity.score)}`);
  return chips.map((t) => `<span class="chip">${t}</span>`).join('');
}

function liabilityBadges(c) {
  const ls = c.liabilities || [];
  if (!ls.length) return `<span class="liability clean">no flagged liabilities</span>`;
  return ls.map((l) =>
    `<span class="liability ${esc(l.severity)}">${esc(l.type)} · ${esc(l.region)} ${esc(l.motif)}@${esc(l.pos)}</span>`
  ).join('');
}

function shortlistHtml() {
  return `<div class="shortlist">` + run.rankResult.ranking
    .slice().sort((a, b) => a.rank - b.rank).map((r) => {
      const c = candidateById(r.id) || { name: r.id, metrics: {}, germline: {} };
      const g = c.germline || {};
      const m = c.metrics || {};
      return `<div class="row">
        <span class="rank">#${r.rank}</span>
        <div class="cand">
          <div class="cand-head"><strong>${esc(c.name)}</strong><span class="fmt">${esc(c.format || '')}</span></div>
          <div class="cand-meta">germline ${esc(g.vh || '—')}/${esc(g.jh || '—')} · CDR-H3 <code>${esc(c.cdrh3 || '—')}</code></div>
          <div class="chips">${metricChips(c)}</div>
          <div class="liabilities">${liabilityBadges(c)}</div>
          <div class="rationale">${esc(r.rationale)}</div>
        </div>
        <span class="kd">KD ${esc(m.kdNm != null ? m.kdNm : '—')} nM</span>
      </div>`;
    }).join('') + `</div>`;
}

function openGate() {
  setStatus('gate');
  renderReviewerStep();
}

function renderReviewerStep() {
  $('#gate').hidden = false;
  $('#gate').innerHTML = `
    <h2>Human gate — Step 1 of 2 · Reviewer</h2>
    <p class="gate-step">Four-eyes control (21 CFR Part 11 · EU GMP Annex 11): the Reviewer recommends; a separate Approver must confirm before any wet-lab commitment.</p>
    ${shortlistHtml()}
    <p class="gate-step"><em>${esc(run.rankResult.overallRecommendation)}</em></p>
    <div class="gate-actions">
      <button class="approve" id="reviewer-recommend">Recommend advancing</button>
      <button class="sendback" id="reviewer-sendback">Send back</button>
    </div>`;
  $('#reviewer-recommend').addEventListener('click', onReviewerRecommend);
  $('#reviewer-sendback').addEventListener('click', () => onSendBack('Reviewer'));
}

async function onReviewerRecommend() {
  run.gate.reviewer = 'recommend';
  addTrace('Reviewer (Dr. A. Rao): recommended advancing the shortlist.');
  await addAudit('Dr. A. Rao', 'Reviewer', 'recommended advancing the shortlist', '');
  renderApproverStep();
}

function renderApproverStep() {
  $('#gate').innerHTML = `
    <h2>Human gate — Step 2 of 2 · Approver</h2>
    <p class="gate-step">A second, separate person provides the final approval (dual control). The scientist owns the wet-lab call.</p>
    ${shortlistHtml()}
    <div class="gate-actions">
      <button class="approve" id="approver-approve">Approve → wet-lab</button>
      <button class="sendback" id="approver-sendback">Send back</button>
    </div>`;
  $('#approver-approve').addEventListener('click', onApproverApprove);
  $('#approver-sendback').addEventListener('click', () => onSendBack('Approver'));
}

async function onSendBack(role) {
  // Simulated alternate re-rank — demonstrates a real human veto WITHOUT a 3rd real Azure call.
  run.gate = { reviewer: null, approver: null };
  const ranking = run.rankResult.ranking.slice().sort((a, b) => a.rank - b.rank);
  if (ranking.length >= 2) {
    [ranking[0].rank, ranking[1].rank] = [ranking[1].rank, ranking[0].rank]; // swap top two
  }
  run.rankResult = {
    ...run.rankResult,
    mode: 'simulated',
    ranking,
    overallRecommendation: 'Re-ranked after human veto (simulated alternate). Top two candidates swapped for reconsideration.'
  };
  markMode(run.rankResult);
  $('#payload-stage5').textContent = JSON.stringify(run.rankResult, null, 2);
  renderProvenance('#prov-stage5', run.rankResult);
  addTrace(`${role}: sent back — simulated alternate re-rank applied (no additional Azure call).`);
  await addAudit(role === 'Reviewer' ? 'Dr. A. Rao' : 'Dr. M. Chen', role, 'sent back for reconsideration', 'simulated alternate re-rank');
  renderReviewerStep();
}

async function onApproverApprove() {
  run.gate.approver = 'approve';
  addTrace('Approver (Dr. M. Chen): approved → candidates released to wet-lab. Decision traced (21 CFR Part 11 · EU GMP Annex 11).');
  await addAudit('Dr. M. Chen', 'Approver', 'approved → released to wet-lab', '');
  stopClock();
  setStatus('approved');
  showSummary();
}

function showSummary() {
  const sp = run.scenario.speed;
  const ranked = run.rankResult.ranking.slice().sort((a, b) => a.rank - b.rank);
  const top = ranked[0];
  const topName = top ? (candidateById(top.id) || { name: top.id }).name : '—';
  $('#gate').hidden = true;
  const sum = $('#summary');
  sum.hidden = false;
  sum.innerHTML = `
    <h2>Discovery cycle complete${run.mode === 'simulated' ? ' (simulated)' : ''}</h2>
    <div class="summary-grid">
      <div><span>Speed to clinic</span><b>${sp.speedMultiplier}× faster</b>${sp.yearsSaved} yrs saved</div>
      <div><span>Candidates advanced</span><b>${run.scenario.funnel.advanced}</b>from ${run.scenario.funnel.generated} generated</div>
      <div><span>Decisions traced</span><b>100%</b>two-person gate · Part 11 / Annex 11</div>
    </div>
    <p>Lead candidate <strong>${esc(topName)}</strong> released to wet-lab — the scientist owns the call.</p>`;
  $('#run-btn').hidden = true;
  $('#reset-btn').hidden = false;
}

init();
