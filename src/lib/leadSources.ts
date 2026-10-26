/** Human-readable names for the `source` recorded on each Lead. */
export const SOURCE_LABELS: Record<string, string> = {
  contact_page: 'Get a Quote form (/contact)',
  about_page: 'About page contact form (/about)',
};

export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}
