"use client";

// Keep the persistent site shell mounted while Next.js swaps route content.
// No forced spinner or animation delay is needed for static App Router pages.
export default function PageTransition({ children }) {
  return <>{children}</>;
}
