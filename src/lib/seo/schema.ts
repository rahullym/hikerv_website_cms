import { z } from 'zod';
import { validateCanonical, validateJsonLd, validateSlug } from './index';

/** Zod schema for the `seo` object accepted by the CMS APIs. All fields optional. */
export const SeoBody = z
  .object({
    title: z.string().max(300).optional(),
    description: z.string().max(1000).optional(),
    slug: z.string().optional(),
    canonical: z.string().optional(),
    ogTitle: z.string().max(300).optional(),
    ogDescription: z.string().max(1000).optional(),
    ogImage: z.string().optional(),
    twitterCard: z.enum(['summary_large_image', 'summary']).optional(),
    robots: z
      .object({
        noindex: z.boolean().optional(),
        nofollow: z.boolean().optional(),
        noarchive: z.boolean().optional(),
        nosnippet: z.boolean().optional(),
      })
      .optional(),
    customSchema: z.string().max(50000).optional(),
  })
  .superRefine((v, ctx) => {
    const checks: [string, string | null][] = [
      ['slug', validateSlug(v.slug ?? '')],
      ['canonical', validateCanonical(v.canonical ?? '')],
      ['customSchema', validateJsonLd(v.customSchema ?? '')],
    ];
    for (const [path, msg] of checks) {
      if (msg) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: msg });
    }
  });
