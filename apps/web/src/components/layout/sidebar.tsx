"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PenSquare,
  Calendar,
  ListOrdered,
  Users,
  Image,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";

const navigation = [
  { name: "Compose", href: "/compose", icon: PenSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Queue", href: "/queue", icon: ListOrdered },
  { name: "Accounts", href: "/accounts", icon: Users },
  { name: "Media", href: "/media", icon: Image },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[var(--sidebar-width)] flex-col border-r border-[var(--border)] bg-[var(--card)]">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-6">
        <Zap className="h-6 w-6 text-[var(--primary)]" />
        <span className="text-lg font-bold">SocialFlow</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
