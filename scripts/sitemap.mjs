// Refreshes public/sitemap.xml before each build: the home page plus one link per product,
// so Google can find every product page. Runs on Vercel with the site's own public keys.
import { writeFileSync } from 'node:fs';

const SITE = 'https://www.aureliabeauty.me';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const slug = (p) =>
  [p.brand, p.name].filter(Boolean).join(' ').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

let products = [];
if (url && key) {
  try {
    const res = await fetch(`${url}/rest/v1/products?select=name,brand,image_url,updated_at&order=sort_order`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (res.ok) products = await res.json();
  } catch { /* offline build: sitemap gets just the home page */ }
}

if (!products.length) {
  console.log('sitemap.xml: database not reachable, keeping the existing file');
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const entries = [
  `  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>`,
  ...products.map((p) => {
    const img = p.image_url ? `\n    <image:image><image:loc>${esc(SITE + p.image_url)}</image:loc></image:image>` : '';
    return `  <url><loc>${SITE}/product/${slug(p)}</loc><lastmod>${(p.updated_at || today).slice(0, 10)}</lastmod>${img}\n  </url>`;
  }),
];

writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join('\n')}\n</urlset>\n`
);
console.log(`sitemap.xml: ${entries.length} pages`);
