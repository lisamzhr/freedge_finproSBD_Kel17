"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Sidebar.css";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="4" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 4V3a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M1 8h16" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Must Use Soon",
    href: "/alerts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({ name: "", plan: "PREMIUM" });
  const pathname = usePathname();
  const closeTimer = useRef(null);

  // Baca user dari storage
  useEffect(() => {
    const stored =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser({ name: u.name || "", plan: u.plan || "PREMIUM" });
      } catch {}
    }
  }, []);

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleTriggerEnter = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const handleSidebarLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  }, []);

  const handleSidebarEnter = useCallback(() => {
    clearTimeout(closeTimer.current);
  }, []);

  return (
    <>
      <div className="sidebar__trigger" onPointerEnter={handleTriggerEnter} />

      <div
        className={`sidebar__overlay ${open ? "sidebar__overlay--visible" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`sidebar ${open ? "sidebar--open" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        {/* ── TOP ── */}
        <div className="sidebar__top">
          <div className="sidebar__logo-wrap">
            <span className="sidebar__logo-name">Freedge</span>
            <span className="sidebar__logo-sub">SMART KITCHEN</span>
          </div>

          <nav className="sidebar__nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__link ${pathname === item.href ? "sidebar__link--active" : ""}`}
              >
                {item.icon}
                <span>{item.label.toUpperCase()}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* ── BOTTOM ── */}
        <div className="sidebar__bottom">
          <Link href="/inventory/add" className="sidebar__add-btn">
            + ADD ITEM
          </Link>

          {/* Klik user → ke /profile */}
          <Link href="/profile" className="sidebar__user">
            <div className="sidebar__avatar">{initials}</div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">
                {user.name ? user.name.toUpperCase() : "USER"}
              </span>
              <span className="sidebar__user-badge">{user.plan}</span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}