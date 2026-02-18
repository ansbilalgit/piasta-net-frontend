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
  itemCategories: string[];
  onCategoryClick: (category: string | null) => void;
  // Accept null to clear filter
  activeCategory?: string | null;
};

export default function GameFilters({
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
  itemCategories,
  onCategoryClick,
  activeCategory,
}: GameFiltersProps) {
  const [draftRange, setDraftRange] = useState<[number, number]>([minDuration, maxDuration]);

  useEffect(() => {
    setDraftRange([minDuration, maxDuration]);
  }, [minDuration, maxDuration]);

  const maxSliderValue = maxDurationLimit;

  return (
    <aside className={styles.filters}>
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
            value={draftRange}
            onChange={(values) => {
              const [low, high] = values;
              const clampedLow = Math.min(Math.max(low, 0), high);
              const clampedHigh = Math.max(Math.min(high, maxSliderValue), clampedLow);
              setDraftRange([clampedLow, clampedHigh]);
            }}
            onFinalChange={(values) => {
              const [low, high] = values;
              const clampedLow = Math.min(Math.max(low, 0), high);
              const clampedHigh = Math.max(Math.min(high, maxSliderValue), clampedLow);
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
      </section>

      {itemCategories && itemCategories.length > 0 && (
        <div className={styles.categoryButtonsExtra} style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {itemCategories.map((category: string) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                className={`${styles.categoryButton} ${isActive ? styles.active : ''}`}
                onClick={() => onCategoryClick(isActive ? null : category)}
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
