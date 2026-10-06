// Grounding for /api/chat, built from the same collections the pages render — the agent can only
// know what the site says. `hash` versions the KV answer cache; pregenerated answers are attached
// only while they were made against this exact hash (scripts/pregen-answers.ts).
import { getCollection, getEntry } from 'astro:content';
import pregenerated from '../data/agent-answers.json';
import { SUGGESTED, sha256Hex } from '../agent/core';
import { fmtDay, fmtMonth, fmtRange, getExperience, getPosts, getProjects } from '../lib/content';

const strip = (md = '') => md.replace(/\s+/g, ' ').trim();

export async function GET() {
  const profile = (await getEntry('site', 'profile'))!;
  const p = profile.data;
  const lines: string[] = [];
  const push = (...l: string[]) => lines.push(...l);

  push(
    '# Profile',
    `Name: ${p.name} (handle ${p.handle})`,
    `Headline: ${p.headline}`,
    ...p.facts.map((f) => `- ${f.text}`),
    `Contact: ${p.socials.map((s) => `${s.label} ${s.href.replace(/^mailto:/, '')}`).join(' · ')}`,
    `Resume PDF: ${p.resumePdf}`,
    `About: ${strip(profile.body)}`,
    '',
    '# Featured projects (projects column)',
  );
  for (const { data: d, body } of await getProjects('featured')) {
    push(
      `## ${d.name} (${d.when})${d.status.length ? ' — ' + d.status.map((s) => s.text).join(', ') : ''}`,
      strip(body),
      ...d.highlights.map((h) => `- ${h}`),
      `Tech: ${d.tech.join(', ')}`,
      ...(d.links.length ? [`Links: ${d.links.map((l) => `${l.label} ${l.href}`).join(' · ')}`] : []),
    );
  }
  push('', '# Archived projects');
  for (const { data: d, body } of await getProjects('archived')) push(`- ${d.name} (${d.when}): ${strip(body)}`);

  push('', '# Experience (resume column)');
  for (const { data: e } of await getExperience()) {
    push(`## ${e.role} — ${e.org} (${fmtRange(e.start, e.end)}, ${e.where})`, ...e.bullets.map((b) => `- ${b}`));
  }
  push('', '# Education');
  for (const { data: s } of await getCollection('education')) {
    push(`- ${s.program}, ${s.school} (${s.where}), ${fmtMonth(s.start)} – expected ${fmtMonth(s.expected)}`);
  }
  push('', '# Skills (no self-ratings on purpose)');
  for (const { data: s } of await getCollection('skills')) push(`- ${s.group}: ${s.items.join(', ')}`);
  push('', '# Now (~/ column)');
  for (const { data: n } of await getCollection('now')) push(`- ${n.label}: ${n.text}`);
  push('', '# Blog posts (blog column)');
  for (const post of await getPosts()) {
    push(`- "${post.data.title}" (${fmtDay(post.data.pubDate)}) /blog/${post.id} — ${post.data.description}`);
  }

  const text = lines.join('\n');
  const hash = (await sha256Hex(text)).slice(0, 16);
  const answers = pregenerated.hash === hash ? (pregenerated.answers as Record<string, string>) : {};
  const suggested = SUGGESTED.map((q) => (answers[q] ? { q, a: answers[q] } : { q }));

  return new Response(JSON.stringify({ hash, text, suggested }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
