const PETS_API_BASE = "https://pets-intrvw.up.railway.app/pets";
const INQUIRIES_API_BASE = "https://pets-intrvw.up.railway.app/inquiries";

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

/** Request body for POST /inquiries */
export interface InquiryRequest {
  petId: string;
  fullName: string;
  email: string;
  message: string;
}

/** Successful response from POST /inquiries */
export interface InquiryResponse {
  ok: true;
  inquiryId: string;
  receivedAt: string;
  petId: string;
  petName: string;
  imageUrl: string;
}

/** Field-level validation errors keyed by InquiryRequest field name */
export type InquiryFieldErrors = Partial<Record<keyof InquiryRequest, string>>;

/** Structured error body returned by POST /inquiries on 4xx */
export interface InquiryErrorBody {
  code: string;
  message: string;
  fieldErrors?: InquiryFieldErrors;
}

/** Thrown by submitInquiry when the external API returns a non-OK response */
export class InquiryApiError extends Error {
  public readonly code: string;
  public readonly fieldErrors: InquiryFieldErrors;

  constructor(body: InquiryErrorBody) {
    super(body.message);
    this.name = "InquiryApiError";
    this.code = body.code;
    this.fieldErrors = body.fieldErrors ?? {};
  }
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

/**
 * Submits an inquiry to the external API. Use from API route only; validate petId and email before calling.
 */
export async function submitInquiry(body: InquiryRequest): Promise<InquiryResponse> {
  const res = await fetch(INQUIRIES_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok: boolean; error?: InquiryErrorBody };
  if (!res.ok) {
    const errorBody = json.error;
    if (errorBody != null && typeof errorBody.message === "string") {
      throw new InquiryApiError(errorBody);
    }
    throw new InquiryApiError({ code: "UNKNOWN_ERROR", message: res.statusText });
  }
  return json as unknown as InquiryResponse;
}
