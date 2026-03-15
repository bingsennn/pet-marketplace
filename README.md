# Pet Marketplace

https://pet-marketplace-asdd.vercel.app/

A modern pet listing and inquiry app built with Next.js App Router. Users can browse pets, apply filters, and submit inquiries through a guided dialog flow.

## Features

- Browse pet cards with image fallback and availability state
- Filter pets by species, size, and availability
- Open a detail dialog for each pet
- Submit inquiries from the dialog with inline validation and field-level errors
- Show inquiry success details (inquiry ID and received time)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/Radix-based UI components

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - Start local dev server
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run ESLint

## API Routes

This app exposes two server routes that proxy/validate against the external pets API:

- `GET /api/pets`
  - Optional query params: `species`, `size`, `available`
  - Returns a filtered list of pets
- `POST /api/inquiries`
  - Body: `petId`, `fullName`, `email`, `message`
  - Performs request validation (including email format and pet existence)
  - Returns either inquiry success payload or structured errors

## Project Structure

- `app/page.tsx` - Client homepage, filtering, and list rendering
- `app/api/pets/route.ts` - Pets query route
- `app/api/inquiries/route.ts` - Inquiry submit route and validation
- `components/` - UI and feature components (cards, filters, dialogs, forms)
- `lib/pets.ts` - External API client types and helpers

## Assumptions

- The external API remains reachable and responds with the documented schema for pets and inquiries.
- The inquiry endpoint is non-persistent (faux backend), so success state is based on API response only.
- A pet is considered valid for inquiry if its `petId` exists in the latest pets list fetched by the app.

## Tradeoffs and Future Improvements

- Validation is intentionally lightweight (required fields + email format + pet existence). With more time, I would add stricter client/server validation with shared schemas (e.g., Zod) and richer error messaging.
- Filtering currently uses straightforward fetches per filter change. With more time, I would add request cancellation and caching (e.g., TanStack Query/SWR) for better responsiveness and reduced duplicate requests.
- UI states cover loading, error, disabled, and success flows, but not all edge UX cases. With more time, I would add explicit empty-results messaging, better accessibility audits, and keyboard/focus refinements.
- There are no automated tests yet. With more time, I would add unit tests for API route validation and integration/E2E tests for the full inquiry flow.
