export interface Item {
  id: number;
  name: string;
  length: number;
  description: string;
  thumbnail: string | null;
  type: number;
  copies: number;
  categories: string[];
  minPlayers: number;
  maxPlayers: number;
}

export interface ItemsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  items: Item[];
}

export type GameTypeFilter = "all" | "boardgame" | "videogame";

export const ITEM_TYPE = {
  VIDEOGAME: 0,
  BOARDGAME: 1,
} as const;

export type GameFilterCategory = {
  name: string;
  type: GameTypeFilter;
};

export const GAME_FILTER_CATEGORIES: GameFilterCategory[] = [
  { name: "All Games", type: "all" },
  { name: "Board Games", type: "boardgame" },
  { name: "Console Games", type: "videogame" },
];
