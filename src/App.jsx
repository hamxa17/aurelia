import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  fetchProducts,
  groupProducts,
  checkIsAdmin,
  fetchSettings,
  DEFAULT_SETTINGS,
  loadSavedCart,
  saveCart,
} from './data/catalog';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import TrustBar from './components/TrustBar';
import ProductSection from './components/ProductSection';
import Philosophy from './components/Philosophy';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import QuickViewModal from './components/QuickViewModal';
import CheckoutModal from './components/CheckoutModal';
import AccountModal from './components/AccountModal';
import AdminModal from './components/AdminModal';

// Hide a section entirely when it has no products yet
const hasItems = (group) =>
  Array.isArray(group) ? group.length > 0 : Boolean(group) && Object.keys(group).length > 0;

const CART_KEY = 'aurelia_cart';
const readLocalCart = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeLocalCart = (lines) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  } catch { /* storage blocked — the cart still works for this visit */ }
};

// Combine a saved account cart with whatever the visitor added before signing in
function mergeCarts(a, b) {
  const map = new Map();
  [...a, ...b].forEach(({ product_id, qty }) => {
    if (!product_id || !(qty > 0)) return;
    map.set(product_id, Math.max(map.get(product_id) || 0, Math.min(qty, 50)));
  });
  return [...map].map(([product_id, qty]) => ({ product_id, qty }));
}

export default function App() {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Cart is stored as [{ product_id, qty }]; product details always come from the live catalog
  const [cartLines, setCartLines] = useState(readLocalCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeQuickViewId, setActiveQuickViewId] = useState(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const [user, setUser] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const cartReadyForUser = useRef(null); // user id whose saved cart has been merged in

  const products = useMemo(() => groupProducts(productList), [productList]);

  const reloadProducts = useCallback(async () => {
    try {
      const list = await fetchProducts();
      setProductList(list);
      setLoadError('');
    } catch (err) {
      console.error('Could not load products:', err);
      setLoadError('We could not load the products right now. Please refresh in a moment.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reloadSettings = useCallback(() => fetchSettings().then(setSettings), []);

  useEffect(() => {
    reloadProducts();
    reloadSettings();
  }, [reloadProducts, reloadSettings]);

  // Track who is signed in (customer or admin)
  useEffect(() => {
    if (!supabase) return undefined;
    const apply = async (session) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsAdminAuthenticated(u ? await checkIsAdmin() : false);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer so we don't call Supabase from inside its own callback
      setTimeout(() => apply(session), 0);
      if (event === 'SIGNED_OUT') {
        cartReadyForUser.current = null;
        setCartLines([]); // don't leave the last person's bag on a shared device
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // When a customer signs in, bring back their saved bag and merge in anything added before signing in
  useEffect(() => {
    if (!user || cartReadyForUser.current === user.id) return;
    let cancelled = false;
    loadSavedCart().then((saved) => {
      if (cancelled) return;
      cartReadyForUser.current = user.id;
      setCartLines((local) => mergeCarts(saved, local));
    });
    return () => { cancelled = true; };
  }, [user]);

  // Save the bag: on this device always, and to the account when signed in
  useEffect(() => {
    writeLocalCart(cartLines);
    if (!user || cartReadyForUser.current !== user.id) return undefined;
    const t = setTimeout(() => saveCart(user.id, cartLines), 600);
    return () => clearTimeout(t);
  }, [cartLines, user]);

  // The admin panel has no public button — open it at yoursite.com/admin (or /#admin)
  useEffect(() => {
    const openIfAdminHash = () => {
      const isAdminUrl = window.location.pathname.replace(/\/+$/, '') === '/admin' || window.location.hash === '#admin';
      if (isAdminUrl) setIsAdminOpen(true);
    };
    openIfAdminHash();
    window.addEventListener('hashchange', openIfAdminHash);
    return () => window.removeEventListener('hashchange', openIfAdminHash);
  }, []);

  // Menu links only for sections that currently have products
  const navLinks = [
    hasItems(products.newArrivals) && { href: '#new-arrivals', label: 'New' },
    hasItems(products.skincare) && { href: '#skincare', label: 'Skincare' },
    hasItems(products.haircare) && { href: '#haircare', label: 'Hair' },
    hasItems(products.supplements) && { href: '#supplements', label: 'Supplements' },
    hasItems(products.lipbalm) && { href: '#lipbalm', label: 'Lip' },
    { href: '#philosophy', label: 'About' },
  ].filter(Boolean);

  // Close the phone menu if the window grows to desktop size while it's open
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 720) setIsMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const quickViewProduct = activeQuickViewId
    ? productList.find((p) => p.id === activeQuickViewId) || null
    : null;

  // Cart lines joined with live product data (removed products simply drop out)
  const cartItems = useMemo(() => {
    const byId = new Map(productList.map((p) => [p.id, p]));
    return cartLines
      .map(({ product_id, qty }) => ({ product: byId.get(product_id), qty }))
      .filter((l) => l.product);
  }, [cartLines, productList]);
  const cart = useMemo(
    () => Object.fromEntries(cartItems.map((l) => [l.product.id, l])),
    [cartItems]
  );

  // Sync body CSS classes for modal/drawer visibility
  useEffect(() => { document.body.classList.toggle('cart-open', isCartOpen); }, [isCartOpen]);
  useEffect(() => { document.body.classList.toggle('menu-open', isMenuOpen); }, [isMenuOpen]);
  useEffect(() => { document.body.classList.toggle('qv-open', activeQuickViewId !== null); }, [activeQuickViewId]);

  // Escape closes whatever is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsMenuOpen(false);
        setActiveQuickViewId(null);
        setIsAdminOpen(false);
        setIsCheckoutOpen(false);
        setIsAccountOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleAddToCart = (id, product, qty = 1) => {
    setCartLines((lines) => {
      const existing = lines.find((l) => l.product_id === id);
      if (existing) {
        return lines.map((l) => (l.product_id === id ? { ...l, qty: Math.min(l.qty + qty, 50) } : l));
      }
      return [...lines, { product_id: id, qty: Math.min(qty, 50) }];
    });
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 500);
  };

  const handleUpdateQty = (id, delta) => {
    setCartLines((lines) =>
      lines
        .map((l) => (l.product_id === id ? { ...l, qty: Math.min(l.qty + delta, 50) } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const handleRemoveItem = (id) => setCartLines((lines) => lines.filter((l) => l.product_id !== id));

  const openAccount = () => {
    setActiveQuickViewId(null);
    setIsMenuOpen(false);
    setIsAccountOpen(true);
  };

  const sectionProps = { onAddToCart: handleAddToCart, onOpenQuickView: setActiveQuickViewId };

  return (
    <div id="top">
      <Navbar
        links={navLinks}
        cartCount={totalCartCount}
        isPulsing={isPulsing}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        onOpenAccount={openAccount}
        isSignedIn={Boolean(user)}
      />

      <MobileMenu links={navLinks} onClose={() => setIsMenuOpen(false)} />

      <Hero />

      <Marquee />

      <TrustBar settings={settings} />

      {loadError && (
        <div className="wrap" role="alert" style={{ padding: '24px 0', textAlign: 'center', color: 'var(--rose-deep)' }}>
          {loadError}
        </div>
      )}

      {!isLoading && (
        <>
          {hasItems(products.newArrivals) && (
            <ProductSection
              id="new-arrivals"
              title="New arrivals"
              tagline="just landed"
              description="The latest additions to the shelf — restocked often."
              products={products.newArrivals}
              isHorizontalScroll={true}
              {...sectionProps}
            />
          )}

          {hasItems(products.skincare) && (
            <ProductSection
              id="skincare"
              title="For the face"
              tagline="skincare"
              description="Cleansers, serums, sunscreen and moisturisers from brands you already trust."
              products={products.skincare}
              isTabbed={true}
              {...sectionProps}
            />
          )}

          {hasItems(products.haircare) && (
            <ProductSection
              id="haircare"
              title="For the hair"
              tagline="hair care"
              description="Everyday shampoos and conditioners for every hair type."
              products={products.haircare}
              isTabbed={true}
              bgPaper={true}
              {...sectionProps}
            />
          )}

          {hasItems(products.supplements) && (
            <ProductSection
              id="supplements"
              title="Supplements"
              tagline="from within"
              description="Collagen and gluta drinks — imported, sealed, and ready to mix."
              products={products.supplements}
              {...sectionProps}
            />
          )}

          {hasItems(products.lipbalm) && (
            <ProductSection
              id="lipbalm"
              title="Lip balm"
              tagline="lip"
              description="Small tubes, big habit."
              products={products.lipbalm}
              bgPaper={true}
              {...sectionProps}
            />
          )}
        </>
      )}

      <Philosophy />

      <Footer settings={settings} />

      <CartDrawer
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        deliveryFrom={Math.min(settings.delivery_inside_dhaka, settings.delivery_outside_dhaka)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <QuickViewModal
        key={activeQuickViewId || 'none'}
        product={quickViewProduct}
        user={user}
        isAdmin={isAdminAuthenticated}
        onClose={() => setActiveQuickViewId(null)}
        onRequestSignIn={openAccount}
        onAddToCart={(id, product, qty) => {
          handleAddToCart(id, product, qty);
          setIsCartOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cartItems}
        settings={settings}
        user={user}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={() => setCartLines([])}
      />

      <AccountModal isOpen={isAccountOpen} user={user} onClose={() => setIsAccountOpen(false)} />

      <AdminModal
        isOpen={isAdminOpen}
        isAuthenticated={isAdminAuthenticated}
        onAuthenticate={setIsAdminAuthenticated}
        onClose={() => setIsAdminOpen(false)}
        products={productList}
        onCatalogChanged={reloadProducts}
        settings={settings}
        onSettingsChanged={reloadSettings}
      />
    </div>
  );
}
