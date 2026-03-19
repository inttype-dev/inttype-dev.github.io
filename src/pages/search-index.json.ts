import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts', ({ data }) => !data.draft && data.lang !== 'en'))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map(post => ({
      id: post.id,
      title: post.data.title,
      description: post.data.description ?? '',
      tags: post.data.tags,
      category: post.data.category,
      pubDate: post.data.pubDate.toISOString().slice(0, 10),
    }));

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
