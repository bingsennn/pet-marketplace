import { FilterSelect } from "@/components/FilterSelect";

export interface PetFilters {
  species: string;
  size: string;
  available: "all" | "true" | "false";
}

export interface FilterBarProps {
  filters: PetFilters;
  onFiltersChange: (filters: PetFilters) => void;
}

const SPECIES_OPTIONS: string[] = ["bird", "cat", "dog", "rabbit"];
const SIZE_OPTIONS: string[] = ["small", "medium", "large"];

function optionsWithAll(
  values: ReadonlyArray<string>,
  allLabel: string = "All"
): Array<{ value: string; label: string }> {
  return [{ value: "", label: allLabel }, ...values.map((v) => ({ value: v, label: v }))];
}

const AVAILABILITY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "true", label: "Available" },
  { value: "false", label: "Unavailable" },
];

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  return (
    <div className="mb-6 flex w-full max-w-2xl flex-wrap items-end gap-4">
      <FilterSelect
        label="Species"
        value={filters.species}
        onChange={(species) =>
          onFiltersChange({ ...filters, species })
        }
        options={optionsWithAll(SPECIES_OPTIONS)}
      />
      <FilterSelect
        label="Size"
        value={filters.size}
        onChange={(size) => onFiltersChange({ ...filters, size })}
        options={optionsWithAll(SIZE_OPTIONS)}
      />
      <FilterSelect
        label="Availability"
        value={filters.available}
        onChange={(available) =>
          onFiltersChange({ ...filters, available: available as PetFilters["available"] })
        }
        options={AVAILABILITY_OPTIONS}
      />
    </div>
  );
}
