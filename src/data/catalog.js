import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS } from './products';

export const IMAGE_BUCKET = 'product-images';
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // keep in sync with schema.sql

// Order of the tabs inside "For the face" / "For the hair"
export const SUBCATEGORIES = {
  skincare: ['Facewash', 'Face Scrub', 'Facial Serum', 'Sunscreen', 'Super Whips'],
  haircare: ['Hair Treatments', 'Power Bonds', 'Hair Masks'],
};

export const CATEGORY_OPTIONS = [
  { group: null, value: 'newArrivals', label: 'New Arrivals' },
  ...SUBCATEGORIES.skincare.map((s) => ({ group: 'Skincare', value: `skincare:${s}`, label: `Skincare — ${s}` })),
  ...SUBCATEGORIES.haircare.map((s) => ({ group: 'Haircare', value: `haircare:${s}`, label: `Haircare — ${s}` })),
  { group: null, value: 'supplements', label: 'Supplements' },
  { group: null, value: 'lipbalm', label: 'Lip Balm' },
];

export const categoryKeyOf = (p) => (p.subcategory ? `${p.section}:${p.subcategory}` : p.section);
export const categoryLabelOf = (p) =>
  CATEGORY_OPTIONS.find((o) => o.value === categoryKeyOf(p))?.label || categoryKeyOf(p);

export function parseCategoryKey(key) {
  const [section, subcategory] = key.split(':');
  return { section, subcategory: subcategory || null };
}

const fromRow = (r) => ({
  id: r.id,
  name: r.name,
  price: Number(r.price),
  note: r.note || '',
  accent: r.accent || 'rose',
  badge: r.badge || '',
  image: r.image_url || '',
  description: r.description || '',
  section: r.section,
  subcategory: r.subcategory,
});

const toRow = (p) => ({
  name: p.name.trim(),
  price: Number(p.price),
  note: p.note?.trim() || null,
  accent: p.accent || 'rose',
  badge: p.badge?.trim() || null,
  image_url: p.image || null,
  description: p.description?.trim() || null,
  section: p.section,
  subcategory: p.subcategory || null,
});

// Preview catalog for when the database isn't connected (e.g. first run on a new computer)
function previewProducts() {
  const out = [];
  const push = (section, subcategory, list) =>
    list.forEach((p, i) =>
      out.push({ ...p, id: `preview-${section}-${subcategory || ''}-${i}`, section, subcategory, image: '', description: '', badge: p.badge || '' })
    );
  push('newArrivals', null, INITIAL_PRODUCTS.newArrivals);
  Object.entries(INITIAL_PRODUCTS.skincare).forEach(([s, l]) => push('skincare', s, l));
  Object.entries(INITIAL_PRODUCTS.haircare).forEach(([s, l]) => push('haircare', s, l));
  push('supplements', null, INITIAL_PRODUCTS.supplements);
  push('lipbalm', null, INITIAL_PRODUCTS.lipbalm);
  return out;
}

export async function fetchProducts() {
  if (!isSupabaseConfigured) return previewProducts();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }) // newest additions first
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data.map(fromRow);
}

// Flat list → the shape the page sections expect
export function groupProducts(list) {
  const grouped = { newArrivals: [], skincare: {}, haircare: {}, supplements: [], lipbalm: [] };
  for (const section of ['skincare', 'haircare']) {
    SUBCATEGORIES[section].forEach((s) => (grouped[section][s] = []));
  }
  for (const p of list) {
    if (p.section === 'skincare' || p.section === 'haircare') {
      const sub = p.subcategory || 'Other';
      (grouped[p.section][sub] ||= []).push(p);
    } else if (grouped[p.section]) {
      grouped[p.section].push(p);
    }
  }
  for (const section of ['skincare', 'haircare']) {
    for (const [sub, items] of Object.entries(grouped[section])) {
      if (items.length === 0) delete grouped[section][sub];
    }
  }
  return grouped;
}

function requireDb() {
  if (!isSupabaseConfigured) throw new Error('The database is not connected. Add the Supabase keys first (see SETUP.md).');
}

export async function createProduct(product) {
  requireDb();
  const { error } = await supabase.from('products').insert(toRow(product));
  if (error) throw error;
}

export async function updateProduct(id, product) {
  requireDb();
  const { error } = await supabase.from('products').update(toRow(product)).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id) {
  requireDb();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadProductImage(file) {
  requireDb();
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Image is too large — keep it under 3 MB.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

// ── Admin sign-in ──────────────────────────────────────────
export async function getCurrentSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function checkIsAdmin() {
  if (!isSupabaseConfigured) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

export async function signInAdmin(email, password) {
  requireDb();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error('Wrong email or password.');
  const ok = await checkIsAdmin();
  if (!ok) {
    await supabase.auth.signOut();
    throw new Error('This account is not an admin for this store.');
  }
}

export async function signOutAdmin() {
  if (isSupabaseConfigured) await supabase.auth.signOut();
}

export async function changeAdminPassword(newPassword) {
  requireDb();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
