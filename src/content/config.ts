import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string().or(z.date()),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const works = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    stack: z.array(z.string()).default([]),
    url: z.string().url().optional(),
  }),
});

const experience = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    period: z.string(),
    location: z.string().optional(),
    highlights: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, works, experience };

