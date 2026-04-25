"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { useUser } from "@/lib/auth/context";
import { useLang } from "@/lib/i18n/context";
import { strings, t } from "@/lib/i18n/strings";
import { cn } from "@/lib/utils";

export function UserMenu({ className }: { className?: string }) {
  const { user, logout } = useUser();
  const { lang } = useLang();
  const router = useRouter();

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-emerald-300",
          className,
        )}
      >
        <UserIcon className="w-3.5 h-3.5" /> Sign in
      </Link>
    );
  }

  const onLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className={cn("inline-flex items-center gap-2 text-xs", className)}>
      <span className="text-stone-400 hidden sm:inline" title={user.email}>
        <UserIcon className="w-3.5 h-3.5 inline mr-1" />
        <span className="font-mono">
          {user.email.length > 22 ? user.email.slice(0, 20) + "…" : user.email}
        </span>
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-1 text-stone-400 hover:text-emerald-300"
      >
        <LogOut className="w-3.5 h-3.5" /> {t(strings.nav2.logout, lang)}
      </button>
    </div>
  );
}
