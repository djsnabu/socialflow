"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Clock, Globe } from "lucide-react";
import { PLATFORMS, PLATFORM_LIMITS, type Platform } from "@socialflow/shared";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const PLATFORM_ICONS: Record<Platform, string> = {
  x: "𝕏",
  linkedin: "in",
  bluesky: "🦋",
  facebook: "f",
  instagram: "📷",
};

export default function ComposePage() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<
    { platform: Platform; content: string; hashtags: string[] }[]
  >([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    authClient.organization.list().then((res) => {
      if (res.data?.length) setOrgId(res.data[0].id);
    });
  }, []);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerate = async () => {
    if (!aiPrompt || selectedPlatforms.length === 0) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: aiPrompt,
          platforms: selectedPlatforms,
          language: "fi",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVariants(data.data.variants);
        if (data.data.variants.length > 0) {
          setContent(data.data.variants[0].content);
        }
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!orgId || !content || selectedPlatforms.length === 0) return;
    setPublishing(true);
    setMessage(null);

    try {
      const platformVariants = variants.length > 0
        ? variants
        : selectedPlatforms.map((p) => ({ platform: p, content, hashtags: [] }));

      await apiFetch("/api/posts", {
        method: "POST",
        organizationId: orgId,
        body: JSON.stringify({
          content,
          platformVariants,
          status: "queued",
        }),
      });

      setMessage({ type: "success", text: "Post created and queued for publishing!" });
      setContent("");
      setVariants([]);
      setAiPrompt("");
      setSelectedPlatforms([]);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to create post" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Compose</h1>

      {message && (
        <div className={`rounded-md p-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </div>
      )}

      {/* Platform selector */}
      <div className="flex gap-2">
        {PLATFORMS.map((platform) => (
          <button
            key={platform}
            onClick={() => togglePlatform(platform)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
              selectedPlatforms.includes(platform)
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
            }`}
          >
            {PLATFORM_ICONS[platform]}
          </button>
        ))}
      </div>

      {/* AI Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Describe what you want to post about..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleGenerate}
            disabled={!aiPrompt || selectedPlatforms.length === 0 || isGenerating}
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </CardContent>
      </Card>

      {/* Content editor */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Write your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
          <div className="text-sm text-[var(--muted-foreground)]">
            {content.length} characters
          </div>
        </CardContent>
      </Card>

      {/* Platform variants */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Platform Variants</h2>
          {variants.map((variant) => (
            <Card key={variant.platform}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span>{PLATFORM_ICONS[variant.platform]}</span>
                  {variant.platform}
                  <span className="text-sm font-normal text-[var(--muted-foreground)]">
                    {variant.content.length}/{PLATFORM_LIMITS[variant.platform].maxChars}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{variant.content}</p>
                {variant.hashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {variant.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--primary)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handlePublish} disabled={!content || selectedPlatforms.length === 0 || publishing}>
          <Send className="h-4 w-4" />
          {publishing ? "Publishing..." : "Publish Now"}
        </Button>
        <Button variant="outline">
          <Clock className="h-4 w-4" />
          Schedule
        </Button>
        <Button variant="outline">
          <Globe className="h-4 w-4" />
          Add to Queue
        </Button>
      </div>
    </div>
  );
}
