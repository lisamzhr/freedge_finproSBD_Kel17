"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  ArrowUpDown, 
  Loader2, 
  ChevronDown
} from 'lucide-react';

const MustUseSoon = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("Soonest");

  useEffect(() => {
    const fetchUrgentItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/fridge?status=urgent');
        if (!response.ok) throw new Error('Fail to fetch inventory data');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUrgentItems();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortOrder === "Soonest") {
        return new Date(a.expiryDate || 0) - new Date(b.expiryDate || 0);
      } else if (sortOrder === "Latest") {
        return new Date(b.expiryDate || 0) - new Date(a.expiryDate || 0);
      }
      return 0;
    });

    return result;
  }, [items, searchQuery, sortOrder]);

  const markAsUsed = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/fridge/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setItems(items.filter(item => (item._id || item.id) !== id));
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <header className="h-20 border-b flex items-center justify-between px-10 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black tracking-tighter text-[#1B4332]">FREEDGE</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="SEARCH PRODUCT" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F2F2F2] border-none rounded py-2.5 pl-10 pr-4 text-[11px] w-64 focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
          <button className="text-gray-400 hover:text-[#1B4332] relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="text-gray-400 hover:text-[#1B4332]"><User className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
            <div className="space-y-2">
              <h1 className="text-[48px] font-black text-[#1B4332] leading-none uppercase tracking-tighter">Must Use Soon</h1>
              <p className="text-gray-500 text-sm max-w-lg font-medium leading-relaxed">
                Reviewing items with high expiration risk.
              </p>
            </div>

            {!loading && (
              <div className="bg-[#B91C1C] text-white px-6 py-4 rounded-sm flex items-center gap-4 shadow-xl self-start min-w-[200px]">
                <div className="flex items-center justify-center bg-white/20 w-8 h-8 rounded-full font-bold text-lg">!</div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm uppercase tracking-widest leading-none mb-1">
                    {items.length} Items expiring soon
                  </span>
                  <span className="text-[9px] font-medium opacity-80 uppercase tracking-wider">Must Use Immediately</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-between items-center mb-10 pb-6 border-b">
            <div className="flex gap-4">
              <div className="relative group">
                <button className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 text-[11px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" /> 
                  Sort: {sortOrder === "Soonest" ? "Soonest" : "Latest"}
                  <ChevronDown className="w-3 h-3 text-gray-300" />
                </button>
                <div className="absolute top-full left-0 w-full h-2 bg-transparent"></div>
                <div className="absolute hidden group-hover:block top-[calc(100%+2px)] left-0 mt-0 bg-white border border-gray-100 shadow-xl z-30 min-w-[180px] py-1">
                  {["Soonest", "Latest"].map(order => (
                    <button 
                      key={order} 
                      onClick={() => setSortOrder(order)} 
                      className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase transition-colors ${sortOrder === order ? 'text-emerald-700 bg-emerald-50' : 'hover:bg-gray-50'}`}
                    >
                      Expiring {order === "Soonest" ? "Soon" : "Later"}
                    </button>
                  ))}
                </div>
              </div>
            </div>            
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-emerald-800">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold uppercase text-[10px] tracking-[0.2em]">Analysing...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedItems.map((item) => (
              <div key={item._id || item.id} className="bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="h-64 bg-gray-50 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gray-100 transition-opacity group-hover:opacity-0"></div>
                  <div className="text-7xl group-hover:scale-110 transition-transform duration-500 z-10 filter drop-shadow-md grayscale group-hover:grayscale-0">
                    {item.icon || '🥚'}
                  </div>
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-[#B91C1C] border border-[#B91C1C]/20 shadow-sm">
                      Urgent
                    </div>
                    <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                      item.status?.toLowerCase() === 'expired' ? 'bg-black text-white border-black' : 
                      item.status?.toLowerCase() === 'empty' ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {item.status || 'Active'}
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-black text-[#1B4332] text-xl leading-none uppercase tracking-tighter group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                        {item.quantity || item.stock} {item.unit || 'pcs'} | {item.category}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm rounded-sm bg-[#B91C1C] text-white">
                      {item.expiryStatus || 'HARI INI'}
                    </span>
                  </div>

                  <button 
                    onClick={() => markAsUsed(item._id || item.id)}
                    className="w-full py-4 bg-[#1B4332] text-white text-[11px] font-bold rounded flex items-center justify-center gap-3 hover:bg-[#2D6A4F] transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95"
                  >
                    Mark As Used
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MustUseSoon;