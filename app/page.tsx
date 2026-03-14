"use client";

import { useEffect, useState } from "react";
import type { Pet } from "@/lib/pets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <h1 className="mb-6 text-xl font-semibold">Pets</h1>
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
