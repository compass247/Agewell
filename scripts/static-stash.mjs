/* ============================================================
   Static-export stash helper: hide server-only surfaces from `next build`.

   `output: "export"` fails to compile if the app tree contains middleware,
   server actions, or non-static route handlers. The PHI portal is exactly
   that. Next.js has no native "exclude these paths from the build", so we
   temporarily MOVE those files out of the build tree into .static-stash/,
   run the static build, then move them back.

   This keeps ALL code on one branch (main) — the portal still builds normally
   for the Fargate image (BUILD_TARGET unset); only the Pages build hides it.

   Used by scripts/prebuild-static.mjs (stash) and postbuild-static.mjs
   (unstash). See package.json → build:static. postbuild runs even on build
   failure so the repo is never left with files stashed away.
   ============================================================ */
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

// Paths (relative to repo root) that must NOT be in a static export.
export const STASH_PATHS = [
  "middleware.js",
  "auth.js",
  "auth.config.js",
  "app/(portal)",
  "app/api/portal",
  "app/api/revalidate", // server-only revalidation route (replaced by Pages Deploy Hook)
  "app/healthz", // ALB health route; not needed on Pages
];

const ROOT = process.cwd();
const STASH_DIR = join(ROOT, ".static-stash");

export function stash() {
  mkdirSync(STASH_DIR, { recursive: true });
  for (const rel of STASH_PATHS) {
    const src = join(ROOT, rel);
    if (!existsSync(src)) continue;
    const dest = join(STASH_DIR, rel);
    mkdirSync(dirname(dest), { recursive: true });
    renameSync(src, dest);
    console.log(`[static-stash] stashed ${rel}`);
  }
}

export function unstash() {
  if (!existsSync(STASH_DIR)) return;
  for (const rel of STASH_PATHS) {
    const src = join(STASH_DIR, rel);
    if (!existsSync(src)) continue;
    const dest = join(ROOT, rel);
    mkdirSync(dirname(dest), { recursive: true });
    renameSync(src, dest);
    console.log(`[static-stash] restored ${rel}`);
  }
  rmSync(STASH_DIR, { recursive: true, force: true });
}
