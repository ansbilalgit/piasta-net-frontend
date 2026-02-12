export interface Item {
  id: number;
  name: string;
  length: number;
  description: string;
  thumbnail: string;
  type: string;
  copies: number;
  min_players?: number;
  max_players?: number;
}

export interface ItemsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  items: Item[];
}
