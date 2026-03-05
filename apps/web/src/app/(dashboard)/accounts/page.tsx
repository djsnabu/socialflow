"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle, XCircle, Trash2, Power } from "lucide-react";
import { PLATFORMS, type Platform } from "@socialflow/shared";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const PLATFORM_INFO: Record<Platform, { name: string; icon: string; color: string }> = {
  x: { name: "X (Twitter)", icon: "𝕏", color: "#000000" },
  linkedin: { name: "LinkedIn", icon: "in", color: "#0077B5" },
  bluesky: { name: "Bluesky", icon: "🦋", color: "#0085FF" },
  facebook: { name: "Facebook", icon: "f", color: "#1877F2" },
  instagram: { name: "Instagram", icon: "📷", color: "#E4405F" },
};

interface ConnectedAccount {
  id: string;
  platform: Platform;
  platformUsername: string;
  displayName: string;
  avatarUrl: string | null;
  isActive: boolean;
}

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [blueskyModal, setBlueskyModal] = useState(false);
  const [blueskyHandle, setBlueskyHandle] = useState("");
  const [blueskyPassword, setBlueskyPassword] = useState("");
  const [blueskyLoading, setBlueskyLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check URL params for OAuth results
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) {
      setMessage({ type: "success", text: `${connected.toUpperCase()} connected successfully!` });
    } else if (error) {
      setMessage({ type: "error", text: `Connection failed: ${error.replace(/_/g, " ")}` });
    }
  }, [searchParams]);

  // Get active organization
  useEffect(() => {
    authClient.organization.list().then((res) => {
      if (res.data?.length) {
        setOrgId(res.data[0].id);
      }
    });
  }, []);

  const fetchAccounts = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await apiFetch<{ success: boolean; data: ConnectedAccount[] }>(
        "/api/accounts",
        { organizationId: orgId }
      );
      setAccounts(res.data);
    } catch {
      console.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnect = async (platform: Platform) => {
    if (platform === "bluesky") {
      setBlueskyModal(true);
      return;
    }

    if (!orgId) return;

    try {
      const res = await apiFetch<{ success: boolean; authUrl: string }>(
        `/oauth/start/${platform}?orgId=${orgId}`
      );
      window.location.href = res.authUrl;
    } catch (err) {
      setMessage({ type: "error", text: `Failed to start ${platform} connection` });
    }
  };

  const handleBlueskyConnect = async () => {
    if (!orgId) return;
    setBlueskyLoading(true);
    try {
      await apiFetch("/oauth/connect/bluesky", {
        method: "POST",
        organizationId: orgId,
        body: JSON.stringify({ handle: blueskyHandle, appPassword: blueskyPassword }),
      });
      setBlueskyModal(false);
      setBlueskyHandle("");
      setBlueskyPassword("");
      setMessage({ type: "success", text: "Bluesky connected successfully!" });
      fetchAccounts();
    } catch {
      setMessage({ type: "error", text: "Bluesky connection failed. Check your handle and app password." });
    } finally {
      setBlueskyLoading(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!orgId) return;
    try {
      await apiFetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
        organizationId: orgId,
      });
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      setMessage({ type: "success", text: "Account disconnected" });
    } catch {
      setMessage({ type: "error", text: "Failed to disconnect account" });
    }
  };

  const handleToggle = async (accountId: string) => {
    if (!orgId) return;
    try {
      const res = await apiFetch<{ success: boolean; data: ConnectedAccount }>(
        `/api/accounts/${accountId}/toggle`,
        { method: "PATCH", organizationId: orgId }
      );
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, isActive: res.data.isActive } : a))
      );
    } catch {
      setMessage({ type: "error", text: "Failed to toggle account" });
    }
  };

  const getAccountForPlatform = (platform: Platform) =>
    accounts.find((a) => a.platform === platform);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Connected Accounts</h1>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const info = PLATFORM_INFO[platform];
          const account = getAccountForPlatform(platform);

          return (
            <Card key={platform}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white text-lg"
                    style={{ backgroundColor: info.color }}
                  >
                    {info.icon}
                  </span>
                  {info.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {account ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">@{account.platformUsername}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(account.id)}
                      >
                        <Power className="h-4 w-4" />
                        {account.isActive ? "Active" : "Paused"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500"
                        onClick={() => handleDisconnect(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <XCircle className="h-4 w-4" />
                      Not connected
                    </div>
                    <Button size="sm" onClick={() => handleConnect(platform)} disabled={loading}>
                      <Plus className="h-4 w-4" />
                      Connect
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bluesky Modal */}
      {blueskyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Connect Bluesky</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Bluesky uses app passwords instead of OAuth. Create one at{" "}
                <a
                  href="https://bsky.app/settings/app-passwords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >
                  bsky.app/settings/app-passwords
                </a>
              </p>
              <div>
                <label className="text-sm font-medium">Handle</label>
                <Input
                  value={blueskyHandle}
                  onChange={(e) => setBlueskyHandle(e.target.value)}
                  placeholder="yourname.bsky.social"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">App Password</label>
                <Input
                  type="password"
                  value={blueskyPassword}
                  onChange={(e) => setBlueskyPassword(e.target.value)}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setBlueskyModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBlueskyConnect} disabled={blueskyLoading || !blueskyHandle || !blueskyPassword}>
                  {blueskyLoading ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
