import { Item, ItemsResponse } from "./types";

const ITEMS_API_BASE_URL = "/api/items";

export async function fetchItems(
  search?: string,
  type?: string,
  sort?: "A-Z" | "Z-A",
  minTime?: number,
  maxTime?: number
): Promise<Item[]> {
  const baseParams = new URLSearchParams();

  if (search) baseParams.append("search", search);
  if (type) baseParams.append("type", type);
  if (sort) baseParams.append("sort", sort === "Z-A" ? "Z-A" : "A-Z");
  if (typeof minTime === "number") baseParams.append("min_time", String(minTime));
  if (typeof maxTime === "number") baseParams.append("max_time", String(maxTime));

  let page = 1;
  let totalCount = Infinity;
  const allItems: Item[] = [];
  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  while (allItems.length < totalCount) {
    const params = new URLSearchParams(baseParams);
    params.append("page", String(page));

    const url = `${ITEMS_API_BASE_URL}?${params.toString()}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      const statusInfo = `${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
      throw new Error(`Failed to fetch items: ${statusInfo}`);
    }

    const data: ItemsResponse = await response.json();
    totalCount = data.totalCount;
    // Patch each item with minPlayers/maxPlayers
    const patchedItems = data.items.map((item) => {
      let minPlayers = item.minPlayers;
      let maxPlayers = item.maxPlayers;
      if (typeof minPlayers !== "number") {
        minPlayers = randomInt(1, 4);
      }
      if (typeof maxPlayers !== "number" || maxPlayers < minPlayers) {
        maxPlayers = randomInt(minPlayers, 12);
      }
      return {
        ...item,
        minPlayers,
        maxPlayers,
      };
    });
    allItems.push(...patchedItems);

    if (data.items.length === 0 || allItems.length >= totalCount) {
      break;
    }

    page += 1;
  }

  return allItems;
}

export async function fetchMaxLength(): Promise<number | null> {
  const response = await fetch(`${ITEMS_API_BASE_URL}?get_max_length=1`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch max length");
  }

  const data: unknown = await response.json();

  if (
    typeof data === "object" &&
    data !== null &&
    "maxLength" in data &&
    typeof (data as { maxLength: unknown }).maxLength === "number" &&
    Number.isFinite((data as { maxLength: number }).maxLength)
  ) {
    return (data as { maxLength: number }).maxLength;
  }

  const items = await fetchItems();
  const lengths = items
    .map((item) => Number(item.length))
    .filter((length) => Number.isFinite(length));

  if (lengths.length === 0) {
    return null;
  }

  return Math.max(...lengths);

}

export async function fetchItemsCount(type?: string): Promise<number> {
  const params = new URLSearchParams();
  if (type) {
    params.append("type", type);
  }

  const url = `${ITEMS_API_BASE_URL}?${params.toString()}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch items count");
  }

  const data: ItemsResponse = await response.json();
  return data.totalCount;
}
