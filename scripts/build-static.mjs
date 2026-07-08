/* ============================================================
   Orchestrates the static (Cloudflare Pages) build:
     1. stash server-only surfaces (PHI portal, middleware, auth, api routes)
     2. run `next build` with BUILD_TARGET=static → output:"export" into out/
     3. ALWAYS restore the stashed files (finally), even if the build fails,
        so the working tree is never left with files moved away.

   Cross-platform (Windows PowerShell + Linux CI) — pure Node, no shell chaining.
   ============================================================ */
import { spawnSync } from "node:child_process";
import { stash, unstash } from "./static-stash.mjs";

let code = 1;
try {
  stash();
  const res = spawnSync("next", ["build"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, BUILD_TARGET: "static" },
  });
  code = res.status ?? 1;
} finally {
  unstash();
}

process.exit(code);
