'use client';
import { useEffect, useState } from 'react';

// Quantity box with − and + buttons. The field can be cleared while typing,
// so on phones you can delete the "1" and type "20".
export default function QtyInput({ value, onChange, min = 1, max = 999, id, label = 'Quantity' }) {
  const [text, setText] = useState(String(value));

  useEffect(() => setText(String(value)), [value]);

  const commit = (n) => {
    const clean = Math.min(max, Math.max(min, Number.isFinite(n) ? Math.round(n) : min));
    setText(String(clean));
    onChange(clean);
  };

  return (
    <div className="qty">
      <button type="button" aria-label="Decrease quantity" onClick={() => commit(Number(text || value) - 1)} disabled={Number(text) <= min}>−</button>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={text}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
          setText(digits);
          if (digits !== '') onChange(Math.min(max, Math.max(min, Number(digits))));
        }}
        onFocus={(e) => e.target.select()}
        onBlur={() => commit(text === '' ? min : Number(text))}
      />
      <button type="button" aria-label="Increase quantity" onClick={() => commit(Number(text || value) + 1)} disabled={Number(text) >= max}>+</button>
    </div>
  );
}
