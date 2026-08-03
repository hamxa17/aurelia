import React, { useState, useEffect } from 'react';
import { loadProducts, saveProducts, resetProducts, findProductById } from './data/products';
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
  const [products, setProducts] = useState(loadProducts);
  const [cart, setCart] = useState({}); // { [id]: { product, qty } }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeQuickViewId, setActiveQuickViewId] = useState(null);
  const [isPulsing, setIsPulsing] = useState(false);

  // Admin state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Save products to localStorage whenever products state changes
  useEffect(() => {
    saveProducts(products);
  }, [products]);

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

  // --- Admin Product CRUD Handlers ---

  const handleAddProduct = (targetCategory, productData) => {
    setProducts((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (targetCategory === 'newArrivals') {
        next.newArrivals.unshift(productData);
      } else if (targetCategory.startsWith('skincare:')) {
        const subCat = targetCategory.split(':')[1];
        if (!next.skincare[subCat]) next.skincare[subCat] = [];
        next.skincare[subCat].unshift(productData);
      } else if (targetCategory.startsWith('haircare:')) {
        const subCat = targetCategory.split(':')[1];
        if (!next.haircare[subCat]) next.haircare[subCat] = [];
        next.haircare[subCat].unshift(productData);
      } else if (targetCategory === 'supplements') {
        next.supplements.unshift(productData);
      } else if (targetCategory === 'lipbalm') {
        next.lipbalm.unshift(productData);
      }
      return next;
    });
  };

  const handleDeleteProduct = (id, categoryKey) => {
    setProducts((prev) => {
      const next = JSON.parse(JSON.stringify(prev));

      const removeFromArray = (arr, index) => {
        if (arr && index >= 0 && index < arr.length) {
          arr.splice(index, 1);
        }
      };

      if (categoryKey === 'newArrivals') {
        const idx = parseInt(id.replace('new-', ''));
        removeFromArray(next.newArrivals, idx);
      } else if (categoryKey.startsWith('skincare:')) {
        const subCat = categoryKey.split(':')[1];
        const match = id.match(/skin-.*-(\d+)/);
        if (match) removeFromArray(next.skincare[subCat], parseInt(match[1]));
      } else if (categoryKey.startsWith('haircare:')) {
        const subCat = categoryKey.split(':')[1];
        const match = id.match(/hair-.*-(\d+)/);
        if (match) removeFromArray(next.haircare[subCat], parseInt(match[1]));
      } else if (categoryKey === 'supplements') {
        const idx = parseInt(id.replace('supp-', ''));
        removeFromArray(next.supplements, idx);
      } else if (categoryKey === 'lipbalm') {
        const idx = parseInt(id.replace('lip-', ''));
        removeFromArray(next.lipbalm, idx);
      }
      return next;
    });
  };

  const handleUpdateProduct = (id, oldCategoryKey, newCategoryKey, productData) => {
    handleDeleteProduct(id, oldCategoryKey);
    handleAddProduct(newCategoryKey, productData);
  };

  const handleResetCatalog = () => {
    const defaultData = resetProducts();
    setProducts(defaultData);
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

      <ProductSection
        id="new-arrivals"
        title="New arrivals"
        tagline="just landed"
        description="The newest formulas in rotation — small batch, restocked often."
        products={products.newArrivals || []}
        isHorizontalScroll={true}
        prefix="new"
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
        prefix="skin"
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
        prefix="hair"
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
        prefix="supp"
        onAddToCart={handleAddToCart}
        onOpenQuickView={setActiveQuickViewId}
      />

      <ProductSection
        id="lipbalm"
        title="Lip balm"
        tagline="lip"
        description="Small tubes, big habit."
        products={products.lipbalm || []}
        prefix="lip"
        bgPaper={true}
        onAddToCart={handleAddToCart}
        onOpenQuickView={setActiveQuickViewId}
      />

      <Promo />

      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      <CartDrawer
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
      />

      <QuickViewModal
        productId={activeQuickViewId}
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
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={handleResetCatalog}
      />
    </div>
  );
}
