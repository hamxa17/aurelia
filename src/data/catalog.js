import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS } from './products';

export const IMAGE_BUCKET = 'product-images';
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // keep in sync with schema.sql

// Order of the tabs inside "For the face" / "For the hair"
export const SUBCATEGORIES = {
  skincare: ['Facewash', 'Face Scrub', 'Facial Serum', 'Moisturiser', 'Sunscreen', 'Super Whips', 'Body Care'],
  haircare: ['Shampoo', 'Conditioner', 'Hair Treatments', 'Power Bonds', 'Hair Masks'],
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
  brand: r.brand || '',
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
  brand: p.brand?.trim() || null,
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
      out.push({ ...p, id: `preview-${section}-${subcategory || ''}-${i}`, section, subcategory, image: '', description: '', badge: p.badge || '', brand: '' })
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


// ── Money ──────────────────────────────────────────────────
// ৳485 (whole taka) or ৳485.50 when there are paisa
export const formatTaka = (n) => {
  const v = Number(n) || 0;
  return '৳' + (Number.isInteger(v) ? v.toLocaleString('en-IN') : v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
};

// ── Store settings (delivery fees, contact) ───────────────
export const DEFAULT_SETTINGS = {
  delivery_inside_dhaka: 70,
  delivery_outside_dhaka: 130,
  whatsapp: '',
  phone: '',
  email: '',
  facebook_url: '',
};

export async function fetchSettings() {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    delivery_inside_dhaka: Number(data.delivery_inside_dhaka),
    delivery_outside_dhaka: Number(data.delivery_outside_dhaka),
  };
}

export async function saveSettings(settings) {
  requireDb();
  const clean = (v) => (v ?? '').toString().trim() || null;
  const { error } = await supabase
    .from('store_settings')
    .update({
      delivery_inside_dhaka: Number(settings.delivery_inside_dhaka) || 0,
      delivery_outside_dhaka: Number(settings.delivery_outside_dhaka) || 0,
      whatsapp: clean(settings.whatsapp),
      phone: clean(settings.phone),
      email: clean(settings.email),
      facebook_url: clean(settings.facebook_url),
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) throw error;
}

// WhatsApp link for a Bangladeshi number like 01712345678
export function whatsappLink(number, text = '') {
  let digits = (number || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) digits = '88' + digits;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

// ── Orders ─────────────────────────────────────────────────
export const AREA_LABELS = { inside_dhaka: 'Inside Dhaka', outside_dhaka: 'Outside Dhaka' };
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// cartItems: [{ product, qty }]
export async function placeOrder({ name, phone, address, area, note }, cartItems) {
  requireDb();
  const { data, error } = await supabase.rpc('place_order', {
    p_name: name,
    p_phone: phone,
    p_address: address,
    p_area: area,
    p_note: note || null,
    p_items: cartItems.map(({ product, qty }) => ({ product_id: product.id, qty })),
  });
  if (error) throw new Error(error.message || 'Could not place the order.');
  const row = Array.isArray(data) ? data[0] : data;
  return { orderId: row.order_id, orderNumber: row.order_number, total: Number(row.total) };
}

const ORDER_SELECT =
  'id, order_number, customer_name, phone, address, area, note, subtotal, delivery_fee, total, status, created_at, order_items(name, brand, price, qty)';

// Admin: all orders. Customer: only their own (enforced by the database).
export async function fetchOrders({ limit = 100, userId = null } = {}) {
  requireDb();
  let query = supabase.from('orders').select(ORDER_SELECT);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status) {
  requireDb();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

// ── Customer accounts (email code sign-in) ─────────────────
export async function sendLoginCode(email) {
  requireDb();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
  });
  if (error) {
    if (/rate|limit|seconds/i.test(error.message)) throw new Error('Please wait a minute before asking for another code.');
    if (/signups not allowed/i.test(error.message)) throw new Error('New accounts are switched off right now.');
    throw new Error(error.message || 'Could not send the code.');
  }
}

export async function verifyLoginCode(email, code) {
  requireDb();
  const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
  if (error) throw new Error('That code is wrong or has expired. Request a new one.');
}

export async function signOutCustomer() {
  if (isSupabaseConfigured) await supabase.auth.signOut();
}

// ── Saved carts ────────────────────────────────────────────
// Stored as [{ product_id, qty }] so prices always come fresh from the catalog
export async function loadSavedCart() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('carts').select('items').maybeSingle();
  if (error || !data) return [];
  return Array.isArray(data.items) ? data.items : [];
}

export async function saveCart(userId, items) {
  if (!isSupabaseConfigured || !userId) return;
  await supabase.from('carts').upsert({ user_id: userId, items, updated_at: new Date().toISOString() });
}

// ── Reviews ────────────────────────────────────────────────
export async function fetchReviews(productId) {
  if (!isSupabaseConfigured || String(productId).startsWith('preview-')) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, author_name, rating, comment, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveReview(productId, { author_name, rating, comment }, existingId = null) {
  requireDb();
  const row = { author_name: author_name.trim(), rating, comment: comment.trim() };
  const { error } = existingId
    ? await supabase.from('reviews').update(row).eq('id', existingId)
    : await supabase.from('reviews').insert({ ...row, product_id: productId });
  if (error) throw new Error(error.code === '23505' ? 'You have already reviewed this product.' : error.message);
}

export async function deleteReview(id) {
  requireDb();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
