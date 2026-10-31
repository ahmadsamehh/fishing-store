'use client';
import { thumbOf, resizeToJpeg } from '@/lib/images';

// Product photos in the dashboard form: add several, choose the main one, reorder, remove.
// Each item is either { url } (already uploaded) or { blob, preview } (new, uploaded on save).
export default function PhotoManager({ photos, onChange, onError, max = 6 }) {
  const add = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    const room = max - photos.length;
    if (files.length > room) onError?.(`You can add up to ${max} photos. Only the first ${room} were added.`);
    else onError?.('');
    const added = [];
    for (const f of files.slice(0, Math.max(0, room))) {
      try {
        const blob = await resizeToJpeg(f, 1200);
        added.push({ blob, preview: URL.createObjectURL(blob) });
      } catch (err) {
        onError?.(err.message);
      }
    }
    onChange([...photos, ...added]);
  };
  const move = (i, dir) => {
    const next = [...photos];
    const j = i + dir;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const makeMain = (i) => onChange([photos[i], ...photos.filter((_, k) => k !== i)]);
  const remove = (i) => onChange(photos.filter((_, k) => k !== i));

  return (
    <div className="pm">
      <div className="pm-head">
        <span className="pm-label">Photos</span>
        <span className="muted small">{photos.length} of {max} · the first one is the main photo</span>
      </div>
      <ul className="pm-grid">
        {photos.map((ph, i) => (
          <li key={ph.url || ph.preview} className={i === 0 ? 'main' : ''}>
            <img src={ph.url ? thumbOf(ph.url) : ph.preview} alt={`Photo ${i + 1}`} onError={(e) => { if (ph.url && e.currentTarget.src !== ph.url) e.currentTarget.src = ph.url; }} />
            {i === 0 && <span className="pm-main">Main</span>}
            <span className="pm-acts">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move left" title="Move left">‹</button>
              {i > 0 && <button type="button" className="pm-star" onClick={() => makeMain(i)} aria-label="Make main photo" title="Make main photo">★</button>}
              <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Move right" title="Move right">›</button>
              <button type="button" className="pm-del" onClick={() => remove(i)} aria-label="Remove photo" title="Remove photo">×</button>
            </span>
          </li>
        ))}
        {photos.length < max && (
          <li className="pm-add">
            <label>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              <span>{photos.length ? 'Add photos' : 'Upload photos'}</span>
              <input type="file" accept="image/*" multiple onChange={add} className="sr-only" />
            </label>
          </li>
        )}
      </ul>
    </div>
  );
}