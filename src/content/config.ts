import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    tech: z.array(z.string()),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    date: z.string().optional(), // YYYY-MM or ISO
    featured: z.boolean().optional(),
  }),
});

export const collections = { projects };
