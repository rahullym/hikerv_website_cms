import { z } from 'zod';
import { escapeHtml } from './html';
import { sourceLabel } from './leadSources';

/**
 * Sources whose form collects the full quote details. Submissions from these
 * forms must include model, size, state and message; the server enforces this
 * so a blank enquiry can never reach the inbox or the CRM, even if the
 * browser-side checks are bypassed.
 */
export const QUOTE_SOURCES = new Set(['contact_page']);

export const QUOTE_FIELDS = ['model', 'size', 'state', 'message'] as const;

const FIELD_LABELS: Record<(typeof QUOTE_FIELDS)[number], string> = {
  model: 'Model',
  size: 'Size',
  state: 'State',
  message: 'Message',
};

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const LeadInput = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    email: z.string().trim().email('A valid email is required'),
    phone: z.string().trim().min(1, 'Phone is required').max(40),
    model: optionalText(80),
    size: optionalText(20),
    state: optionalText(40),
    message: optionalText(4000),
    source: z.string().trim().max(40).optional(),
    website: z.string().optional(), // honeypot: silently no-op if filled
  })
  .superRefine((v, ctx) => {
    if (v.website) return; // let the honeypot short-circuit happen in the handler
    if (!QUOTE_SOURCES.has(v.source ?? '')) return;
    for (const field of QUOTE_FIELDS) {
      if (!v[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `${FIELD_LABELS[field]} is required`,
        });
      }
    }
  });

export type LeadInputData = z.infer<typeof LeadInput>;

export type LeadRecord = {
  name: string;
  email: string;
  phone: string;
  model?: string;
  size?: string;
  state?: string;
  message?: string;
  source: string;
};

/** Normalise parsed input into the shape stored on the Lead document. */
export function toLeadRecord(input: LeadInputData): LeadRecord {
  return {
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    model: input.model || undefined,
    size: input.size || undefined,
    state: input.state || undefined,
    message: input.message || undefined,
    source: input.source || 'contact',
  };
}

/** Build the notification email for a new lead. */
export function buildLeadEmail(lead: LeadRecord): { subject: string; html: string } {
  const notProvided = '<span style="color:#999">Not provided</span>';
  const cell = (v?: string) => (v ? escapeHtml(v) : notProvided);
  const row = (label: string, value: string, top = false) =>
    `<tr><td${top ? ' valign="top"' : ''}><strong>${label}</strong></td><td>${value}</td></tr>`;

  const html = `
        <h2 style="margin:0 0 12px;font-family:system-ui">New Hike RV enquiry</h2>
        <table cellpadding="6" style="font-family:system-ui;font-size:14px;border-collapse:collapse">
          ${row('Name', escapeHtml(lead.name))}
          ${row('Email', `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>`)}
          ${row('Phone', escapeHtml(lead.phone))}
          ${row('Model', cell(lead.model))}
          ${row('Size', lead.size ? `${escapeHtml(lead.size)} ft` : notProvided)}
          ${row('State', cell(lead.state))}
          ${row('Message', lead.message ? escapeHtml(lead.message).replace(/\n/g, '<br/>') : notProvided, true)}
          ${row('Submitted via', escapeHtml(sourceLabel(lead.source)))}
        </table>
        <p style="color:#666;font-size:12px;margin-top:18px">View all enquiries in the Hike RV CMS at /admin/leads</p>
      `;

  return {
    subject: `New enquiry: ${lead.name} — ${lead.model ?? 'no model selected'}`,
    html,
  };
}
