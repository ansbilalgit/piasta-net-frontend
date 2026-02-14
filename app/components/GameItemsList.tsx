"use client";

import { useEffect, useState } from "react";
import { fetchItems } from "@/lib/itemsService";
import { Item } from "@/lib/types";
import styles from "./GameItemsList.module.css";
import Card from "./Card";

type GameItemsListProps = {
  searchTerm: string;
  activeTab: string;
  activeSort: "A-Z" | "Z-A";
  minDuration: number;
  maxDuration: number;
};

export default function GameItemsList({
  searchTerm,
  activeTab,
  activeSort,
  minDuration,
  maxDuration,
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
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters({
        searchTerm,
        activeTab,
        activeSort,
        minDuration,
        maxDuration,
      });
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchTerm, activeTab, activeSort, minDuration, maxDuration]);

  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchItems(
          debouncedFilters.searchTerm || undefined,
          debouncedFilters.activeTab !== "All Games" ? debouncedFilters.activeTab : undefined,
          debouncedFilters.activeSort,
          debouncedFilters.minDuration,
          debouncedFilters.maxDuration
        );

        const normalizedSearch = debouncedFilters.searchTerm.trim().toLowerCase();
        const byName = normalizedSearch
          ? data.filter((item) => item.name.toLowerCase().includes(normalizedSearch))
          : data;

        const byDuration = byName.filter((item) => {
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

  const getCategoryLabel = (item: Item): string => {
    if (item.type === 1) {
      return "Board Games";
    }

    if (item.type === 0) {
      return "Console Games";
    }

    return item.categories[0] ?? "Unknown";
  };

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
            <Card
              key={item.id}
              title={item.name}
              category={getCategoryLabel(item)}
              description={item.description}
              players={"N/A"}
              duration={`${item.length} min`}
              thumbnail={item.thumbnail ?? undefined}
              copies={item.copies}
            />
          ))}
        </div>
      )}
    </section>
  );
}
