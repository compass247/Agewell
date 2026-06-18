import "../src/styles.css";

// Root layout. The real <html>/<body> with the correct lang attribute is
// rendered by app/[lang]/layout.jsx (which knows the active locale). This
// root layout just passes children through so the locale layout can own the
// document shell.
export default function RootLayout({ children }) {
  return children;
}
