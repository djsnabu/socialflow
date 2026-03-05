"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization Name</label>
            <Input placeholder="My Organization" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Timezone</label>
            <Input value="Europe/Helsinki" readOnly className="mt-1" />
          </div>
          <Button>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Default Language</label>
            <Input value="fi" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Default Tone</label>
            <Input placeholder="professional, friendly..." className="mt-1" />
          </div>
          <Button>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
