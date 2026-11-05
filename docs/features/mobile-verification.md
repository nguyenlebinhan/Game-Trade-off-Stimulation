# Mobile browser verification

Verified in Chromium 156 with a 320×700 viewport, mobile emulation, touch input,
and software WebGL. This is browser verification, not a physical-device claim.

## Renderer loading and fallback

The Three.js renderer is a lazy dynamic import. Against verified base `67fe4206f408e7dab385e1acfc83bea3b32f8b65`, comparable clean-build measurements are: base initial JavaScript 254.52 kB (79.63 kB gzip), post-split initial JavaScript 260.93 kB (81.65 kB gzip), and deferred renderer chunk 561.76 kB (138.89 kB gzip). The CSS scene and semantic buttons are available while that chunk loads and remain the usable fallback when WebGL is absent or renderer creation fails.

The browser initially used a 980px layout because the entry document had no
viewport metadata. Adding that metadata and loading final world layout rules
after the legacy shell styles yields a 320×700 canvas at (0, 0), with document
scroll width 320px. The icon palette and simulation buttons have 44px touch
targets. The inspector sits above the bottom controls; workload/results are
available through a scrollable overlay.

`scripts/check-mobile.cjs` exercises actual browser touch input: palette Add,
raycast mesh selection, connector drag from the inspector to another mesh,
cancelled connector drag, typed relationship creation, ground orbit (rendered
frame changes), endpoint removal and edge cleanup, reset, and workload access.
The connected mobile screenshot was visually inspected: both meshes and their
connecting line are visible, with the inspector below the objects. A desktop
1366×900 screenshot is also produced. No page errors were recorded.

Run Vite, then run the script with Playwright available on Node's module path.
Playwright may be installed in a temporary tooling directory to keep the app
dependency tree unchanged. Set `NODE_PATH` to that directory's `node_modules`
and install Chromium with its Playwright CLI. `APP_URL` defaults to
`http://127.0.0.1:5173`. Screenshots go to the system temporary directory.

Architecture edits remain an in-memory sandbox separate from the deterministic
simulation workload. The existing 320px jsdom test checks DOM presence only;
it does not replace this browser test or prove touch geometry.
