"use client";

import { useState, useEffect } from "react";
import GameFilters from "@/components/gamefilter";
import GameItemsList from "@/components/GameItemsList";
import { fetchMaxLength } from '@/lib/itemsService';

export default function Home() {
  const [activeTab, setActiveTab] = useState('All Games');
  const [activeSort, setActiveSort] = useState<'A-Z' | 'Z-A'>('A-Z');
  const [searchTerm, setSearchTerm] = useState('');
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(240);

  // Initialize maxDuration from server (max length across items)
  useEffect(() => {
    let mounted = true;
    fetchMaxLength()
      .then((m) => {
        if (!mounted) return;
        if (typeof m === 'number' && !Number.isNaN(m)) {
          setMaxDuration(m);
        }
      })
      .catch(() => {
        // ignore, keep default
      });
    return () => { mounted = false };
  }, []);

  return (
    <div className="flex gap-0 bg-black min-h-screen">
      <GameFilters 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        minDuration={minDuration}
        maxDuration={maxDuration}
        setMinDuration={setMinDuration}
        setMaxDuration={setMaxDuration}
      />
      <GameItemsList 
        searchTerm={searchTerm}
        activeTab={activeTab}
        activeSort={activeSort}
        minDuration={minDuration}
        maxDuration={maxDuration}
      />
    </div>
  );
}

