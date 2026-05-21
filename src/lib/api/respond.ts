export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

export const ok = (body: unknown) => jsonResponse(body, { status: 200 });
export const created = (body: unknown) => jsonResponse(body, { status: 201 });
export const badRequest = (message: string) =>
  jsonResponse({ error: message }, { status: 400 });
export const unauthorized = (message = 'Unauthorized') =>
  jsonResponse({ error: message }, { status: 401 });
export const forbidden = (message = 'Forbidden') =>
  jsonResponse({ error: message }, { status: 403 });
export const notFound = (message = 'Not found') =>
  jsonResponse({ error: message }, { status: 404 });
export const serverError = (message = 'Internal error') =>
  jsonResponse({ error: message }, { status: 500 });
