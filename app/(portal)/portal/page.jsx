import { redirect } from "next/navigation";
import { requireSession } from "../../../src/lib/phi/session.js";
import { homePathFor } from "../../../src/lib/phi/rbac.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// /portal is just a signpost: send each role to the module it actually owns.
export default async function PortalIndex() {
  const actor = await requireSession();
  redirect(homePathFor(actor.role));
}
