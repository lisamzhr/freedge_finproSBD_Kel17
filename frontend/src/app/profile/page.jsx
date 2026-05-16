'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: '', email: '' });
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  // Ambil data user dari storage
  useEffect(() => {
    const stored =
      localStorage.getItem('user') || sessionStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setForm({ name: u.name || '' });
    }
  }, []);

  const initials = user.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSave() {
    setServerError('');
    setSaveSuccess(false);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Update failed.');

      // Update storage
      const updatedUser = { ...user, name: form.name };
      if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(updatedUser));
      if (sessionStorage.getItem('user')) sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSaveSuccess(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        .pp-root {
          display: flex; min-height: 100vh; width: 100%;
          font-family: 'DM Sans', sans-serif;
          background: #FCF9F8; flex-direction: column;
        }

        /* ── TOP BAR ── */
        .pp-topbar {
          width: 100%; background: #F0EDED;
          border-bottom: 1px solid #BFC9C1;
          padding: 0 32px; height: 65px;
          display: flex; align-items: center;
          justify-content: space-between; box-sizing: border-box;
          position: sticky; top: 0; z-index: 10;
        }
        .pp-topbar-brand {
          display: flex; align-items: baseline; gap: 10px; text-decoration: none;
        }
        .pp-topbar-name {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 22px; color: #0F5238; letter-spacing: -.02em; line-height: 1;
        }
        .pp-topbar-tag {
          font-size: 10px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: #707973;
        }
        .pp-topbar-nav { display: flex; gap: 24px; }
        .pp-topbar-link {
          font-size: 12px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: #707973; text-decoration: none;
          transition: color .15s;
        }
        .pp-topbar-link:hover { color: #0F5238; }
        .pp-topbar-link--active {
          color: #0F5238; border-bottom: 1px solid #0F5238; padding-bottom: 1px;
        }

        /* ── MAIN ── */
        .pp-main { flex: 1; background: #FCF9F8; }

        .pp-page-header {
          padding: 48px 32px 24px; max-width: 960px; margin: 0 auto;
        }
        .pp-page-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 30px; letter-spacing: -.02em; color: #0F5238;
          font-weight: 400; margin: 0 0 0 0;
          border-bottom: 1px solid #0F5238;
          display: inline-block; padding-bottom: 4px;
        }

        .pp-content {
          padding: 0 32px 64px; max-width: 960px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1.4fr; gap: 48px;
          align-items: start;
        }

        /* ── INFO CARD ── */
        .pp-card {
          background: #fff; border: 1px solid rgba(15,82,56,.1);
          padding: 32px; display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 0;
        }
        .pp-avatar {
          width: 88px; height: 88px;
          background: #0F5238; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 600; letter-spacing: .05em;
          margin-bottom: 20px; flex-shrink: 0;
        }
        .pp-card-name {
          font-size: 22px; font-weight: 600; color: #1C1B1B;
          margin: 0 0 4px;
        }
        .pp-card-email {
          font-size: 14px; color: #707973; margin: 0 0 24px;
        }
        .pp-card-divider {
          width: 100%; height: 1px; background: #BFC9C1; margin-bottom: 24px;
        }
        .pp-card-stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%;
        }
        .pp-card-stat { text-align: left; }
        .pp-stat-label {
          font-size: 11px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: #0F5238; margin-bottom: 4px;
        }
        .pp-stat-val { font-size: 15px; color: #1C1B1B; }

        /* ── FORM SECTION ── */
        .pp-forms { display: flex; flex-direction: column; gap: 24px; }

        .pp-panel {
          background: #fff; border: 1px solid rgba(15,82,56,.1); padding: 28px;
        }
        .pp-panel--muted {
          background: #F6F3F2; border: 1px solid #BFC9C1;
        }
        .pp-panel-title {
          font-size: 11px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: #0F5238; margin: 0 0 20px;
        }
        .pp-panel-title--muted { color: #707973; }

        /* fields */
        .pp-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 20px; }
        .pp-field:last-of-type { margin-bottom: 0; }
        .pp-label {
          font-size: 11px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: #707973;
        }
        .pp-input-wrap {
          background: #fff; border: 1px solid #BFC9C1;
          transition: border-color .15s, box-shadow .15s;
        }
        .pp-input-wrap:focus-within { border-color: #0F5238; box-shadow: 0 0 0 3px rgba(15,82,56,.1); }
        .pp-input-wrap.err { border-color: #C0392B; }
        .pp-input-wrap--disabled { background: #F6F3F2; cursor: not-allowed; }
        .pp-input {
          width: 100%; height: 48px; padding: 0 16px; border: none; outline: none;
          background: transparent; font-family: 'DM Sans', sans-serif;
          font-size: 15px; color: #1C1B1B; box-sizing: border-box;
        }
        .pp-input::placeholder { color: #BFC9C1; }
        .pp-input--disabled { color: #707973; cursor: not-allowed; }
        .pp-err-msg { font-size: 12px; color: #C0392B; }

        .pp-success-msg {
          padding: 12px 14px; background: #F0FFF4;
          border: 1px solid #A8E7C5; font-size: 13px;
          color: #0F5238; line-height: 1.5; margin-bottom: 16px;
        }
        .pp-server-err {
          padding: 12px 14px; background: #FEF2F2;
          border: 1px solid #FECACA; font-size: 13px;
          color: #B91C1C; line-height: 1.5; margin-bottom: 16px;
        }

        /* buttons */
        .pp-btn {
          height: 52px; padding: 0 36px; border: none;
          background: #0F5238; color: #fff; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          font-size: 13px; letter-spacing: .1em; text-transform: uppercase;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          transition: background .15s, transform .1s;
        }
        .pp-btn:hover:not(:disabled) { background: #0A3D29; }
        .pp-btn:active:not(:disabled) { transform: translateY(1px); }
        .pp-btn:disabled { opacity: .6; cursor: not-allowed; }

        .pp-btn-danger {
          height: 48px; padding: 0 32px;
          background: transparent; border: 1px solid #BA1A1A;
          color: #BA1A1A; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          font-size: 13px; letter-spacing: .1em; text-transform: uppercase;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .15s;
        }
        .pp-btn-danger:hover { background: rgba(186,26,26,.05); }

        .pp-spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: pp-spin .7s linear infinite; flex-shrink: 0;
        }
        @keyframes pp-spin { to { transform: rotate(360deg); } }

        .pp-logout-desc {
          font-size: 14px; color: #707973; line-height: 1.6; margin: 0 0 20px;
        }

        /* ── FOOTER DETAIL ── */
        .pp-footer-detail {
          padding: 0 32px 48px; max-width: 960px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 2fr; gap: 16px; opacity: .4;
        }
        .pp-detail-sq { background: #E5E2E1; border: 1px solid #BFC9C1; aspect-ratio: 1; }
        .pp-detail-bar {
          position: relative; border-left: 1px solid #0F5238;
          background: rgba(45,106,79,.05);
          padding: 20px;
        }
        .pp-detail-bar-label {
          font-size: 11px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: #0F5238; margin: 0 0 4px;
        }
        .pp-detail-bar-text { font-size: 14px; color: #1C1B1B; }

        /* ── FOOTER ── */
        .pp-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 32px 40px; background: #DCD9D9;
          border-top: 1px solid #BFC9C1; flex-wrap: wrap; gap: 16px;
        }
        .pp-footer-brand {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 20px; color: #0F5238; font-weight: 400;
        }
        .pp-footer-links { display: flex; gap: 24px; align-items: center; }
        .pp-footer-link { font-size: 14px; color: #707973; text-decoration: none; transition: color .15s; }
        .pp-footer-link:hover { color: #0F5238; }
        .pp-footer-copy { font-size: 13px; color: #707973; opacity: .6; }

        @media (max-width: 760px) {
          .pp-content { grid-template-columns: 1fr; gap: 24px; }
          .pp-topbar-nav { display: none; }
          .pp-footer-detail { display: none; }
        }
      `}</style>

      <div className="pp-root">

        {/* ── TOP BAR ── */}
        <header className="pp-topbar">
          <Link href="/dashboard" className="pp-topbar-brand">
            <span className="pp-topbar-name">FREEDGE</span>
            <span className="pp-topbar-tag">Culinary Precision</span>
          </Link>
          <nav className="pp-topbar-nav">
            <Link href="/dashboard" className="pp-topbar-link">Dashboard</Link>
            <span className="pp-topbar-link pp-topbar-link--active">Profile</span>
          </nav>
        </header>

        <main className="pp-main">

          {/* ── PAGE HEADER ── */}
          <div className="pp-page-header">
            <h2 className="pp-page-title">Profile</h2>
          </div>

          {/* ── CONTENT GRID ── */}
          <div className="pp-content">

            {/* Info Card */}
            <section>
              <div className="pp-card">
                <div className="pp-avatar">{initials}</div>
                <h3 className="pp-card-name">{user.name || '—'}</h3>
                <p className="pp-card-email">{user.email || '—'}</p>
                <div className="pp-card-divider" />
                <div className="pp-card-stats">
                  <div className="pp-card-stat">
                    </div>
                </div>
              </div>
            </section>

            {/* Forms */}
            <section className="pp-forms">

              {/* Edit Info */}
              <div className="pp-panel">
                <p className="pp-panel-title">Edit Account Information</p>

                {saveSuccess && (
                  <div className="pp-success-msg">Changes saved successfully.</div>
                )}
                {serverError && (
                  <div className="pp-server-err">{serverError}</div>
                )}

                {/* Full Name */}
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-name">Full Name</label>
                  <div className={`pp-input-wrap${errors.name ? ' err' : ''}`}>
                    <input
                      id="pp-name" name="name" type="text"
                      placeholder="Your full name"
                      value={form.name} onChange={handleChange}
                      className="pp-input"
                    />
                  </div>
                  {errors.name && <span className="pp-err-msg">{errors.name}</span>}
                </div>

                {/* Email (read-only) */}
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-email">Email Address</label>
                  <div className="pp-input-wrap pp-input-wrap--disabled">
                    <input
                      id="pp-email" type="email"
                      value={user.email} readOnly
                      className="pp-input pp-input--disabled"
                    />
                  </div>
                </div>

                <button className="pp-btn" onClick={handleSave} disabled={loading}>
                  {loading && <span className="pp-spinner" />}
                  Save Changes
                </button>
              </div>

              {/* Logout */}
              <div className="pp-panel pp-panel--muted">
                <p className="pp-panel-title pp-panel-title--muted">Account Management</p>
                <p className="pp-logout-desc">
                  Disconnect your current session from this device.
                  All local preferences will be cleared.
                </p>
                <button className="pp-btn-danger" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" stroke="#BA1A1A" strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M11 11l3-3-3-3" stroke="#BA1A1A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 8H6" stroke="#BA1A1A" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Logout
                </button>
              </div>

            </section>
          </div>

          {/* ── FOOTER DETAIL ── */}
          <div className="pp-footer-detail">
            <div className="pp-detail-sq" />
            <div className="pp-detail-bar">
              <p className="pp-detail-bar-label">Freedge System Status</p>
              <p className="pp-detail-bar-text">Optimization Engine: Active</p>
            </div>
          </div>

        </main>

        {/* ── FOOTER ── */}
        <footer className="pp-footer">
          <span className="pp-footer-brand">Freedge</span>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
            <div className="pp-footer-links">
              <a href="#" className="pp-footer-link">Privacy</a>
              <a href="#" className="pp-footer-link">Terms</a>
              <a href="#" className="pp-footer-link">Contact</a>
            </div>
            <span className="pp-footer-copy">© 2024 Freedge Culinary Systems. All rights reserved.</span>
          </div>
        </footer>

      </div>
    </>
  );
}