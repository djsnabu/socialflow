"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PenSquare,
  Calendar,
  Clock,
  Users,
  Image,
  BarChart2,
  Settings,
  Zap,
  Rss,
} from "lucide-react";

const navigation = [
  { name: "Compose", href: "/compose", icon: PenSquare },
  { name: "Queue", href: "/queue", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Accounts", href: "/accounts", icon: Users },
  { name: "Media", href: "/media", icon: Image },
];

const secondary = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        background: "var(--surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--topnav-height)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid var(--border-subtle)",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: "var(--accent)",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={14} color="white" />
        </div>
        <span style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "-0.01em" }}>
          SocialFlow
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "7px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13.5px",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--text)" : "var(--text-muted)",
                background: isActive ? "var(--surface-raised)" : "transparent",
                textDecoration: "none",
                transition: "background 150ms, color 150ms",
              }}
              className={cn("sidebar-link", isActive && "active")}
            >
              <item.icon
                size={15}
                style={{ color: isActive ? "var(--accent)" : "var(--text-subtle)", flexShrink: 0 }}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "8px", borderTop: "1px solid var(--border-subtle)" }}>
        {secondary.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "7px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13.5px",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--text)" : "var(--text-muted)",
                background: isActive ? "var(--surface-raised)" : "transparent",
                textDecoration: "none",
                transition: "background 150ms, color 150ms",
              }}
            >
              <item.icon size={15} style={{ color: isActive ? "var(--accent)" : "var(--text-subtle)", flexShrink: 0 }} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <style>{`
        .sidebar-link:hover {
          background: var(--surface-hover) !important;
          color: var(--text) !important;
        }
        .sidebar-link:hover svg {
          color: var(--text-muted) !important;
        }
        .sidebar-link.active:hover {
          background: var(--surface-raised) !important;
        }
      `}</style>
    </aside>
  );
}
