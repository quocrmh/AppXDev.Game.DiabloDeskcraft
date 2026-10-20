# Known Issues & Troubleshooting

## 1. Issue: Characters Appear Semi-Transparent or Have Black Boxes
- **Symptoms:** Generated pixel art sprites show a dark box around the character or blend semi-transparently into the background.
- **Root Cause:** Raw PNGs generated on dark backgrounds or blended with `globalCompositeOperation = 'screen'`.
- **Solution:** `cleanSpriteImage()` in `src/renderer/pixelOverlayRenderer.js` performs an edge flood-fill to strip background pixels to `alpha = 0` while clamping interior character pixels to `alpha = 255`, and renders character sprites with `source-over` (`globalAlpha = 1.0`).

## 2. Issue: Launching Electron from Background PowerShell Doesn't Show Window
- **Symptoms:** Running `npx electron .` directly from a headless agent terminal starts processes in Session 0 or without foreground desktop privileges.
- **Solution:** Always trigger `Start-ScheduledTask -TaskName "LaunchDiabloDeskcraft"` so Windows Task Scheduler launches Electron in the active user's interactive desktop session.
