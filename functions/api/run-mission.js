const MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const SITE_ORIGIN = 'https://novaworkforce.online';
const SPECIALIST_ROLES = {
  Research: 'Evidence discovery, market research, competitor analysis, source-aware synthesis.',
  Strategy: 'Requirements, decomposition, prioritisation, sequencing, route selection.',
  Growth: 'Marketing, sales, positioning, campaigns, outreach, customer acquisition.',
  Engineering: 'Software architecture, implementation planning, testing, technical verification.',
  Operations: 'Repeatable workflows, process design, handoffs, controls, operating procedures.',
  Analyst: 'Comparisons, metrics, synthesis, decision support, business intelligence.'
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
function extractText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => typeof part?.text === 'string' ? part.text : '').filter(Boolean).join('\n').trim();
}
function extractSources(payload) {
  const chunks = payload?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  return chunks.map((chunk) => ({ url: String(chunk?.web?.uri || ''), title: String(chunk?.web?.title || chunk?.web?.domain || '') })).filter((item) => /^https?:\/\//i.test(item.url)).slice(0, 10);
}
function parseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { const match = text.match(/\{[\s\S]*\}/); if (!match) return null; try { return JSON.parse(match[0]); } catch { return null; } }
}
function cleanList(value, limit = 8) { return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean).slice(0, limit) : []; }
function normalizeSpecialists(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({ name: String(item?.name || ''), reason: String(item?.reason || '') })).filter((item) => Object.prototype.hasOwnProperty.call(SPECIALIST_ROLES, item.name)).slice(0, 3);
}
async function verifyTurnstile(token, secret, request) {
  if (!token || typeof token !== 'string' || token.length > 4096) return false;
  const body = new URLSearchParams({ secret, response: token });
  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (remoteIp) body.set('remoteip', remoteIp);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const result = await response.json().catch(() => null);
  return response.ok && result?.success === true && (!result.hostname || result.hostname === 'novaworkforce.online' || result.hostname.endsWith('.novaworkforce.online') || result.hostname.endsWith('.pages.dev'));
}
async function callGemini(apiKey, prompt, options = {}) {
  const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } };
  if (options.googleSearch) request.tools = [{ google_search: {} }];
  const upstream = await fetch(MODEL_URL, { method: 'POST', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(request), signal: AbortSignal.timeout(45000) });
  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) throw new Error(payload?.error?.message || 'The AI provider rejected the request.');
  return { text: extractText(payload), sources: extractSources(payload) };
}
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ success: false, message: 'Only POST requests are supported.' }, 405);
  const origin = request.headers.get('Origin');
  const allowed = new Set([SITE_ORIGIN, 'https://www.novaworkforce.online', 'https://nova-workforce.pages.dev']);
  if (origin) {
    let requestOrigin;
    try { requestOrigin = new URL(origin); } catch { return json({ success: false, message: 'Request origin is not allowed.' }, 403); }
    if (!allowed.has(origin) && !requestOrigin.hostname.endsWith('.pages.dev')) return json({ success: false, message: 'Request origin is not allowed.' }, 403);
  }
  if (!env.GEMINI_API_KEY) return json({ success: false, message: 'The Gemini server key is not configured in Cloudflare Pages secrets.' }, 503);
  if (!env.TURNSTILE_SECRET_KEY) return json({ success: false, message: 'Turnstile is not configured. Add TURNSTILE_SECRET_KEY in Cloudflare Pages secrets.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ success: false, message: 'Request body must be valid JSON.' }, 400); }
  const mission = typeof body?.mission === 'string' ? body.mission.trim() : '';
  if (!mission) return json({ success: false, message: 'A mission is required.' }, 400);
  if (mission.length > 8000) return json({ success: false, message: 'Mission and context are too long. Keep the combined request under 8,000 characters.' }, 413);
  let captchaValid = false;
  try { captchaValid = await verifyTurnstile(body?.turnstileToken, env.TURNSTILE_SECRET_KEY, request); } catch { captchaValid = false; }
  if (!captchaValid) return json({ success: false, message: 'Security check expired or failed. Complete the check and retry.' }, 403);

  const plannerPrompt = [
    'You are NOVA Planner, the planning layer of an early-stage AI workflow product.',
    'Understand the business mission, identify constraints and assumptions, choose useful specialist roles and produce a practical route.',
    'Do not claim to have performed external research, browsed websites, called APIs, accessed files or changed external systems unless this request actually supplied that result.',
    'Choose 1 to 3 specialists only from: Research, Strategy, Growth, Engineering, Operations, Analyst.',
    'Return ONLY valid JSON with this shape:',
    '{"title":"string","summary":"string","goal":"string","constraints":["string"],"recommended_path":["string"],"specialists":[{"name":"string","reason":"string"}],"assumptions":["string"]}',
    '', 'Mission:', mission
  ].join('\n');
  let plan;
  try { plan = parseJson((await callGemini(env.GEMINI_API_KEY, plannerPrompt)).text); } catch (error) { return json({ success: false, message: error?.message || 'Planning failed.' }, 502); }
  if (!plan) return json({ success: false, message: 'The planning model returned an unreadable result.' }, 502);
  const specialists = normalizeSpecialists(plan.specialists);
  if (!specialists.length) return json({ success: false, message: 'The planning model did not select a valid specialist.' }, 502);

  let workerOutputs;
  try {
    workerOutputs = await Promise.all(specialists.map(async (specialist) => {
      const prompt = [
        'You are NOVA specialist worker ' + specialist.name + '.',
        'Role: ' + SPECIALIST_ROLES[specialist.name],
        'Work only from the mission and planning context below. Do not pretend to have access or evidence that was not provided.',
        'Separate concrete output from assumptions and information still needed.',
        'Return ONLY valid JSON with this shape:',
        '{"worker":"string","deliverable":"string","key_decisions":["string"],"open_questions":["string"],"evidence_needed":["string"]}',
        '', 'Mission:', mission, '', 'Planning context:', JSON.stringify({ title: plan.title || '', goal: plan.goal || '', recommended_path: cleanList(plan.recommended_path, 8), specialist_reason: specialist.reason })
      ].join('\n');
      const response = await callGemini(env.GEMINI_API_KEY, prompt, { googleSearch: specialist.name === 'Research' });
      const result = parseJson(response.text);
      return { name: specialist.name, reason: specialist.reason, sources: response.sources, result: result || { worker: specialist.name, deliverable: response.text || 'No readable specialist result.', key_decisions: [], open_questions: ['Structured output was not returned.'], evidence_needed: ['Review the output before consequential use.'] } };
    }));
  } catch (error) { return json({ success: false, message: error?.message || 'Specialist execution failed.' }, 502); }

  const verifierPrompt = [
    'You are NOVA model-review layer.',
    'Review the mission, plan and specialist outputs. Check whether the output addresses the request, whether assumptions are clearly separated, claims require evidence, and the next step is sensible.',
    'Do not invent external validation. A model review is not independent proof that facts are true. Do not describe this as verified truth.',
    'Return ONLY valid JSON with this shape:',
    '{"passed":true,"checks":["string"],"gaps":["string"],"final_summary":"string","next_action":"string"}',
    '', 'Mission:', mission, '', 'Plan:', JSON.stringify(plan), '', 'Specialist outputs:', JSON.stringify(workerOutputs)
  ].join('\n');
  let verification;
  try { verification = parseJson((await callGemini(env.GEMINI_API_KEY, verifierPrompt)).text); } catch (error) { return json({ success: false, message: error?.message || 'Review step failed.' }, 502); }
  if (!verification) return json({ success: false, message: 'The model-review step returned an unreadable result.' }, 502);
  return json({ success: true, data: {
    title: String(plan.title || 'NOVA mission'),
    summary: String(verification.final_summary || plan.summary || ''),
    goal: String(plan.goal || ''),
    recommended_path: cleanList(plan.recommended_path, 8),
    specialists: workerOutputs.map((item) => ({ name: item.name, reason: item.reason, deliverable: String(item.result?.deliverable || ''), decisions: cleanList(item.result?.key_decisions, 6), open_questions: cleanList(item.result?.open_questions, 6), evidence_needed: cleanList(item.result?.evidence_needed, 6), sources: item.sources || [] })),
    verification: cleanList(verification.checks, 8),
    gaps: cleanList(verification.gaps, 8),
    assumptions: cleanList(plan.assumptions, 8),
    next_action: String(verification.next_action || 'Review the result and decide the next step.'),
    model_review_passed: verification.passed === true
  } });
}
