"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "./context";

/**
 * Redirects to /login?next=<currentPath> if user is not signed in.
 * Returns { user, ready } so the caller can render a loader until ready === true.
 */
export function useLoginGuard() {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [user, loading, router, pathname]);

  return { user, ready: !loading && !!user };
}
