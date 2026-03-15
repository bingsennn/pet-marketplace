import type { Pet } from "@/lib/pets";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface PetCardProps {
  pet: Pet;
  onSelect: (pet: Pet) => void;
}

export function PetCard({ pet, onSelect }: PetCardProps) {
  const [hasImageError, setHasImageError] = useState<boolean>(false);
  const fallbackImageSrc: string =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='Arial,sans-serif' font-size='28'>Image unavailable</text></svg>";

  return (
    <Card
      className={`cursor-pointer transition-opacity hover:opacity-90 ${pet.available ? "" : "opacity-70 ring-muted-foreground/30"}`}
      onClick={() => onSelect(pet)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(pet);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <img
        src={hasImageError ? fallbackImageSrc : pet.image_url}
        alt={pet.name}
        className="aspect-[4/3] w-full object-cover"
        onError={() => setHasImageError(true)}
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
  );
}
