import { NextRequest, NextResponse } from "next/server";
import { getPets, type GetPetsFilters } from "@/lib/pets";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const filters: GetPetsFilters = {};
  const species = searchParams.get("species");
  if (species != null && species !== "") filters.species = species;
  const size = searchParams.get("size");
  if (size != null && size !== "") filters.size = size;
  const availableParam = searchParams.get("available");
  if (availableParam !== null && availableParam !== "") {
    const lower = availableParam.toLowerCase();
    if (lower === "true") filters.available = true;
    else if (lower === "false") filters.available = false;
  }
  try {
    const pets = await getPets(filters);
    return NextResponse.json(pets);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch pets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
