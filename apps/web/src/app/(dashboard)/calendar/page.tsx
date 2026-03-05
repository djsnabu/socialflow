"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Adjust for Monday start
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Content Calendar</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(new Date(year, month - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle>
              {monthNames[month]} {year}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(new Date(year, month + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-[var(--muted-foreground)]"
              >
                {day}
              </div>
            ))}
            {days.map((day, i) => (
              <div
                key={i}
                className={`min-h-[80px] rounded-md border border-[var(--border)] p-2 text-sm ${
                  day ? "cursor-pointer hover:bg-[var(--accent)]" : "bg-[var(--muted)]"
                }`}
              >
                {day && <span className="font-medium">{day}</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
