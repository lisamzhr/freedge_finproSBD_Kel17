'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import './dashboard.css';

const API = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

export default function DashboardPage() {
  useRequireAuth();
  const [stats, setStats] = useState({ total: 0, expiringSoon: 0, expired: 0 });
  const [mustUse, setMustUse] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };

      const [allRes, mustRes] = await Promise.all([
        fetch(`${API}/fridge?status=active`, { headers }),
        fetch(`${API}/fridge/must-use`, { headers }),
      ]);

      const allData = await allRes.json();
      const mustData = await mustRes.json();

      const allItems = allData.data?.items || [];
      const mustItems = mustData.data?.items || [];

      const expired = allItems.filter(i => i.status === 'expired').length;

      setStats({
        total: allData.data?.total || 0,
        expiringSoon: mustItems.length,
        expired,
      });

      setMustUse(mustItems.slice(0, 3));
      setRecent(allItems.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (item) => {
    const exp = item.batches?.[0]?.expireDate || item.expireDate;
    if (!exp) return null;
    const days = Math.ceil((new Date(exp) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getBadge = (days) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days left`;
  };

  return (
    <div className="dash">
      {/* TOP BAR */}
      <header className="dash__topbar">
        <h2 className="dash__topbar-title">
          {user.name ? `Good morning, ${user.name.split(' ')[0]}` : 'Dashboard'}
        </h2>
        <div className="dash__topbar-right">
          <Link href="/add" style={{
            padding: '10px 20px', background: '#0F5238', color: '#fff',
            fontSize: '12px', fontWeight: 700, letterSpacing: '1px',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            + Add Item
          </Link>
        </div>
      </header>

      <main className="dash__main">
        {/* STATS */}
        <div className="dash__stats">
          {[
            { label: 'TOTAL ITEMS', value: loading ? '-' : stats.total, color: '#0F5238', href: '/inventory' },
            { label: 'EXPIRING SOON', value: loading ? '-' : stats.expiringSoon, color: '#BA1A1A', href: '/must-use-soon' },
            { label: 'EXPIRED', value: loading ? '-' : stats.expired, color: '#BA1A1A', href: '/inventory' },
            { label: 'ADD NEW ITEM', value: '+', color: '#0F5238', href: '/add' },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
              <div className="dash__stat-card" style={{ cursor: 'pointer' }}>
                <span className="dash__stat-label">{stat.label}</span>
                <span className="dash__stat-value" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* MUST USE SOON */}
        <section className="dash__section">
          <div className="dash__section-header">
            <h3 className="dash__section-title">Must Use Soon</h3>
            <Link href="/must-use-soon" className="dash__view-all">VIEW ALL →</Link>
          </div>

          {loading ? (
            <p style={{ color: '#707973', fontSize: '14px' }}>Loading...</p>
          ) : mustUse.length === 0 ? (
            <div style={{ padding: '32px', background: '#fff', border: '1px solid #BFC9C1', textAlign: 'center' }}>
              <p style={{ color: '#707973', fontSize: '14px' }}>No items expiring soon!</p>
            </div>
          ) : (
            <div className="dash__cards">
              {mustUse.map((item) => {
      const days = getDaysLeft(item);
      return (
        <div key={item._id} className="dash__item-card">
          <div className="dash__item-body" style={{ padding: '28px', gap: '12px', display: 'flex', flexDirection: 'column' }}>

            <div style={{ 
              fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', 
              textTransform: 'uppercase', color: days <= 1 ? '#BA1A1A' : '#D97706' 
            }}>
              {getBadge(days)}
            </div>
          
            <div className="dash__item-top">
              <span className="dash__item-name">{item.displayName}</span>
            </div>
          
            <p style={{ fontSize: '13px', color: '#707973', lineHeight: '1.6', margin: 0 }}>
              {item.totalQuantity} {item.unit} remaining - use before it goes to waste.
            </p>
          
            <div style={{ 
              fontSize: '11px', color: '#0F5238', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {item.category}
            </div>
          
            <Link href="/must-use-soon" className="dash__item-btn" style={{ 
              textAlign: 'center', display: 'block', textDecoration: 'none', padding: '10px 0', marginTop: '4px'
            }}>
              View Details
            </Link>
          </div>
        </div>
      );
    })}
            </div>
          )}
        </section>

        {/* RECENT INVENTORY */}
        <section className="dash__section">
          <div className="dash__section-header">
            <h3 className="dash__section-title">Recent Inventory</h3>
            <Link href="/inventory" className="dash__view-all">VIEW ALL →</Link>
          </div>

          <div className="dash__table-wrap">
            <table className="dash__table">
              <thead>
                <tr>
                  <th>ITEM NAME</th>
                  <th>CATEGORY</th>
                  <th>QUANTITY</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#707973' }}>Loading...</td></tr>
                ) : recent.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#707973' }}>No items yet. <Link href="/add" style={{ color: '#0F5238' }}>Add your first item →</Link></td></tr>
                ) : recent.map((item) => {
                  const days = getDaysLeft(item);
                  return (
                    <tr key={item._id}>
                      <td className="dash__td-name">{item.displayName}</td>
                      <td><span className="dash__category-badge">{item.category}</span></td>
                      <td style={{ fontSize: '16px', color: '#1C1B1B' }}>{item.totalQuantity} {item.unit}</td>
                      <td>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                          color: days !== null && days <= 3 ? '#BA1A1A' : '#0F5238',
                        }}>
                          {days !== null ? getBadge(days) : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* CALLOUT */}
        <div className="dash__callout" style={{ position: 'relative', overflow: 'hidden', minHeight: '220px' }}>
          <img 
            src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=1200&q=80"
            alt=""
            style={{ 
              position: 'absolute', inset: 0, width: '100%', height: '100%', 
              objectFit: 'cover', opacity: 0.15, pointerEvents: 'none'
            }}
          />
          <div className="dash__callout-text" style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ 
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px', 
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: 0 
            }}>
              Smart Kitchen
            </p>
            <h4 className="dash__callout-heading">
              Every ingredient has a story. Make sure it ends on the plate.
            </h4>
            <p className="dash__callout-body" style={{ fontSize: '15px' }}>
              Track what you have, use what matters, waste nothing.
            </p>
          </div>
          <Link href="/add" className="dash__callout-btn" style={{ position: 'relative', zIndex: 1 }}>
            Add Item
          </Link>
        </div>

      </main>
    </div>
  );
}