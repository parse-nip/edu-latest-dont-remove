import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, Users, Trophy, UploadCloud, Megaphone, Gavel, Scale } from "lucide-react";
import Link from "next/link";

export default function HackathonsPage() {
  // ... keep existing data arrays (upcoming, active, etc.) but they'll be used in detail pages ...

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Hackathons</h1>
          <p className="text-muted-foreground">Create and manage your events. Authenticate later to personalize.</p>
        </div>
        <Button asChild>
          <Link href="/hackathons/create">Create New Hackathon</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>Organized or joined hackathons appear here (placeholder).</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="mx-auto h-12 w-12 mb-4" />
            <h3 className="font-semibold mb-2">No hackathons yet</h3>
            <p>Create your first event to get started—set up dates, rules, and invite participants.</p>
          </div>
        </CardContent>
      </Card>

      {/* Later: Dynamic list from DB */}
      {/* <div className="grid gap-6 md:grid-cols-2">
        {userHackathons.map(h => (
          <Card key={h.id}>
            <CardHeader>
              <CardTitle>{h.name}</CardTitle>
              <CardDescription>{h.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild><Link href={`/hackathons/${h.id}`}>Manage</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div> */}
    </div>
  );
}