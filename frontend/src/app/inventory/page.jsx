"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Loader2, 
  ChevronDown, 
  Calendar
} from 'lucide-react';
import Link from 'next/link';


const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder] = useState("Newest");

  // connect ke profile yang logged-in
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setUserData(result.data);
      }
    } catch (err) {
      console.error("Fail to load profile:", err);
    }
  };

  // connect ke inventory di database
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/fridge', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('End of session. Please login.');
        throw new Error('Fail to retrieve data');
      }

      const rawData = await response.json();
      
      const dataArray = rawData.data && Array.isArray(rawData.data.items) 
        ? rawData.data.items 
        : [];
      
      setItems(dataArray);
    } catch (err) {
      setError(err.message);
      setItems([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchUserProfile();
  }, []);

  // filter display items
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items
      .filter(item => {
        const itemName = (item.displayName || item.name || item.productId?.name || "").toLowerCase();
        const matchesSearch = itemName.includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category?.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === "Newest") return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
        if (sortOrder === "Oldest") return new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0);
        if (sortOrder === "A-Z") return (a.displayName || a.name || "").localeCompare(b.displayName || b.name || "");
        return 0;
      });
  }, [items, searchQuery, selectedCategory, sortOrder]);

  // searching date
  const resolveExpiryDate = (item) => {
    if (!item) return null;
    if (item.expireDate) return item.expireDate;
    if (item.expiryDate) return item.expiryDate;

    if (item.batches && Array.isArray(item.batches) && item.batches.length > 0) {
      return item.batches[0].expireDate || item.batches[0].expiryDate;
    }

    if (item.productId?.expireDate || item.productId?.expiryDate) {
      return item.productId.expireDate || item.productId.expiryDate;
    }

    return null;
  };

  // display date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // status expired
  const getExpiryStatus = (dateString) => {
    if (!dateString) return { label: "No Date", color: "text-gray-300" };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { label: "No Date", color: "text-gray-300" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diff = targetDate - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { label: "Expired", color: "text-red-500" };
    if (days === 0) return { label: "Today", color: "text-red-600 font-bold" };
    if (days <= 3) return { label: `${days} Days Left`, color: "text-orange-500" };
    return { label: `${days} Days Left`, color: "text-emerald-600" };
  };

  // kategori untuk produk
  const categories = ["All", "Produce", "Protein", "Dairy", "Frozen", "Beverage", "Others"];
  
  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans text-gray-900">
      <header className="h-20 border-b bg-white flex items-center justify-between px-10 sticky top-0 z-50">
        {/* header */}
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-black tracking-tighter text-[#1B4332]">FREEDGE</h1>
          <nav className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          </nav>
        </div>
        
        {/* search bar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Item" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F2F2F2] border-none rounded-none py-2 pl-10 pr-4 text-[11px] w-64 focus:ring-1 focus:ring-emerald-500 font-medium transition-all outline-none"
            />
          </div>
        </div>
      </header>

      {/* deskripsi dan add item box */}
      <main className="p-10 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-[#1B4332] tracking-tighter uppercase leading-none">Inventory</h2>
            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase text-[10px]">Available products in your kitchen.</p>
          </div>
          <Link href="/add">
            <button className="bg-[#1B4332] text-white px-8 py-4 rounded-none font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#2D6A4F] transition-all shadow-md">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </Link>
        </div>

        {/* filter kategori produk */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 py-4 border-y border-gray-100">
          <div className="flex gap-4">
            <div className="relative group">
              <button className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-none min-w-[160px] justify-between">
                <span className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  {selectedCategory}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-300" />
              </button>
              <div className="absolute left-0 top-[calc(100%+1px)] hidden group-hover:block bg-white border border-gray-200 shadow-xl rounded-none py-1 z-30 min-w-full">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-gray-50 text-gray-600">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* grid produk */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-emerald-800">
            <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-20" />
            <p className="font-bold uppercase text-[10px] tracking-[0.3em]">Loading...</p>
          </div>
        ) : error ? (
          <div className="py-32 text-center">
            <div className="bg-red-50 text-red-500 inline-block px-6 py-3 rounded-none font-bold text-[10px] uppercase tracking-widest">
              Error: {error}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const expiryDate = resolveExpiryDate(item);
              const status = getExpiryStatus(expiryDate);
              
              {/* formating display grid */}
              return (
                <div key={item._id} className="bg-white border border-gray-100 rounded-none overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col">

                  {/* data produk */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h3 className="font-black text-[#1B4332] text-lg leading-tight uppercase tracking-tight">
                          {item.displayName || item.name || (item.productId && item.productId.name)}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
                      </div>
                    </div>

                    {/* status & date */}
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-none">
                           <Calendar className={`w-3.5 h-3.5 ${status.color}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.1em] mb-0.5">Expiration</span>
                          <span className={`text-[11px] font-black uppercase leading-none ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-[9px] text-gray-500 font-medium mt-1">
                            {formatDate(expiryDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryPage;