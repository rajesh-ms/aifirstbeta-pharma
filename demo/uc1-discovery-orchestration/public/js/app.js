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
  trace: []
};

const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
      setStage(stage.id, 'done', `Target validated: ${res.target.name} — ${res.target.recommendation.toUpperCase()}`);
    } else if (stage.id === 5) {
      const res = await runStage('/api/rank', {
        target: run.scenario.program.target,
        candidates: run.candidates
      });
      markMode(res);
      run.rankResult = res;
      $('#payload-stage5').textContent = JSON.stringify(res, null, 2);
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

function shortlistHtml() {
  return `<div class="shortlist">` + run.rankResult.ranking
    .slice().sort((a, b) => a.rank - b.rank).map((r) => {
      const c = candidateById(r.id) || { name: r.id, kdNm: '—' };
      return `<div class="row"><span class="rank">#${r.rank}</span>
        <span><strong>${c.name}</strong> — ${r.rationale}</span>
        <span class="kd">KD ${c.kdNm} nM</span></div>`;
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
    <p class="gate-step">Four-eyes control (Annex 22): the Reviewer recommends; a separate Approver must confirm before any wet-lab commitment.</p>
    ${shortlistHtml()}
    <p class="gate-step"><em>${run.rankResult.overallRecommendation}</em></p>
    <div class="gate-actions">
      <button class="approve" id="reviewer-recommend">Recommend advancing</button>
      <button class="sendback" id="reviewer-sendback">Send back</button>
    </div>`;
  $('#reviewer-recommend').addEventListener('click', onReviewerRecommend);
  $('#reviewer-sendback').addEventListener('click', () => onSendBack('Reviewer'));
}

function onReviewerRecommend() {
  run.gate.reviewer = 'recommend';
  addTrace('Reviewer (Dr. A. Rao): recommended advancing the shortlist.');
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

function onSendBack(role) {
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
  addTrace(`${role}: sent back — simulated alternate re-rank applied (no additional Azure call).`);
  renderReviewerStep();
}

function onApproverApprove() {
  run.gate.approver = 'approve';
  addTrace('Approver (Dr. M. Chen): approved → candidates released to wet-lab. Decision traced (Annex 22 / Part 11).');
  stopClock();
  setStatus('approved');
  showSummary();
}

function showSummary() {
  const sp = run.scenario.speed;
  const top = run.rankResult.ranking.slice().sort((a, b) => a.rank - b.rank)[0];
  const topName = (candidateById(top.id) || { name: top.id }).name;
  $('#gate').hidden = true;
  const sum = $('#summary');
  sum.hidden = false;
  sum.innerHTML = `
    <h2>Discovery cycle complete${run.mode === 'simulated' ? ' (simulated)' : ''}</h2>
    <div class="summary-grid">
      <div><span>Speed to clinic</span><b>${sp.speedMultiplier}× faster</b>${sp.yearsSaved} yrs saved</div>
      <div><span>Candidates advanced</span><b>${run.scenario.funnel.advanced}</b>from ${run.scenario.funnel.generated} generated</div>
      <div><span>Decisions traced</span><b>100%</b>two-person gate · Annex 22</div>
    </div>
    <p>Lead candidate <strong>${topName}</strong> released to wet-lab — the scientist owns the call.</p>`;
  $('#run-btn').hidden = true;
  $('#reset-btn').hidden = false;
}

init();
