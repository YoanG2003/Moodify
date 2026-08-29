# Moodify

Moodify is a mobile wellbeing and mood-tracking UI/UX project by **Monika Stoyanova**. This repository contains the iOS and Android implementation of her Figma design.

**Moodify is the official product name.** Any other labels found in the original Figma workspace are internal design-file references and are not names of the app.

The app is being prepared as an EU/EEA beta for users aged 16+. It is a wellness product, not a medical device or emergency service.

## Included

- Light/dark Figma-derived UI with Expo Router navigation, onboarding, age gate, avatar setup, five main tabs, mood logging, habits, tools, insights, chat, profile, and settings.
- Email authentication and verification, password reset, Google login, and Apple login when Firebase/provider credentials are configured. An explicit local-beta account is available only when Firebase is absent.
- Offline-first Zustand persistence for a usable development build, typed domain models, validation, local reminders, and manual health fallback.
- Read-only HealthKit and Health Connect daily step/sleep aggregates in EAS development builds.
- Firebase rules, Functions, emulator configuration, repeatable content seeding, data export/deletion, App Check enforcement, and 30-day chat TTL configuration.
- Moderated OpenAI Responses API chat through authenticated callable Functions, with rate limiting and an EU 112 crisis response.
- Bundled Figma assets and an origin manifest at `assets/figma/manifest.json`; runtime screens do not use expiring Figma URLs.
- Official branding is sourced exclusively from `assets/brand/moodify-logo.png`; native icon, adaptive icon, splash, and favicon files are deterministic size/background variants of that supplied artwork.

## Local setup

1. Install dependencies with `npm install` and `cd functions && npm install`.
2. Copy `.env.example` to `.env` and add Firebase and social-login client IDs.
3. Run `npm start` for UI work. Health, Apple sign-in, App Check, and native Firebase verification require an EAS development build: `eas build --profile development`.
4. Run `npm run typecheck`, `npm run lint`, and `npm test` before a build.

Without `.env`, choose **Try local beta**. This mode is for visual/product testing only; cloud sync, real accounts, export/deletion Functions, and production AI are intentionally unavailable.

## Firebase setup

1. Create iOS and Android apps using bundle/package ID `com.moodify.app`, enable Email/Password, Google, and Apple providers, and configure authorized domains/deep links.
2. Create Firestore, Storage, Functions, Analytics, Crashlytics, and App Check. Register App Attest/DeviceCheck for iOS and Play Integrity for Android.
3. Copy `.firebaserc.example` to `.firebaserc`, set the project ID, then deploy with `firebase deploy`.
4. Store the OpenAI key only in Functions: `firebase functions:secrets:set OPENAI_API_KEY`.
5. Seed curated content with `cd functions && npm run seed` while authenticated to the intended Firebase project.
6. Enable Firestore TTL for the deployed `expiresAt` field overrides and run the emulator suite before production deployment.

The callable AI contract is `createAiReply({ sessionId, message, locale, region })`. The backend defaults to `gpt-5-mini`; set `OPENAI_CHAT_MODEL` server-side to change it.

## Release boundary

The codebase is beta-ready, but signing credentials, Firebase project files, App Check registrations, OAuth IDs, OpenAI secret, legal owner/contact details, support URL, store listings, and physical-device permission tests must come from the product owner. Follow [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) before TestFlight or Play internal testing.

Draft privacy and terms text is in `docs/PRIVACY.md` and `docs/TERMS.md`; obtain legal review before distribution.
