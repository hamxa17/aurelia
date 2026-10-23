import React, { useState, useEffect } from 'react';
import { ACCENTS } from '../data/products';
import {
  CATEGORY_OPTIONS,
  categoryKeyOf,
  categoryLabelOf,
  parseCategoryKey,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  signInAdmin,
  signOutAdmin,
  changeAdminPassword,
} from '../data/catalog';
import { isSupabaseConfigured } from '../lib/supabase';
import BloomShape from './BloomShape';

export default function AdminModal({ 
  isOpen, 
  isAuthenticated, 
  onAuthenticate, 
  onClose, 
  products,
  onCatalogChanged
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');
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
  const [newPassConfirm, setNewPassConfirm] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState('');
  const [passChangeError, setPassChangeError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setPassError('');
      setFormSuccess('');
      setFormError('');
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setPassError('');
    try {
      await signInAdmin(email, password);
      onAuthenticate(true);
      setPassword('');
    } catch (err) {
      setPassError(err.message || 'Could not sign in.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    onAuthenticate(false);
    resetForm();
    setActiveTab('manage');
  };

  const handleStartEdit = (prod) => {
    setEditingId(prod.id);
    setFormName(prod.name || '');
    setFormCategory(categoryKeyOf(prod));
    setFormPrice(prod.price ?? '');
    setFormNote(prod.note || '');
    setFormAccent(prod.accent || 'rose');
    setFormBadge(prod.badge || '');
    setFormImage(prod.image || '');
    setFormDescription(prod.description || '');
    setActiveTab('add');
    setFormSuccess('');
    setFormError('');
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
    setFormError('');
  };

  // Images go to cloud storage; only the link is saved with the product
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setFormError('');
    setIsUploading(true);
    try {
      setFormImage(await uploadProductImage(file));
    } catch (err) {
      setFormError(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formName.trim() || formPrice === '' || isBusy || isUploading) return;
    if (formImage && !/^https:\/\//i.test(formImage)) {
      setFormError('Image link must start with https://');
      return;
    }

    const productData = {
      name: formName,
      price: parseFloat(formPrice),
      note: formNote.trim() || 'Formulated for your daily ritual',
      accent: formAccent,
      badge: formBadge,
      image: formImage,
      description: formDescription,
      ...parseCategoryKey(formCategory),
    };

    setIsBusy(true);
    setFormError('');
    try {
      if (editingId) {
        await updateProduct(editingId, productData);
        setFormSuccess('Product updated — it is live for everyone now.');
      } else {
        await createProduct(productData);
        setFormSuccess('Product published — it is live for everyone now.');
      }
      await onCatalogChanged();
      setTimeout(() => {
        setFormSuccess('');
        resetForm();
        setActiveTab('manage');
      }, 1200);
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (prod) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.name}"? This removes it for everyone.`)) return;
    setFormError('');
    try {
      await deleteProduct(prod.id);
      await onCatalogChanged();
    } catch (err) {
      setFormError(friendlyError(err));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassChangeError('');
    if (newPass.length < 10) {
      setPassChangeError('Use at least 10 characters.');
      return;
    }
    if (newPass !== newPassConfirm) {
      setPassChangeError('The two passwords do not match.');
      return;
    }
    try {
      await changeAdminPassword(newPass);
      setPassChangeSuccess('Password updated.');
      setNewPass('');
      setNewPassConfirm('');
      setTimeout(() => setPassChangeSuccess(''), 2500);
    } catch (err) {
      setPassChangeError(err.message || 'Could not update the password.');
    }
  };

  const allItems = products;

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
            <h2 className="admin-title">Admin sign in</h2>
            {!isSupabaseConfigured ? (
              <p className="admin-sub">
                The store database isn't connected yet, so editing is switched off. Follow SETUP.md to connect it.
              </p>
            ) : (
              <>
                <p className="admin-sub">Sign in with the store owner account to manage products.</p>
                <form onSubmit={handleLogin} className="admin-form">
                  <input
                    type="email"
                    placeholder="Email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="admin-input"
                    required
                    autoFocus
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="admin-input"
                    required
                  />
                  {passError && <div className="admin-error">{passError}</div>}
                  <button type="submit" className="admin-btn" disabled={isBusy}>
                    {isBusy ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>
              </>
            )}
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
                <button className="admin-tab" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            </div>

            <div className="admin-content">
              {formSuccess && <div className="admin-success-banner">{formSuccess}</div>}
              {formError && <div className="admin-error" role="alert" style={{ marginBottom: '12px' }}>{formError}</div>}

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
                        {allItems.map((item) => (
                          <tr key={item.id}>
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
                            <td><span className="admin-cat-badge">{categoryLabelOf(item)}</span></td>
                            <td><strong>৳{Number(item.price).toFixed(2)}</strong></td>
                            <td>{item.badge ? <span className="card__badge">{item.badge}</span> : '—'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                className="admin-action-edit"
                                onClick={() => handleStartEdit(item)}
                              >
                                Edit
                              </button>
                              <button 
                                className="admin-action-delete"
                                onClick={() => handleDelete(item)}
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
                        {CATEGORY_OPTIONS.filter((o) => !o.group).slice(0, 1).map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                        {['Skincare', 'Haircare'].map((group) => (
                          <optgroup key={group} label={group}>
                            {CATEGORY_OPTIONS.filter((o) => o.group === group).map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                        ))}
                        {CATEGORY_OPTIONS.filter((o) => !o.group).slice(1).map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
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
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        onChange={handleImageFileChange}
                        disabled={isUploading}
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
                    {isUploading && <div className="admin-success" style={{ marginTop: '6px' }}>Uploading image…</div>}
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                      Max 3 MB. Or paste an image link (https://):
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://example.com/product.jpg" 
                      value={formImage}
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
                    <button type="submit" className="admin-btn" disabled={isBusy || isUploading}>
                      {isBusy ? 'Saving…' : editingId ? 'Save Changes' : 'Publish Product to Store'}
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
                    <h4>Change your password</h4>
                    <form onSubmit={handleChangePassword} style={{ marginTop: '12px', display: 'grid', gap: '8px', maxWidth: '300px' }}>
                      <input
                        type="password"
                        placeholder="New password (10+ characters)"
                        autoComplete="new-password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="admin-input"
                      />
                      <input
                        type="password"
                        placeholder="Type it again"
                        autoComplete="new-password"
                        value={newPassConfirm}
                        onChange={(e) => setNewPassConfirm(e.target.value)}
                        className="admin-input"
                      />
                      {passChangeError && <div className="admin-error">{passChangeError}</div>}
                      {passChangeSuccess && <div className="admin-success">{passChangeSuccess}</div>}
                      <button type="submit" className="admin-btn" style={{ marginTop: '4px' }}>Update Password</button>
                    </form>
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

function friendlyError(err) {
  const msg = err?.message || '';
  if (/row-level security|permission denied|JWT/i.test(msg)) {
    return 'You are not allowed to do that. Try signing out and back in.';
  }
  return msg || 'Something went wrong. Please try again.';
}
