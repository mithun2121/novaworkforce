const categoryData = [
  { name: 'Agriculture', description: 'Organise farm notes, expenses and task lists.', workflows: [
    { name: 'Daily farm task planner', kind: 'Uses supplied information', description: 'Create a task checklist from crop stage, field notes and available labour.', prompt: 'Create a practical daily farm operations checklist using only the farm details provided. Prioritise time-sensitive work, state assumptions, and flag agricultural or safety decisions that need local expert confirmation.' },
    { name: 'Farm expense and yield review', kind: 'Uses supplied information', description: 'Summarise supplied expenses and harvest records.', prompt: 'Analyse the supplied farm expense and harvest data. Calculate totals only where inputs allow, identify missing values and unusual costs, and do not invent missing numbers.' },
    { name: 'Weather-aware field briefing', kind: 'Needs a configured integration', description: 'Prepare a briefing after connecting a weather provider.', prompt: 'Prepare a weather-aware field briefing using connected provider data and supplied farm details. Cite forecast timestamps, distinguish data from recommendations, and flag time-sensitive decisions for local expert review.' },
    { name: 'Farm inventory review', kind: 'Needs a configured integration', description: 'Compare connected inventory against stock thresholds.', prompt: 'Review connected farm inventory against configured thresholds. List items needing attention and draft reorder suggestions. Do not place orders.' }
  ]},
  { name: 'Retail and shop', description: 'Prepare daily reports and review stock notes.', workflows: [
    { name: 'Daily shop opening checklist', kind: 'Uses supplied information', description: 'Create a practical shift checklist from your notes.', prompt: 'Create a concise opening and closing checklist for the described shop. Group tasks by timing and role, include relevant safety and cash-handling checks, and do not claim that tasks have been performed.' },
    { name: 'Sales and expense summary', kind: 'Uses supplied information', description: 'Summarise sales and expenses from supplied data.', prompt: 'Summarise only the sales and expense records supplied. Calculate totals where supported, identify anomalies, state limitations, and suggest actions for review.' },
    { name: 'Stock and low-stock review', kind: 'Needs a configured integration', description: 'Requires a connected point-of-sale or inventory API.', prompt: 'Review current stock returned by a connected inventory system. Show evidence for each alert and draft replenishment suggestions. Never place an order without approval.' },
    { name: 'Customer feedback inbox', kind: 'Needs a configured integration', description: 'Requires a connected reviews or support service.', prompt: 'Classify returned customer feedback by theme and urgency. Summarise recurring issues and draft response suggestions for human approval.' }
  ]},
  { name: 'Office and admin', description: 'Organise documents, reports and follow-ups.', workflows: [
    { name: 'Document and invoice organiser', kind: 'Uses supplied information', description: 'Create a review list from supplied text.', prompt: 'Organise the supplied document text into a review list with document type, date, parties, amounts if present, missing fields and suggested next step. Do not invent fields.' },
    { name: 'Weekly operations report', kind: 'Uses supplied information', description: 'Structure notes, progress and blockers into a report.', prompt: 'Turn supplied weekly notes and metrics into an operations report with accomplishments, blockers, measurable trends, decisions needed and next priorities. Label missing data clearly.' },
    { name: 'Meeting follow-up assistant', kind: 'Needs a configured integration', description: 'Requires calendar or email access to read meeting data.', prompt: 'Use connected calendar data to prepare a meeting brief and draft follow-up tasks or messages. Do not send messages or alter events without approval.' },
    { name: 'CRM follow-up queue', kind: 'Needs a configured integration', description: 'Requires a connected CRM.', prompt: 'Prioritise leads returned by a connected CRM using supplied rules. Explain priorities and draft follow-ups. Do not send outreach or update records.' }
  ]},
  { name: 'Marketing and growth', description: 'Prepare market research and campaign drafts.', workflows: [
    { name: 'Content calendar builder', kind: 'Uses supplied information', description: 'Build a calendar from business goals and campaign dates.', prompt: 'Build a realistic content calendar from supplied goals, audience, offer and dates. Include channel, idea, objective, call to action and production notes. Do not claim anything was published.' },
    { name: 'Competitor research brief', kind: 'Uses supplied information', description: 'Compare the material and URLs you provide.', prompt: 'Create a competitor comparison from supplied evidence. Separate facts from interpretation, include URLs where available and flag information that needs fresh verification.' },
    { name: 'Campaign performance report', kind: 'Needs a configured integration', description: 'Requires connected analytics or advertising metrics.', prompt: 'Analyse metrics returned by the connected provider for the selected period. Explain trends cautiously, flag missing attribution and recommend tests without changing campaigns.' },
    { name: 'Social publishing queue', kind: 'Needs a configured integration', description: 'Requires an approved publishing integration.', prompt: 'Prepare a publishing queue from supplied brand guidelines. Present copy, channel, timing and media requirements for approval. Do not publish until authorised.' }
  ]},
  { name: 'Workshop and services', description: 'Structure job cards, quotes and customer updates.', workflows: [
    { name: 'Job card and work checklist', kind: 'Uses supplied information', description: 'Turn a service request into a draft job card.', prompt: 'Convert the supplied service request into a draft job card, diagnostic checklist, parts to confirm, work sequence and customer questions. Do not assert an unsupported diagnosis.' },
    { name: 'Quote and job-cost review', kind: 'Uses supplied information', description: 'Review supplied labour, parts and rate information.', prompt: 'Review quote inputs and calculate subtotals only where numbers and rules are provided. Highlight missing assumptions and return a draft for approval.' },
    { name: 'Booking and reminder sync', kind: 'Needs a configured integration', description: 'Requires booking or calendar access.', prompt: 'Review appointments returned by a connected booking service and prepare reminders or scheduling suggestions. Do not message customers or alter bookings without approval.' },
    { name: 'Customer ticket triage', kind: 'Needs a configured integration', description: 'Requires a connected helpdesk.', prompt: 'Triage tickets returned by a connected helpdesk under the agreed rules. Explain urgency and draft replies. Do not send replies or close tickets without approval.' }
  ]},
  { name: 'Finance and bookkeeping', description: 'Prepare record reviews without replacing an accountant.', workflows: [
    { name: 'Expense categorisation draft', kind: 'Uses supplied information', description: 'Organise supplied transaction rows for review.', prompt: 'Categorise only supplied transactions using the provided rules. Explain uncertain rows, flag possible duplicates or missing receipts where detectable, and leave final accounting decisions to a qualified reviewer.' },
    { name: 'Month-end checklist', kind: 'Uses supplied information', description: 'Create a checklist for your internal close process.', prompt: 'Create a month-end checklist tailored to the supplied business process. Organise by sequence, owner, evidence and completion criteria. Flag items requiring an accountant.' },
    { name: 'Accounting data review', kind: 'Needs a configured integration', description: 'Requires permitted ledger access.', prompt: 'Review records returned by the connected accounting platform for missing fields, possible duplicates and reconciliation items. Do not post entries or initiate payments.' },
    { name: 'Invoice status and reminders', kind: 'Needs a configured integration', description: 'Requires invoice data and an approved email service.', prompt: 'Review invoice statuses returned by the connected system and draft reminders according to configured terms. Do not send messages or change invoice status without approval.' }
  ]}
];
const $ = (id) => document.getElementById(id);
let activeCategory = 0;
let activeWorkflow = null;
let turnstileToken = '';
let turnstileWidgetId = null;
let siteKey = document.querySelector('meta[name="turnstile-site-key"]')?.content || '';
const runningCopy = 'The server is processing this request. Provider-level step progress is not exposed in this preview.';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function setStatus(text, isError = false) {
  $('mission-status').textContent = text;
  $('mission-status').className = 'status-line' + (isError ? ' form-message error' : '');
}
function renderCategories() {
  const root = $('category-list');
  root.replaceChildren();
  categoryData.forEach((category, index) => {
    const button = el('button', 'category-button', category.name);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(index === activeCategory));
    button.addEventListener('click', () => {
      activeCategory = index;
      activeWorkflow = null;
      renderCategories();
      renderWorkflows();
      renderSelection();
    });
    root.append(button);
  });
}
function renderWorkflows() {
  const category = categoryData[activeCategory];
  $('category-title').textContent = category.name;
  $('category-description').textContent = category.description;
  const root = $('workflow-list');
  root.replaceChildren();
  category.workflows.forEach((workflow, index) => {
    const button = el('button', 'workflow-option');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(activeWorkflow === workflow));
    button.append(el('span', 'template-kind', workflow.kind), el('strong', '', workflow.name), el('span', '', workflow.description));
    button.addEventListener('click', () => {
      activeWorkflow = workflow;
      $('mission-input').value = workflow.prompt;
      renderWorkflows();
      renderSelection();
      setStatus('Workflow selected. Add relevant context before running the mission.');
    });
    root.append(button);
  });
}
function renderSelection() {
  $('selected-title').textContent = activeWorkflow ? activeWorkflow.name : 'Custom mission';
  $('selected-description').textContent = activeWorkflow ? activeWorkflow.description + ' ' + (activeWorkflow.kind === 'Needs a configured integration' ? 'Selecting this template does not connect the required integration.' : 'Use only information you are authorised to share.') : 'Describe the objective, expected output and relevant constraints.';
  $('mission-result').classList.add('hidden');
  $('mission-result').replaceChildren();
}
function markdownReport(data, mission) {
  const lines = ['# NOVA Mission Report', '', '## ' + (data.title || 'Mission result'), '', '**Mission:** ' + mission, '', '**Summary**', data.summary || 'No summary returned.', '', '## Recommended path', ...(data.recommended_path || []).map((item, index) => `${index + 1}. ${item}`), '', '## Specialist outputs'];
  for (const specialist of (data.specialists || [])) {
    lines.push('', '### ' + specialist.name, specialist.reason || '', specialist.deliverable || '');
    for (const d of (specialist.decisions || [])) lines.push('- Decision: ' + d);
    for (const q of (specialist.open_questions || [])) lines.push('- Open question: ' + q);
    for (const e of (specialist.evidence_needed || [])) lines.push('- Evidence needed: ' + e);
    for (const s of (specialist.sources || [])) lines.push('- Source: ' + (s.title || s.url) + ' | ' + s.url);
  }
  lines.push('', '## Model-reported review checks', ...(data.verification || []).map(x => '- ' + x), '', '## Open gaps', ...(data.gaps || []).map(x => '- ' + x), '', '## Assumptions', ...(data.assumptions || []).map(x => '- ' + x), '', '**Suggested next action:** ' + (data.next_action || 'Review the result.'), '', '> AI-generated draft. Model-reported checks are not independent proof of correctness. Review important claims before consequential use.');
  return lines.join('\n');
}
function renderResult(data, mission) {
  const result = $('mission-result');
  result.replaceChildren();
  result.classList.remove('hidden');
  result.append(el('p', 'eyebrow', 'Draft result for review'), el('h3', '', data.title || 'NOVA mission'), el('p', '', data.summary || 'No summary returned.'));
  function addList(title, items) {
    if (!Array.isArray(items) || items.length === 0) return;
    result.append(el('h4', '', title));
    const ul = el('ul');
    items.forEach((item) => ul.append(el('li', '', String(item))));
    result.append(ul);
  }
  addList('Recommended path', data.recommended_path);
  for (const specialist of (data.specialists || [])) {
    result.append(el('h4', '', specialist.name + (specialist.reason ? ' | ' + specialist.reason : '')));
    result.append(el('p', '', specialist.deliverable || 'No deliverable returned.'));
    addList('Decisions', specialist.decisions);
    addList('Open questions', specialist.open_questions);
    addList('Evidence needed', specialist.evidence_needed);
    if (specialist.sources?.length) {
      const sources = el('ul');
      for (const source of specialist.sources) {
        const li = el('li');
        const link = el('a', '', source.title || source.url);
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        li.append(link);
        sources.append(li);
      }
      result.append(el('h4', '', 'Sources returned by the model'), sources);
    }
  }
  addList('Model-reported review checks', data.verification);
  addList('Open gaps', data.gaps);
  addList('Assumptions', data.assumptions);
  result.append(el('h4', '', 'Suggested next action'), el('p', '', data.next_action || 'Review the result and decide what to do next.'), el('p', 'small muted', 'This result is AI-generated. Verify important claims before relying on it.'));
  result.dataset.report = markdownReport(data, mission);
}
function resetTurnstile() {
  turnstileToken = '';
  if (window.turnstile && turnstileWidgetId !== null) {
    try { window.turnstile.reset(turnstileWidgetId); } catch { /* widget may not be ready */ }
  }
}
function configureTurnstile() {
  if (!siteKey || siteKey.includes('__TURNSTILE_SITE_KEY__')) {
    $('turnstile-help').textContent = 'Live mission execution is disabled until TURNSTILE_SITE_KEY is set as a Cloudflare Pages build variable and TURNSTILE_SECRET_KEY is added as a secret.';
    $('run-mission').disabled = true;
    $('run-mission').title = 'Turnstile is not configured';
    return;
  }
  $('turnstile-help').textContent = 'Complete the security check before running a mission. This helps reduce automated misuse of the model API.';
  window.onNovaTurnstileLoaded = () => {
    if (!window.turnstile) return;
    turnstileWidgetId = window.turnstile.render('#turnstile-container', {
      sitekey: siteKey,
      callback: (token) => { turnstileToken = token; $('run-mission').disabled = false; },
      'expired-callback': () => { turnstileToken = ''; },
      'error-callback': () => { turnstileToken = ''; setStatus('The security check did not load. Refresh the page and try again.', true); }
    });
  };
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onNovaTurnstileLoaded&render=explicit';
  script.async = true;
  script.defer = true;
  script.onerror = () => { $('turnstile-help').textContent = 'Turnstile could not load. Check the site key and browser network settings.'; };
  document.head.append(script);
  $('run-mission').disabled = true;
}
$('context-file').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  if (file.size > 1024 * 1024) { setStatus('Choose a text, CSV, JSON or Markdown file smaller than 1 MB.', true); return; }
  if (!/\.(txt|csv|json|md)$/i.test(file.name)) { setStatus('This preview accepts .txt, .csv, .json and .md files only.', true); return; }
  try {
    const contents = await file.text();
    if (!contents.trim()) { setStatus('That file appears to be empty.', true); return; }
    const details = $('business-details');
    details.value += (details.value.trim() ? '\n\n' : '') + 'Uploaded file: ' + file.name + '\n' + contents;
    setStatus('File content added to the mission context. It is not sent until you run the mission.');
  } catch {
    setStatus('The file could not be read. Try saving it as UTF-8 text or CSV.', true);
  }
});
$('run-mission').addEventListener('click', async () => {
  if (!turnstileToken) { setStatus('Complete the security check before running a mission.', true); return; }
  const mission = $('mission-input').value.trim();
  if (!mission) { setStatus('Enter a mission before running it.', true); return; }
  if (mission.length > 4000) { setStatus('Keep the mission under 4,000 characters.', true); return; }
  const details = $('business-details').value.trim();
  const fullMission = mission + (details ? '\n\nAdditional context supplied by the user:\n' + details : '\n\nNo business-specific input was supplied. State missing information and do not invent business facts.');
  const button = $('run-mission');
  button.disabled = true;
  setStatus(runningCopy);
  $('mission-result').classList.add('hidden');
  try {
    const response = await fetch('/api/run-mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission: fullMission, turnstileToken })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success || !payload?.data) {
      throw new Error(payload?.message || 'The mission request failed. Check the Cloudflare function settings.');
    }
    renderResult(payload.data, fullMission);
    setStatus('Result received. Review the output, assumptions, sources and open gaps before relying on it.');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'The mission request failed. Try again later.', true);
  } finally {
    resetTurnstile();
    if (siteKey && !siteKey.includes('__TURNSTILE_SITE_KEY__')) button.disabled = true;
  }
});
$('download-brief').addEventListener('click', () => {
  const mission = $('mission-input').value.trim();
  if (!mission) { setStatus('Enter a mission before downloading a brief.', true); return; }
  const details = $('business-details').value.trim();
  const text = ['# NOVA Workflow Brief', '', '## Mission', mission, '', '## Additional context', details || 'No additional context provided.', '', '> This file is a user-prepared brief. It is not evidence that a mission was executed.'].join('\n');
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'nova-workflow-brief.md'; document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});
$('clear-brief').addEventListener('click', () => {
  $('mission-input').value = '';
  $('business-details').value = '';
  $('context-file').value = '';
  $('mission-result').replaceChildren();
  $('mission-result').classList.add('hidden');
  setStatus('Brief cleared. No mission was submitted.');
});
$('mission-result').addEventListener('click', (event) => {
  if (event.target.closest('a')) return;
});
renderCategories();
renderWorkflows();
renderSelection();
configureTurnstile();
