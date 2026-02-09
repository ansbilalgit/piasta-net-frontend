"use client";

import React, { useState } from 'react';

const GameFilters = () => {
  const [activeTab, setActiveTab] = useState('All Games');
  const [activeSort, setActiveSort] = useState('A-Z'); 

  const categories = [
    { name: 'All Games', icon: null },
    { name: 'Board Games', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M12 8h.01"/><path d="M8 12h.01"/><path d="M16 12h.01"/><path d="M12 16h.01"/></svg>
    )},
    { name: 'Console Games', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="15.5" cy="10.5" r=".5"/><circle cx="17.5" cy="12.5" r=".5"/></svg>
    )},
  ];

  return (
    <div className="w-80  p-6 bg-[#0a0f18] text-white rounded-xl font-sans min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Filters</h2>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input
          type="text"
          placeholder="Search games..."
          className="w-full bg-[#161b26] border border-gray-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveTab(cat.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              activeTab === cat.name
                ? 'bg-[#0095e8] border-[#0095e8] text-white'
                : 'bg-[#111827] border-gray-800 hover:bg-gray-800'
            }`}
          >
            {cat.icon}
            <span className="font-semibold">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveSort('A-Z')}
          className={`flex items-center gap-2 px-4 py-2 bg-[#1c222d] border rounded-lg transition-colors ${
            activeSort === 'A-Z' ? 'border-white' : 'border-transparent hover:bg-gray-700'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg>
          <span className="font-bold text-sm uppercase">A-Z</span>
        </button>
        <button 
          onClick={() => setActiveSort('Z-A')}
          className={`flex items-center gap-2 px-4 py-2 bg-[#1c222d] border rounded-lg transition-colors ${
            activeSort === 'Z-A' ? 'border-white' : 'border-transparent hover:bg-gray-700'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h10"/><path d="M11 16h7"/><path d="M11 20h4"/></svg>
          <span className="font-bold text-sm uppercase">Z-A</span>
        </button>
      </div>
    </div>
  );
};

export default GameFilters;