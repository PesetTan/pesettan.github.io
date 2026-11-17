'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { RSVPInput } from '@/lib/rsvp-validation';
import { event } from '@/lib/event';

const KEY = 'alyna-ellene-2027-edit-token';
const blank: RSVPInput = { name: '', email: '', attendance: 'yes', partySize: 1, message: '' };
function apiUrl() { return ['localhost', '127.0.0.1'].includes(location.hostname) ? '/api/rsvp' : `${event.serviceOrigin}/api/rsvp`; }
function newToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join(''); }

export default function RsvpForm() {
  const [form, setForm] = useState<RSVPInput>(blank);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<RSVPInput | null>(null);
  const [editing, setEditing] = useState(false);
  const [editLink, setEditLink] = useState('');
  const [copied, setCopied] = useState(false);
  const token = useRef<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(location.hash.slice(1)).get('edit');
    let stored: string | null = null;
    try { stored = localStorage.getItem(KEY); } catch {}
    const value = fragment && /^[a-f0-9]{64}$/.test(fragment) ? fragment : stored;
    if (!value || !/^[a-f0-9]{64}$/.test(value)) return;
    token.current = value;
    try { localStorage.setItem(KEY, value); } catch {}
    setEditLink(`${location.origin}${location.pathname}#edit=${value}`);
    if (fragment) { history.replaceState(null, '', `${location.pathname}#rsvp`); document.getElementById('rsvp')?.scrollIntoView(); }
    setLoading(true);
    fetch(apiUrl(), { headers: { Authorization: `Bearer ${value}` }, credentials: 'omit', cache: 'no-store' })
      .then(async r => { const data = await r.json() as { error?: string; rsvp?: RSVPInput }; if (!r.ok) throw new Error(data.error); if (data.rsvp) { setForm(data.rsvp); setSaved(data.rsvp); setEditing(Boolean(fragment)); } })
      .catch(() => setError('We couldn’t load your previous RSVP. Please refresh to try again.'))
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setPending(true);
    const website = String(new FormData(e.currentTarget).get('website') || '');
    if (!token.current) { token.current = newToken(); try { localStorage.setItem(KEY, token.current); } catch {} }
    try {
      const response = await fetch(apiUrl(), { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.current}` }, body: JSON.stringify({ ...form, partySize: form.attendance === 'no' ? 0 : form.partySize, website }) });
      const data = await response.json() as { error?: string; rsvp?: RSVPInput };
      if (!response.ok || !data.rsvp) throw new Error(data.error || 'Your RSVP could not be saved.');
      setSaved(data.rsvp); setForm(data.rsvp); setEditing(false);
      setEditLink(`${location.origin}${location.pathname}#edit=${token.current}`);
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); }
    finally { setPending(false); }
  }

  if (loading) return <div className="rsvp-card form-loading" role="status">Loading your RSVP…</div>;
  if (saved && !editing) return <div className="rsvp-card rsvp-success" ref={successRef} tabIndex={-1}><span className="success-check" aria-hidden="true">✓</span><p className="eyebrow">YOU’RE ALL SET</p><h3>Your RSVP is saved.</h3><p>{saved.attendance === 'yes' ? `We have ${saved.partySize} ${saved.partySize === 1 ? 'person' : 'people'} planning to join us.` : saved.attendance === 'maybe' ? `We’ve marked your group of ${saved.partySize} as “Maybe.”` : 'We’ve saved that you can’t make it. Thank you for letting us know.'}</p><p className="muted">The exact February date is still to come. You can update your reply whenever you need.</p><label htmlFor="edit-link">Your private edit link</label><input id="edit-link" value={editLink} readOnly onFocus={e => e.currentTarget.select()} aria-describedby="edit-help"/><p id="edit-help" className="field-help">Keep this link—it lets you change only your household’s RSVP. No account needed.</p><div className="success-actions"><button type="button" className="button primary" onClick={() => setEditing(true)}>Edit my RSVP</button><button type="button" className="button secondary" onClick={async () => { try { await navigator.clipboard.writeText(editLink); setCopied(true); } catch { document.getElementById('edit-link')?.focus(); } }}>{copied ? 'Link copied ✓' : 'Copy edit link'}</button></div></div>;

  return <form className="rsvp-card" onSubmit={submit} aria-labelledby="form-title"><div className="form-top"><span className="eyebrow">YOUR HOUSEHOLD RSVP</span><span className="form-ticket-no">FEB / 2027</span></div><h3 id="form-title">{saved ? 'Update your RSVP' : 'Let’s make it a party.'}</h3><div className="field-grid"><div><label htmlFor="guest-name">Your name <span>*</span></label><input id="guest-name" name="name" autoComplete="name" required minLength={2} maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name or family name"/></div><div><label htmlFor="guest-email">Email <span>*</span></label><input id="guest-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com"/></div></div><fieldset><legend>Are you planning to join? <span>*</span></legend><div className="response-options">{([['yes','Count us in','Planning to come'],['maybe','Maybe','Depends on the date'],['no','Can’t make it','Sending birthday love']] as const).map(([value,label,description]) => <label className={`response-choice ${form.attendance === value ? 'selected' : ''}`} key={value}><input type="radio" name="attendance" value={value} checked={form.attendance === value} onChange={() => setForm({ ...form, attendance: value, partySize: value === 'no' ? 0 : Math.max(1, form.partySize) })}/><strong>{label}</strong><small>{description}</small></label>)}</div></fieldset>{form.attendance !== 'no' && <div className="count-field"><div><label htmlFor="party-size">Total number attending <span>*</span></label><p id="count-help" className="field-help">Adults + children, including you.</p></div><div className="stepper"><button type="button" aria-label="One fewer guest" disabled={form.partySize <= 1} onClick={() => setForm({ ...form, partySize: form.partySize - 1 })}>−</button><input id="party-size" name="partySize" type="number" min="1" max="50" required inputMode="numeric" aria-describedby="count-help" value={Number.isNaN(form.partySize) ? '' : form.partySize} onChange={e => setForm({ ...form, partySize: e.target.value === '' ? NaN : Number(e.target.value) })}/><button type="button" aria-label="One more guest" disabled={form.partySize >= 50 || Number.isNaN(form.partySize)} onClick={() => setForm({ ...form, partySize: form.partySize + 1 })}>+</button></div></div>}<div><label htmlFor="guest-message">A note for the hosts <small>(optional)</small></label><textarea id="guest-message" name="message" rows={2} maxLength={1000} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Anything you’d like us to know?"/></div><div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave blank</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary submit-rsvp" disabled={pending} type="submit">{pending ? 'Saving your RSVP…' : saved ? 'Save my changes' : 'Send my RSVP'}<span aria-hidden="true">↗</span></button><p className="form-privacy">Your response is visible only to the hosts. No account needed.</p></form>;
}
