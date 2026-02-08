const { SUPPORT_KB } = require('./platformSupportKb');

const safeText = (value) => String(value || '').slice(0, 4000);

const normalizeRole = (value) => {
  const role = String(value || '').trim().toLowerCase();
  if (role === 'user' || role === 'ngo' || role === 'admin') return role;
  return 'guest';
};

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const scoreEntry = (entry, message) => {
  if (!entry) return 0;
  const text = String(message || '').toLowerCase();
  let score = 0;
  const title = String(entry.title || '').toLowerCase();
  if (title && text.includes(title)) score += 3;
  const keywords = Array.isArray(entry.keywords) ? entry.keywords : [];
  for (const kw of keywords) {
    const needle = String(kw || '').toLowerCase().trim();
    if (!needle) continue;
    if (text.includes(needle)) score += 2;
  }
  return score;
};

const selectKbEntries = (message, limit = 4) => {
  const scored = SUPPORT_KB
    .map((entry) => ({ entry, score: scoreEntry(entry, message) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 8)))
    .map((row) => row.entry);

  if (scored.length > 0) return scored;

  // Default to a small baseline when no keywords match.
  const baseline = SUPPORT_KB.filter((entry) => entry.id === 'overview' || entry.id === 'troubleshooting');
  return baseline.length > 0 ? baseline : SUPPORT_KB.slice(0, 2);
};

const normalizeHistory = (history = []) => {
  if (!Array.isArray(history)) return [];
  const normalized = [];
  for (const item of history.slice(-14)) {
    if (!item) continue;
    const role = String(item.role || item.from || '').toLowerCase();
    const mappedRole = role === 'assistant' || role === 'bot' ? 'assistant' : 'user';
    const content = safeText(item.content || item.text || item.message || '');
    if (!content.trim()) continue;
    normalized.push({ role: mappedRole, content });
  }
  return normalized;
};

const roleHelpBlurb = (role) => {
  if (role === 'admin') {
    return 'The user is an admin. Prefer admin workflows (verification, requests, analytics) when relevant.';
  }
  if (role === 'ngo') {
    return 'The user is an NGO. Prefer NGO workflows (profile, approvals, transactions, volunteering) when relevant.';
  }
  if (role === 'user') {
    return 'The user is a regular user. Prefer user workflows (browse, donate, volunteer, certificates, messages).';
  }
  return 'The user may be logged out. Provide guest-safe guidance and suggest logging in for role-specific actions.';
};

const buildSystemPrompt = ({ role }) => {
  return [
    'You are "NGO Connect Bot", a support assistant for the NGO Connect platform.',
    '',
    'Core goals:',
    '- Answer questions about how the website works (features, pages, flows, statuses).',
    '- Give clear step-by-step instructions that match the user\'s role.',
    '- Ask 1 clarifying question if needed (e.g. role, which page, what error/status they see).',
    '- When you reference navigation, use the exact page names: Dashboard, NGOs, Campaigns, Volunteer Opportunities, Messages, Admin Dashboard.',
    '',
    'Safety and privacy:',
    '- Never provide or request passwords, OTPs, or private credentials.',
    '- Do not claim you performed actions on the user\'s account.',
    '- Do not invent NGO/campaign names or facts not present in context.',
    '',
    `Role context: ${roleHelpBlurb(role)}`
  ].join('\n');
};

const buildPrompt = ({ message, role, kbEntries, dbContext, history, clientContext }) => {
  const kbText = (kbEntries || [])
    .map((entry) => `### ${entry.title}\n${entry.content}`)
    .join('\n\n');

  const historyLines = (history || [])
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content}`)
    .join('\n');

  const ctxLines = [];
  if (clientContext && typeof clientContext === 'object') {
    if (clientContext.path) ctxLines.push(`Current page: ${safeText(clientContext.path)}`);
  }

  return [
    buildSystemPrompt({ role }),
    '',
    ctxLines.length ? `Client context:\n${ctxLines.join('\n')}` : '',
    dbContext ? `Database context:\n${dbContext}` : '',
    kbText ? `Platform knowledge:\n${kbText}` : '',
    historyLines ? `Conversation so far:\n${historyLines}` : '',
    `User question: ${safeText(message)}`,
    '',
    'Write a helpful response. Use short paragraphs or bullets. Keep it concise.'
  ]
    .filter(Boolean)
    .join('\n\n');
};

const buildFallbackReply = ({ message, role, kbEntries }) => {
  const text = String(message || '').toLowerCase();

  const sensitive = ['password', 'otp', 'credentials', 'login details', 'id password'];
  if (sensitive.some((kw) => text.includes(kw))) {
    return [
      'I can\'t help with passwords or private credentials.',
      '',
      'If you\'re having trouble signing in:',
      '- Double-check you\'re using the correct email/role account.',
      '- If you forgot the password, contact the admin/support team (there is no password reset flow in the app yet).'
    ].join('\n');
  }

  if (text.includes('certificate')) {
    const entry = (kbEntries || []).find((e) => e.id === 'donations') ||
      (kbEntries || []).find((e) => e.id === 'campaign_volunteering') ||
      (kbEntries || [])[0];
    return entry ? entry.content : 'Certificates are issued only after the NGO approves. Check your dashboard for status.';
  }

  if (text.includes('volunteer') && (text.includes('hours') || text.includes('activity'))) {
    return [
      'Volunteer hours depend on the type of volunteering:',
      '- Volunteer Opportunities: hours come from the completion step.',
      '- Campaign Volunteering: hours are recorded/updated by the NGO during approval.',
      '',
      'Check:',
      '- User Dashboard -> Volunteer History (opportunities)',
      '- User Dashboard -> Campaign Volunteer Registrations (campaign volunteering)'
    ].join('\n');
  }

  const top = Array.isArray(kbEntries) && kbEntries.length ? kbEntries[0] : null;
  const roleLine = role && role !== 'guest' ? `You are logged in as: ${role}.` : '';
  return [
    roleLine,
    top ? top.content : 'Ask me how to donate, volunteer, view certificates, or message NGOs.',
    '',
    'If you tell me your role (user/ngo/admin) and what page you are on, I can guide you more precisely.'
  ]
    .filter(Boolean)
    .join('\n');
};

module.exports = {
  normalizeRole,
  escapeRegExp,
  selectKbEntries,
  normalizeHistory,
  buildPrompt,
  buildFallbackReply
};
