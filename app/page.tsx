"use client";

import { useCallback, useEffect, useState } from "react";
import type { Pet } from "@/lib/pets";
import { FilterBar, type PetFilters } from "@/components/FilterBar";
import { PetInquiryDialog } from "@/components/PetInquiryDialog";
import { PetCard } from "@/components/PetCard";

function buildPetsUrl(filters: PetFilters): string {
  const params = new URLSearchParams();
  if (filters.species !== "") params.set("species", filters.species);
  if (filters.size !== "") params.set("size", filters.size);
  if (filters.available === "true") params.set("available", "true");
  if (filters.available === "false") params.set("available", "false");
  const qs = params.toString();
  return qs ? `/api/pets?${qs}` : "/api/pets";
}

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PetFilters>({
    species: "",
    size: "",
    available: "all",
  });
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const fetchPets = useCallback(() => {
    setLoading(true);
    fetch(buildPetsUrl(filters))
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: Pet[]) => {
        setPets(data);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load pets");
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <h1 className="mb-6 text-xl font-semibold">Pets</h1>

      <FilterBar filters={filters} onFiltersChange={setFilters} />

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} onSelect={setSelectedPet} />
        ))}
      </div>

      <PetInquiryDialog
        selectedPet={selectedPet}
        onClose={() => setSelectedPet(null)}
      />
    </div>
  );
}
