"use client";
/* Client-side idle logoff for UX parity with the server-side sliding timeout.
   After `minutes` of no user interaction, redirect to login (the server JWT is
   already expired by then). The server is the source of truth; this just avoids
   leaving PHI on screen. */
import { useEffect, useRef } from "react";

export default function IdleTimeout({ minutes = 15 }) {
  const timer = useRef(null);

  useEffect(() => {
    const ms = minutes * 60 * 1000;
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        window.location.href = "/portal/login";
      }, ms);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [minutes]);

  return null;
}
