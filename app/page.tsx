"use client";

import { useEffect, useState } from "react";
import type { Pet } from "@/lib/pets";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pets")
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
  }, []);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <h1 className="mb-4 text-xl font-semibold">Pets</h1>
      <ul className="list-disc space-y-1 text-left">
        {pets.map((pet) => (
          <li key={pet.id}>
            {pet.name} — {pet.species}, {pet.age_months}mo, {pet.size}, ${pet.price}
            {pet.available ? "" : " (unavailable)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
