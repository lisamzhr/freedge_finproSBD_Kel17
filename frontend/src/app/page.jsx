"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./homepage.css";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="page-wrapper">
      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">
          <Link href="/" className="navbar__brand">
            <span className="navbar__logo-mark" />
            <span className="navbar__brand-name">FreshTrack</span>
          </Link>

          <div className="navbar__links">
            <a href="#features" className="navbar__link">Features</a>
            <a href="#efficiency" className="navbar__link">How It Works</a>
          </div>

          <div className="navbar__actions">
            <Link href="/login" className="btn btn--ghost">Log in</Link>
            <Link href="/register" className="btn btn--solid">Get Started</Link>
          </div>

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {menuOpen && (
          <div className="navbar__mobile-menu">
            <a href="#features" className="navbar__link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#efficiency" className="navbar__link" onClick={() => setMenuOpen(false)}>How It Works</a>
            <Link href="/login" className="btn btn--ghost" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link href="/register" className="btn btn--solid" onClick={() => setMenuOpen(false)}>Get Started</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__content">
          <div className="hero__left">
            <p className="hero__eyebrow">Culinary Precision</p>
            <h1 className="hero__title">Your Fridge,<br />Perfectly<br />Organised.</h1>
            <p className="hero__subtitle">
              A smart inventory system that tracks every ingredient,
              alerts you before things expire, and suggests recipes
              based on what you already have.
            </p>
            <div className="hero__cta">
              <Link href="/register" className="btn btn--solid btn--lg">Get Started</Link>
              <Link href="/login" className="btn btn--outline btn--lg">Log In</Link>
            </div>
          </div>

          <div className="hero__right">
            <div className="hero__img-overlay" />
            <Image
              src="/homepage.png"
              alt="Premium organised refrigerator interior"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className="hero__img"
              priority
            />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="features">
        <div className="features__container">
          <div className="features__header">
            <div className="features__heading-wrap">
              <h2 className="features__heading">Features</h2>
            </div>
            <p className="features__subheading">Everything you need to master your kitchen</p>
          </div>

          <div className="features__grid">
            {/* Card 1 */}
            <div className="feature-card">
              <div className="feature-card__img-wrap">
                <Image src="/smartInventoryInterface.png" alt="Smart Inventory Interface" fill sizes="(max-width: 900px) 100vw, 33vw" className="feature-card__img" />
              </div>
              <div className="feature-card__body">
                <div className="feature-card__title-row">
                  <svg className="feature-card__svg-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="7" height="7" rx="1" stroke="#0F5238" strokeWidth="1.5"/>
                    <rect x="11.5" y="1.5" width="7" height="7" rx="1" stroke="#0F5238" strokeWidth="1.5"/>
                    <rect x="1.5" y="11.5" width="7" height="7" rx="1" stroke="#0F5238" strokeWidth="1.5"/>
                    <rect x="11.5" y="11.5" width="7" height="7" rx="1" stroke="#0F5238" strokeWidth="1.5"/>
                  </svg>
                  <h3 className="feature-card__title">Smart Inventory</h3>
                </div>
                <p className="feature-card__desc">
                  Maintain a live, visual record of every ingredient. Categorize with
                  architectural clarity and track quantity with a single tap.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="feature-card">
              <div className="feature-card__img-wrap">
                <Image src="/expiryAlerts.png" alt="Expiry Alerts" fill sizes="(max-width: 900px) 100vw, 33vw" loading="eager" className="feature-card__img" />
              </div>
              <div className="feature-card__body">
                <div className="feature-card__title-row">
                  <svg className="feature-card__svg-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2L10 12" stroke="#0F5238" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="10" cy="16.5" r="1.2" fill="#0F5238"/>
                  </svg>
                  <h3 className="feature-card__title">Expiry Alerts</h3>
                </div>
                <p className="feature-card__desc">
                  Intelligent notifications prioritize items nearing their peak. Reduce waste
                  through proactive planning and time-sensitive reminders.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="feature-card">
              <div className="feature-card__img-wrap">
                <Image src="/barcodeScanner.png" alt="Barcode Scanner" fill sizes="(max-width: 900px) 100vw, 33vw" className="feature-card__img" />
              </div>
              <div className="feature-card__body">
                <div className="feature-card__title-row">
                  <svg className="feature-card__svg-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 6V3.5A2 2 0 0 1 3.5 1.5H6" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M18.5 6V3.5A2 2 0 0 0 16.5 1.5H14" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M1.5 14V16.5A2 2 0 0 0 3.5 18.5H6" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M18.5 14V16.5A2 2 0 0 1 16.5 18.5H14" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="4" y1="6.5" x2="4" y2="13.5" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="7" y1="6.5" x2="7" y2="13.5" stroke="#0F5238" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="10" y1="6.5" x2="10" y2="13.5" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="13" y1="6.5" x2="13" y2="13.5" stroke="#0F5238" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="16" y1="6.5" x2="16" y2="13.5" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <h3 className="feature-card__title">Barcode Scanner</h3>
                </div>
                <p className="feature-card__desc">
                  Seamlessly add groceries with our high-precision scanner. Instantly sync
                  nutritional data and storage best practices to your fridge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENTO / EFFICIENCY ──────────────────────────────── */}
      <section id="efficiency" className="bento">
        <div className="bento__container">
          <div className="bento__main">
            <p className="bento__eyebrow">Efficiency First</p>
            <h2 className="bento__heading">Master Your<br />Kitchen Flow.</h2>
            <p className="bento__body">
              FreshTrack combines smart tracking, predictive alerts, and AI-powered
              suggestions so your kitchen always runs at its best with zero waste.
            </p>
            <Link href="/register" className="btn btn--outline-white btn--lg">
              Start For Free
            </Link>
          </div>

          <div className="bento__tiles">
            <div className="bento__tile bento__tile--wide">
              <div className="bento__tile-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4C16 4 6 10 6 18C6 23.52 10.48 28 16 28C21.52 28 26 23.52 26 18C26 10 16 4 16 4Z" stroke="#0F5238" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M16 28V16" stroke="#0F5238" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M16 20C16 20 11 16 9 12" stroke="#0F5238" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h4 className="bento__tile-title">Waste Reduction</h4>
                <p className="bento__tile-desc">
                  Users report up to 40% reduction in food waste within the first month.
                </p>
              </div>
            </div>

            <div className="bento__tile">
              <svg className="bento__tile-svg" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 3L5 16H14L12.5 25L23 12H14L15.5 3Z" stroke="#0F5238" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
              <h4 className="bento__tile-title bento__tile-title--green">Instant Sync</h4>
              <p className="bento__tile-desc">Real-time across all household devices.</p>
            </div>

            <div className="bento__tile">
              <svg className="bento__tile-svg" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3V10C9 12.21 10.79 14 13 14V25" stroke="#0F5238" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 3V8" stroke="#0F5238" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 3V8" stroke="#0F5238" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M19 3C19 3 22 6 22 11C22 13.21 20.21 14 18 14V25" stroke="#0F5238" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h4 className="bento__tile-title bento__tile-title--green">Recipe AI</h4>
              <p className="bento__tile-desc">Suggestions based on your current inventory.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────── */}
      <section className="cta-final">
        <h2 className="cta-final__heading">Ready to get started?</h2>
        <p className="cta-final__sub">
          Join thousands of households already reducing food waste with FreshTrack.
        </p>
        <Link href="/register" className="btn btn--solid btn--lg">
          Create Free Account
        </Link>
      </section>
    </div>
  );
}