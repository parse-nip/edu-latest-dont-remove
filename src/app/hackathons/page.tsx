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
import { HackathonDemo } from "@/components/hackathons/hackathon-demo";

export default function HackathonsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hackathons</h1>
          <p className="text-muted-foreground">Join events, manage teams, and experience the full flow.</p>
        </div>
        <Button asChild>
          <Link href="/hackathons/create">Create New Hackathon</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Hackathons</CardTitle>
          <CardDescription>Explore ongoing events and demos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/hackathons/demo">View Demo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}