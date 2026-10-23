import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProducts, groupProducts, getCurrentSession, checkIsAdmin } from './data/catalog';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import ProductSection from './components/ProductSection';
import Philosophy from './components/Philosophy';
import Promo from './components/Promo';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import QuickViewModal from './components/QuickViewModal';
import AdminModal from './components/AdminModal';

export default function App() {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cart, setCart] = useState({}); // { [id]: { product, qty } }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeQuickViewId, setActiveQuickViewId] = useState(null);
  const [isPulsing, setIsPulsing] = useState(false);

  // Admin state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

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

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  // Restore an admin session after a page refresh, and react to sign-in / sign-out
  useEffect(() => {
    let active = true;
    getCurrentSession().then(async (session) => {
      if (active && session) setIsAdminAuthenticated(await checkIsAdmin());
    });
    if (!supabase) return () => { active = false; };
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setIsAdminAuthenticated(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Open the admin panel directly at yoursite.com/#admin
  useEffect(() => {
    const openIfAdminHash = () => {
      if (window.location.hash === '#admin') setIsAdminOpen(true);
    };
    openIfAdminHash();
    window.addEventListener('hashchange', openIfAdminHash);
    return () => window.removeEventListener('hashchange', openIfAdminHash);
  }, []);

  const quickViewProduct = activeQuickViewId
    ? productList.find((p) => p.id === activeQuickViewId) || null
    : null;

  // Sync body CSS classes for modal/drawer visibility
  useEffect(() => {
    document.body.classList.toggle('cart-open', isCartOpen);
  }, [isCartOpen]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', isMenuOpen);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.classList.toggle('qv-open', activeQuickViewId !== null);
  }, [activeQuickViewId]);

  // Handle escape key to close open overlays
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsMenuOpen(false);
        setActiveQuickViewId(null);
        setIsAdminOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalCartCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  const handleAddToCart = (id, product, qty = 1) => {
    setCart((prevCart) => {
      const existingQty = prevCart[id] ? prevCart[id].qty : 0;
      return {
        ...prevCart,
        [id]: { product, qty: existingQty + qty }
      };
    });

    // Pulse cart count icon
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 500);
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prevCart) => {
      if (!prevCart[id]) return prevCart;
      const newQty = prevCart[id].qty + delta;
      if (newQty <= 0) {
        const nextCart = { ...prevCart };
        delete nextCart[id];
        return nextCart;
      }
      return {
        ...prevCart,
        [id]: { ...prevCart[id], qty: newQty }
      };
    });
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => {
      const nextCart = { ...prevCart };
      delete nextCart[id];
      return nextCart;
    });
  };

  return (
    <div id="top">
      <Navbar
        cartCount={totalCartCount}
        isPulsing={isPulsing}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />

      <MobileMenu onClose={() => setIsMenuOpen(false)} />

      <Hero />

      <Marquee />

      {loadError && (
        <div className="wrap" role="alert" style={{ padding: '24px 0', textAlign: 'center', color: 'var(--rose-deep)' }}>
          {loadError}
        </div>
      )}

      {!isLoading && (<>
      <ProductSection
        id="new-arrivals"
        title="New arrivals"
        tagline="just landed"
        description="The newest formulas in rotation — small batch, restocked often."
        products={products.newArrivals || []}
        isHorizontalScroll={true}
        onAddToCart={handleAddToCart}
        onOpenQuickView={setActiveQuickViewId}
      />

      <Philosophy />

      <ProductSection
        id="skincare"
        title="For the face"
        tagline="skincare"
        description="Five categories, one goal: skin that behaves without a ten-step ritual."
        products={products.skincare || {}}
        isTabbed={true}
        onAddToCart={handleAddToCart}
        onOpenQuickView={setActiveQuickViewId}
      />

      <ProductSection
        id="haircare"
        title="For the hair"
        tagline="hair care"
        description="Bond-level repair, wash-day treatments, and masks for the in-between."
        products={products.haircare || {}}
        isTabbed={true}
        bgPaper={true}
        onAddToCart={handleAddToCart}
        onOpenQuickView={setActiveQuickViewId}
      />

      <ProductSection
        id="supplements"
        title="Supplements"
        tagline="from within"
        description="Because skin starts before the mirror."
        products={products.supplements || []}
        onAddToCart={handleAddToCart}
        onOpenQuickView={setActiveQuickViewId}
      />

      <ProductSection
        id="lipbalm"
        title="Lip balm"
        tagline="lip"
        description="Small tubes, big habit."
        products={products.lipbalm || []}
        bgPaper={true}
        onAddToCart={handleAddToCart}
        onOpenQuickView={setActiveQuickViewId}
      />
      </>)}

      <Promo />

      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      <CartDrawer
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
      />

      <QuickViewModal
        key={activeQuickViewId || 'none'}
        product={quickViewProduct}
        onClose={() => setActiveQuickViewId(null)}
        onAddToCart={(id, product, qty) => {
          handleAddToCart(id, product, qty);
          setIsCartOpen(true);
        }}
      />

      <AdminModal
        isOpen={isAdminOpen}
        isAuthenticated={isAdminAuthenticated}
        onAuthenticate={setIsAdminAuthenticated}
        onClose={() => setIsAdminOpen(false)}
        products={productList}
        onCatalogChanged={reloadProducts}
      />
    </div>
  );
}
