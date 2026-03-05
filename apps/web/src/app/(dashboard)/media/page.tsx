"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <Button>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="text-center text-[var(--muted-foreground)]">
            <Upload className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">No media uploaded yet</p>
            <p className="text-sm">Upload images to use in your posts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
