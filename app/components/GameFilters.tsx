
"use client";

import { useEffect, useState } from "react";
import styles from "./GameFilters.module.css";
import RangeSlider from "./RangeSlider";
import { GAME_FILTER_CATEGORIES, GameTypeFilter } from "@/lib/types";

type GameFiltersProps = {
  activeTab: GameTypeFilter;
  setActiveTab: (tab: GameTypeFilter) => void;
  activeSort: "A-Z" | "Z-A";
  setActiveSort: (sort: "A-Z" | "Z-A") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  minDuration: number;
  maxDuration: number;
  maxDurationLimit: number;
  setMinDuration: (value: number) => void;
  setMaxDuration: (value: number) => void;
  minPlayers: number;
  maxPlayers: number;
  maxPlayersLimit: number;
  setMinPlayers: (value: number) => void;
  setMaxPlayers: (value: number) => void;
  itemCategories: string[];
  onCategoryClick: (category: string) => void;
  activeCategories: string[];
};
function GameFilters({
  activeTab,
  setActiveTab,
  activeSort,
  setActiveSort,
  searchTerm,
  setSearchTerm,
  minDuration,
  maxDuration,
  maxDurationLimit,
  setMinDuration,
  setMaxDuration,
  minPlayers,
  maxPlayers,
  maxPlayersLimit,
  setMinPlayers,
  setMaxPlayers,
  itemCategories,
  onCategoryClick,
  activeCategories,
}: GameFiltersProps)  {
  const [draftRange, setDraftRange] = useState<[number, number]>([minDuration, maxDuration]);
  // Category filter state: 'top10', 'all', 'none'
  const [categoryView, setCategoryView] = useState<'top10' | 'all' | 'none'>('top10');
  // Player range slider state
  const [draftPlayerRange, setDraftPlayerRange] = useState<[number, number]>([minPlayers, maxPlayers]);

  // Compute filtered categories based on toggle state
  let filteredCategories: string[] = [];
  if (categoryView === 'all') {
    filteredCategories = itemCategories;
  } else if (categoryView === 'top10') {
    filteredCategories = itemCategories.slice(0, 10);
  } // 'none' will show no categories

  useEffect(() => {
    setDraftRange([minDuration, maxDuration]);
  }, [minDuration, maxDuration]);

  useEffect(() => {
    setDraftPlayerRange([minPlayers, maxPlayers]);
  }, [minPlayers, maxPlayers]);

  const maxSliderValue = maxDurationLimit;
  const maxPlayersSliderValue = maxPlayersLimit;

  return (
    <aside className={styles.filters} style={{ overflowY: 'auto', maxHeight: '100vh' }}>
      <h2 className={styles.title}>Filters</h2>

      <div className={styles.searchWrap}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon} aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          aria-label="Search games"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.categoryTabs}>
        {GAME_FILTER_CATEGORIES.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => setActiveTab(category.type)}
            className={`${styles.categoryButton} ${activeTab === category.type ? styles.active : ""}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className={styles.sortButtons}>
        <button
          type="button"
          onClick={() => setActiveSort("A-Z")}
          className={`${styles.sortButton} ${activeSort === "A-Z" ? styles.active : ""}`}
        >
          A-Z
        </button>
        <button
          type="button"
          onClick={() => setActiveSort("Z-A")}
          className={`${styles.sortButton} ${activeSort === "Z-A" ? styles.active : ""}`}
        >
          Z-A
        </button>
      </div>

      <section className={styles.durationSection}>
        <h3 className={styles.durationTitle}>Duration (min)</h3>

        <div className={styles.rangeGroup}>
          <RangeSlider
            min={0}
            max={maxSliderValue}
            value={[Math.min(draftRange[0], draftRange[1]), Math.max(draftRange[0], draftRange[1])]}
            onChange={(values) => {
              const [low, high] = values;
              const sorted = [Math.min(low, high), Math.max(low, high)];
              const clampedLow = Math.min(Math.max(sorted[0], 0), sorted[1]);
              const clampedHigh = Math.max(Math.min(sorted[1], maxSliderValue), clampedLow);
              setDraftRange([clampedLow, clampedHigh]);
            }}
            onFinalChange={(values) => {
              const [low, high] = values;
              const sorted = [Math.min(low, high), Math.max(low, high)];
              const clampedLow = Math.min(Math.max(sorted[0], 0), sorted[1]);
              const clampedHigh = Math.max(Math.min(sorted[1], maxSliderValue), clampedLow);
              setMinDuration(clampedLow);
              setMaxDuration(clampedHigh);
            }}
          />
        </div>

        <div className={styles.numberInputs}>
          <input
            type="number"
            aria-label="Minimum duration"
            min={0}
            max={maxSliderValue}
            value={draftRange[0]}
            onChange={(event) => {
              const value = Number(event.target.value) || 0;
              const clampedValue = Math.min(Math.max(value, 0), maxSliderValue);
              const nextMin = Math.min(clampedValue, draftRange[1]);
              setDraftRange([nextMin, draftRange[1]]);
              setMinDuration(nextMin);
            }}
            className={styles.numberInput}
          />
          <input
            type="number"
            aria-label="Maximum duration"
            min={0}
            max={maxSliderValue}
            value={draftRange[1]}
            onChange={(event) => {
              const value = Number(event.target.value) || 0;
              const clampedValue = Math.min(Math.max(value, 0), maxSliderValue);
              const nextMax = Math.max(clampedValue, draftRange[0]);
              setDraftRange([draftRange[0], nextMax]);
              setMaxDuration(nextMax);
            }}
            className={styles.numberInput}
          />
        </div>

        {/* Player range slider section */}
        <div style={{ margin: '1rem 0' }}>
          <h3 className={styles.durationTitle}>Players</h3>
          <div className={styles.rangeGroup}>
            <RangeSlider
              min={1}
              max={maxPlayersSliderValue}
              value={[Math.min(draftPlayerRange[0], draftPlayerRange[1]), Math.max(draftPlayerRange[0], draftPlayerRange[1])]}
              onChange={(values) => {
                const [low, high] = values;
                const sorted = [Math.min(low, high), Math.max(low, high)];
                const clampedLow = Math.min(Math.max(sorted[0], 1), sorted[1]);
                const clampedHigh = Math.max(Math.min(sorted[1], maxPlayersSliderValue), clampedLow);
                setDraftPlayerRange([clampedLow, clampedHigh]);
              }}
              onFinalChange={(values) => {
                const [low, high] = values;
                const sorted = [Math.min(low, high), Math.max(low, high)];
                const clampedLow = Math.min(Math.max(sorted[0], 1), sorted[1]);
                const clampedHigh = Math.max(Math.min(sorted[1], maxPlayersSliderValue), clampedLow);
                setMinPlayers(clampedLow);
                setMaxPlayers(clampedHigh);
              }}
            />
          </div>
          <div className={styles.numberInputs}>
            <input
              type="number"
              aria-label="Minimum players"
              min={1}
              max={maxPlayersSliderValue}
              value={draftPlayerRange[0]}
              onChange={(event) => {
                const value = Number(event.target.value) || 1;
                const clampedValue = Math.min(Math.max(value, 1), maxPlayersSliderValue);
                const nextMin = Math.min(clampedValue, draftPlayerRange[1]);
                setDraftPlayerRange([nextMin, draftPlayerRange[1]]);
                setMinPlayers(nextMin);
              }}
              className={styles.numberInput}
            />
            <input
              type="number"
              aria-label="Maximum players"
              min={1}
              max={maxPlayersSliderValue}
              value={draftPlayerRange[1]}
              onChange={(event) => {
                const value = Number(event.target.value) || 1;
                const clampedValue = Math.min(Math.max(value, 1), maxPlayersSliderValue);
                const nextMax = Math.max(clampedValue, draftPlayerRange[0]);
                setDraftPlayerRange([draftPlayerRange[0], nextMax]);
                setMaxPlayers(nextMax);
              }}
              className={styles.numberInput}
            />
          </div>
        </div>

        {/* Category filter toggle button with label */}
        <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ fontWeight: 500 }}>Categories</span>
          <button
            type="button"
            className={styles.categoryButton}
            onClick={() => {
              setCategoryView((prev) =>
                prev === 'top10' ? 'all' : prev === 'all' ? 'none' : 'top10'
              );
            }}
          >
            {categoryView === 'top10' ? 'Top 10' : categoryView === 'all' ? 'All' : 'None'}
          </button>
        </div>
      </section>

      {filteredCategories && filteredCategories.length > 0 && (
        <div className={styles.categoryButtonsExtra} style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {filteredCategories.map((category: string) => {
            const isActive = activeCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                className={`${styles.categoryButton} ${isActive ? styles.active : ''}`}
                onClick={() => onCategoryClick(category)}
                aria-pressed={isActive}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
export default GameFilters;