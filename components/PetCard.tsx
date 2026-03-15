import type { Pet } from "@/lib/pets";
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
  );
}
