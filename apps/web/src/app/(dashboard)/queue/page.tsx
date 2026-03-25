"use client";

import { useState } from "react";
import { Clock, List, CalendarDays, Plus } from "lucide-react";
import Link from "next/link";

type Tab = "queue" | "drafts" | "sent";

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<Tab>("queue");
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "17px", fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
          All channels
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* View toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "2px",
              gap: "2px",
            }}
          >
            <button
              onClick={() => setView("list")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontSize: "12.5px",
                fontWeight: 500,
                background: view === "list" ? "var(--surface-raised)" : "transparent",
                color: view === "list" ? "var(--text)" : "var(--text-muted)",
                transition: "all 150ms",
              }}
            >
              <List size={13} /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontSize: "12.5px",
                fontWeight: 500,
                background: view === "calendar" ? "var(--surface-raised)" : "transparent",
                color: view === "calendar" ? "var(--text)" : "var(--text-muted)",
                transition: "all 150ms",
              }}
            >
              <CalendarDays size={13} /> Calendar
            </button>
          </div>

          <Link
            href="/compose"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              background: "var(--accent)",
              color: "white",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 150ms",
            }}
          >
            <Plus size={14} />
            New post
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: "24px",
          gap: "0",
        }}
      >
        {(["queue", "drafts", "sent"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === tab ? "var(--text)" : "var(--text-muted)",
              fontSize: "13.5px",
              fontWeight: activeTab === tab ? 500 : 400,
              cursor: "pointer",
              marginBottom: "-1px",
              transition: "color 150ms",
              textTransform: "capitalize",
            }}
          >
            {tab}
            {tab === "sent" && (
              <span
                style={{
                  marginLeft: "6px",
                  fontSize: "11px",
                  color: "var(--text-subtle)",
                  fontWeight: 400,
                }}
              >
                0
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 0",
          gap: "12px",
        }}
      >
        {/* Illustration placeholder — stacked post cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px", opacity: 0.35 }}>
          {[92, 76, 60].map((w, i) => (
            <div
              key={i}
              style={{
                width: `${w + 160}px`,
                height: 44,
                background: "var(--surface-raised)",
                borderRadius: "var(--radius)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "0 12px",
              }}
            >
              <div style={{ width: 28, height: 28, background: "var(--border)", borderRadius: "6px" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ width: `${w}%`, height: 7, background: "var(--border)", borderRadius: 4 }} />
                <div style={{ width: `${w * 0.6}%`, height: 7, background: "var(--border)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", margin: 0 }}>
          No posts scheduled
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          Schedule some posts and they will appear here
        </p>

        <Link
          href="/compose"
          style={{
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 18px",
            background: "var(--accent)",
            color: "white",
            borderRadius: "var(--radius-sm)",
            fontSize: "13.5px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "background 150ms",
          }}
        >
          <Plus size={14} />
          New post
        </Link>
      </div>
    </div>
  );
}
