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
  const [minPlayers, setMinPlayers] = useState(1);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [maxPlayersLimit, setMaxPlayersLimit] = useState(10);
  // Fetch categories and player range from all items on mount
  useEffect(() => {
    let mounted = true;
    fetchItems()
      .then((data) => {
        if (!mounted) return;
        const counts: Record<string, number> = {};
        let minPlayersVal = Infinity;
        let maxPlayersVal = -Infinity;
        data.forEach((item) => {
          item.categories.forEach((cat: string) => {
            counts[cat] = (counts[cat] || 0) + 1;
          });
          // Assume default values if missing
          const itemMin = typeof item.minPlayers === "number" ? item.minPlayers : 1;
          const itemMax = typeof item.maxPlayers === "number" ? item.maxPlayers : 10;
          minPlayersVal = Math.min(minPlayersVal, itemMin);
          maxPlayersVal = Math.max(maxPlayersVal, itemMax);
        });
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([cat]) => cat);
        setItemCategories(sorted);
        // If no items, fallback to defaults
        setMinPlayers(minPlayersVal === Infinity ? 1 : minPlayersVal);
        setMaxPlayers(maxPlayersVal === -Infinity ? 10 : maxPlayersVal);
        setMaxPlayersLimit(maxPlayersVal === -Infinity ? 10 : maxPlayersVal);
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
          minPlayers={minPlayers}
          maxPlayers={maxPlayers}
          maxPlayersLimit={maxPlayersLimit}
          setMinPlayers={setMinPlayers}
          setMaxPlayers={setMaxPlayers}
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
          minPlayers={minPlayers}
          maxPlayers={maxPlayers}
          filterCategories={activeCategories}
        />
      </div>
    </div>
  );
}