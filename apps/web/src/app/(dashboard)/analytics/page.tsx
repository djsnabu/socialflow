"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, Heart, Share2 } from "lucide-react";

const stats = [
  { name: "Total Impressions", value: "0", icon: Eye },
  { name: "Total Engagement", value: "0", icon: Heart },
  { name: "Total Shares", value: "0", icon: Share2 },
  { name: "Posts Published", value: "0", icon: BarChart3 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-[var(--muted-foreground)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center text-[var(--muted-foreground)]">
            Analytics data will appear once you start publishing posts.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
