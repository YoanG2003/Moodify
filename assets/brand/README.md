# Moodify official brand assets

The official Moodify mark is `moodify-logo.png`. It is an exact, byte-for-byte copy of the supplied splash-screen artwork `Group 55.png` (SHA-256 `75642b5acec2a1a571236df165d0db66c147c66b7bfe61efb3e3fcd0a0444174`).

No generative AI is used for any brand asset. The other PNG files are deterministic platform variants produced by `scripts/make-brand-assets.swift`:

- `moodify-app-icon.png`: 1024×1024, opaque black background for iOS and the general app icon.
- `moodify-adaptive-foreground.png`: 1024×1024 transparent Android adaptive-icon foreground; Android supplies the black background.
- `moodify-splash-logo.png`: 512×512 transparent splash-screen mark.
- `moodify-favicon.png`: 192×192 opaque web icon.

Regenerate the variants on macOS with:

```bash
swift scripts/make-brand-assets.swift "/path/to/Group 55.png" assets/brand
```
