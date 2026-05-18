'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';

const CATEGORIES = ['produce', 'protein', 'dairy', 'frozen', 'beverage', 'other'];
const UNITS = ['gram', 'ml', 'pcs'];

const API = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
    (typeof window !== 'undefined'
    ? localStorage.getItem('token') || sessionStorage.getItem('token')
    : null);

/* helpers */

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

/* sub-components */

function NutritionAccordion({ nutrition }) {
  const [open, setOpen] = useState(false);
  if (!nutrition) return null;

  const rows = [
    { label: 'Calories',     value: nutrition.calories, unit: 'kcal' },
    { label: 'Protein',      value: nutrition.protein,  unit: 'g'    },
    { label: 'Fat',          value: nutrition.fat,      unit: 'g'    },
    { label: 'Carbohydrate', value: nutrition.carbs,    unit: 'g'    },
    { label: 'Fiber',        value: nutrition.fiber,    unit: 'g'    },
  ];

  return (
    <div className={`ai-accordion${open ? ' open' : ''}`}>
      <button type="button" className="ai-accordion-hd" onClick={() => setOpen(o => !o)}>
        <span className="ai-accordion-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5z" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="ai-accordion-label">Nutritional Specifications</span>
        <span className="ai-accordion-chevron">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="ai-accordion-body">
          {rows.map(r => (
            <div key={r.label} className="ai-nutr-row">
              <span className="ai-nutr-label">{r.label}</span>
              <span className="ai-nutr-val">
                {r.value != null ? `${r.value} ${r.unit}` : '—'}
              </span>
            </div>
          ))}
          <p className="ai-nutr-note">Per 100g serving</p>
        </div>
      )}
    </div>
  );
}

function DuplicateModal({ match, onRestock, onAddNew, onClose }) {
  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal">
        <div className="ai-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 19h20L12 2z" stroke="#D97706" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M12 9v5M12 15.5v.5" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="ai-modal-title">Similar Item Found</h3>
        <p className="ai-modal-desc">
          <strong>{match.item.displayName}</strong> is already in your fridge
          ({Math.round(match.similarity * 100)}% match).
          Add to existing stock or create a new entry?
        </p>
        <div className="ai-modal-actions">
          <button className="ai-modal-btn-primary" onClick={onRestock}>
            Add to "{match.item.displayName}"
          </button>
          <button className="ai-modal-btn-secondary" onClick={onAddNew}>
            Create New Entry
          </button>
          <button className="ai-modal-btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* main page - add item */
export default function AddItemPage() {
  useRequireAuth();
  const router = useRouter();

  /* tab */
  const [tab, setTab] = useState('barcode'); // 'barcode' | 'manual'

  /* barcode scanner camera */
  const videoRef    = useRef(null);
  const readerRef   = useRef(null);
  const streamRef   = useRef(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [scanError,    setScanError]    = useState('');
  const [scanning,     setScanning]     = useState(false);
  const [scannedCode,  setScannedCode]  = useState('');
  const [fetchingBarcode, setFetchingBarcode] = useState(false);

  /* form */
  const [form, setForm] = useState({
    displayName: '',
    category:    'produce',
    quantity:    1,
    unit:        'pcs',
    expireDate:  '',
  });
  const [errors,    setErrors]    = useState({});
  const [nutrition, setNutrition] = useState(null);
  const [barcodeId, setBarcodeId] = useState('');

  /* duplicate */
  const [dupMatch,    setDupMatch]    = useState(null);
  const [skipDupCheck, setSkipDupCheck] = useState(false);

  /* submit */
  const [loading,      setLoading]      = useState(false);
  const [serverError,  setServerError]  = useState('');

  /* scanner camera setup */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch (_) {}
      readerRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setScanError('');
    setScanning(true);
    setScannerReady(false);
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        advanced: [
          { focusMode: 'continuous' },
          { focusDistance: 0 },
        ]
      },
    });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScannerReady(true);

      reader.decodeFromVideoElement(videoRef.current, (result) => {
        if (result) {
          const code = result.getText();
          setScannedCode(code);
          stopCamera();
          setScanning(false);
          fetchBarcodeData(code);
        }
      });
    } catch (err) {
      setScanError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions.'
          : 'Could not start camera. Try manual input instead.'
      );
      setScanning(false);
    }
  }, [stopCamera]);

  /* start camera ketika tab barcode dipilih, stop jika pindah tab */
  useEffect(() => {
    if (tab === 'barcode') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [tab]);

  /* barcode fetching */
  async function fetchBarcodeData(code) {
    setFetchingBarcode(true);
    try {
      const res  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();
      
      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};
        
      const nutrition = {
        calories: n['energy-kcal_100g'] != null ? parseFloat(n['energy-kcal_100g'].toFixed(2)) : null,
        protein:  n['proteins_100g']    != null ? parseFloat(n['proteins_100g'].toFixed(2))    : null,
        fat:      n['fat_100g']         != null ? parseFloat(n['fat_100g'].toFixed(2))         : null,
        carbs:    n['carbohydrates_100g'] != null ? parseFloat(n['carbohydrates_100g'].toFixed(2)) : null,
        fiber:    n['fiber_100g']       != null ? parseFloat(n['fiber_100g'].toFixed(2))       : null,
      };

        setForm(prev => ({
          ...prev,
          displayName: p.product_name || p.product_name_en || '',
        }));
        setNutrition(nutrition);
        setBarcodeId(code);
      }
    } catch (_) {
      /* failed fetch, user isi manual */
    } finally {
      setFetchingBarcode(false);
      setTab('manual');
    }
  }

  /* form handling */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.displayName.trim()) e.displayName = 'Product name is required.';
    if (!form.quantity || form.quantity < 1) e.quantity = 'Quantity must be at least 1.';
    if (!form.expireDate) e.expireDate = 'Expiration date is required.';
    else if (new Date(form.expireDate) < new Date()) e.expireDate = 'Date must be in the future.';
    return e;
  }

  /* duplicate check sebelum submit: cari item di fridge dengan nama mirip, return data jika match > threshold */
  async function checkDuplicate() {
    try {
      const res  = await fetch(`${API}/fridge/check-duplicate`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({ name: form.displayName }),
      });
      const data = await res.json();
      if (data.match && data.item) return data;
      return null;
    } catch (_) {
      return null;
    }
  }

  /* restock item yang sudah ada, tanpa duplicate check lagi */
  async function restockExisting(itemId) {
    setLoading(true);
    setServerError('');
    try {
      await submitToAPI();
    } finally {
      setLoading(false);
    }
  }

  /* submit baru atau restock */
  async function submitToAPI() {
    const body = {
      displayName: form.displayName.trim(),
      category:    form.category,
      quantity:    Number(form.quantity),
      unit:        form.unit,
      expireDate:  form.expireDate,
      ...(barcodeId  && { barcodeId }),
      ...(nutrition && { description: {
        calories: nutrition.calories,
        protein:  nutrition.protein,
        fat:      nutrition.fat,
        carbs:    nutrition.carbs,
        fiber:    nutrition.fiber,
      }}),
    };
    const res  = await fetch(`${API}/fridge`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to save item.');
    router.push('/inventory');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    /* duplicate check */
    if (!skipDupCheck) {
      const dup = await checkDuplicate();
      if (dup) { setDupMatch(dup); return; }
    }

    setLoading(true);
    try {
      await submitToAPI();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* render */
  return (
    <>
      <style>{`
        .ai-root {
          min-height: 100vh;
          background: #F5F2EF;
          font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
          display: flex;
          justify-content: center;
        }
        .ai-main {
          width: 100%;
          max-width: 760px;
          padding: 48px 56px;
        }
        .ai-page-title {
          font-family: var(--font-dm-serif), 'DM Serif Display', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          letter-spacing: -.03em;
          color: #1C1B1B;
          margin: 0 0 4px;
        }
        .ai-page-sub {
          font-size: 13px;
          color: #707973;
          margin: 0 0 36px;
          letter-spacing: .01em;
        }

        .ai-card {
          background: #fff;
          border: 1px solid #E3E0DC;
          padding: 36px;
        }

        .ai-tabs {
          display: flex;
          border-bottom: 1px solid #E3E0DC;
          margin-bottom: 32px;
        }
        .ai-tab {
          padding: 12px 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #9CA3A0;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: color .15s, border-color .15s;
          margin-bottom: -1px;
        }
        .ai-tab.active {
          color: #0F5238;
          border-bottom-color: #0F5238;
        }
        .ai-tab:hover:not(.active) { color: #404943; }

        /* barcode scanner */
        .ai-scanner-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: #111;
          overflow: hidden;
          margin-bottom: 28px;
        }
        .ai-scanner-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ai-scanner-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .ai-scanner-frame {
          width: 200px;
          height: 120px;
          border: 2px solid rgba(168,231,197,.8);
          position: relative;
          box-shadow: 0 0 0 2000px rgba(0,0,0,.45);
        }
        .ai-scanner-frame::before,
        .ai-scanner-frame::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #A8E7C5;
          border-style: solid;
        }
        .ai-scanner-frame::before {
          top: -2px; left: -2px;
          border-width: 3px 0 0 3px;
        }
        .ai-scanner-frame::after {
          bottom: -2px; right: -2px;
          border-width: 0 3px 3px 0;
        }
        .ai-scanner-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #A8E7C5, transparent);
          animation: ai-scan-line 2s ease-in-out infinite;
        }
        @keyframes ai-scan-line {
          0%   { top: 0;   opacity: 1; }
          50%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .ai-scanner-hint {
          margin-top: 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: rgba(255,255,255,.8);
        }
        .ai-scanner-placeholder {
          width: 100%;
          aspect-ratio: 4/3;
          background: #1A1A1A;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .ai-scanner-placeholder svg { opacity: .4; }
        .ai-scanner-placeholder p {
          font-size: 12px;
          color: rgba(255,255,255,.4);
          letter-spacing: .05em;
          margin: 0;
        }
        .ai-scan-error {
          padding: 12px 16px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          font-size: 13px;
          color: #B91C1C;
          margin-bottom: 20px;
        }
        .ai-scan-success {
          padding: 12px 16px;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          font-size: 13px;
          color: #166534;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ai-retry-btn {
          margin-top: 12px;
          padding: 10px 20px;
          background: #0F5238;
          color: #fff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 11px;
          font-weight: 700;
          display: inline-block;
          letter-spacing: .1em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background .15s;
        }
        .ai-retry-btn:hover { background: #0A3D29; }

        .ai-barcode-fetching {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: #F7FAF8;
          border: 1px solid #D1E8DA;
          font-size: 13px;
          color: #0F5238;
          margin-bottom: 24px;
        }

        /* form */
        .ai-section-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #0F5238;
          margin: 0 0 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #E3E0DC;
        }

        /* form fields */
        .ai-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        .ai-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #707973;
        }
        .ai-input, .ai-select {
          height: 48px;
          padding: 0 14px;
          border: 1px solid #D4D0CB;
          background: #FAFAF9;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 14px;
          color: #1C1B1B;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
          width: 100%;
          appearance: none;
        }
        .ai-input:focus, .ai-select:focus {
          border-color: #0F5238;
          box-shadow: 0 0 0 3px rgba(15,82,56,.08);
          background: #fff;
        }
        .ai-input.err, .ai-select.err { border-color: #C0392B; }
        .ai-input::placeholder { color: #BFC9C1; }
        .ai-err-msg { font-size: 11px; color: #C0392B; }

        .ai-row { display: flex; gap: 12px; }
        .ai-row > .ai-field { flex: 1; }

        /* quantity + unit */
        .ai-qty-wrap { display: flex; }
        .ai-qty-input {
          flex: 1;
          height: 48px;
          padding: 0 14px;
          border: 1px solid #D4D0CB;
          border-right: none;
          background: #FAFAF9;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 14px;
          color: #1C1B1B;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }
        .ai-qty-input:focus {
          border-color: #0F5238;
          box-shadow: 0 0 0 3px rgba(15,82,56,.08);
          background: #fff;
          z-index: 1;
        }
        .ai-qty-input.err { border-color: #C0392B; }
        .ai-unit-select {
          width: 80px;
          height: 48px;
          padding: 0 10px;
          border: 1px solid #D4D0CB;
          background: #F0EDE9;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #404943;
          outline: none;
          cursor: pointer;
          appearance: none;
          text-align: center;
          transition: border-color .15s;
        }
        .ai-unit-select:focus { border-color: #0F5238; }

        /* select arrow */
        .ai-select-wrap { position: relative; }
        .ai-select-wrap::after {
          content: '';
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid #707973;
          pointer-events: none;
        }

        /* accordion */
        .ai-accordion {
          border: 1px solid #E3E0DC;
          margin-top: 4px;
          margin-bottom: 28px;
        }
        .ai-accordion-hd {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: #F7F5F2;
          border: none;
          cursor: pointer;
          font-family: var(--font-dm-sans), sans-serif;
          text-align: left;
        }
        .ai-accordion-icon { color: #0F5238; flex-shrink: 0; }
        .ai-accordion-label {
          flex: 1;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #404943;
        }
        .ai-accordion-chevron {
          color: #9CA3A0;
          transition: transform .2s;
        }
        .ai-accordion.open .ai-accordion-chevron { transform: rotate(180deg); }
        .ai-accordion-body {
          padding: 16px;
          border-top: 1px solid #E3E0DC;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 24px;
        }
        .ai-nutr-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #F0EDE9;
        }
        .ai-nutr-label { font-size: 11px; color: #707973; text-transform: uppercase; letter-spacing: .05em; }
        .ai-nutr-val   { font-size: 13px; font-weight: 600; color: #1C1B1B; }
        .ai-nutr-note  {
          grid-column: 1 / -1;
          font-size: 10px;
          color: #9CA3A0;
          letter-spacing: .04em;
          margin: 4px 0 0;
        }

        /* server error */
        .ai-server-err {
          padding: 12px 16px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          font-size: 13px;
          color: #B91C1C;
          margin-bottom: 20px;
        }

        /* submit button */
        .ai-submit {
          width: 100%;
          height: 56px;
          background: #0F5238;
          color: #fff;
          border: none;
          cursor: pointer;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background .15s, transform .1s;
        }
        .ai-submit:hover:not(:disabled) { background: #0A3D29; }
        .ai-submit:active:not(:disabled) { transform: translateY(1px); }
        .ai-submit:disabled { opacity: .55; cursor: not-allowed; }

        .ai-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: ai-spin .7s linear infinite;
        }
        @keyframes ai-spin { to { transform: rotate(360deg); } }

        /* duplicate modal */
        .ai-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 24px;
        }
        .ai-modal {
          background: #fff;
          padding: 36px;
          max-width: 420px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .ai-modal-icon {
          width: 52px; height: 52px;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-modal-title {
          font-family: var(--font-dm-serif), serif;
          font-size: 20px;
          font-weight: 400;
          color: #1C1B1B;
          margin: 0;
        }
        .ai-modal-desc {
          font-size: 14px;
          color: #404943;
          line-height: 1.6;
          margin: 0;
        }
        .ai-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          margin-top: 8px;
        }
        .ai-modal-btn-primary {
          width: 100%; height: 48px;
          background: #0F5238; color: #fff;
          border: none; cursor: pointer;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          transition: background .15s;
        }
        .ai-modal-btn-primary:hover { background: #0A3D29; }
        .ai-modal-btn-secondary {
          width: 100%; height: 48px;
          background: #fff; color: #0F5238;
          border: 1px solid #0F5238; cursor: pointer;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          transition: background .15s;
        }
        .ai-modal-btn-secondary:hover { background: #F0FDF4; }
        .ai-modal-btn-ghost {
          width: 100%; height: 40px;
          background: none; color: #9CA3A0;
          border: none; cursor: pointer;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: .05em;
          transition: color .15s;
        }
        .ai-modal-btn-ghost:hover { color: #404943; }

        /* responsive */
        @media (max-width: 860px) {
          .ai-main { margin-left: 0; padding: 24px 20px; }
        }
      `}</style>

      <div className="ai-root">
        {/* <Sidebar /> */}

        <main className="ai-main" style={{ marginLeft: 0 }}>
          <h1 className="ai-page-title">Add New Item</h1>
          <p className="ai-page-sub">Capture barcode or enter item details manually!</p>

          <div className="ai-card">
            {/* tabs */}
            <div className="ai-tabs">
              <button
                className={`ai-tab${tab === 'barcode' ? ' active' : ''}`}
                onClick={() => setTab('barcode')}
              >
                Barcode Scan
              </button>
              <button
                className={`ai-tab${tab === 'manual' ? ' active' : ''}`}
                onClick={() => setTab('manual')}
              >
                Manual Input
              </button>
            </div>

            {/* barcode tab */}
            {tab === 'barcode' && (
              <>
                {scanError ? (
                  <div>
                    <div className="ai-scan-error">{scanError}</div>
                    <button className="ai-retry-btn" onClick={startCamera}>Retry Camera</button>
                  </div>
                ) : scanning ? (
                  <div className="ai-scanner-wrap">
                    <video ref={videoRef} className="ai-scanner-video" muted playsInline />
                    {scannerReady && (
                      <div className="ai-scanner-overlay">
                        <div className="ai-scanner-frame">
                          <div className="ai-scanner-line" />
                        </div>
                        <p className="ai-scanner-hint">Align barcode within frame</p>
                      </div>
                    )}
                  </div>
                ) : scannedCode ? (
                  <div>
                    <div className="ai-scan-success">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="#166534" strokeWidth="1.4"/>
                        <path d="M5 8l2 2 4-4" stroke="#166534" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Barcode scanned: {scannedCode}
                    </div>
                    {fetchingBarcode && (
                      <div className="ai-barcode-fetching">
                        <div className="ai-spinner" style={{ borderTopColor: '#0F5238', borderColor: 'rgba(15,82,56,.2)' }} />
                        Fetching product data…
                      </div>
                    )}
                    <button className="ai-retry-btn" onClick={() => { setScannedCode(''); setTab('barcode'); startCamera(); }}>
                      Scan Again
                    </button>
                  </div>
) : (
                  <div className="ai-scanner-placeholder">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <rect x="4" y="4" width="12" height="12" rx="2" stroke="white" strokeWidth="2"/>
                      <rect x="32" y="4" width="12" height="12" rx="2" stroke="white" strokeWidth="2"/>
                      <rect x="4" y="32" width="12" height="12" rx="2" stroke="white" strokeWidth="2"/>
                      <path d="M24 8h4M32 16v4M24 24h8v8M16 24v8h8M8 24v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p>Initializing camera…</p>
                  </div>
                )}

                {/* upload image barcode */}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#333' }} />
                  <span style={{ fontSize: '11px', color: '#666', letterSpacing: '.08em', textTransform: 'uppercase' }}>or upload image</span>
                  <div style={{ flex: 1, height: '1px', background: '#333' }} />
                </div>
                <label className="ai-retry-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginTop: '12px' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v8M4 4l3-3 3 3M1 10v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload Barcode Image
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const { BrowserMultiFormatReader } = await import('@zxing/browser');
                      const reader = new BrowserMultiFormatReader();
                      const img = new Image();
                      img.src = URL.createObjectURL(file);
                      img.onload = async () => {
                        try {
                          const result = await reader.decodeFromImageElement(img);
                          const code = result.getText();
                          setScannedCode(code);
                          stopCamera();
                          setScanning(false);
                          fetchBarcodeData(code);
                        } catch {
                          setScanError('Could not decode barcode from image. Try a clearer photo.');
                        }
                      };
                    }}
                  />
                </label>
              </>
            )}

            {/* manual form*/}
            {tab === 'manual' && (
              <form onSubmit={handleSubmit} noValidate>
                {serverError && <div className="ai-server-err">{serverError}</div>}

                {/* product name */}
                <div className="ai-field">
                  <label className="ai-label" htmlFor="ai-name">Product Title</label>
                  <input
                    id="ai-name"
                    name="displayName"
                    className={`ai-input${errors.displayName ? ' err' : ''}`}
                    placeholder="e.g. Indomilk Cokelat 1L"
                    value={form.displayName}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  {errors.displayName && <span className="ai-err-msg">{errors.displayName}</span>}
                </div>

                {/* category + quantity */}
                <div className="ai-row">
                  <div className="ai-field">
                    <label className="ai-label" htmlFor="ai-category">Category</label>
                    <div className="ai-select-wrap">
                      <select
                        id="ai-category"
                        name="category"
                        className="ai-select"
                        value={form.category}
                        onChange={handleChange}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="ai-field">
                    <label className="ai-label">Quantity</label>
                    <div className="ai-qty-wrap">
                      <input
                        name="quantity"
                        type="number"
                        min="1"
                        className={`ai-qty-input${errors.quantity ? ' err' : ''}`}
                        value={form.quantity}
                        onChange={handleChange}
                      />
                      <select
                        name="unit"
                        className="ai-unit-select"
                        value={form.unit}
                        onChange={handleChange}
                      >
                        {UNITS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    {errors.quantity && <span className="ai-err-msg">{errors.quantity}</span>}
                  </div>
                </div>

                {/* expiry date */}
                <div className="ai-field">
                  <label className="ai-label" htmlFor="ai-expire">Expiration Date</label>
                  <input
                    id="ai-expire"
                    name="expireDate"
                    type="date"
                    className={`ai-input${errors.expireDate ? ' err' : ''}`}
                    value={form.expireDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.expireDate && <span className="ai-err-msg">{errors.expireDate}</span>}
                </div>

                {/* nutrition, show kalau barcode berhasil di-scan */}
                <NutritionAccordion nutrition={nutrition} />

                <button type="submit" className="ai-submit" disabled={loading}>
                  {loading && <span className="ai-spinner" />}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h12M10 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Confirm and Store
                </button>
              </form>
            )}
          </div>
        </main>
      </div>

      {/* duplicate modal */}
      {dupMatch && (
        <DuplicateModal
          match={dupMatch}
          onRestock={() => {
            setDupMatch(null);
            restockExisting(dupMatch.item._id);
          }}
          onAddNew={() => {
            setDupMatch(null);
            setSkipDupCheck(true);
            /* re-trigger submit */
            document.querySelector('form').requestSubmit();
          }}
          onClose={() => setDupMatch(null)}
        />
      )}
    </>
  );
}
