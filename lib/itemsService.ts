import { Item, ItemsResponse } from './types';

/**
 * Fetches items from the API with optional filters
 * This abstraction allows easy migration from direct DB access to backend API
 */
export async function fetchItems(
  search?: string,
  type?: string,
  sort?: 'A-Z' | 'Z-A'
  , minTime?: number,
  maxTime?: number
): Promise<Item[]> {
  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (sort) params.append('sort', sort === 'Z-A' ? 'Z-A' : 'A-Z');
  if (typeof minTime === 'number') params.append('min_time', String(minTime));
  if (typeof maxTime === 'number') params.append('max_time', String(maxTime));

  const response = await fetch(`/api/items?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }

  const data: ItemsResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch items');
  }

  return data.items;
}

export async function fetchMaxLength(): Promise<number | null> {
  const response = await fetch(`/api/items?get_max_length=1`);

  if (!response.ok) {
    throw new Error('Failed to fetch max length');
  }

  const data: any = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch max length');
  }

  return typeof data.maxLength === 'number' ? data.maxLength : null;
}
