// Size / type choices for a product.
// product.options = { types: [{ label, image? }], sizes: [{ label, price, image? }] }  (either list may be missing)

export const typesOf = (p) => (Array.isArray(p?.options?.types) ? p.options.types.filter((t) => t?.label) : []);
export const sizesOf = (p) => (Array.isArray(p?.options?.sizes) ? p.options.sizes.filter((s) => s?.label) : []);
export const hasOptions = (p) => typesOf(p).length > 0 || sizesOf(p).length > 0;

// One bag line per product + chosen type + chosen size
export const lineKey = (productId, type, size) => [productId, type || '', size || ''].join('|');

// Lowest price, for "from ৳…" on cards
export function fromPrice(p) {
  const prices = sizesOf(p).map((s) => Number(s.price)).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : p.price;
}

// What a given choice costs and looks like. `valid` is false until every required choice is made.
export function resolveVariant(p, type, size) {
  const types = typesOf(p);
  const sizes = sizesOf(p);
  const t = types.find((x) => x.label === type) || null;
  const s = sizes.find((x) => x.label === size) || null;
  return {
    valid: (!types.length || !!t) && (!sizes.length || !!s),
    type: t?.label || null,
    size: s?.label || null,
    price: s ? Number(s.price) : p.price,
    image: s?.image || t?.image || p.image,
    label: [t?.label, s?.label].filter(Boolean).join(' · '),
  };
}

// Default choice: the first of each list
export const defaultChoice = (p) => ({ type: typesOf(p)[0]?.label || null, size: sizesOf(p)[0]?.label || null });
