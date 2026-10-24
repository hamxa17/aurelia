export const ACCENTS = {
  rose:   ['#F1D6D9','#C97C86'],
  gold:   ['#F3E3B8','#C6992B'],
  berry:  ['#E7C3CC','#7A2A38'],
  sage:   ['#DCE3C8','#7C8A55'],
  clay:   ['#EAD3BE','#B4703C'],
};

function p(name, price, note, accent, badge){
  return {name, price: Number(price), note, accent, badge};
}

// Starter catalog. Used only as a preview when the database isn't connected yet,
// and as the source for supabase/seed.sql.
export const INITIAL_PRODUCTS = {
  newArrivals: [
    p('Cleanser', 240, 'Gel-to-milk everyday facewash', 'rose', 'New'),
    p('Serum', 420, 'Vitamin C + niacinamide', 'gold', 'New'),
    p('Bond Repair', 280, 'Leave-in bond treatment', 'berry', 'New'),
    p('Lip Balm', 90, 'Tinted, sheer rose', 'rose'),
    p('Supplement', 360, 'Skin + joint supplement', 'sage', 'New'),
    p('Clay Root Scrub', 220, 'Weekly resurfacing scrub', 'clay'),
  ],
  skincare: {
    'Facewash': [
      p('Cleanser', 240, 'Gel-to-milk, all skin types', 'rose'),
      p('Bare Slate Wash', 200, 'Oil-based, removes makeup', 'clay'),
      p('Green Tea Foam', 180, 'Light foam for oily skin', 'sage'),
    ],
    'Face Scrub': [
      p('Clay Root Scrub', 220, 'Weekly resurfacing scrub', 'clay'),
      p('Rice Polish', 210, 'Gentle daily exfoliant', 'gold'),
      p('Sugar & Sea Salt Buff', 230, 'Textured deep scrub', 'rose'),
    ],
    'Facial Serum': [
      p('Serum', 420, 'Vitamin C + niacinamide', 'gold'),
      p('Hyaluronic Veil', 380, '5-layer hydration serum', 'rose'),
      p('Retinol Night Drop', 460, 'Slow-release retinol 0.3%', 'berry'),
    ],
    'Sunscreen': [
      p('Cloud Shield SPF50', 300, 'Weightless, no white cast', 'gold'),
      p('Tinted Daily SPF40', 320, 'SPF + light coverage', 'clay'),
      p('Mineral Barrier SPF35', 290, 'Zinc-based, sensitive skin', 'sage'),
    ],
    'Super Whips': [
      p('Whipped Shea Cream', 270, 'Rich barrier repair whip', 'clay'),
      p('Oat Milk Whip', 250, 'Calming daily moisturizer', 'sage'),
      p('Rose Butter Whip', 270, 'Cushiony overnight whip', 'rose'),
    ],
  },
  haircare: {
    'Hair Treatments': [
      p('Scalp Reset Tonic', 260, 'Weekly scalp treatment', 'sage'),
      p('Overnight Repair Oil', 300, 'Split-end + shine treatment', 'clay'),
      p('Heat Shield Mist', 210, 'Pre-styling protectant', 'gold'),
    ],
    'Power Bonds': [
      p('Bond Repair', 280, 'Leave-in bond treatment', 'berry'),
      p('Bond Rebuild Shampoo', 240, 'Sulfate-free, bond-safe', 'rose'),
      p('Bond Seal Conditioner', 240, 'Locks in bond repair', 'gold'),
    ],
    'Hair Masks': [
      p('Honey Silk Mask', 270, 'Weekly deep conditioning', 'gold'),
      p('Protein Recovery Mask', 290, 'For damaged, brittle hair', 'clay'),
      p('Cool Mint Scalp Mask', 250, 'Clarifying scalp mask', 'sage'),
    ],
  },
  supplements: [
    p('Marine Collagen', 360, 'Skin + joint support, unflavored', 'sage'),
    p('Biotin Bloom', 220, 'Hair + nail growth support', 'gold'),
    p('Inner Glow Greens', 340, 'Daily antioxidant blend', 'sage'),
    p('Omega Radiance', 280, 'Skin-barrier fatty acids', 'clay'),
  ],
  lipbalm: [
    p('Lip Balm', 90, 'Tinted, sheer rose', 'rose'),
    p('Lip Balm', 90, 'Deep repair, unscented', 'gold'),
    p('Lip Balm', 100, 'Tinted, plumping', 'berry'),
    p('Lip Balm', 110, 'SPF20 daily lip balm', 'clay'),
  ],
};
