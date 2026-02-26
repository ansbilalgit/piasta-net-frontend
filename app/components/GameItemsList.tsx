"use client";

import { useEffect, useState } from "react";
import { fetchItems } from "@/lib/itemsService";
import { GameTypeFilter, ITEM_TYPE, Item } from "@/lib/types";
import styles from "./GameItemsList.module.css";
import { GameCard } from "./Card";

type GameItemsListProps = {
  searchTerm: string;
  activeTab: GameTypeFilter;
  activeSort: "A-Z" | "Z-A";
  minDuration: number;
  maxDuration: number;
  minPlayers: number;
  maxPlayers: number;
  filterCategories?: string[];
};
export default function GameItemsList({
  searchTerm,
  activeTab,
  activeSort,
  minDuration,
  maxDuration,
  minPlayers,
  maxPlayers,
  filterCategories = [],
}: GameItemsListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedFilters, setDebouncedFilters] = useState({
    searchTerm,
    activeTab,
    activeSort,
    minDuration,
    maxDuration,
    minPlayers,
    maxPlayers,
    filterCategories,
  });
  // Local state for category counts and sorted categories (not used in UI, but required for logic)
  const [itemCategoryCounts, setItemCategoryCounts] = useState<Record<string, number>>({});
  const [sortedItemCategories, setSortedItemCategories] = useState<string[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters({
        searchTerm,
        activeTab,
        activeSort,
        minDuration,
        maxDuration,
        minPlayers,
        maxPlayers,
        filterCategories,
      });
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchTerm, activeTab, activeSort, minDuration, maxDuration, minPlayers, maxPlayers, filterCategories]);

  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const data : Item[] = await fetchItems(
          debouncedFilters.searchTerm || undefined,
          debouncedFilters.activeTab === "all" ? undefined : debouncedFilters.activeTab,
          debouncedFilters.activeSort,
          debouncedFilters.minDuration,
          debouncedFilters.maxDuration
        );

        // Count item.categories usage (not type)
        const itemCategoryCountsTemp: Record<string, number> = {};
        data.forEach((item) => {
          item.categories.forEach((category) => {
            itemCategoryCountsTemp[category] = (itemCategoryCountsTemp[category] || 0) + 1;
          });
        });
        // Sort item.categories by usage
        const sortedItemCategoriesTemp = Object.entries(itemCategoryCountsTemp)
          .sort((a, b) => b[1] - a[1])
          .map(([category]) => category);

        if (mounted) {
          setItemCategoryCounts(itemCategoryCountsTemp);
          setSortedItemCategories(sortedItemCategoriesTemp);
        }

        const normalizedSearch = debouncedFilters.searchTerm.trim().toLowerCase();
        const byName = normalizedSearch
          ? data.filter((item) => item.name.toLowerCase().includes(normalizedSearch))
          : data;

        // Filter by categories if set (all selected must be present)
        const byCategory = debouncedFilters.filterCategories && debouncedFilters.filterCategories.length > 0
          ? byName.filter((item) => debouncedFilters.filterCategories!.every((cat) => item.categories.includes(cat)))
          : byName;

        // Filter by player range (default MinPlayers=1, MaxPlayers=10)
        const byPlayers = byCategory.filter((item) => {
          const minPlayers = typeof item.minPlayers === "number" ? item.minPlayers : 1;
          const maxPlayers = typeof item.maxPlayers === "number" ? item.maxPlayers : 10;
          return (
            minPlayers <= (debouncedFilters.maxPlayers ?? 10) &&
            maxPlayers >= (debouncedFilters.minPlayers ?? 1)
          );
        });

        const byDuration = byPlayers.filter((item) => {
          const length = Number(item.length);
          if (Number.isNaN(length)) {
            return false;
          }
          return length >= debouncedFilters.minDuration && length <= debouncedFilters.maxDuration;
        });

        const sorted = [...byDuration].sort((left, right) => {
          const compare = left.name.localeCompare(right.name, undefined, {
            sensitivity: "base",
          });

          return debouncedFilters.activeSort === "Z-A" ? -compare : compare;
        });

        if (mounted) {
          setItems(sorted);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch items");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      mounted = false;
    };
  }, [debouncedFilters]);

  // Returns a label based on the item's type (type-based category)
  const getTypeCategoryLabel = (item: Item): string => {
    if (item.type === ITEM_TYPE.BOARDGAME) {
      return "Board Games";
    }

    if (item.type === ITEM_TYPE.VIDEOGAME) {
      return "Console Games";
    }

    return "Other";
  };

  // These are based on item.categories (not type)
  // Now lifted to parent (GamesPage) for filter UI

  return (
    <section className={styles.itemsContainer}>
      <div className={styles.itemsHeader}>
        <h2>
          Items <span className={styles.itemCount}>({items.length})</span>
        </h2>
      </div>



      {error && <div className={styles.errorMessage}>{error}</div>}
      {loading && items.length === 0 && <div className={styles.loadingMessage}>Loading items...</div>}
      {!loading && items.length === 0 && !error && <div className={styles.emptyMessage}>No items found</div>}

      {items.length > 0 && (
        <div className={styles.itemsGrid}>
          {items.map((item) => (
            <GameCard
              key={item.id}
              title={item.name}
              category={getTypeCategoryLabel(item)}
              description={item.description}
              players={`${item.minPlayers}–${item.maxPlayers}`}
              thumbnail={item.thumbnail ?? ""}
              duration={`${item.length} min`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
