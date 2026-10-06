import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import figlet from 'figlet';

export async function getProfile() {
  const profile = await getEntry('site', 'profile');
  if (!profile) throw new Error('src/content/site/profile.md is missing');
  return profile;
}

/** Banner generated at build time so the art can never drift from figlet's output. */
export function banner(text: string): string {
  return figlet
    .textSync(text, { font: 'Small Slant' })
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, i, all) => line.length > 0 || (i > 0 && i < all.length - 1))
    .join('\n');
}

export async function getProjects(tier: 'featured' | 'archived') {
  return (await getCollection('projects', (p) => p.data.tier === tier)).sort((a, b) => a.data.order - b.data.order);
}

export async function getExperience() {
  return (await getCollection('experience')).sort((a, b) => b.data.start.getTime() - a.data.start.getTime());
}

// Dates are stored as UTC midnight; format in UTC so a month never slips in western time zones.
const month = new Intl.DateTimeFormat('en-CA', { month: 'short', year: 'numeric', timeZone: 'UTC' });
export const fmtMonth = (d: Date) => month.format(d).replace('.', '');

export function fmtRange(start: Date, end?: Date): string {
  if (!end) return `${fmtMonth(start)} – Present`;
  const a = fmtMonth(start);
  const b = fmtMonth(end);
  return a === b ? a : `${a} – ${b}`;
}

type AnyEntry =
  | CollectionEntry<'site'>
  | CollectionEntry<'projects'>
  | CollectionEntry<'experience'>
  | CollectionEntry<'education'>
  | CollectionEntry<'skills'>
  | CollectionEntry<'now'>
  | CollectionEntry<'opinions'>;

let reported = false;

/** A9: warn (never fail) once per build while any content is still unverified. */
export async function reportUnverified(): Promise<void> {
  if (reported) return;
  reported = true;
  const names = ['site', 'projects', 'experience', 'education', 'skills', 'now', 'opinions'] as const;
  const all = (await Promise.all(names.map((n) => getCollection(n)))).flat() as AnyEntry[];
  const pending = all.filter((e) => !e.data.verified);
  if (!pending.length) return;
  console.warn(`\n[content] ${pending.length}/${all.length} entries unverified — flip \`verified: true\` once checked:`);
  for (const e of pending) console.warn(`  · ${e.collection}/${e.id}  (${e.data.source})`);
  console.warn('');
}
