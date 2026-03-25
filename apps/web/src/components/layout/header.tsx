"use client";

import { signOut } from "@/lib/auth-client";
import { LogOut, Plus, Bell } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header
      style={{
        height: "var(--topnav-height)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "var(--surface)",
        flexShrink: 0,
      }}
    >
      <div />

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* New post button */}
        <Link
          href="/compose"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "background 150ms",
          }}
          className="new-post-btn"
        >
          <Plus size={14} />
          New post
        </Link>

        {/* Notifications */}
        <button
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-sm)",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            transition: "background 150ms, color 150ms",
          }}
          className="icon-btn"
        >
          <Bell size={15} />
        </button>

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-sm)",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            transition: "background 150ms, color 150ms",
          }}
          className="icon-btn"
          title="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>

      <style>{`
        .new-post-btn:hover {
          background: var(--accent-hover) !important;
        }
        .icon-btn:hover {
          background: var(--surface-hover) !important;
          color: var(--text) !important;
        }
      `}</style>
    </header>
  );
}
