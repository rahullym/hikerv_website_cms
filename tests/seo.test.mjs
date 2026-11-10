// Run after `npm run build`: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('.vercel/output/static');
const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');

test('title is 50-60 characters', () => {
  const title = html.match(/<title>([^<]*)<\/title>/)[1];
  assert.ok(title.length >= 50 && title.length <= 60, `${title} (${title.length})`);
});

test('headings: first is the single h1, no skipped levels', () => {
  const levels = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  assert.equal(levels[0], 1);
  assert.equal(levels.filter((l) => l === 1).length, 1);
  let max = 0;
  for (const l of levels) {
    assert.ok(l <= max + 1, `heading level jumps to h${l} after max h${max}: ${levels}`);
    max = Math.max(max, l);
  }
  assert.match(body, /<h1[^>]*>\s*Engineered/);
});

test('every img has non-empty alt, width and height', () => {
  const imgs = [...body.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  assert.ok(imgs.length > 10);
  for (const tag of imgs) {
    assert.match(tag, /\salt="[^"]{3,}"/, tag);
    assert.match(tag, /\swidth="\d+"/, tag);
    assert.match(tag, /\sheight="\d+"/, tag);
  }
});

test('no render-blocking stylesheets', () => {
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"/);
  assert.match(html, /<style>/);
});

test('no plain-text email addresses in the HTML', () => {
  assert.doesNotMatch(html, /[\w.+-]+@hikerv\.com\.au/i);
  assert.doesNotMatch(html, /mailto:/i);
});

test('LocalBusiness JSON-LD is valid and complete', () => {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(m[1]);
  assert.equal(data['@type'], 'LocalBusiness');
  assert.equal(data.address.addressLocality, 'Campbellfield');
  assert.equal(data.address.addressRegion, 'VIC');
  assert.ok(data.telephone);
  assert.ok(data.openingHoursSpecification.length > 0);
});

test('llms.txt is served from the site root', () => {
  const txt = fs.readFileSync(path.join(out, 'llms.txt'), 'utf8');
  assert.match(txt, /^# Hike RV/);
  assert.match(txt, /Campbellfield/);
  assert.match(txt, /Rover Series/);
});

test('initial page load assets weigh under 5 MB', () => {
  const refs = new Set();
  for (const m of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:webp|png|jpe?g|css|js|svg|ico))"/g)) refs.add(m[1]);
  // JS modules referenced from <script type=module> imports
  let total = 0;
  for (const r of refs) {
    if (r === '/favicon.png' || fs.existsSync(path.join(out, decodeURI(r)))) {
      total += fs.statSync(path.join(out, decodeURI(r))).size;
    }
  }
  // The hero video is attached only after the load event (data-src), so it is not initial weight.
  assert.doesNotMatch(html, /<source[^>]+\ssrc="\/herobgvideo\.mp4"/);
  assert.ok(total < 5 * 1024 * 1024, `total ${total}`);
});

test('oversized originals are gone', () => {
  for (const f of ['approved.png', 'solar.png', 'craft.png', 'suspenison.png', 'chasis1.png', 'drifterbg.png', 'philosophybg.jpg']) {
    assert.ok(!fs.existsSync(path.join(out, f)), f);
  }
});
