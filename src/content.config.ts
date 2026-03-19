import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    category: z.enum(['개발', '일상']).default('개발'),
    project: z.string().optional(),
    draft: z.boolean().default(false),
    lang: z.enum(['kr', 'en']).default('kr'),
    translationOf: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    desc: z.string(),
    tags: z.array(z.string()).default([]),
    github: z.string().optional(),
    link: z.string().optional(),
    image: z.string().optional(),
    status: z.enum(['완료', '진행 중']),
    priority: z.number().default(3),
    date: z.string(),
    lang: z.enum(['kr', 'en']).default('kr'),
    translationOf: z.string().optional(),
  }),
});

export const collections = { posts, projects };
