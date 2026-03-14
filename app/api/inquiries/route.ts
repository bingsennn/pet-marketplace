import { NextRequest, NextResponse } from "next/server";
import { getPets, InquiryApiError, submitInquiry, type InquiryRequest } from "@/lib/pets";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { petId, fullName, email, message } = body as Record<string, unknown>;

  if (typeof petId !== "string" || petId.trim() === "") {
    return NextResponse.json(
      { error: "petId is required" },
      { status: 400 }
    );
  }
  if (typeof fullName !== "string" || fullName.trim() === "") {
    return NextResponse.json(
      { error: "fullName is required" },
      { status: 400 }
    );
  }
  if (typeof email !== "string" || email.trim() === "") {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }
  if (typeof message !== "string" || message.trim() === "") {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 }
    );
  }

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  const pets = await getPets();
  const petIds = new Set(pets.map((p) => p.id));
  if (!petIds.has(petId)) {
    return NextResponse.json(
      { error: "This pet is not available for inquiry" },
      { status: 400 }
    );
  }

  const inquiry: InquiryRequest = {
    petId: petId.trim(),
    fullName: fullName.trim(),
    email: email.trim(),
    message: message.trim(),
  };

  try {
    const result = await submitInquiry(inquiry);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof InquiryApiError) {
      return NextResponse.json(
        { error: error.message, fieldErrors: error.fieldErrors },
        { status: 400 }
      );
    }
    const msg = error instanceof Error ? error.message : "Failed to submit inquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
