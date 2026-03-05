"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
      <div />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </header>
  );
}
