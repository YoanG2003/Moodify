# Moodify beta release checklist

## Accounts and credentials

- Set the EAS project ID, Apple team, App Store Connect app, Google Play app, and production bundle/package ownership.
- Add `GoogleService-Info.plist` and `google-services.json` as EAS file variables named `GOOGLE_SERVICES_PLIST` and `GOOGLE_SERVICES_JSON`; never commit private credentials. The dynamic app config enables native Firebase only when the platform file is present.
- Configure Firebase OAuth providers, email-action deep links, authorized domains, App Check attestation, Crashlytics, and minimal Analytics consent.
- Set the Functions `OPENAI_API_KEY` secret and confirm the production model/region.

## Privacy and store declarations

- Replace all bracketed organization/contact fields in the legal drafts and obtain EU privacy/legal review.
- Publish HTTPS privacy, terms, and support pages; add their final URLs to both store listings.
- Complete Apple privacy nutrition labels, the privacy manifest review, Google Play Data Safety, Health Connect declaration, and account-deletion URL.
- Confirm a documented lawful basis, retention schedule, data-subject request process, processor agreements, and incident-response contact.
- Verify that analytics and crash reports do not contain mood notes, chat text, raw health samples, email addresses, or other sensitive content.

## Verification

- Run client typecheck, lint, unit tests, Functions build, Firebase emulator tests, and dependency audit review.
- Test 375×812 plus small/large iOS and Android devices in light/dark mode, larger text, VoiceOver/TalkBack, reduced motion, offline state, and keyboard flows.
- Test email verification/deep links, password reset, Google/Apple sign-in, App Check rejection, account export, immediate chat deletion, TTL expiry, and cascade deletion.
- Test local reminders across timezone/DST changes and denied/revoked notification permissions.
- Test HealthKit/Health Connect unavailable, partial, denied, and revoked states on physical devices; verify only daily aggregates reach Firestore.
- Execute safety cases for self-harm intent, immediate danger, diagnosis requests, prompt injection, abusive/oversized content, rate limits, timeout, and model failure.

## Distribution

- Build `development`, then `preview`; validate on registered physical devices before `production`.
- Upload to TestFlight and Play internal testing, invite a limited beta cohort, and monitor crash-free sessions and callable failures.
- Do not promote to public release until policy review, accessibility QA, deletion/export verification, and crisis-flow review are signed off.
