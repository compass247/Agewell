import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default function PortalIndex() {
  redirect("/portal/patients");
}
