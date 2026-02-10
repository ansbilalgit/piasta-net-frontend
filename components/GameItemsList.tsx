"use client";

import React, { useState, useEffect } from 'react';
import { fetchItems } from '@/lib/itemsService';
import { Item } from '@/lib/types';
import './GameItemsList.css';

interface GameItemsListProps {
  searchTerm: string;
  activeTab: string;
  activeSort: 'A-Z' | 'Z-A';
  minDuration: number;
  maxDuration: number;
}

const GameItemsList = ({ searchTerm, activeTab, activeSort, minDuration, maxDuration }: GameItemsListProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch items when filters change
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchItems(
          searchTerm || undefined,
          activeTab !== 'All Games' ? activeTab : undefined,
          activeSort,
          minDuration,
          maxDuration
        );
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [searchTerm, activeTab, activeSort, minDuration, maxDuration]);

  return (
    <div className="items-container">
      <div className="items-header">
        <h2>Items <span className="item-count">({items.length})</span></h2>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-message">
          Loading items...
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="empty-message">
          No items found
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              {item.thumbnail && (
                <div className="item-thumbnail-wrapper">
                  <img src={item.thumbnail} alt={item.name} className="item-thumbnail" />
                </div>
              )}
              <div className="item-content">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-type">{item.type}</p>
                <p className="item-description">{item.description}</p>
                <div className="item-footer">
                  <span className="item-meta">Duration: {item.length} min</span>
                  { (item.min_players != null || item.max_players != null) && (
                    <span className="item-meta">
                      Players: {
                        (item.min_players != null && item.max_players != null)
                          ? (item.min_players === item.max_players ? `${item.min_players}` : `${item.min_players}-${item.max_players}`)
                          : (item.min_players != null ? `${item.min_players}` : `${item.max_players}`)
                      }
                    </span>
                  )}
                  <span className="item-meta">Copies: {item.copies}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameItemsList;
