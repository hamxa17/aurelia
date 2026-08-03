import React, { useState, useEffect } from 'react';
import { ACCENTS, getAdminPassword, setAdminPassword } from '../data/products';
import BloomShape from './BloomShape';

export default function AdminModal({ 
  isOpen, 
  isAuthenticated, 
  onAuthenticate, 
  onClose, 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onResetProducts 
}) {
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'add' | 'settings'

  // Form State for Add / Edit
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('newArrivals');
  const [formPrice, setFormPrice] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formAccent, setFormAccent] = useState('rose');
  const [formBadge, setFormBadge] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Settings State
  const [newPass, setNewPass] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setPassError('');
      setFormSuccess('');
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === getAdminPassword()) {
      onAuthenticate(true);
      setPassError('');
      setPassword('');
    } else {
      setPassError('Incorrect admin password. Please try again.');
    }
  };

  const handleStartEdit = (id, prod, categoryKey) => {
    setEditingId({ id, categoryKey });
    setFormName(prod.name || '');
    setFormCategory(categoryKey);
    setFormPrice(prod.price || '');
    setFormNote(prod.note || '');
    setFormAccent(prod.accent || 'rose');
    setFormBadge(prod.badge || '');
    setFormImage(prod.image || '');
    setFormDescription(prod.details?.description || '');
    setActiveTab('add');
    setFormSuccess('');
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('newArrivals');
    setFormPrice('');
    setFormNote('');
    setFormAccent('rose');
    setFormBadge('');
    setFormImage('');
    setFormDescription('');
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    const productData = {
      name: formName.trim(),
      price: parseFloat(formPrice),
      note: formNote.trim() || 'Formulated for your daily ritual',
      accent: formAccent,
      badge: formBadge.trim() || undefined,
      image: formImage || undefined,
      details: {
        description: formDescription.trim()
      }
    };

    if (editingId) {
      onUpdateProduct(editingId.id, editingId.categoryKey, formCategory, productData);
      setFormSuccess('Product updated successfully!');
    } else {
      onAddProduct(formCategory, productData);
      setFormSuccess('New product added to catalog successfully!');
    }

    setTimeout(() => {
      setFormSuccess('');
      resetForm();
      setActiveTab('manage');
    }, 1200);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPass.trim().length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    setAdminPassword(newPass.trim());
    setPassChangeSuccess('Admin password updated successfully!');
    setNewPass('');
    setTimeout(() => setPassChangeSuccess(''), 2000);
  };

  // Flatten all current products for manager view
  const getAllProductList = () => {
    const list = [];
    if (products.newArrivals) {
      products.newArrivals.forEach((pr, i) => list.push({ id: `new-${i}`, categoryKey: 'newArrivals', categoryLabel: 'New Arrivals', item: pr }));
    }
    if (products.skincare) {
      Object.entries(products.skincare).forEach(([cat, items]) => {
        items.forEach((pr, i) => list.push({ id: `skin-${cat.replace(/\s/g, '')}-${i}`, categoryKey: `skincare:${cat}`, categoryLabel: `Skincare (${cat})`, item: pr }));
      });
    }
    if (products.haircare) {
      Object.entries(products.haircare).forEach(([cat, items]) => {
        items.forEach((pr, i) => list.push({ id: `hair-${cat.replace(/\s/g, '')}-${i}`, categoryKey: `haircare:${cat}`, categoryLabel: `Hair care (${cat})`, item: pr }));
      });
    }
    if (products.supplements) {
      products.supplements.forEach((pr, i) => list.push({ id: `supp-${i}`, categoryKey: 'supplements', categoryLabel: 'Supplements', item: pr }));
    }
    if (products.lipbalm) {
      products.lipbalm.forEach((pr, i) => list.push({ id: `lip-${i}`, categoryKey: 'lipbalm', categoryLabel: 'Lip balm', item: pr }));
    }
    return list;
  };

  const allItems = getAllProductList();

  return (
    <>
      <div className="admin-overlay" onClick={onClose} />
      <div className="admin-modal">
        <button className="admin-close" onClick={onClose} aria-label="Close admin">&times;</button>
        
        {!isAuthenticated ? (
          <div className="admin-auth-view">
            <div className="admin-auth-icon">
              <BloomShape width="36" height="36" style={{ color: 'var(--gold)' }} />
            </div>
            <h2 className="admin-title">Admin Access Portal</h2>
            <p className="admin-sub">Enter the secret admin password to manage products and store catalog.</p>
            
            <form onSubmit={handleLogin} className="admin-form">
              <input 
                type="password" 
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                autoFocus
              />
              {passError && <div className="admin-error">{passError}</div>}
              <button type="submit" className="admin-btn">Unlock Portal</button>
            </form>
          </div>
        ) : (
          <div className="admin-panel-view">
            <div className="admin-header">
              <div className="admin-brand">
                <BloomShape width="22" height="22" style={{ color: 'var(--gold)' }} />
                <span>Store Management</span>
              </div>
              <div className="admin-tabs">
                <button 
                  className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('manage'); resetForm(); }}
                >
                  Products ({allItems.length})
                </button>
                <button 
                  className={`admin-tab ${activeTab === 'add' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('add'); if(!editingId) resetForm(); }}
                >
                  {editingId ? 'Edit Product' : '+ Add New Product'}
                </button>
                <button 
                  className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </div>
            </div>

            <div className="admin-content">
              {formSuccess && <div className="admin-success-banner">{formSuccess}</div>}

              {activeTab === 'manage' && (
                <div className="admin-manage-list">
                  <div className="admin-section-head">
                    <h3>Active Store Catalog</h3>
                    <button className="admin-btn-secondary" onClick={() => { resetForm(); setActiveTab('add'); }}>
                      + Add Product
                    </button>
                  </div>
                  
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Badge</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allItems.map(({ id, categoryKey, categoryLabel, item }) => (
                          <tr key={id}>
                            <td>
                              <div className="admin-item-cell">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} 
                                  />
                                ) : (
                                  <span className="admin-swatch-dot" style={{ background: ACCENTS[item.accent]?.[0] || '#F1D6D9' }} />
                                )}
                                <div>
                                  <div className="admin-item-name">{item.name}</div>
                                  <div className="admin-item-note">{item.note}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="admin-cat-badge">{categoryLabel}</span></td>
                            <td><strong>৳{Number(item.price).toFixed(2)}</strong></td>
                            <td>{item.badge ? <span className="card__badge">{item.badge}</span> : '—'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                className="admin-action-edit"
                                onClick={() => handleStartEdit(id, item, categoryKey)}
                              >
                                Edit
                              </button>
                              <button 
                                className="admin-action-delete"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                    onDeleteProduct(id, categoryKey);
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'add' && (
                <form onSubmit={handleSubmitForm} className="admin-edit-form">
                  <h3 style={{ marginBottom: '18px' }}>{editingId ? 'Edit Product Details' : 'Add New Product to Store'}</h3>

                  <div className="admin-grid-2">
                    <div>
                      <label className="label">Product Name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Rose Hydrating Veil" 
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="label">Price (৳) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        placeholder="e.g. 280" 
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-grid-2" style={{ marginTop: '14px' }}>
                    <div>
                      <label className="label">Category Placement *</label>
                      <select 
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="admin-input"
                      >
                        <option value="newArrivals">New Arrivals</option>
                        <optgroup label="Skincare">
                          <option value="skincare:Facewash">Skincare — Facewash</option>
                          <option value="skincare:Face Scrub">Skincare — Face Scrub</option>
                          <option value="skincare:Facial Serum">Skincare — Facial Serum</option>
                          <option value="skincare:Sunscreen">Skincare — Sunscreen</option>
                          <option value="skincare:Super Whips">Skincare — Super Whips</option>
                        </optgroup>
                        <optgroup label="Haircare">
                          <option value="haircare:Hair Treatments">Haircare — Hair Treatments</option>
                          <option value="haircare:Power Bonds">Haircare — Power Bonds</option>
                          <option value="haircare:Hair Masks">Haircare — Hair Masks</option>
                        </optgroup>
                        <option value="supplements">Supplements</option>
                        <option value="lipbalm">Lip Balm</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Swatch Accent Color (Fallback)</label>
                      <select 
                        value={formAccent}
                        onChange={(e) => setFormAccent(e.target.value)}
                        className="admin-input"
                      >
                        <option value="rose">Rose (Soft Pink)</option>
                        <option value="gold">Gold (Soft Yellow)</option>
                        <option value="berry">Berry (Deep Red)</option>
                        <option value="sage">Sage (Soft Green)</option>
                        <option value="clay">Clay (Warm Earth)</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-grid-2" style={{ marginTop: '14px' }}>
                    <div>
                      <label className="label">Short Note / Subtitle</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Daily barrier repair cream" 
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="label">Badge (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. New, Best Seller" 
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  {/* Product Image Upload */}
                  <div style={{ marginTop: '14px' }}>
                    <label className="label">Upload Product Image (Optional)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange}
                        className="admin-input"
                        style={{ flex: 1 }}
                      />
                      {formImage && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={formImage} 
                            alt="Preview" 
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--line)' }} 
                          />
                          <button 
                            type="button" 
                            className="admin-action-delete" 
                            style={{ fontSize: '12px' }}
                            onClick={() => setFormImage('')}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                      Or paste image URL:
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://example.com/product.jpg" 
                      value={formImage.startsWith('data:') ? '' : formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="admin-input"
                      style={{ marginTop: '4px' }}
                    />
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <label className="label">Full Description</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe what makes this product special..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    <button type="submit" className="admin-btn">
                      {editingId ? 'Save Changes' : 'Publish Product to Store'}
                    </button>
                    {editingId && (
                      <button type="button" className="admin-btn-secondary" onClick={resetForm}>
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              )}

              {activeTab === 'settings' && (
                <div className="admin-settings-view">
                  <h3>Admin Portal Settings</h3>
                  
                  <div className="admin-card-box" style={{ marginTop: '18px' }}>
                    <h4>Change Admin Password</h4>
                    <form onSubmit={handleChangePassword} style={{ marginTop: '12px' }}>
                      <input 
                        type="password" 
                        placeholder="Enter new password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="admin-input"
                        style={{ maxWidth: '300px' }}
                      />
                      {passChangeSuccess && <div className="admin-success" style={{ marginTop: '8px' }}>{passChangeSuccess}</div>}
                      <button type="submit" className="admin-btn" style={{ marginTop: '12px' }}>Update Password</button>
                    </form>
                  </div>

                  <div className="admin-card-box" style={{ marginTop: '20px', borderColor: 'var(--rose-deep)' }}>
                    <h4 style={{ color: 'var(--rose-deep)' }}>Reset Catalog to Default</h4>
                    <p style={{ fontSize: '13.5px', marginTop: '6px', color: 'var(--ink-soft)' }}>
                      Restores the original products and removes all custom added or edited items from browser storage.
                    </p>
                    <button 
                      className="admin-action-delete" 
                      style={{ marginTop: '14px', padding: '10px 18px', fontSize: '13px' }}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reset all products back to original defaults? All custom changes will be erased.')) {
                          onResetProducts();
                          alert('Catalog reset to factory defaults.');
                          setActiveTab('manage');
                        }
                      }}
                    >
                      Reset Entire Store Catalog
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
