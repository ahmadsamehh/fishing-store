'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { youtubeId } from '@/lib/youtube';
import AdminGate from '@/components/AdminGate';

const SHOWN_ON_HOME = 6;
const EMPTY = { youtubeUrl: '', title: '', productId: '' };

function VideoForm({ initial, products, onSave, onCancel }) {
  const [f, setF] = useState(initial || EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const id = youtubeId(f.youtubeUrl);

  const submit = async (e) => {
    e.preventDefault();
    if (!id) return setError('Paste a YouTube link. Copy it from the video page or its Share button.');
    setBusy(true);
    setError('');
    const err = await onSave(f);
    setBusy(false);
    if (err) setError(err);
    else if (!initial) setF(EMPTY);
  };

  return (
    <form className="vid-form" onSubmit={submit} noValidate>
      <span className="cat-label">{initial ? 'Edit video' : 'Add a video'}</span>
      <div className="vid-form-row">
        {id ? <img className="vid-thumb" src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" /> : <span className="vid-thumb vid-thumb-empty">No video yet</span>}
        <div className="vid-fields">
          <label>YouTube link<input type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={f.youtubeUrl} onChange={set('youtubeUrl')} /></label>
          <label>Title (optional)<input value={f.title} onChange={set('title')} placeholder="Shown under the video" /></label>
          <label>Linked product (optional)
            <select value={f.productId || ''} onChange={set('productId')}>
              <option value="">No product</option>
              {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </label>
        </div>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="vid-form-acts">
        {initial && <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>}
        <button type="submit" className="btn btn-pink" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Add video'}</button>
      </div>
    </form>
  );
}

function VideosPanel() {
  const { videos, products, adminAddVideo, adminUpdateVideo, adminDeleteVideo, adminMoveVideo } = useStore();
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const list = videos || [];
  const productName = (pid) => products.find((p) => p.id === pid)?.name;

  const run = async (fn, okText) => {
    setError(''); setMessage('');
    const err = await fn();
    err ? setError(err) : okText && setMessage(okText);
    return err;
  };

  if (videos === null) {
    return (
      <div className="adm-page">
        <div className="section-head"><h1>Videos</h1></div>
        <p className="error">The videos table isn't set up yet. Run the videos SQL in Supabase, then refresh this page.</p>
      </div>
    );
  }

  return (
    <div className="adm-page">
      <div className="section-head"><h1>Videos</h1></div>
      <p className="muted cat-intro">The videos in the "Watch &amp; learn" section of the home page. The first {SHOWN_ON_HOME} in this list are shown. Link a video to a product so customers can open it from the video.</p>

      {!editing && <VideoForm products={products} onSave={(f) => run(() => adminAddVideo(f), 'Video added.')} />}

      {message && <p className="notice" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <ol className="vid-list">
        {list.map((v, i) => {
          const id = youtubeId(v.youtubeUrl);
          if (editing === v.id) {
            return (
              <li key={v.id} className="vid-item vid-item-edit">
                <VideoForm
                  initial={{ youtubeUrl: v.youtubeUrl, title: v.title, productId: v.productId || '' }}
                  products={products}
                  onSave={async (f) => { const err = await run(() => adminUpdateVideo(v.id, f), 'Changes saved.'); if (!err) setEditing(null); return err; }}
                  onCancel={() => setEditing(null)}
                />
              </li>
            );
          }
          return (
            <li key={v.id} className={`vid-item${i >= SHOWN_ON_HOME ? ' vid-hidden' : ''}`}>
              <span className="vid-num">{i + 1}</span>
              {id ? <img className="vid-thumb" src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" /> : <span className="vid-thumb vid-thumb-empty">Link not recognized</span>}
              <span className="vid-info">
                <strong>{v.title || productName(v.productId) || 'Untitled video'}</strong>
                <small className="muted">{v.productId ? `Opens: ${productName(v.productId) || 'deleted product'}` : 'Not linked to a product'}{i >= SHOWN_ON_HOME ? ' · not on the home page' : ''}</small>
              </span>
              <span className="vid-acts">
                <button type="button" className="icon-act" disabled={i === 0} onClick={() => run(() => adminMoveVideo(v.id, -1))} aria-label="Move up" title="Move up">↑</button>
                <button type="button" className="icon-act" disabled={i === list.length - 1} onClick={() => run(() => adminMoveVideo(v.id, 1))} aria-label="Move down" title="Move down">↓</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(v.id)}>Edit</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => window.confirm('Delete this video from the home page?') && run(() => adminDeleteVideo(v.id), 'Video deleted.')}>Delete</button>
              </span>
            </li>
          );
        })}
      </ol>
      {!list.length && <div className="empty">No videos yet. Add the first one above.</div>}
    </div>
  );
}

export default function AdminVideosPage() {
  return (
    <AdminGate>
      <VideosPanel />
    </AdminGate>
  );
}
