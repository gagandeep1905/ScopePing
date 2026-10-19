(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'scopeping.requests.v1';
  const BASELINE_KEY = 'scopeping.baseline.v1';
  let requests = loadRequests();
  let lastDraft = null;
  let lastAnalysis = null;
  let lastAnalysisRequest = '';
  let lastAnalysisScope = '';
  let toastTimer;

  const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount) || 0);
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  const num = (id) => Math.max(0, Number($(id).value) || 0);
  const plural = (n, singular, pluralForm = `${singular}s`) => `${n} ${n === 1 ? singular : pluralForm}`;
  const statusLabel = (s) => ({ pending: 'Pending', approved: 'Approved', declined: 'Declined', completed: 'Completed' }[s] || 'Pending');

  function loadRequests() {
    try { const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  function saveRequests() { localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); renderStats(); renderRequestList(); }
  function baseline() {
    return {
      projectName: $('project-name').value.trim() || 'Untitled project',
      clientName: $('client-name').value.trim(),
      projectValue: num('project-value'),
      hourlyRate: num('hourly-rate'),
      revisions: $('revision-count').value,
      scope: $('included-scope').value.trim()
    };
  }
  function saveBaseline() {
    try { localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline())); } catch { /* storage may be unavailable */ }
  }
  function loadBaseline() {
    try {
      const b = JSON.parse(localStorage.getItem(BASELINE_KEY) || 'null');
      if (!b) return;
      if (b.projectName) $('project-name').value = b.projectName;
      if (b.clientName) $('client-name').value = b.clientName;
      if (typeof b.projectValue === 'number') $('project-value').value = b.projectValue;
      if (typeof b.hourlyRate === 'number') $('hourly-rate').value = b.hourlyRate;
      if (b.revisions) $('revision-count').value = b.revisions;
      if (b.scope) $('included-scope').value = b.scope;
    } catch { /* ignore invalid saved data */ }
  }
  function feeEstimate() { return Math.round((num('hourly-rate') * num('extra-hours')) / 100) * 100; }
  function setFeeEstimate(force = false) {
    const suggested = feeEstimate();
    $('suggested-fee').textContent = money(suggested);
    if (force || $('final-fee').dataset.manual !== 'true') $('final-fee').value = suggested;
    updateImpactSummary();
  }
  function updateImpactSummary() {
    const h = num('extra-hours'); const d = num('extra-days'); const fee = num('final-fee'); const b = baseline();
    $('summary-hours').textContent = plural(h, 'hour');
    $('summary-days').textContent = plural(d, 'day');
    $('summary-fee').textContent = money(fee);
    $('summary-total').textContent = money(b.projectValue + fee);
    $('reply-to-label').textContent = b.clientName ? `To: ${b.clientName}` : 'To: your client';
    if (lastAnalysis && !$('analysis-result').hidden) {
      const analysisHours = Math.max(0, Number(lastAnalysis.suggestedExtraHours) || 0);
      $('analysis-fee').textContent = money(Math.round((num('hourly-rate') * analysisHours) / 100) * 100);
    }
    saveBaseline();
  }
  function formatList(revisions) {
    if (revisions === 'unlimited') return 'unlimited / as agreed';
    return `${revisions} ${Number(revisions) === 1 ? 'round' : 'rounds'}`;
  }
  function generateMessage() {
    const b = baseline(); const description = $('request-description').value.trim();
    if (!description) { toast('Add a short description of the client’s request first.'); $('request-description').focus(); return false; }
    const hours = num('extra-hours'); const days = num('extra-days'); const fee = num('final-fee');
    const tone = $('message-tone').value; const lang = $('message-language').value;
    const person = b.clientName ? b.clientName : '';
    const hello = person ? `Hi ${person},` : 'Hi,';
    const currentAnalysis = lastAnalysis && lastAnalysisRequest === description && lastAnalysisScope === b.scope ? lastAnalysis : null;
    let message = '';

    if (!currentAnalysis) {
      if (lang === 'hinglish') {
        message = `${hello}\n\nRequest share karne ke liye thanks. Main isse original scope ke saath check karke confirm karunga/karungi ki ye existing agreement mein covered hai ya fee/timeline mein change hoga. Confirm karne se pehle main extra work start nahi karunga/karungi.\n\nThanks!`;
      } else {
        message = `${hello}\n\nThanks for sharing this request. I’ll compare it with our original scope and confirm whether there is any cost or timeline impact before proceeding. I’ll document any change and get your approval before starting additional work.\n\nThanks!`;
      }
    } else if (currentAnalysis.verdict === 'likely_in_scope') {
      if (lang === 'hinglish') {
        message = tone === 'firm'
          ? `${hello}\n\nMaine request ko original scope se compare kiya hai aur ye agreed work mein included lag rahi hai. Main original agreement ke according proceed karunga/karungi. Agar requirements badalti hain, toh revised scope aur impact ko pehle confirm kar lenge.\n\nThank you.`
          : `${hello}\n\nRequest share karne ke liye thanks! Ye original scope mein covered lag rahi hai, isliye main existing agreement ke according proceed kar sakta/sakti hoon. Main delivery schedule confirm karke aage badhunga/badhungi.\n\nThanks!`;
      } else {
        message = tone === 'firm'
          ? `${hello}\n\nI compared this request with our original scope, and it appears to be covered by the agreement. I’ll proceed under the existing scope and timeline. If the requirements change, I’ll confirm any revised scope, cost, or timing with you before starting that work.\n\nThank you.`
          : `${hello}\n\nThanks for sharing this. Based on the scope we agreed on, this looks to be included in the original project. I’ll proceed under the existing agreement and confirm the delivery schedule. If anything changes, I’ll flag it before doing additional work.\n\nThanks!`;
      }
    } else if (currentAnalysis && ['mixed', 'unclear'].includes(currentAnalysis.verdict)) {
      const qs = (currentAnalysis.clarifyingQuestions || []).slice(0, 3);
      const questionText = qs.length ? qs.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'Could you confirm the exact deliverables and any required revisions?';
      if (lang === 'hinglish') {
        message = `${hello}\n\nRequest share karne ke liye thanks. Main original scope ke saath compare kar raha/rahi hoon, lekin price aur timeline confirm karne se pehle kuch details clear karna chahta/chahti hoon:\n${questionText}\n\nIn points ko confirm kar dein, phir main bata dunga/dungi ki ye existing scope mein covered hai ya iske liye additional fee/timeline chahiye.\n\nThanks!`;
      } else {
        message = `${hello}\n\nThanks for sharing the request. I’ve compared it with our original scope, but I’d like to clarify a few details before confirming whether any additional fee or time is needed:\n${questionText}\n\nOnce these points are confirmed, I’ll document the agreed scope and any cost or timeline impact before proceeding.\n\nThanks!`;
      }
    } else if (lang === 'hinglish') {
      if (tone === 'friendly') message = `${hello}\n\nIs request ko share karne ke liye thanks! Main ye extra work kar sakta/sakti hoon. Ye hamare original scope ke beyond hai, isliye iske liye additional fee ${money(fee)} hogi aur delivery mein ${plural(days, 'day')} extra lagenge. Agar aap comfortable hain, toh main revised scope confirm karke kaam start kar dunga/dungi.\n\nThanks!`;
      else if (tone === 'firm') message = `${hello}\n\nYe request original agreed scope mein included nahi thi. Is additional work ka charge ${money(fee)} hoga aur timeline ${plural(days, 'day')} extend hogi. Please written approval confirm kar dein; approval milne ke baad hi main extra work start karunga/karungi.\n\nThank you.`;
      else message = `${hello}\n\nThanks for sharing the request. Hamare original scope ke comparison mein ye additional work hai. Iske liye revised fee ${money(fee)} hogi aur delivery timeline ${plural(days, 'day')} extend hogi. Aapki confirmation ke baad main updated scope aur timeline ke according proceed karunga/karungi.\n\nRegards`;
    } else {
      if (tone === 'friendly') message = `${hello}\n\nThanks for sharing this request! I can take care of this additional work. Since it falls outside our original scope, the add-on fee would be ${money(fee)}, with ${plural(days, 'day')} added to the timeline. If that works for you, I’ll confirm the revised scope and get started.\n\nThanks!`;
      else if (tone === 'firm') message = `${hello}\n\nThis request falls outside our originally agreed scope. The additional fee is ${money(fee)}, and the delivery timeline will extend by ${plural(days, 'day')}. Please confirm your approval in writing before I begin the additional work. I’ll proceed once the revised scope and price are approved.\n\nThank you.`;
      else message = `${hello}\n\nThanks for sharing the request. Based on our original scope, this would be treated as additional work. The additional fee would be ${money(fee)}, and the delivery timeline would extend by ${plural(days, 'day')}. Once you confirm, I’ll document the revised scope and timeline before proceeding.\n\nRegards`;
    }
    lastDraft = { ...b, description, hours, days, fee, tone, lang, message, analysis: currentAnalysis, id: null };
    $('reply-message').textContent = message;
    updateImpactSummary();
    $('reply-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    toast('Client reply generated. Review it before sending.');
    return true;
  }

  const commonWords = new Set(['a','an','the','and','or','to','for','of','in','on','with','please','can','could','would','you','we','i','it','this','that','also','just','need','want','make','add','new','please','client','request','work','project','page','section','feature']);
  function localScopeAnalysis(scope, requestText, revisions) {
    const normal = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const scopeNorm = normal(scope); const requestNorm = normal(requestText);
    const scopeTokens = new Set(scopeNorm.split(/\s+/).filter(w => w.length > 2));
    const requestTokens = [...new Set(requestNorm.split(/\s+/).filter(w => w.length > 2 && !commonWords.has(w)))];
    const matched = requestTokens.filter(w => scopeTokens.has(w));
    const additions = /\b(add|adding|new|another|extra|additional|also|integrat|connect|second|third|expand|more|include another|create a|build a|set up)\b/i.test(requestText);
    const revisionLanguage = /\b(revision|revise|tweak|adjust|change the text|fix|correct|minor edit|colour|color|spacing|typo)\b/i.test(requestText);
    const revisionAllowed = revisionLanguage && (revisions === 'unlimited' || Number(revisions) > 0);
    let verdict = 'unclear';
    let summary = 'The request and scope text do not provide enough detail for a reliable conclusion. Confirm the deliverables before agreeing.';
    let included = matched.length ? [`The request shares these terms with the original scope: ${matched.slice(0, 5).join(', ')}.`] : [];
    let extras = [];
    let questions = ['Which exact deliverables or changes should be included?', 'Does this replace an item in the original scope or add something new?'];
    let hours = 1; let days = 1;
    if (revisionAllowed) {
      verdict = 'likely_in_scope';
      summary = 'The wording resembles a revision or correction, and the project notes indicate revisions are included. Confirm the remaining revision allowance and exact change.';
      included = ['The request sounds like a revision/correction.', `Recorded revision allowance: ${revisions === 'unlimited' ? 'unlimited / as agreed' : `${revisions} round(s)`}.`];
      extras = [];
      questions = ['Is this within the agreed revision rounds?', 'Does the change introduce a new deliverable or new functionality?'];
      hours = 0; days = 0;
    } else if (additions) {
      verdict = matched.length ? 'mixed' : 'likely_out_of_scope';
      summary = matched.length ? 'Some wording overlaps with the original scope, but the request appears to add or expand deliverables. Separate the included portion from new work.' : 'The wording suggests a new or expanded deliverable, but this keyword check cannot determine contract coverage. Review the agreement before treating it as extra work.';
      extras = ['Possible new or expanded deliverable detected from the request wording.'];
      questions = ['Which new deliverables are required, and what does “done” mean for each?', 'Is any requested item already listed in the signed proposal or statement of work?'];
      const itemCount = (requestText.match(/\b(and|also|plus|another|additionally)\b/gi) || []).length;
      hours = Math.min(16, Math.max(1, (itemCount + 1) * 2));
      days = Math.max(1, Math.ceil(hours / 4));
    } else if (matched.length >= 3) {
      verdict = 'mixed';
      summary = 'The request shares some terms with the original scope, but a keyword match is not enough to confirm it is included. Clarify the exact outcome and boundaries.';
      extras = ['No explicit new deliverable was conclusively identified; coverage remains uncertain.'];
      hours = 1; days = 1;
    } else {
      verdict = 'unclear';
      summary = 'A local keyword check cannot confidently match the request to the written scope. Ask one or two questions before committing on cost or deadline.';
      extras = ['Potential scope change needs human review.'];
      hours = 2; days = 1;
    }
    return { verdict, confidence: 'low', summary, likelyIncluded: included, possibleExtras: extras, clarifyingQuestions: questions, suggestedExtraHours: hours, suggestedExtraDays: days, rationale: 'Local fallback only: this uses simple wording and keyword rules, not a language model. It can miss context, synonyms, attachments, and contract details.' };
  }

  function renderList(id, items, emptyText) {
    const el = $(id);
    const list = (Array.isArray(items) ? items : []).filter(Boolean).slice(0, 4);
    el.innerHTML = list.length ? list.map(item => `<li>${safe(item)}</li>`).join('') : `<li class="analysis-empty">${safe(emptyText)}</li>`;
  }
  function renderAnalysis(analysis, mode) {
    lastAnalysis = analysis;
    lastAnalysisRequest = $('request-description').value.trim();
    lastAnalysisScope = baseline().scope;
    const labels = { likely_in_scope: 'Likely within scope', likely_out_of_scope: 'Likely extra work', mixed: 'Mixed / partly unclear', unclear: 'Review needed' };
    const verdictEl = $('analysis-verdict');
    verdictEl.textContent = labels[analysis.verdict] || labels.unclear;
    verdictEl.className = `verdict-${analysis.verdict || 'unclear'}`;
    $('analysis-mode').textContent = mode === 'ai' ? 'AI ANALYSIS' : 'LOCAL CHECK';
    $('analysis-mode').className = `analysis-mode ${mode === 'ai' ? 'mode-ai' : 'mode-local'}`;
    $('analysis-summary').textContent = analysis.summary || 'Review the request and original scope manually.';
    renderList('analysis-included', analysis.likelyIncluded, 'No clearly covered item identified.');
    renderList('analysis-extras', analysis.possibleExtras, 'No definite extra identified; verify manually.');
    renderList('analysis-questions', analysis.clarifyingQuestions, 'Confirm deliverables, fee and deadline before starting.');
    const hours = Math.max(0, Math.min(200, Number(analysis.suggestedExtraHours) || 0));
    const days = Math.max(0, Math.min(90, Math.round(Number(analysis.suggestedExtraDays) || 0)));
    const fee = Math.round((num('hourly-rate') * hours) / 100) * 100;
    $('analysis-estimate').textContent = `${plural(hours, 'hour')} · ${plural(days, 'day')}`;
    $('analysis-fee').textContent = money(fee);
    $('analysis-rationale').textContent = `Confidence: ${analysis.confidence || 'low'}. ${analysis.rationale || 'Confirm the recommendation manually.'} ${mode === 'ai' ? 'AI-generated recommendation; verify all assumptions.' : 'AI is not configured for this session, so this is only a simple rules-based fallback.'}`;
    $('analysis-result').hidden = false;
  }
  async function analyzeScope() {
    const scope = baseline().scope;
    const requestText = $('request-description').value.trim();
    if (!scope) { toast('Add the original agreed scope first.'); $('included-scope').focus(); return; }
    if (!requestText) { toast('Paste the client request first.'); $('request-description').focus(); return; }
    const button = $('analyze-btn');
    button.disabled = true; button.classList.add('is-loading'); button.innerHTML = '<span>◌</span> Comparing scope…';
    const payload = { scope, request: requestText, revisions: $('revision-count').value, projectName: $('project-name').value.trim(), hourlyRate: num('hourly-rate'), originalProjectValue: num('project-value') };
    try {
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if ($('request-description').value.trim() !== requestText || baseline().scope !== scope) { toast('The scope or request changed. Run the comparison again.'); return; }
      if (!response.ok || !data.analysis) throw new Error(data.message || data.error || 'AI is unavailable');
      renderAnalysis(data.analysis, data.mode || 'ai');
      toast(data.mode === 'ai' ? 'AI scope comparison complete. Review the assumptions.' : 'Local scope check complete.');
    } catch (error) {
      if ($('request-description').value.trim() !== requestText || baseline().scope !== scope) { toast('The scope or request changed. Run the comparison again.'); return; }
      const fallback = localScopeAnalysis(scope, requestText, $('revision-count').value);
      renderAnalysis(fallback, 'local');
      const reason = String(error?.message || 'Unknown AI error');
      toast(`LOCAL CHECK — ${reason}`);
    } finally {
      button.disabled = false; button.classList.remove('is-loading'); button.innerHTML = '<span>✦</span> Compare request with original scope <span class="button-arrow">→</span>';
    }
  }
  function applyAnalysisEstimate() {
    if (!lastAnalysis) return;
    $('extra-hours').value = Math.max(0, Number(lastAnalysis.suggestedExtraHours) || 0);
    $('extra-days').value = Math.max(0, Math.round(Number(lastAnalysis.suggestedExtraDays) || 0));
    $('final-fee').dataset.manual = 'false';
    setFeeEstimate(true);
    toast('Suggested estimate applied. Review the quote and deadline.');
  }
  function invalidateAnalysis() {
    if (lastAnalysis) {
      lastAnalysis = null; lastAnalysisRequest = ''; lastAnalysisScope = '';
      $('analysis-result').hidden = true;
    }
  }

  function renderStats() {
    const open = requests.filter(r => r.status === 'pending').length;
    const pending = requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + Number(r.fee || 0), 0);
    const approved = requests.filter(r => ['approved', 'completed'].includes(r.status)).reduce((sum, r) => sum + Number(r.fee || 0), 0);
    $('stat-open').textContent = open;
    $('stat-pending').textContent = money(pending);
    $('stat-approved').textContent = money(approved);
    $('sidebar-count').textContent = open;
  }
  function renderRequestList() {
    const query = ($('log-search')?.value || '').trim().toLowerCase();
    const status = $('status-filter')?.value || 'all';
    const items = requests.filter(r => {
      const matchesSearch = !query || [r.projectName, r.clientName, r.description, r.message].some(x => String(x || '').toLowerCase().includes(query));
      return matchesSearch && (status === 'all' || r.status === status);
    }).sort((a,b) => b.createdAt - a.createdAt);
    $('log-count').textContent = `${items.length} ${items.length === 1 ? 'request' : 'requests'}`;
    $('request-list').innerHTML = items.map(r => `
      <article class="request-item" data-id="${safe(r.id)}">
        <div class="request-item-top"><div><div class="request-item-project">${safe(r.projectName)}</div><div class="request-item-client">${r.clientName ? `Client: ${safe(r.clientName)} · ` : ''}${safe(new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }))}</div></div><span class="request-status ${safe(r.status)}">${safe(statusLabel(r.status))}</span></div>
        <p class="request-item-description">${safe(r.description)}</p>
        ${r.analysis ? `<div class="request-scope-tag">Scope check: ${safe(({likely_in_scope:'Likely in scope',likely_out_of_scope:'Possible extra work',mixed:'Mixed / unclear',unclear:'Needs review'})[r.analysis.verdict] || 'Needs review')}</div>` : ''}
        <div class="request-item-bottom"><div class="request-item-metric"><span>ADD-ON QUOTE</span><strong>${money(r.fee)}</strong></div><div class="request-item-metric"><span>EXTRA TIME</span><strong>${safe(plural(r.hours, 'hour'))}</strong></div><div class="request-item-metric"><span>TIMELINE</span><strong>${safe(plural(r.days, 'day'))}</strong></div><div class="request-item-actions"><select aria-label="Update status for ${safe(r.projectName)}" data-status-id="${safe(r.id)}"><option value="pending" ${r.status==='pending'?'selected':''}>Pending</option><option value="approved" ${r.status==='approved'?'selected':''}>Approved</option><option value="declined" ${r.status==='declined'?'selected':''}>Declined</option><option value="completed" ${r.status==='completed'?'selected':''}>Completed</option></select><button type="button" data-copy-id="${safe(r.id)}">Copy reply</button><button type="button" data-delete-id="${safe(r.id)}" aria-label="Delete request">Delete</button></div></div>
      </article>`).join('');
    const isEmpty = items.length === 0;
    $('request-list').style.display = isEmpty ? 'none' : 'grid';
    $('empty-state').classList.toggle('visible', isEmpty);
    if (isEmpty && requests.length > 0) {
      $('empty-state').querySelector('h2').textContent = 'No matching requests.';
      $('empty-state').querySelector('p').textContent = 'Try another search term or status filter to find the request you need.';
      $('empty-state').querySelector('button').style.display = 'none';
    } else if (isEmpty) {
      $('empty-state').querySelector('h2').textContent = 'Your paper trail starts here.';
      $('empty-state').querySelector('p').textContent = 'Generate a client reply and save the change request. It will appear here so you can keep track of the decision.';
      $('empty-state').querySelector('button').style.display = 'inline-flex';
    }
  }
  function draftMatchesCurrent() {
    if (!lastDraft) return false;
    const b = baseline();
    return lastDraft.projectName === b.projectName && lastDraft.clientName === b.clientName &&
      lastDraft.projectValue === b.projectValue && lastDraft.hourlyRate === b.hourlyRate &&
      lastDraft.revisions === b.revisions && lastDraft.scope === b.scope &&
      lastDraft.description === $('request-description').value.trim() &&
      lastDraft.hours === num('extra-hours') && lastDraft.days === num('extra-days') &&
      lastDraft.fee === num('final-fee') && lastDraft.tone === $('message-tone').value &&
      lastDraft.lang === $('message-language').value;
  }
  function saveDraftToLog() {
    if (!draftMatchesCurrent()) {
      if (!generateMessage()) return;
    }
    const alreadySaved = lastDraft.id && requests.some(r => r.id === lastDraft.id);
    if (alreadySaved) { toast('This draft is already in your request log.'); return; }
    const record = { ...lastDraft, id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, status: 'pending', createdAt: Date.now() };
    requests.push(record); lastDraft.id = record.id; saveRequests();
    toast('Saved to your request log.');
    $('save-request-btn').innerHTML = '✓ Saved to request log';
    setTimeout(() => { $('save-request-btn').innerHTML = 'Save to request log <span>→</span>'; }, 1800);
  }
  function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    $(viewName === 'requests' ? 'requests-view' : 'workspace-view').classList.add('active-view');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === viewName));
    $('crumb-current').textContent = viewName === 'requests' ? 'Request log' : 'Overview';
    if (viewName === 'requests') renderRequestList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toast(message) {
    const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy'); ta.remove(); if (!ok) throw new Error('copy failed');
      }
      return true;
    } catch { return false; }
  }
  function exportData() {
    const payload = { product: 'ScopePing', exportedAt: new Date().toISOString(), baseline: baseline(), requests };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `scopeping-export-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    toast('Exported your workspace data.');
  }

  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => showView(link.dataset.view)));
  $('back-workspace-btn').addEventListener('click', () => showView('workspace'));
  $('empty-new-btn').addEventListener('click', () => showView('workspace'));

  // Calculations and persistence
  ['hourly-rate','extra-hours'].forEach(id => $(id).addEventListener('input', () => setFeeEstimate(false)));
  ['project-name','client-name','project-value','hourly-rate','revision-count','included-scope'].forEach(id => $(id).addEventListener('input', updateImpactSummary));
  $('final-fee').addEventListener('input', () => { $('final-fee').dataset.manual = 'true'; updateImpactSummary(); });
  ['extra-days','extra-hours'].forEach(id => $(id).addEventListener('input', updateImpactSummary));
  $('analyze-btn').addEventListener('click', analyzeScope);
  $('apply-analysis-btn').addEventListener('click', applyAnalysisEstimate);
  $('request-description').addEventListener('input', invalidateAnalysis);
  $('included-scope').addEventListener('input', invalidateAnalysis);
  $('generate-btn').addEventListener('click', generateMessage);
  $('save-request-btn').addEventListener('click', saveDraftToLog);
  $('copy-btn').addEventListener('click', async () => {
    const ok = await copyText($('reply-message').textContent);
    $('copy-feedback').textContent = ok ? 'Copied to clipboard' : 'Select and copy the message manually';
    toast(ok ? 'Message copied.' : 'Clipboard access was blocked by this browser.');
    setTimeout(() => $('copy-feedback').textContent = '', 2800);
  });
  $('export-btn').addEventListener('click', exportData);
  $('log-search').addEventListener('input', renderRequestList);
  $('status-filter').addEventListener('change', renderRequestList);
  $('request-list').addEventListener('change', (event) => {
    const id = event.target.dataset.statusId; if (!id) return;
    const item = requests.find(r => r.id === id); if (!item) return;
    item.status = event.target.value; saveRequests(); toast(`Request marked ${statusLabel(item.status).toLowerCase()}.`);
  });
  $('request-list').addEventListener('click', async (event) => {
    const copyId = event.target.dataset.copyId; const deleteId = event.target.dataset.deleteId;
    if (copyId) {
      const item = requests.find(r => r.id === copyId); if (!item) return;
      const ok = await copyText(item.message || ''); toast(ok ? 'Client reply copied.' : 'Clipboard access was blocked by this browser.');
    }
    if (deleteId) {
      const item = requests.find(r => r.id === deleteId); if (!item) return;
      if (!window.confirm(`Delete the saved request for “${item.projectName}”? This cannot be undone.`)) return;
      requests = requests.filter(r => r.id !== deleteId); saveRequests(); toast('Request deleted.');
    }
  });

  // Friendly date, saved baseline and initial state
  $('today-label').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  loadBaseline();
  setFeeEstimate(true);
  renderStats(); renderRequestList();
  // Show a first useful draft on launch without requiring an AI service.
  $('reply-message').textContent = 'Hi! Thanks for sharing this request. I’ll review how it fits with our original scope and confirm the cost and timeline before I begin. That way, we’re both clear on what’s included.';
})();
