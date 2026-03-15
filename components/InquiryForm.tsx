"use client";

import { useState } from "react";
import type { InquiryFieldErrors, InquiryResponse, Pet } from "@/lib/pets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface InquiryFormProps {
  pet: Pet;
  onSuccess: (result: InquiryResponse) => void;
  onBack: () => void;
}

export function InquiryForm({ pet, onSuccess, onBack }: InquiryFormProps) {
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<InquiryFieldErrors>({});
  const [formFullName, setFormFullName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formMessage, setFormMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (formLoading) return;
    setFormLoading(true);
    setFormError(null);
    setFormFieldErrors({});
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          fullName: formFullName,
          email: formEmail,
          message: formMessage,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        fieldErrors?: InquiryFieldErrors;
      };
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong");
        setFormFieldErrors(data.fieldErrors ?? {});
        return;
      }
      onSuccess(data as InquiryResponse);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Network error"
      );
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Inquire about {pet.name}</DialogTitle>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
            <p className="text-xs text-destructive" role="alert">
              {formFieldErrors.fullName}
            </p>
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
            <p className="text-xs text-destructive" role="alert">
              {formFieldErrors.email}
            </p>
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
            <p className="text-xs text-destructive" role="alert">
              {formFieldErrors.message}
            </p>
          )}
        </div>
        {formError !== null && (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        )}
        <DialogFooter showCloseButton={false}>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={formLoading}
          >
            Back
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading ? "Sending…" : "Submit inquiry"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
