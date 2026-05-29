export const prerender = false;

import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { Subscriber } from '../../../lib/db/models/Subscriber';
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
    const rows = await Subscriber.find().sort({ createdAt: -1 }).lean();
    const header = ['Email', 'Source', 'Subscribed at'];
    const csv = [
      header.join(','),
      ...rows.map((r) => [csvCell(r.email), csvCell(r.source), csvCell(r.createdAt?.toISOString())].join(',')),
    ].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error('subscribers export', err);
    return serverError();
  }
};
