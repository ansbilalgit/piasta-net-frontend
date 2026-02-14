"use client";

import { useEffect, useState } from "react";
import GameFilters from "../components/GameFilters";
import GameItemsList from "../components/GameItemsList";
import { fetchItemsCount, fetchMaxLength } from "@/lib/itemsService";
import { GameTypeFilter } from "@/lib/types";
import styles from "./page.module.css";

export default function GamesPage() {
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
      .catch(() => {
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
      .catch(() => {
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
        />
        <GameItemsList
          searchTerm={searchTerm}
          activeTab={activeTab}
          activeSort={activeSort}
          minDuration={minDuration}
          maxDuration={maxDuration}
        />
      </div>
    </div>
  );
}