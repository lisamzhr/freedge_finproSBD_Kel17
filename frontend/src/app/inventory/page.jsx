"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Loader2, 
  MoreVertical,
  ChevronDown
} from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("A-Z");

  const categories = ["All", "Produce", "Protein", "Dairy", "Frozen", "Beverage", "Other"];

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/fridge'); 
        if (!response.ok) throw new Error('Fail to fetch inventory data');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || item.category?.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    if (sortOrder === "A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "Z-A") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [items, searchQuery, categoryFilter, sortOrder]);

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
              placeholder="SEARCH INVENTORY" 
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
              <h1 className="text-[48px] font-black text-[#1B4332] leading-none uppercase tracking-tighter">Inventory</h1>
              <p className="text-gray-500 text-sm max-w-lg font-medium leading-relaxed">
                Products available in your kitchen.
              </p>
            </div>
            
            <button className="bg-[#1B4332] text-white px-6 py-4 rounded-sm flex items-center gap-3 shadow-xl hover:bg-[#2D6A4F] transition-all font-bold text-xs uppercase tracking-widest active:scale-95">
              <Plus className="w-4 h-4" /> Add new item
            </button>
          </div>

          <div className="flex flex-wrap justify-between items-center mb-10 pb-6 border-b">
            <div className="flex gap-4">
              {/* Sort Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 text-[11px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" /> SORT: {sortOrder}
                  <ChevronDown className="w-3 h-3 text-gray-300" />
                </button>
                <div className="absolute top-full left-0 w-full h-2 bg-transparent"></div>
                <div className="absolute hidden group-hover:block top-[calc(100%+2px)] left-0 mt-0 bg-white border border-gray-100 shadow-xl z-30 min-w-[150px] py-1">
                  {["A-Z", "Z-A"].map(order => (
                    <button key={order} onClick={() => setSortOrder(order)} className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase hover:bg-gray-50">
                      {order}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Category Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 text-[11px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm">
                  <Filter className="w-3.5 h-3.5 text-gray-400" /> Category: {categoryFilter}
                  <ChevronDown className="w-3 h-3 text-gray-300" />
                </button>
                <div className="absolute top-full left-0 w-full h-2 bg-transparent"></div>
                <div className="absolute hidden group-hover:block top-[calc(100%+2px)] left-0 mt-0 bg-white border border-gray-100 shadow-xl z-30 min-w-[160px] py-1 max-h-64 overflow-y-auto">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase transition-colors ${categoryFilter === cat ? 'text-emerald-700 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <div key={item._id || item.id} className="bg-white border border-gray-100 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="h-44 bg-gray-50 relative flex items-center justify-center text-5xl grayscale group-hover:grayscale-0 transition-all duration-500">
                  {item.icon || '📦'}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className={`px-1.5 py-0.5 rounded-[2px] text-[7px] font-black uppercase border shadow-xs ${
                      item.status?.toLowerCase() === 'expired' ? 'bg-black text-white border-black' : 
                      item.status?.toLowerCase() === 'empty' ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {item.status || 'Active'}
                    </span>
                  </div>
                  <button className="absolute top-3 right-3 p-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-black text-[#1B4332] text-sm uppercase tracking-tight truncate group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                      {item.category || 'Other'}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Stock Available</span>
                      <span className="text-[11px] font-black uppercase text-[#1B4332]">
                        {item.quantity || item.stock} {item.unit || 'pcs'}
                      </span>
                    </div>
                    <button className="text-[10px] font-bold text-[#1B4332] uppercase hover:underline tracking-widest">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;