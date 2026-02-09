"use client";

import React, { useState } from 'react';
import './gamefilter.css';

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
    <div className="game-filters">
      <h2>Filters</h2>

      {/* Search Input */}
      <div className="search-wrapper">
        <div>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input
          type="text"
          placeholder="Search games..."
          className="search-input"
        />
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveTab(cat.name)}
            className={`category-button ${activeTab === cat.name ? 'active' : ''}`}
          >
            {cat.icon}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort Buttons */}
      <div className="sort-buttons">
        <button 
          onClick={() => setActiveSort('A-Z')}
          className={`sort-button ${activeSort === 'A-Z' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg>
          <span>A-Z</span>
        </button>
        <button 
          onClick={() => setActiveSort('Z-A')}
          className={`sort-button ${activeSort === 'Z-A' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h10"/><path d="M11 16h7"/><path d="M11 20h4"/></svg>
          <span>Z-A</span>
        </button>
      </div>
    </div>
  );
};

export default GameFilters;