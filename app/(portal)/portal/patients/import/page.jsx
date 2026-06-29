import Link from "next/link";
import { requireSession } from "../../../../../src/lib/phi/session.js";
import { requireCan } from "../../../../../src/lib/phi/rbac.js";
import ImportForm from "../../_components/ImportForm.jsx";
import "../../portal.css";

export const runtime = "nodejs";

export default async function ImportPage() {
  const actor = await requireSession();
  requireCan(actor, "create");

  return (
    <div>
      <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 20 }}>
        <h1 className="pf-h1" style={{ margin: 0 }}>Import patients</h1>
        <Link className="pf-btn pf-btn--ghost" href="/portal/patients">← Back</Link>
      </div>
      <div className="pf-card">
        <ImportForm />
      </div>
    </div>
  );
}
