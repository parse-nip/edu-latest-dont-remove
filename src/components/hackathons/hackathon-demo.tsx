"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const HackathonDemo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hackathon Demo</CardTitle>
        <CardDescription>
          Demo functionality temporarily disabled during Supabase migration.
          Authentication and full database integration now available through Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-muted-foreground">
          The demo will be restored with full Supabase integration in the next update.
        </p>
      </CardContent>
    </Card>
  );
};

export default HackathonDemo;