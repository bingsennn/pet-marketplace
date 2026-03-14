const PETS_API_BASE = "https://pets-intrvw.up.railway.app/pets";

/** Single pet from the API */
export interface Pet {
  id: string;
  name: string;
  species: string;
  age_months: number;
  size: string;
  price: number;
  image_url: string;
  available: boolean;
}

/** Optional filters for GET /pets (query params) */
export interface GetPetsFilters {
  species?: string;
  size?: string;
  available?: boolean;
}

/** Raw API response shape */
export interface PetsApiResponse {
  data: Pet[];
}

/**
 * Fetches pets from the external API with optional filters.
 * Use this in server code or from an API route; for client components, call GET /api/pets instead.
 */
export async function getPets(filters?: GetPetsFilters): Promise<Pet[]> {
  const url = new URL(PETS_API_BASE);
  if (filters?.species != null && filters.species !== "") {
    url.searchParams.set("species", filters.species);
  }
  if (filters?.size != null && filters.size !== "") {
    url.searchParams.set("size", filters.size);
  }
  if (filters?.available !== undefined) {
    url.searchParams.set("available", String(filters.available));
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch pets: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as PetsApiResponse;
  return json.data ?? [];
}
