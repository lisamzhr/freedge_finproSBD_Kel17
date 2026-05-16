'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) window.location.href = '/dashboard';
  }, []);

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Login failed.');

      const store = rememberMe ? localStorage : sessionStorage;
      store.setItem('token', data.data.token);
      store.setItem('user', JSON.stringify(data.data.user));

      window.location.href = '/dashboard';
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        .lp-root { display:flex; min-height:100vh; width:100%; font-family:'DM Sans',sans-serif; }

        /* LEFT PANEL */
        .lp-left {
          position:relative; width:50%; min-height:100vh;
          background:#2D6A4F; display:flex; flex-direction:column;
          justify-content:space-between; padding:48px 56px; overflow:hidden; isolation:isolate;
        }
        .lp-left-img {
          position:absolute; inset:0;
          background-image: url('/login.png');
          background-size:cover; background-position:center;
          z-index:0; pointer-events:none;
        }
        .lp-left-img::after {
          content:'';
          position:absolute; inset:0;
          background:linear-gradient(180deg, rgba(15,82,56,.45) 0%, rgba(15,82,56,.85) 100%);
        }
        /* subtle organic grid texture */
        .lp-left-texture {
          position:absolute; inset:0; opacity:.05; pointer-events:none; z-index:0;
          background-image:
            radial-gradient(circle at 20% 35%, #A8E7C5 1px, transparent 1px),
            radial-gradient(circle at 75% 65%, #A8E7C5 1px, transparent 1px),
            radial-gradient(circle at 50% 10%, #A8E7C5 1px, transparent 1px);
          background-size: 60px 60px, 80px 80px, 100px 100px;
        }
        .lp-circle1 {
          position:absolute; top:-100px; right:-100px; width:440px; height:440px;
          border-radius:50%; border:1px solid rgba(168,231,197,.1); z-index:0; pointer-events:none;
        }
        .lp-circle2 {
          position:absolute; bottom:-40px; left:-60px; width:260px; height:260px;
          border-radius:50%; border:1px solid rgba(168,231,197,.07); z-index:0; pointer-events:none;
        }

        .lp-brand { position:relative; z-index:1; display:flex; flex-direction:column; gap:4px; }
        .lp-brand-name {
          font-family:'DM Serif Display',Georgia,serif; font-weight:400;
          font-size:clamp(32px,3vw,48px); line-height:1; letter-spacing:-.04em;
          color:#fff; margin:0;
        }
        .lp-brand-tag {
          font-size:13px; font-weight:500; letter-spacing:.1em; text-transform:uppercase;
          color:rgba(168,231,197,.75); margin:0;
        }

        .lp-quote-wrap {
          position:relative; z-index:1;
          border-left:2px solid #A8E7C5; padding-left:20px;
        }
        .lp-quote {
          font-style:italic; font-weight:300; font-size:17px; line-height:1.7;
          color:#A8E7C5; margin:0;
        }

        /* RIGHT PANEL */
        .lp-right {
          width:50%; min-height:100vh; background:#FCF9F8;
          display:flex; justify-content:center; align-items:center;
          padding:48px 32px; box-sizing:border-box;
        }
        .lp-form-wrap {
          width:100%; max-width:420px;
          display:flex; flex-direction:column; gap:32px;
        }

        .lp-header { display:flex; flex-direction:column; gap:6px; }
        .lp-title {
          font-family:'DM Serif Display',Georgia,serif; font-weight:400;
          font-size:clamp(22px,2.2vw,30px); letter-spacing:-.02em;
          color:#1C1B1B; margin:0;
        }
        .lp-subtitle { font-size:14px; color:#404943; margin:0; line-height:1.6; }

        /* FORM */
        .lp-form { display:flex; flex-direction:column; gap:0; padding:16px 0 0; }

        .lp-field { display:flex; flex-direction:column; gap:5px; margin-bottom:20px; }
        .lp-field-row {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:5px;
        }
        .lp-label {
          font-size:11px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#707973; margin:0;
        }
        .lp-forgot {
          font-size:11px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#0F5238; text-decoration:none;
          transition:opacity .15s;
        }
        .lp-forgot:hover { opacity:.7; }

        .lp-input-wrap {
          background:#fff; border:1px solid #BFC9C1;
          transition:border-color .15s, box-shadow .15s;
        }
        .lp-input-wrap:focus-within { border-color:#0F5238; box-shadow:0 0 0 3px rgba(15,82,56,.1); }
        .lp-input-wrap.err { border-color:#C0392B; }
        .lp-input {
          width:100%; height:48px; padding:0 16px; border:none; outline:none;
          background:transparent; font-family:'DM Sans',sans-serif;
          font-size:15px; color:#1C1B1B; box-sizing:border-box;
        }
        .lp-input::placeholder { color:#BFC9C1; }
        .lp-err-msg { font-size:12px; color:#C0392B; }

        /* Remember me */
        .lp-remember {
          display:flex; align-items:center; gap:8px;
          margin-bottom:16px; cursor:pointer;
        }
        .lp-checkbox {
          width:16px; height:16px; border:1px solid #BFC9C1;
          background:#fff; appearance:none; cursor:pointer;
          flex-shrink:0; transition:background .15s, border-color .15s;
          position:relative;
        }
        .lp-checkbox:checked { background:#0F5238; border-color:#0F5238; }
        .lp-checkbox:checked::after {
          content:''; position:absolute; top:2px; left:4px;
          width:5px; height:8px; border:2px solid #fff;
          border-top:none; border-left:none; transform:rotate(45deg);
        }
        .lp-remember-label { font-size:14px; color:#404943; cursor:pointer; user-select:none; }

        .lp-server-err {
          padding:12px 14px; background:#FEF2F2; border:1px solid #FECACA;
          font-size:13px; color:#B91C1C; line-height:1.5; margin-bottom:4px;
        }

        /* CTA */
        .lp-btn {
          width:100%; height:56px; border:none;
          background:#0F5238; color:#fff; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-weight:600;
          font-size:13px; letter-spacing:.1em; text-transform:uppercase;
          display:flex; align-items:center; justify-content:center; gap:10px;
          transition:background .15s, transform .1s;
        }
        .lp-btn:hover:not(:disabled) { background:#0A3D29; }
        .lp-btn:active:not(:disabled) { transform:translateY(1px); }
        .lp-btn:disabled { opacity:.6; cursor:not-allowed; }

        .lp-spinner {
          width:14px; height:14px; border:2px solid rgba(255,255,255,.3);
          border-top-color:#fff; border-radius:50%;
          animation:lp-spin .7s linear infinite; flex-shrink:0;
        }
        @keyframes lp-spin { to { transform:rotate(360deg); } }

        /* ALTERNATIVE ACTIONS */
        .lp-alt {
          border-top:1px solid #BFC9C1; padding-top:28px;
          display:flex; flex-direction:column; gap:20px;
        }
        .lp-signup-row {
          display:flex; justify-content:center; gap:4px; flex-wrap:wrap;
        }
        .lp-signup-text { font-size:15px; color:#404943; }
        .lp-signup-link { font-size:15px; font-weight:700; color:#0F5238; text-decoration:none; }
        .lp-signup-link:hover { text-decoration:underline; }

        .lp-oauth-row { display:flex; gap:16px; }
        .lp-oauth-btn {
          flex:1; height:44px; background:#fff; border:1px solid #BFC9C1;
          display:flex; align-items:center; justify-content:center; gap:8px;
          cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600;
          font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:#1C1B1B;
          transition:border-color .15s, background .15s;
        }
        .lp-oauth-btn:hover { border-color:#0F5238; background:#F7FAF8; }

        @media(max-width:860px) {
          .lp-left { display:none; }
          .lp-right { width:100%; }
        }
      `}</style>

      <div className="lp-root">
        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-left-img" />
          <div className="lp-left-texture" />
          <div className="lp-circle1" />
          <div className="lp-circle2" />

          <div className="lp-brand">
            <h1 className="lp-brand-name">FREEDGE</h1>
            <p className="lp-brand-tag">Culinary Precision</p>
          </div>

          <div className="lp-quote-wrap">
            <p className="lp-quote">
              "The secret of good cooking is,<br />
              first, having a love of it."
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-form-wrap">
            <div className="lp-header">
              <h2 className="lp-title">Welcome Back</h2>
              <p className="lp-subtitle">Enter your credentials to access your inventory.</p>
            </div>

            <form className="lp-form" onSubmit={handleSubmit} noValidate>
              {serverError && <div className="lp-server-err">{serverError}</div>}

              {/* Email */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-email">Email Address</label>
                <div className={`lp-input-wrap${errors.email ? ' err' : ''}`}>
                  <input id="lp-email" name="email" type="email"
                    placeholder="chef@freedge.com"
                    value={form.email} onChange={handleChange}
                    autoComplete="email" className="lp-input" />
                </div>
                {errors.email && <span className="lp-err-msg">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="lp-field">
                <div className="lp-field-row">
                  <label className="lp-label" htmlFor="lp-password">Password</label>
                  <Link href="/forgot-password" className="lp-forgot">Forgot?</Link>
                </div>
                <div className={`lp-input-wrap${errors.password ? ' err' : ''}`}>
                  <input id="lp-password" name="password" type="password"
                    placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    autoComplete="current-password" className="lp-input" />
                </div>
                {errors.password && <span className="lp-err-msg">{errors.password}</span>}
              </div>

              {/* Remember me */}
              <label className="lp-remember">
                <input type="checkbox" className="lp-checkbox"
                  checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <span className="lp-remember-label">Remember me for 7 days</span>
              </label>

              <button type="submit" className="lp-btn" disabled={loading}>
                {loading && <span className="lp-spinner" />}
                Sign In to Freedge
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}