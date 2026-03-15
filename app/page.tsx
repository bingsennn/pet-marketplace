"use client";

import { useCallback, useEffect, useState } from "react";
import type { InquiryFieldErrors, InquiryResponse, Pet } from "@/lib/pets";
import { FilterBar, type PetFilters } from "@/components/FilterBar";
import { PetCard } from "@/components/PetCard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function buildPetsUrl(filters: PetFilters): string {
  const params = new URLSearchParams();
  if (filters.species !== "") params.set("species", filters.species);
  if (filters.size !== "") params.set("size", filters.size);
  if (filters.available === "true") params.set("available", "true");
  if (filters.available === "false") params.set("available", "false");
  const qs = params.toString();
  return qs ? `/api/pets?${qs}` : "/api/pets";
}

function formatReceivedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
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
  type InquiryView = "detail" | "form" | "success";
  const [inquiryView, setInquiryView] = useState<InquiryView>("detail");
  const [inquiryResult, setInquiryResult] = useState<InquiryResponse | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<InquiryFieldErrors>({});
  const [formFullName, setFormFullName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formMessage, setFormMessage] = useState<string>("");

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

  useEffect(() => {
    if (selectedPet !== null) {
      setInquiryView("detail");
      setInquiryResult(null);
      setFormError(null);
      setFormFieldErrors({});
      setFormFullName("");
      setFormEmail("");
      setFormMessage("");
    }
  }, [selectedPet]);

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

      <Dialog
        open={selectedPet !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPet(null);
            setInquiryView("detail");
            setInquiryResult(null);
            setFormError(null);
            setFormFieldErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          {selectedPet !== null && inquiryView === "detail" && (
            <>
              <img
                src={selectedPet.image_url}
                alt={selectedPet.name}
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <DialogHeader>
                <DialogTitle>{selectedPet.name}</DialogTitle>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-muted-foreground" aria-label="Pet details">
                  <dt className="text-muted-foreground">Species</dt>
                  <dd className="text-foreground">{selectedPet.species}</dd>
                  <dt className="text-muted-foreground">Age</dt>
                  <dd className="text-foreground">{selectedPet.age_months} months</dd>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="text-foreground">{selectedPet.size}</dd>
                  <dt className="text-muted-foreground">Price</dt>
                  <dd className="text-foreground">${selectedPet.price}</dd>
                  <dt className="text-muted-foreground">Availability</dt>
                  <dd className="text-foreground">{selectedPet.available ? "Available" : "Unavailable"}</dd>
                </dl>
              </DialogHeader>
              <DialogFooter showCloseButton={false}>
                {selectedPet.available ? (
                  <Button onClick={() => setInquiryView("form")}>
                    Inquire
                  </Button>
                ) : (
                  <p className="w-full text-sm text-muted-foreground">
                    This pet is not available for inquiry at the moment. Please check back later or browse other pets.
                  </p>
                )}
              </DialogFooter>
            </>
          )}

          {selectedPet !== null && inquiryView === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>Inquire about {selectedPet.name}</DialogTitle>
              </DialogHeader>
              <form
                className="flex flex-col gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedPet || formLoading) return;
                  setFormLoading(true);
                  setFormError(null);
                  setFormFieldErrors({});
                  try {
                    const res = await fetch("/api/inquiries", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        petId: selectedPet.id,
                        fullName: formFullName,
                        email: formEmail,
                        message: formMessage,
                      }),
                    });
                    const data = await res.json() as { error?: string; fieldErrors?: InquiryFieldErrors };
                    if (!res.ok) {
                      setFormError(data.error ?? "Something went wrong");
                      setFormFieldErrors(data.fieldErrors ?? {});
                      return;
                    }
                    setInquiryResult(data as InquiryResponse);
                    setInquiryView("success");
                  } catch (err) {
                    setFormError(err instanceof Error ? err.message : "Network error");
                  } finally {
                    setFormLoading(false);
                  }
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="inquiry-fullName">Full name</Label>
                  <Input
                    id="inquiry-fullName"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    required
                    disabled={formLoading}
                    placeholder="Your name"
                    aria-invalid={formFieldErrors.fullName != null}
                  />
                  {formFieldErrors.fullName != null && (
                    <p className="text-xs text-destructive" role="alert">{formFieldErrors.fullName}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inquiry-email">Email</Label>
                  <Input
                    id="inquiry-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    disabled={formLoading}
                    placeholder="you@example.com"
                    aria-invalid={formFieldErrors.email != null}
                  />
                  {formFieldErrors.email != null && (
                    <p className="text-xs text-destructive" role="alert">{formFieldErrors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inquiry-message">Message</Label>
                  <Input
                    id="inquiry-message"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    required
                    disabled={formLoading}
                    placeholder="Your message"
                    aria-invalid={formFieldErrors.message != null}
                  />
                  {formFieldErrors.message != null && (
                    <p className="text-xs text-destructive" role="alert">{formFieldErrors.message}</p>
                  )}
                </div>
                {formError !== null && (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                )}
                <DialogFooter showCloseButton={false}>
                  <Button type="button" variant="outline" onClick={() => setInquiryView("detail")} disabled={formLoading}>
                    Back
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Sending…" : "Submit inquiry"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {selectedPet !== null && inquiryView === "success" && inquiryResult !== null && (
            <>
              <DialogHeader>
                <DialogTitle>Inquiry sent</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <img
                  src={inquiryResult.imageUrl}
                  alt={inquiryResult.petName}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
                <p className="text-sm text-muted-foreground">
                  Thank you for your interest in <strong>{inquiryResult.petName}</strong>.
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Inquiry ID</dt>
                  <dd className="font-mono text-foreground">{inquiryResult.inquiryId}</dd>
                  <dt className="text-muted-foreground">Received</dt>
                  <dd className="text-foreground">{formatReceivedAt(inquiryResult.receivedAt)}</dd>
                </dl>
              </div>
              <DialogFooter showCloseButton={false}>
                <Button onClick={() => setSelectedPet(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
