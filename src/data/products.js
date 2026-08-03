export const ACCENTS = {
  rose:   ['#F1D6D9','#C97C86'],
  gold:   ['#F3E3B8','#C6992B'],
  berry:  ['#E7C3CC','#7A2A38'],
  sage:   ['#DCE3C8','#7C8A55'],
  clay:   ['#EAD3BE','#B4703C'],
};

export const PRODUCT_DETAILS = {
  'Cleanser': {
    description: 'A gentle, pH-balanced cleanser that transforms from a cushiony gel to a conditioning milk. It melts away daily impurities, pollution, and light makeup without stripping your skin\'s natural moisture barrier.',
    ingredients: 'Aloe Barbadensis Leaf Juice, Glycerin, Coco-Glucoside, Rosa Damascena Flower Water, Chamomilla Recutita (Matricaria) Flower Extract, Panthenol, Xanthan Gum, Citric Acid.',
    usage: 'Massage 1-2 pumps onto damp skin in circular motions. Rinse thoroughly with lukewarm water. Use morning and night.',
    reviews: [
      { user: 'Sania M.', rating: 5, comment: 'Perfect morning cleanser. Doesn\'t leave my skin tight at all.' },
      { user: 'Rahat K.', rating: 4, comment: 'Switched from a foaming cleanser to this, my redness is completely gone!' }
    ]
  },
  'Serum': {
    description: 'A powerhouse brightening serum formulated with 10% stabilized Vitamin C and 2% Niacinamide. Designed to visibly fade dark spots, even out skin tone, and restore a youthful radiance.',
    ingredients: 'Water, Ascorbic Acid (Vitamin C), Niacinamide, Hyaluronic Acid, Ferulic Acid, Tocopherol (Vitamin E), Centella Asiatica Extract, Ethylhexylglycerin.',
    usage: 'Apply 3-4 drops onto clean, dry face and neck in the morning. Follow with your favorite moisturizer and SPF.',
    reviews: [
      { user: 'Tasnim A.', rating: 5, comment: 'My hyperpigmentation is noticeably lighter after just two weeks!' },
      { user: 'Farhan S.', rating: 5, comment: 'Love how fast it absorbs. No sticky residue at all.' }
    ]
  },
  'Bond Repair': {
    description: 'A revolutionary leave-in treatment that works on a molecular level to repair broken hair bonds. Strengthens damaged hair, reduces breakage, and restores elasticity and shine.',
    ingredients: 'Water, Bis-Aminopropyl Diglycol Dimaleate, Cetearyl Alcohol, Behentrimonium Methosulfate, Cetyl Alcohol, Glycerin, Panthenol, Hydrolyzed Keratin, Phenoxyethanol.',
    usage: 'Apply a dime-sized amount to clean, damp hair, focusing on mid-lengths to ends. Do not rinse. Style as usual.',
    reviews: [
      { user: 'Nadia R.', rating: 5, comment: 'Saves my bleached hair from falling apart. Truly a miracle product.' },
      { user: 'Imran H.', rating: 4, comment: 'Smells amazing and makes my hair super soft, just wish the bottle was bigger.' }
    ]
  },
  'Lip Balm': {
    description: 'An ultra-nourishing lip treatment that locks in moisture for up to 12 hours. Formulated with shea butter and botanical oils for soft, plump lips with a hint of natural shine.',
    ingredients: 'Butyrospermum Parkii (Shea Butter), Cocos Nucifera (Coconut) Oil, Beeswax, Simmondsia Chinensis (Jojoba) Seed Oil, Tocopherol, Natural Flavors.',
    usage: 'Apply generously to lips as needed throughout the day, or apply a thick layer before bed as an overnight lip mask.',
    reviews: [
      { user: 'Zarin F.', rating: 5, comment: 'The only balm that keeps my lips hydrated in dry weather. 10/10!' },
      { user: 'Moin U.', rating: 5, comment: 'Subtle and not sticky. Perfect everyday carry.' }
    ]
  },
  'Supplement': {
    description: 'A daily wellness capsule packed with marine collagen, biotin, and antioxidants. Supports skin elasticity, hydration from within, and strengthens hair and nails.',
    ingredients: 'Hydrolyzed Marine Collagen, Biotin, Vitamin C (Ascorbic Acid), Zinc Citrate, Vitamin E, Hyaluronic Acid (Vegetarian), Silica.',
    usage: 'Take 2 capsules daily with a glass of water, preferably with a meal or as directed by your healthcare professional.',
    reviews: [
      { user: 'Anis L.', rating: 5, comment: 'My nails are stronger and grow so much faster now. Love it.' },
      { user: 'Sara Q.', rating: 4, comment: 'Great formulation. Easy to swallow and skin feels plump.' }
    ]
  },
  'Clay Root Scrub': {
    description: 'A weekly resurfacing treatment that combines Kaolin clay and finely ground botanicals. Gently exfoliates dead skin cells, refines pores, and absorbs excess sebum.',
    ingredients: 'Kaolin, Water, Bentonite, Juglans Regia (Walnut) Shell Powder, Glycyrrhiza Glabra (Licorice) Root Extract, Glycerin, Salicylic Acid, Phenoxyethanol.',
    usage: 'Apply a thin layer to clean, damp face, avoiding eyes. Leave on for 5 minutes, then massage gently in circular motions while rinsing with warm water. Use 1-2 times a week.',
    reviews: [
      { user: 'Tahmid B.', rating: 5, comment: 'Leaves my skin incredibly smooth. Best exfoliant I\'ve tried.' },
      { user: 'Sadia O.', rating: 4, comment: 'Very deep clean. A bit drying if you leave it on too long, so stick to 5 mins!' }
    ]
  }
};

export function getProductDetails(name, note) {
  const cleanName = name.trim();
  for (const key of Object.keys(PRODUCT_DETAILS)) {
    if (cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase())) {
      return PRODUCT_DETAILS[key];
    }
  }
  return {
    description: `A premium, nourishing formulation designed to support your daily ritual. The ${name} is ${note ? note.toLowerCase() : 'formulated with care'} and crafted using the highest-quality, clean ingredients. Ideal for maintaining healthy, radiant skin.`,
    ingredients: `Aqua, Glycerin, Organic ${name.replace(/\s/g, '')} extract, Aloe Barbadensis Leaf Juice, Panthenol, Hyaluronic Acid, Ethylhexylglycerin, Natural Botanical Fragrance.`,
    usage: `Apply a small amount of the ${name} to the targeted area. Massage gently in upward circular motions until fully absorbed. Use as part of your daily routine.`,
    reviews: [
      { user: 'Aurelia Customer', rating: 5, comment: `Absolutely love the ${name}! It's a game-changer for my routine.` },
      { user: 'Skincare Fanatic', rating: 5, comment: 'Highly recommend this formula. Gentle, effective, and smells incredible.' }
    ]
  };
}

function p(name, price, note, accent, badge, details = null){ 
  return {name, price: Number(price), note, accent, badge, details}; 
}

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

const STORAGE_KEY = 'aurelia_products_data';
const ADMIN_PASS_KEY = 'aurelia_admin_password';

export function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading products from localStorage:', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to localStorage:', e);
  }
}

export function resetProducts() {
  localStorage.removeItem(STORAGE_KEY);
  return INITIAL_PRODUCTS;
}

export function getAdminPassword() {
  return localStorage.getItem(ADMIN_PASS_KEY) || 'aurelia123';
}

export function setAdminPassword(newPassword) {
  localStorage.setItem(ADMIN_PASS_KEY, newPassword);
}

export function findProductById(id, productsData = null) {
  const data = productsData || loadProducts();
  const all = [
    ...(data.newArrivals || []).map((pr, i) => ['new-' + i, pr]),
    ...(data.supplements || []).map((pr, i) => ['supp-' + i, pr]),
    ...(data.lipbalm || []).map((pr, i) => ['lip-' + i, pr]),
  ];
  
  if (data.skincare) {
    Object.entries(data.skincare).forEach(([cat, list]) =>
      list.forEach((pr, i) => all.push(['skin-' + cat.replace(/\s/g, '') + '-' + i, pr]))
    );
  }
  if (data.haircare) {
    Object.entries(data.haircare).forEach(([cat, list]) =>
      list.forEach((pr, i) => all.push(['hair-' + cat.replace(/\s/g, '') + '-' + i, pr]))
    );
  }
  const found = all.find(([pid]) => pid === id);
  return found ? found[1] : null;
}
