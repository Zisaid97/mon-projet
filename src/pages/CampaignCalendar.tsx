
import React from "react";
import { Header } from "@/components/layout/Header";
import { CampaignCalendarView } from "@/components/campaigns/CampaignCalendarView";

export default function CampaignCalendar() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">
          Calendrier des campagnes
        </h1>
        <CampaignCalendarView />
      </main>
    </div>
  );
}
