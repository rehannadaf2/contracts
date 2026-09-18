# Cryptodesk (Next.js + Firebase P2P Trading App)

Production-ready P2P crypto marketplace inspired by Binance P2P, built with **Next.js App Router**, **Tailwind CSS**, and **Firebase**.

## Features

- Email/password auth + phone OTP auth.
- Persistent login session with Firebase Auth.
- Binance-like dark marketplace UI and yellow accent color.
- Live ad table with Firestore `onSnapshot` real-time updates.
- Create ad flow storing records in `ads` collection.
- Trade creation, lifecycle (`pending` / `paid` / `completed` / `disputed`).
- Real-time trade chat (`trades/{tradeId}/messages`).
- Payment proof upload to Firebase Storage.
- Admin panel with trade/dispute controls.
- Dispute creation flow storing records in `disputes` collection.
- Security rules templates for Firestore + Storage.

## Folder Structure

- `app/` - all routes and pages (home, trade, orders, profile, admin)
- `components/` - reusable UI blocks
- `lib/` - Firebase setup, auth context, format helpers
- `types/` - centralized TS data models
- `firestore.rules` - Firestore access rules
- `storage.rules` - Firebase Storage rules

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Fill Firebase values in `.env.local` from Firebase Console.
4. Run locally:
   ```bash
   npm run dev
   ```

## Firebase Setup Notes

1. Enable Authentication providers:
   - Email/Password
   - Phone
2. Create Firestore database in production mode.
3. Create Storage bucket.
4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

## Deployment (Vercel)

1. Push project to GitHub.
2. Import into Vercel.
3. Set all `NEXT_PUBLIC_FIREBASE_*` env vars in Vercel project settings.
4. Build command: `npm run build`
5. Output: default Next.js.

## Important Implementation Details

- Admin route checks `users/{uid}.role === "admin"`.
- User profile doc is auto-created on first login.
- Trade countdown is 15 minutes from `expiresAt`.
- Payment proof stored in `proofs/{tradeId}` paths.

## Production Hardening Checklist

- Add server-side checks using Firebase Admin SDK for critical status transitions.
- Add rate limiting for chat/dispute creation.
- Add KYC/2FA before enabling large trade amounts.
- Add robust escrow wallet settlement automation.
- Add monitoring (Sentry + Firebase Analytics + logs).

