"use client";

import { useEffect, useState } from "react";
import type { InquiryResponse, Pet } from "@/lib/pets";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InquiryForm } from "@/components/InquiryForm";

export interface PetInquiryDialogProps {
  selectedPet: Pet | null;
  onClose: () => void;
}

type InquiryView = "detail" | "form" | "success";

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

export function PetInquiryDialog({ selectedPet, onClose }: PetInquiryDialogProps) {
  const [inquiryView, setInquiryView] = useState<InquiryView>("detail");
  const [inquiryResult, setInquiryResult] = useState<InquiryResponse | null>(null);

  useEffect(() => {
    if (selectedPet !== null) {
      setInquiryView("detail");
      setInquiryResult(null);
    }
  }, [selectedPet]);

  return (
    <Dialog
      open={selectedPet !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
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
              <dl
                className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-muted-foreground"
                aria-label="Pet details"
              >
                <dt className="text-muted-foreground">Species</dt>
                <dd className="text-foreground">{selectedPet.species}</dd>
                <dt className="text-muted-foreground">Age</dt>
                <dd className="text-foreground">{selectedPet.age_months} months</dd>
                <dt className="text-muted-foreground">Size</dt>
                <dd className="text-foreground">{selectedPet.size}</dd>
                <dt className="text-muted-foreground">Price</dt>
                <dd className="text-foreground">${selectedPet.price}</dd>
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="text-foreground">
                  {selectedPet.available ? "Available" : "Unavailable"}
                </dd>
              </dl>
            </DialogHeader>
            <DialogFooter showCloseButton={false}>
              {selectedPet.available ? (
                <Button onClick={() => setInquiryView("form")}>Inquire</Button>
              ) : (
                <p className="w-full text-sm text-muted-foreground">
                  This pet is not available for inquiry at the moment. Please check back later or
                  browse other pets.
                </p>
              )}
            </DialogFooter>
          </>
        )}

        {selectedPet !== null && inquiryView === "form" && (
          <InquiryForm
            pet={selectedPet}
            onSuccess={(result) => {
              setInquiryResult(result);
              setInquiryView("success");
            }}
            onBack={() => setInquiryView("detail")}
          />
        )}

        {selectedPet !== null &&
          inquiryView === "success" &&
          inquiryResult !== null && (
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
                  Thank you for your interest in{" "}
                  <strong>{inquiryResult.petName}</strong>.
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Inquiry ID</dt>
                  <dd className="font-mono text-foreground">
                    {inquiryResult.inquiryId}
                  </dd>
                  <dt className="text-muted-foreground">Received</dt>
                  <dd className="text-foreground">
                    {formatReceivedAt(inquiryResult.receivedAt)}
                  </dd>
                </dl>
              </div>
              <DialogFooter showCloseButton={false}>
                <Button onClick={onClose}>Close</Button>
              </DialogFooter>
            </>
          )}
      </DialogContent>
    </Dialog>
  );
}
