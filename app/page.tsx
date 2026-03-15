"use client";

import { useEffect, useRef, useState } from "react";
import type { Pet } from "@/lib/pets";
import { FilterBar, type PetFilters } from "@/components/FilterBar";
import { PetInquiryDialog } from "@/components/PetInquiryDialog";
import { PetCard } from "@/components/PetCard";
import { PetCardSkeleton } from "@/components/ui/pet-card-skeleton";

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
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PetFilters>({
    species: "",
    size: "",
    available: "all",
  });
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const hasLoadedOnceRef = useRef<boolean>(false);

  useEffect(() => {
    const isFirstLoad: boolean = !hasLoadedOnceRef.current;

    if (isFirstLoad) setIsInitialLoading(true);
    else setIsRefreshing(true);

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
      .finally(() => {
        if (isFirstLoad) {
          setIsInitialLoading(false);
          hasLoadedOnceRef.current = true;
          return;
        }
        setIsRefreshing(false);
      });
  }, [filters]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <h1 className="mb-6 text-xl font-semibold">Pets</h1>
      <div className="w-full max-w-2xl">
        <FilterBar filters={filters} onFiltersChange={setFilters} />
        <div className="mb-4 h-5 text-sm text-zinc-500 dark:text-zinc-400">
          {isRefreshing && (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200" />
              Updating results...
            </span>
          )}
        </div>
      </div>

      <div className="w-full max-w-2xl columns-1 gap-4 sm:columns-2">
        {isInitialLoading ? (
          <>
            <div className="mb-4 break-inside-avoid">
              <PetCardSkeleton />
            </div>
            <div className="mb-4 break-inside-avoid">
              <PetCardSkeleton />
            </div>
            <div className="mb-4 break-inside-avoid">
              <PetCardSkeleton />
            </div>
            <div className="mb-4 break-inside-avoid">
              <PetCardSkeleton />
            </div>
          </>
        ) : (
          pets.map((pet) => (
            <div key={pet.id} className="mb-4 break-inside-avoid">
              <PetCard pet={pet} onSelect={setSelectedPet} />
            </div>
          ))
        )}
      </div>
      {!isInitialLoading && error && (
        <div className="mt-4 w-full max-w-2xl rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
          Failed to refresh pets: {error}
        </div>
      )}

      <PetInquiryDialog
        selectedPet={selectedPet}
        onClose={() => setSelectedPet(null)}
      />
    </div>
  );
}
