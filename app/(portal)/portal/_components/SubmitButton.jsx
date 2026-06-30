"use client";
/* Submit button that reflects the enclosing form's pending state (React 18 /
   Next 14 — useFormStatus from react-dom). */
import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, pendingLabel, ...props }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} {...props}>
      {pending ? pendingLabel || "Working…" : children}
    </button>
  );
}
