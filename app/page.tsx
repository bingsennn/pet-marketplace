"use client";

import { useCallback, useEffect, useState } from "react";
import type { Pet } from "@/lib/pets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SPECIES_OPTIONS: string[] = ["bird", "cat", "dog", "rabbit"];
const SIZE_OPTIONS: string[] = ["small", "medium", "large"];

type AvailableFilter = "all" | "true" | "false";

function buildPetsUrl(filters: {
  species: string;
  size: string;
  available: AvailableFilter;
}): string {
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
  const [species, setSpecies] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [available, setAvailable] = useState<AvailableFilter>("all");

  const fetchPets = useCallback(() => {
    setLoading(true);
    fetch(buildPetsUrl({ species, size, available }))
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
  }, [species, size, available]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <h1 className="mb-6 text-xl font-semibold">Pets</h1>

      <div className="mb-6 flex w-full max-w-2xl flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Species
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Size
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Availability
          <select
            value={available}
            onChange={(e) => setAvailable(e.target.value as AvailableFilter)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </label>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {pets.map((pet) => (
          <Card
            key={pet.id}
            className={pet.available ? "" : "opacity-70 ring-muted-foreground/30"}
          >
            <img
              src={pet.image_url}
              alt={pet.name}
              className="aspect-[4/3] w-full object-cover"
            />
            <CardHeader>
              <CardTitle>{pet.name}</CardTitle>
              <CardDescription>
                {pet.species} · {pet.age_months}mo · {pet.size}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <span className="font-medium">${pet.price}</span>
              {pet.available ? (
                <span className="text-muted-foreground"> · Available</span>
              ) : (
                <span className="text-muted-foreground"> · Unavailable</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
