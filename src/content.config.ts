import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every entry carries `verified` (A9): false = drafted or inferred, needs Elliott's pass.
// `source` records where the facts came from so a reviewer knows what to check against.
const provenance = {
  verified: z.boolean(),
  source: z.string(),
};

const tone = z.enum(['win', 'accent', 'warn', 'muted']);

const site = defineCollection({
  loader: glob({ base: './src/content/site', pattern: '*.md' }),
  schema: z.object({
    name: z.string(),
    handle: z.string(),
    headline: z.string(),
    facts: z.array(z.object({ icon: z.string(), text: z.string() })),
    socials: z.array(z.object({ label: z.string(), href: z.string() })),
    resumePdf: z.string(),
    ...provenance,
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '*.md' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      tier: z.enum(['featured', 'archived']),
      order: z.number(),
      when: z.string(),
      status: z.array(z.object({ text: z.string(), tone })).default([]),
      tech: z.array(z.string()).default([]),
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
      highlights: z.array(z.string()).default([]),
      images: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      ...provenance,
    }),
});

const experience = defineCollection({
  loader: glob({ base: './src/content/experience', pattern: '*.md' }),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    where: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date().optional(), // omitted = present
    bullets: z.array(z.string()),
    ...provenance,
  }),
});

const education = defineCollection({
  loader: glob({ base: './src/content/education', pattern: '*.md' }),
  schema: z.object({
    school: z.string(),
    program: z.string(),
    where: z.string(),
    start: z.coerce.date(),
    expected: z.coerce.date(),
    ...provenance,
  }),
});

// D12: skills are plain lists — no levels, ratings or bars.
const skills = defineCollection({
  loader: file('src/content/skills.yaml'),
  schema: z.object({ group: z.string(), items: z.array(z.string()), ...provenance }),
});

const now = defineCollection({
  loader: file('src/content/now.yaml'),
  schema: z.object({ label: z.string(), text: z.string(), ...provenance }),
});

const opinions = defineCollection({
  loader: glob({ base: './src/content/opinions', pattern: '*.md' }),
  schema: z.object({ title: z.string(), stub: z.boolean().default(false), ...provenance }),
});

// Posts are Elliott's own writing (imported from dev.to by scripts/sync-devto.ts), so no
// provenance flags — eschmechel.dev is canonical, dev.to is the cross-post.
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    devto: z.object({ id: z.number(), url: z.url() }).optional(),
  }),
});

export const collections = { site, projects, experience, education, skills, now, opinions, blog };
