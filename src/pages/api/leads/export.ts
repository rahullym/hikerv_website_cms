export const prerender = false;

import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { Lead } from '../../../lib/db/models/Lead';
import { hasRole } from '../../../lib/auth/session';
import { forbidden, serverError } from '../../../lib/api/respond';

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const rows = await Lead.find().sort({ createdAt: -1 }).lean();
    const header = ['Name', 'Email', 'Phone', 'Model', 'Size', 'State', 'Message', 'Status', 'Submitted at'];
    const csv = [
      header.join(','),
      ...rows.map((r) =>
        [r.name, r.email, r.phone, r.model, r.size, r.state, r.message, r.status, r.createdAt?.toISOString()]
          .map(csvCell)
          .join(',')
      ),
    ].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error('leads export', err);
    return serverError();
  }
};
