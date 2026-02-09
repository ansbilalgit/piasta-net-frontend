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
  items: Item[];
  success: boolean;
  error?: string;
}
