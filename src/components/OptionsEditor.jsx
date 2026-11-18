import React, { useState } from 'react';
import { uploadProductImage } from '../data/catalog';

// Admin: the sizes (each with its own price) and types a customer can choose between.
// value = { types: [{label, image}], sizes: [{label, price, image}] }
export default function OptionsEditor({ value, onChange, onError }) {
  const types = value?.types || [];
  const sizes = value?.sizes || [];
  const [busyRow, setBusyRow] = useState(null);

  const set = (key, list) => onChange({ ...value, types, sizes, [key]: list });
  const update = (key, list, i, patch) => set(key, list.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (key, list, i) => set(key, list.filter((_, j) => j !== i));

  const upload = (key, list, i) => async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setBusyRow(`${key}${i}`);
    try {
      update(key, list, i, { image: await uploadProductImage(file) });
    } catch (err) {
      onError?.(err.message || 'Photo upload failed.');
    } finally {
      setBusyRow(null);
    }
  };

  const photoCell = (key, list, row, i) => (
    <label className="opt-photo" title="Photo for this choice (optional)">
      {row.image ? <img src={row.image} alt="" /> : <span>{busyRow === `${key}${i}` ? '…' : '+ photo'}</span>}
      <input type="file" accept="image/*" hidden onChange={upload(key, list, i)} />
    </label>
  );

  return (
    <div className="opt-editor">
      <div>
        <label className="label">Sizes (optional) — each size has its own price</label>
        {sizes.map((s, i) => (
          <div className="opt-row" key={i}>
            <input className="admin-input" placeholder="e.g. 250ml" value={s.label}
              onChange={(e) => update('sizes', sizes, i, { label: e.target.value })} />
            <input className="admin-input" type="number" min="1" placeholder="Price ৳" value={s.price ?? ''}
              onChange={(e) => update('sizes', sizes, i, { price: e.target.value })} />
            {photoCell('sizes', sizes, s, i)}
            <button type="button" className="opt-remove" aria-label="Remove size" onClick={() => remove('sizes', sizes, i)}>×</button>
          </div>
        ))}
        <button type="button" className="admin-btn-secondary opt-add" onClick={() => set('sizes', [...sizes, { label: '', price: '' }])}>+ Add size</button>
      </div>
      <div>
        <label className="label">Types (optional) — e.g. scents or formulas</label>
        {types.map((t, i) => (
          <div className="opt-row opt-row--type" key={i}>
            <input className="admin-input" placeholder="e.g. Honey" value={t.label}
              onChange={(e) => update('types', types, i, { label: e.target.value })} />
            {photoCell('types', types, t, i)}
            <button type="button" className="opt-remove" aria-label="Remove type" onClick={() => remove('types', types, i)}>×</button>
          </div>
        ))}
        <button type="button" className="admin-btn-secondary opt-add" onClick={() => set('types', [...types, { label: '' }])}>+ Add type</button>
      </div>
    </div>
  );
}
