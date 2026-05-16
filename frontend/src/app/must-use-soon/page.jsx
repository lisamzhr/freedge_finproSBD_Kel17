"use client";

import { useRequireAuth } from '@/hooks/useAuth';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Loader2, 
  ChevronDown, 
  Filter, 
  Flame, 
  User as UserIcon, 
} from 'lucide-react';

const MustUseSoonPage = () => {
  useRequireAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  
  const [mounted, setMounted] = useState(false);

  // connect ke user yang logged-in
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fridge` {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setUserData(result.data);
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    }
  };

  // connect ke database inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Gagal mengambil data inventory');
      const rawData = await response.json();
      
      setItems(rawData.data?.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setMounted(true);
    fetchInventory(); 
    fetchUserProfile();
  }, []);

  // searching date
  const resolveExpiryDate = (item) => {
    if (!item) return null;
    
    // kalau ada batches, ambil yang paling dekat expired (earliest)
    if (item.batches && Array.isArray(item.batches) && item.batches.length > 0) {
      const sorted = [...item.batches]
        .filter(b => b.expireDate)
        .sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate));
      if (sorted.length > 0) return sorted[0].expireDate;
    }
  
    if (item.expireDate) return item.expireDate;
    return item.productId?.expireDate || null;
  };

  // helper function, 
  const resolveQuantityInfo = (item) => {
    // quantity
    const quantity = 
      item.quantity ?? 
      (item.batches?.[0]?.quantity) ?? 
      0;

    // jumlah unit produk
    const unit = 
      item.unit || 
      item.productId?.unit || 
      item.batches?.[0]?.unit || 
      'UNIT';

    return { quantity, unit };
  };

  // proses kalkulasi expiry date dsb
  const processedData = useMemo(() => {
    if (!mounted) return { filteredItems: [], urgentCount: 0 };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const mapped = items
      .map(item => {
        const expiryDateStr = resolveExpiryDate(item);
        if (!expiryDateStr) return null;
        const expDate = new Date(expiryDateStr);
        const targetDate = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
        if (isNaN(targetDate.getTime())) return null;
        const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
        return { ...item, diffDays, expiryDate: expiryDateStr };
      })
      .filter(item => item !== null && item.diffDays <= 7) 
      .sort((a, b) => a.diffDays - b.diffDays);

    const filteredItems = mapped.filter(item => {
      const nameMatch = (item.displayName || item.name || item.productId?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedFilter === "ALL") return nameMatch;
      if (selectedFilter === "EXPIRED") return nameMatch && item.diffDays < 0;
      if (selectedFilter === "URGENT") return nameMatch && item.diffDays >= 0 && item.diffDays <= 3;
      if (selectedFilter === "LATER") return nameMatch && item.diffDays > 3;
      return nameMatch;
    });

    return { filteredItems, urgentCount: mapped.filter(i => i.diffDays <= 3).length };
  }, [items, selectedFilter, searchQuery, mounted]);

  const { filteredItems, urgentCount } = processedData;

  // format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans text-gray-900">
      {/* efek di kotak merah */}
      <style>{`
        @keyframes custom-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .animate-urgent {
          animation: custom-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* header */}
      <header className="h-20 border-b bg-white flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-black tracking-tighter text-[#1B4332]">FREEDGE</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Item" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F2F2F2] border-none rounded-none py-2 pl-10 pr-4 text-[11px] w-64 focus:ring-1 focus:ring-[#1B4332] font-medium transition-all outline-none"
            />
          </div>
        </div>
      </header>

      <main className="p-10 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="text-6xl font-black text-[#1B4332] tracking-tighter uppercase leading-none">Must Use Soon</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Reviewing items with high expiration risk.</p>
          </div>
          
          {urgentCount > 0 && (
            <div className="bg-red-600 text-white px-8 py-4 flex items-center gap-4 shadow-xl animate-urgent">
              <Flame className="w-5 h-5 fill-current" />
              <span className="text-[11px] font-black uppercase tracking-widest">{urgentCount} Expiring Soon</span>
            </div>
          )}
        </div>

        {/* filter kategori produk */}
        <div className="flex items-center justify-between gap-6 mb-8 py-4 border-y border-gray-100">
          <div className="flex gap-4">
            <div className="relative group">
              <button className="flex items-center gap-3 px-6 py-2 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-none shadow-sm min-w-[140px] justify-between">
                <span className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  {selectedFilter}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-300" />
              </button>
              <div className="absolute left-0 top-[calc(100%+1px)] hidden group-hover:block bg-white border border-gray-200 shadow-xl py-1 z-30 min-w-full">
                {["ALL", "EXPIRED", "URGENT", "LATER"].map(f => (
                  <button key={f} onClick={() => setSelectedFilter(f)} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-gray-50 text-gray-600">
                    {f === "LATER" ? "4-7 DAYS" : f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            {filteredItems.length} EXPIRING PRODUCTS
          </div>
        </div>

        {/* grid produk */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-emerald-800">
            <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-20" />
            <p className="font-bold uppercase text-[10px] tracking-[0.3em]">Checking Freshness...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const date = resolveExpiryDate(item);
              const isExpired = item.diffDays < 0;
              const isUrgent = item.diffDays >= 0 && item.diffDays <= 3;
              
              // sisa stok, dari helper function
              const { quantity, unit } = resolveQuantityInfo(item);
              
              const accentColor = isExpired ? 'bg-red-500' : isUrgent ? 'bg-[#D68A3E]' : 'bg-[#5B9A78]';
              const textColor = isExpired ? 'text-red-600' : isUrgent ? 'text-[#D68A3E]' : 'text-[#5B9A78]';

              return (
                <div key={item._id} className="bg-white border border-gray-200 flex items-center relative group hover:shadow-md transition-shadow">
                  {/* warna di samping */}
                  <div className={`w-1.5 self-stretch ${accentColor} ${isUrgent || isExpired ? 'animate-pulse' : ''}`} />

                  {/* gap kiri */}
                  <div className="w-10 h-24 flex-shrink-0 flex items-center justify-center">
                  </div>

                  {/* data produk */}
                  <div className="flex-1 py-4">
                    <h3 className="text-lg font-black text-[#1B4332] uppercase tracking-tight">
                      {item.displayName || item.name || item.productId?.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {item.category || item.productId?.category || 'General'}
                      </span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full" />
                      <span className="text-[10px] font-black text-[#1B4332] uppercase tracking-widest flex items-center gap-1">
                        REMAINING: <span className="text-emerald-700">{quantity} {unit}</span>
                      </span>
                    </div>
                  </div>

                  {/* status & date */}
                  <div className="flex items-center gap-12 pr-6">
                    <div className="text-right flex flex-col items-end">
                      <p className={`text-[11px] font-black uppercase tracking-tighter ${textColor} ${isUrgent || isExpired ? 'animate-pulse' : ''}`}>
                        {isExpired ? 'EXPIRED' : 
                         item.diffDays === 0 ? 'EXPIRING TODAY' : `${item.diffDays} DAYS LEFT`}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{formatDate(date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="py-40 text-center border-2 border-dashed border-gray-100">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Inventory safe & fresh</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MustUseSoonPage;