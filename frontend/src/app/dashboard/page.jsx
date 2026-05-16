"use client";

import { useState } from "react";
import Link from "next/link";
import "./dashboard.css";

// ── DUMMY DATA ──────────────────────────────────────────────
const MUST_USE_SOON = [
  { id: 1, name: "Fresh Strawberries", weight: "400g", location: "Refrigerated", badge: "Expires today" },
  { id: 2, name: "Heritage Carrots",   weight: "1.2kg", location: "Pantry",       badge: "Expires tomorrow" },
  { id: 3, name: "Whole Milk",         weight: "1L",    location: "Refrigerated", badge: "Expires tomorrow" },
];

const INVENTORY = [
  { id: 1, name: "Sourdough Bread",   category: "Bakery",   qty: 1, location: "Pantry"      },
  { id: 2, name: "Greek Yogurt",      category: "Dairy",    qty: 3, location: "Refrigerated" },
  { id: 3, name: "Chicken Breast",    category: "Meat",     qty: 2, location: "Freezer"      },
  { id: 4, name: "Cherry Tomatoes",   category: "Produce",  qty: 6, location: "Refrigerated" },
];

const FILTERS = ["ALL", "REFRIGERATED", "FREEZER", "PANTRY"];

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [quantities, setQuantities] = useState(
    Object.fromEntries(INVENTORY.map((i) => [i.id, i.qty]))
  );

  const changeQty = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const filtered = INVENTORY.filter(
    (item) =>
      activeFilter === "ALL" ||
      item.location.toUpperCase() === activeFilter
  );

  return (
    <div className="dash">
      {/* ── TOP APP BAR ─────────────────────────────────── */}
      <header className="dash__topbar">
        <h2 className="dash__topbar-title">Dashboard</h2>
        <div className="dash__topbar-right">
          <div className="dash__search-wrap">
            <svg className="dash__search-icon" width="17" height="17" viewBox="0 0 17 17" fill="none">
              <circle cx="7.5" cy="7.5" r="6" stroke="#707973" strokeWidth="1.5"/>
              <path d="M12 12L15.5 15.5" stroke="#707973" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input className="dash__search" type="text" placeholder="Search inventory..." />
          </div>
          <button className="dash__icon-btn" aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M9 2a6 6 0 0 1 6 6v3l1.5 2.5H1.5L3 11V8a6 6 0 0 1 6-6Z" stroke="#5E5E5E" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M7 16a2 2 0 0 0 4 0" stroke="#5E5E5E" strokeWidth="1.5"/>
            </svg>
          </button>
          <button className="dash__icon-btn" aria-label="Settings">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
              <circle cx="9.5" cy="9.5" r="2.5" stroke="#5E5E5E" strokeWidth="1.5"/>
              <path d="M9.5 1v2M9.5 16v2M1.5 9.5h2M15.5 9.5h2M3.7 3.7l1.4 1.4M13.9 13.9l1.4 1.4M3.7 15.3l1.4-1.4M13.9 5.1l1.4-1.4" stroke="#5E5E5E" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── MAIN SECTION ─────────────────────────────────── */}
      <main className="dash__main">

        {/* ── STATS ── */}
        <div className="dash__stats">
          {[
            { label: "TOTAL ITEMS",     value: "42",  color: "#0F5238" },
            { label: "EXPIRING SOON",   value: "05",  color: "#BA1A1A" },
            { label: "FRIDGE CAPACITY", value: "68%", color: "#0F5238" },
            { label: "RECIPES READY",   value: "12",  color: "#0F5238" },
          ].map((stat) => (
            <div key={stat.label} className="dash__stat-card">
              <span className="dash__stat-label">{stat.label}</span>
              <span className="dash__stat-value" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ── MUST USE SOON ── */}
        <section className="dash__section">
          <div className="dash__section-header">
            <h3 className="dash__section-title">Must Use Soon</h3>
            <Link href="/alerts" className="dash__view-all">VIEW ALL</Link>
          </div>

          <div className="dash__cards">
            {MUST_USE_SOON.map((item) => (
              <div key={item.id} className="dash__item-card">
                {/* Placeholder gambar */}
                <div className="dash__item-img">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="4" fill="#E9EDE9"/>
                    <path d="M20 10C20 10 12 15 12 22C12 26.42 15.58 30 20 30C24.42 30 28 26.42 28 22C28 15 20 10 20 10Z" stroke="#0F5238" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M20 30V20" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="dash__item-body">
                  <div className="dash__item-top">
                    <span className="dash__item-name">{item.name}</span>
                    <span className="dash__item-badge">{item.badge}</span>
                  </div>
                  <span className="dash__item-meta">{item.weight} • {item.location}</span>
                  <button className="dash__item-btn">USE NOW</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RECENT INVENTORY ── */}
        <section className="dash__section">
          <div className="dash__section-header">
            <h3 className="dash__section-title">Recent Inventory</h3>
            <div className="dash__filters">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`dash__filter-btn ${activeFilter === f ? "dash__filter-btn--active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="dash__table-wrap">
            <table className="dash__table">
              <thead>
                <tr>
                  <th>ITEM NAME</th>
                  <th>CATEGORY</th>
                  <th>QUANTITY</th>
                  <th>LOCATION</th>
                  <th className="dash__table-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="dash__td-name">{item.name}</td>
                    <td>
                      <span className="dash__category-badge">{item.category}</span>
                    </td>
                    <td>
                      <div className="dash__qty">
                        <button className="dash__qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                        <span className="dash__qty-val">{quantities[item.id]}</span>
                        <button className="dash__qty-btn" onClick={() => changeQty(item.id, +1)}>+</button>
                      </div>
                    </td>
                    <td className="dash__td-location">{item.location}</td>
                    <td className="dash__table-right">
                      <button className="dash__action-btn" aria-label="More options">
                        <span /><span /><span />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── KITCHEN SYNC CALLOUT ── */}
        <div className="dash__callout">
          <div className="dash__callout-text">
            <h4 className="dash__callout-heading">Sync Your Kitchen Today</h4>
            <p className="dash__callout-body">
              Share your inventory with family members and keep everyone in sync —
              no more duplicate purchases or forgotten groceries.
            </p>
          </div>
          <Link href="/settings" className="dash__callout-btn">
            CONNECT HOUSEHOLD
          </Link>
        </div>

      </main>
    </div>
  );
}