import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const features = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/features' }),
  schema: z.object({ title: z.string(), order: z.number(), summary: z.string() }),
});

const showcase = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/showcase' }),
  schema: z.object({ title: z.string(), image: z.string(), order: z.number(), summary: z.string() }),
});

export const collections = { features, showcase };
