"use client";

import { useEffect, useState } from "react";
import GameFilters from "../components/GameFilters";
import GameItemsList from "../components/GameItemsList";
import { fetchItems } from "@/lib/itemsService";

import { fetchItemsCount, fetchMaxLength } from "@/lib/itemsService";
import { GameTypeFilter } from "@/lib/types";
import styles from "./page.module.css";


export default function GamesPage() {
  const [itemCategories, setItemCategories] = useState<string[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  // Fetch categories from all items on mount
  useEffect(() => {
    let mounted = true;
    fetchItems()
      .then((data) => {
        if (!mounted) return;
        const counts: Record<string, number> = {};
        data.forEach((item) => {
          item.categories.forEach((cat) => {
            counts[cat] = (counts[cat] || 0) + 1;
          });
        });
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([cat]) => cat);
        setItemCategories(sorted);
      });
    return () => { mounted = false; };
  }, []);

  const [activeTab, setActiveTab] = useState<GameTypeFilter>("all");
  const [activeSort, setActiveSort] = useState<"A-Z" | "Z-A">("A-Z");
  const [searchTerm, setSearchTerm] = useState("");
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(240);
  const [maxDurationLimit, setMaxDurationLimit] = useState(240);
  const [countsByType, setCountsByType] = useState({
    all: 0,
    boardgame: 0,
    videogame: 0,
  });

  useEffect(() => {
    let mounted = true;

    fetchMaxLength()
      .then((maxLength) => {
        if (!mounted) {
          return;
        }

        if (typeof maxLength === "number" && !Number.isNaN(maxLength)) {
          setMaxDurationLimit(maxLength);
          setMaxDuration(maxLength);
        }
      })
      .catch((error) => {
        console.error(error);
        // Keep defaults if API max value is unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchItemsCount(),
      fetchItemsCount("boardgame"),
      fetchItemsCount("videogame"),
    ])
      .then(([all, boardgame, videogame]) => {
        if (!mounted) {
          return;
        }

        setCountsByType({ all, boardgame, videogame });
      })
      .catch((error) => {
        console.error(error);
        // Keep default counts on API failure.
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.gamesPage}>
      <div className="games-header">
        <div className="games-header-top">
          <span className="games-icon">🎮</span>
          <h1>Game Library</h1>
        </div>
        <p className="games-count">
          {countsByType.boardgame} Board Games and {countsByType.videogame} Console Games available
        </p>
      </div>

      <div className={styles.pageWrap}>
        <GameFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          minDuration={minDuration}
          maxDuration={maxDuration}
          maxDurationLimit={maxDurationLimit}
          setMinDuration={setMinDuration}
          setMaxDuration={setMaxDuration}
          itemCategories={itemCategories}
          onCategoryClick={(category) => {
            setActiveCategories((prev) =>
              prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
            );
          }}
          activeCategories={activeCategories}
        />
        <GameItemsList
          searchTerm={searchTerm}
          activeTab={activeTab}
          activeSort={activeSort}
          minDuration={minDuration}
          maxDuration={maxDuration}
          filterCategories={activeCategories}
        />
      </div>
    </div>
  );
}