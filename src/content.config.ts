import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    // posts/**/*.md + projects 내 번호로 시작하는 파일 (프로젝트 글)
    pattern: ['posts/**/*.md', 'projects/*/[0-9]*.md'],
    base: './src/content',
    generateId: ({ entry }) => {
      const withoutExt = entry.replace(/\.md$/, '');
      const parts = withoutExt.split('/');
      parts.shift(); // 'posts' 또는 'projects' 제거
      parts[parts.length - 1] = parts[parts.length - 1].replace(/^\d+-/, ''); // 앞 숫자 제거
      return parts.join('/');
    },
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    category: z.enum(['개발', '일상']).default('개발'),
    draft: z.boolean().default(false),
    lang: z.enum(['kr', 'en']).default('kr'),
    translationOf: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({
    // 숫자로 시작하지 않는 파일만 = 프로젝트 index 파일
    pattern: '*/[!0-9]*.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0], // 폴더명을 ID로
  }),
  schema: z.object({
    name: z.string(),
    desc: z.string(),
    tags: z.array(z.string()).default([]),
    github: z.string().optional(),
    link: z.string().optional(),
    image: z.string().optional(),
    status: z.enum(['완료', '진행 중']),
    startDate: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'YYYY-MM 또는 YYYY-MM-DD 형식으로 입력하세요'),
    endDate: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'YYYY-MM 또는 YYYY-MM-DD 형식으로 입력하세요').optional(),
    lang: z.enum(['kr', 'en']).default('kr'),
    translationOf: z.string().optional(),
  }),
});

export const collections = { posts, projects };
