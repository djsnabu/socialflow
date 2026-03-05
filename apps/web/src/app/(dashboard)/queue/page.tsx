"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Pause, Play, Trash2 } from "lucide-react";

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Queue</h1>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4" />
          Edit Time Slots
        </Button>
      </div>

      {/* Queue slots overview */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="space-y-2">
                <div className="text-center text-sm font-medium">{day}</div>
                <div className="space-y-1">
                  <div className="rounded bg-[var(--secondary)] p-1 text-center text-xs">
                    09:00
                  </div>
                  <div className="rounded bg-[var(--secondary)] p-1 text-center text-xs">
                    12:00
                  </div>
                  <div className="rounded bg-[var(--secondary)] p-1 text-center text-xs">
                    17:00
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queued posts */}
      <Card>
        <CardHeader>
          <CardTitle>Queued Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-[var(--muted-foreground)] py-8">
            No posts in queue. Add posts from the Compose page.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
