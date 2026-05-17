'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) window.location.href = '/dashboard';
  }, []);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Min 8 characters.';
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Registration failed.');
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user)); // ← tambah ini
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

        .rp-root { display:flex; min-height:100vh; width:100%; font-family:'DM Sans',sans-serif; }

        /* LEFT PANEL */
        .rp-left {
          position:relative; width:50%; min-height:100vh;
          background:#2D6A4F; display:flex; flex-direction:column;
          justify-content:flex-end; padding:48px 56px; overflow:hidden;
        }
        .rp-left-overlay {
          position:absolute; inset:0;
          background-image: url('/register.png');
          background-size:cover; background-position:center;
          z-index:0; pointer-events:none;
        }
        .rp-left-overlay::after {
          content:'';
          position:absolute; inset:0;
          background:linear-gradient(160deg, rgba(15,52,35,.3) 0%, rgba(15,52,35,.75) 100%);
        }
        .rp-left-grid {
          position:absolute; inset:0; display:flex; flex-direction:column;
          justify-content:space-evenly; padding:60px 0; opacity:.07; pointer-events:none; z-index:1;
        }
        .rp-shelf { width:100%; height:1px; background:#A8E7C5; }
        .rp-left-circle1 {
          position:absolute; top:-120px; right:-120px; width:480px; height:480px;
          border-radius:50%; border:1px solid rgba(168,231,197,.1); pointer-events:none; z-index:1;
        }
        .rp-left-circle2 {
          position:absolute; bottom:-60px; left:-80px; width:320px; height:320px;
          border-radius:50%; border:1px solid rgba(168,231,197,.07); pointer-events:none; z-index:1;
        }
        .rp-brand { position:relative; z-index:1; display:flex; flex-direction:column; gap:12px; }
        .rp-brand-name {
          font-family:'DM Serif Display',Georgia,serif; font-weight:400;
          font-size:clamp(34px,3.5vw,52px); line-height:1; letter-spacing:-.04em;
          color:#A8E7C5; margin:0;
        }
        .rp-brand-tag {
          font-size:12px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
          color:rgba(168,231,197,.6); margin:0;
        }
        .rp-brand-desc {
          font-size:14px; font-weight:300; line-height:1.75;
          color:rgba(168,231,197,.7); margin:0;
        }

        /* RIGHT PANEL */
        .rp-right {
          width:50%; min-height:100vh; background:#FCF9F8;
          display:flex; justify-content:center; align-items:center;
          padding:48px 32px; box-sizing:border-box;
        }
        .rp-form-wrap {
          width:100%; max-width:420px;
          display:flex; flex-direction:column; gap:40px;
        }
        .rp-header { display:flex; flex-direction:column; gap:6px; }
        .rp-title {
          font-family:'DM Serif Display',Georgia,serif; font-weight:400;
          font-size:clamp(24px,2.5vw,32px); letter-spacing:-.02em;
          color:#1C1B1B; margin:0;
        }
        .rp-subtitle { font-size:14px; color:#404943; margin:0; line-height:1.6; }

        /* FORM */
        .rp-form { display:flex; flex-direction:column; gap:16px; }
        .rp-field { display:flex; flex-direction:column; gap:6px; }
        .rp-label {
          font-size:11px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#404943;
        }
        .rp-input-wrap {
          background:#fff; border:1px solid #BFC9C1;
          transition:border-color .15s, box-shadow .15s;
        }
        .rp-input-wrap:focus-within { border-color:#2D6A4F; box-shadow:0 0 0 3px rgba(45,106,79,.1); }
        .rp-input-wrap.err { border-color:#C0392B; }
        .rp-input-wrap.err:focus-within { box-shadow:0 0 0 3px rgba(192,57,43,.1); }
        .rp-input {
          width:100%; height:50px; padding:0 16px; border:none; outline:none;
          background:transparent; font-family:'DM Sans',sans-serif;
          font-size:15px; color:#1C1B1B; box-sizing:border-box;
        }
        .rp-input::placeholder { color:rgba(112,121,115,.45); }
        .rp-err-msg { font-size:12px; color:#C0392B; }

        .rp-server-err {
          padding:12px 14px; background:#FEF2F2; border:1px solid #FECACA;
          font-size:13px; color:#B91C1C; line-height:1.5;
        }

        .rp-btn {
          width:100%; height:50px; border:none;
          background:#2D6A4F; color:#fff; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-weight:600;
          font-size:13px; letter-spacing:.1em; text-transform:uppercase;
          box-shadow:4px 4px 0 rgba(15,82,56,.2);
          display:flex; align-items:center; justify-content:center; gap:10px;
          transition:background .15s, box-shadow .15s, transform .1s;
        }
        .rp-btn:hover:not(:disabled) { background:#235C43; box-shadow:5px 5px 0 rgba(15,82,56,.25); }
        .rp-btn:active:not(:disabled) { transform:translate(1px,1px); box-shadow:2px 2px 0 rgba(15,82,56,.2); }
        .rp-btn:disabled { opacity:.6; cursor:not-allowed; box-shadow:none; }

        .rp-spinner {
          width:14px; height:14px; border:2px solid rgba(255,255,255,.3);
          border-top-color:#fff; border-radius:50%;
          animation:rp-spin .7s linear infinite; flex-shrink:0;
        }
        @keyframes rp-spin { to { transform:rotate(360deg); } }

        /* FOOTER */
        .rp-footer {
          display:flex; flex-direction:column; align-items:center; gap:20px;
          padding-top:4px;
        }
        .rp-signin { font-size:14px; color:#404943; text-align:center; }
        .rp-signin a { font-weight:600; color:#2D6A4F; text-decoration:none; border-bottom:1px solid transparent; transition:border-color .15s; }
        .rp-signin a:hover { border-bottom-color:#2D6A4F; }
        .rp-links { display:flex; gap:24px; }
        .rp-links a {
          font-size:11px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#707973; text-decoration:none;
          transition:color .15s;
        }
        .rp-links a:hover { color:#2D6A4F; }

        @media(max-width:860px) {
          .rp-left { display:none; }
          .rp-right { width:100%; }
        }
      `}</style>

      <div className="rp-root">
        {/* LEFT */}
        <div className="rp-left">
          <div className="rp-left-overlay" />
          <div className="rp-left-circle1" />
          <div className="rp-left-circle2" />
          <div className="rp-left-grid">
            {Array.from({length:12}).map((_,i) => <div key={i} className="rp-shelf" />)}
          </div>
          <div className="rp-brand">
            <h1 className="rp-brand-name">FREEDGE</h1>
            <p className="rp-brand-tag">Culinary Precision</p>
            <p className="rp-brand-desc">
              Organize your ingredients,<br />reduce waste, and cook with intention.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rp-right">
          <div className="rp-form-wrap">
            <div className="rp-header">
              <h2 className="rp-title">Create Account</h2>
              <p className="rp-subtitle">Enter your details to begin your culinary journey.</p>
            </div>

            <form className="rp-form" onSubmit={handleSubmit} noValidate>
              {serverError && <div className="rp-server-err">{serverError}</div>}

              <div className="rp-field">
                <label className="rp-label" htmlFor="reg-name">Full Name</label>
                <div className={`rp-input-wrap${errors.name ? ' err' : ''}`}>
                  <input id="reg-name" name="name" type="text" placeholder="Julian Voss"
                    value={form.name} onChange={handleChange} autoComplete="name"
                    className="rp-input" />
                </div>
                {errors.name && <span className="rp-err-msg">{errors.name}</span>}
              </div>

              <div className="rp-field">
                <label className="rp-label" htmlFor="reg-email">Email Address</label>
                <div className={`rp-input-wrap${errors.email ? ' err' : ''}`}>
                  <input id="reg-email" name="email" type="email" placeholder="voss@precision.com"
                    value={form.email} onChange={handleChange} autoComplete="email"
                    className="rp-input" />
                </div>
                {errors.email && <span className="rp-err-msg">{errors.email}</span>}
              </div>

              <div className="rp-field">
                <label className="rp-label" htmlFor="reg-password">Password</label>
                <div className={`rp-input-wrap${errors.password ? ' err' : ''}`}>
                  <input id="reg-password" name="password" type="password" placeholder="Min. 8 characters"
                    value={form.password} onChange={handleChange} autoComplete="new-password"
                    className="rp-input" />
                </div>
                {errors.password && <span className="rp-err-msg">{errors.password}</span>}
              </div>

              <button type="submit" className="rp-btn" disabled={loading}>
                {loading && <span className="rp-spinner" />}
                Create Account
              </button>
            </form>

            <div className="rp-footer">
              <p className="rp-signin">
                Already have an account?{' '}
                <Link href="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}