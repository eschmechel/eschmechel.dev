import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, getProfile } from '../lib/content';

export async function GET(context: APIContext) {
  const profile = (await getProfile()).data;
  const posts = await getPosts();
  return rss({
    title: `${profile.name} — blog`,
    description: profile.headline,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/blog/${p.id}`,
      categories: p.data.tags,
    })),
    customData: '<language>en-ca</language>',
  });
}
