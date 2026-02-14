export interface Item {
  id: number;
  name: string;
  length: number;
  description: string;
  thumbnail: string | null;
  type: number;
  copies: number;
  categories: string[];
}

export interface ItemsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  items: Item[];
}

export type GameTypeFilter = "all" | "boardgame" | "videogame";
