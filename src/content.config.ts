import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// one markdown file per project. the file name is the id used for #anchor and folder name.
// the body is the description.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // event, award or team, shown under the title.
    where: z.string().optional(),
    // sort order, lowest first.
    order: z.number(),
    stack: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    // caption for photos/projects/<id>/cover.
    cover: z.string().optional(),
    // gallery captions keyed by file name.
    photos: z.record(z.string(), z.string()).default({}),
    // start with the gallery expanded.
    open: z.boolean().default(false),
  }),
});

export const collections = { projects };
