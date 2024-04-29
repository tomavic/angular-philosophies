#!/usr/bin/env node
// Angular Philosophies MCP server. No dependencies: newline-delimited JSON-RPC 2.0 over stdio.
// It serves the chapters in `data.json` (generated from docs/) so an agent pulls only the chapter it needs.
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const { topics } = JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8'));
const SERVER = { name: 'angular-philosophies', version: '2.0.0' };

const findTopic = ref => {
  const key = String(ref ?? '').trim().toLowerCase();
  return topics.find(t => t.slug === key || t.n === key.padStart(2, '0') || t.slug.endsWith(`-${key}`) || t.title.toLowerCase() === key);
};

const text = value => ({ content: [{ type: 'text', text: value }] });
const fail = message => ({ isError: true, content: [{ type: 'text', text: message }] });
const rulesOf = t => t.rules.map(r => `- ${r}`).join('\n');

const tools = {
  list_topics: {
    description: 'List every chapter of the Angular Philosophies guide with its title and a one-line summary.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: () => text(topics.map(t => `${t.slug}: ${t.title}. ${t.summary}`).join('\n')),
  },
  get_topic: {
    description: 'Return one whole chapter (prose, code and rules). Accepts a slug such as "03-signal-store", a number such as "3", or the title.',
    inputSchema: { type: 'object', properties: { topic: { type: 'string' } }, required: ['topic'], additionalProperties: false },
    run: ({ topic }) => {
      const t = findTopic(topic);
      return t ? text(t.body) : fail(`Unknown topic "${topic}". Call list_topics for the valid names.`);
    },
  },
  get_rules: {
    description: 'Return the imperative rules of one chapter, or of every chapter when no topic is given. Prefer this over get_topic when you only need what to do.',
    inputSchema: { type: 'object', properties: { topic: { type: 'string' } }, additionalProperties: false },
    run: ({ topic } = {}) => {
      if (!topic) return text(topics.filter(t => t.rules.length).map(t => `## ${t.title}\n${rulesOf(t)}`).join('\n\n'));
      const t = findTopic(topic);
      return t ? text(`## ${t.title}\n${rulesOf(t)}`) : fail(`Unknown topic "${topic}". Call list_topics for the valid names.`);
    },
  },
  search: {
    description: 'Find the rules and passages that mention a word or phrase, across every chapter.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false },
    run: ({ query }) => {
      const q = String(query ?? '').trim().toLowerCase();
      if (!q) return fail('Give a non-empty query.');
      const hits = [];
      for (const t of topics) {
        for (const rule of t.rules) if (rule.toLowerCase().includes(q)) hits.push(`[${t.slug}, rule] ${rule}`);
        for (const line of t.body.split('\n')) {
          const clean = line.trim();
          if (clean && !clean.startsWith('- ') && clean.toLowerCase().includes(q)) hits.push(`[${t.slug}] ${clean.slice(0, 240)}`);
        }
      }
      return text(hits.length ? hits.slice(0, 15).join('\n') : `Nothing matches "${query}".`);
    },
  },
};

const handlers = {
  initialize: p => ({ protocolVersion: p?.protocolVersion ?? '2024-11-05', capabilities: { tools: {} }, serverInfo: SERVER }),
  ping: () => ({}),
  'tools/list': () => ({ tools: Object.entries(tools).map(([name, { description, inputSchema }]) => ({ name, description, inputSchema })) }),
  'tools/call': p => {
    const tool = tools[p?.name];
    return tool ? tool.run(p.arguments ?? {}) : fail(`Unknown tool "${p?.name}".`);
  },
};

const send = message => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`);

createInterface({ input: process.stdin }).on('line', line => {
  if (!line.trim()) return;
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return send({ id: null, error: { code: -32700, message: 'Parse error' } });
  }
  if (request.id === undefined) return; // a notification such as notifications/initialized
  const handler = handlers[request.method];
  if (!handler) return send({ id: request.id, error: { code: -32601, message: `Method not found: ${request.method}` } });
  try {
    send({ id: request.id, result: handler(request.params) });
  } catch (error) {
    send({ id: request.id, error: { code: -32603, message: String(error?.message ?? error) } });
  }
});
