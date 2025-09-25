"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, Users, Trophy, UploadCloud, Megaphone, Gavel, Scale, BookOpen, Users as UsersIcon, FileText, Users2, Award, Users3, Star, UsersRound, HelpCircle, FileText as FileTextIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { notFound } from "next/navigation";

interface Hackathon {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  host: string;
  status: "upcoming" | "active" | "past";
  teams: number;
  maxTeams: number;
  rules: string;
  // Add more as needed from setup
}

const mockHackathon: Hackathon = {
  id: "1",
  name: "Fall Build Sprint",
  description: "AI-powered rapid prototyping weekend for students.",
  start: "Oct 12",
  end: "Oct 13",
  host: "Your School",
  status: "upcoming",
  teams: 0,
  maxTeams: 50,
  rules: "Teams up to 4, start from scratch, code of conduct applies.",
};

const teams = [
  { id: 1, name: "Team Atlas", members: ["Alex", "Priya", "Jordan"], points: 180 },
  { id: 2, name: "ByteBuddies", members: ["Taylor", "Morgan"], points: 165 },
];

const submissions = [
  { id: 1, team: "Team Atlas", title: "Classroom Copilot", status: "Pending" },
  { id: 2, team: "ByteBuddies", title: "HackBoard", status: "Reviewed" },
];

const judges = ["Dana", "Chris", "Sam", "Lee", "Morgan", "Taylor"];

export default function HackathonDetail({ params }: { params: { id: string } }) {
  if (params.id !== "1") notFound(); // Placeholder; later fetch from DB

  const hackathon = mockHackathon;

  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "schedule", label: "Schedule", icon: CalendarDays },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "rules", label: "Rules", icon: Scale },
    { id: "teams", label: "Teams", icon: UsersIcon },
    { id: "submissions", label: "Submissions", icon: UploadCloud },
    { id: "judges", label: "Judges", icon: Users2 },
    { id: "judging", label: "Judging", icon: Gavel },
    { id: "sponsors", label: "Sponsors", icon: Award },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "resources", label: "Resources", icon: FileTextIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Event Dashboard</CardTitle>
              <CardDescription>Manage your hackathon. Participants see a join/participate view (auth-gated later).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Status</h3>
                  <Badge variant="outline">{hackathon.status}</Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Participants</h3>
                  <Button size="sm" variant="outline">Invite via Link</Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this dashboard to update schedules, review submissions, and score teams. Connect Daytona for dev envs and OpenRouter for AI judging.
              </p>
            </CardContent>
          </Card>
        );
      case "schedule":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Event Schedule</CardTitle>
              <CardDescription>Times in local timezone. Edit as organizer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>09:00</TableCell>
                    <TableCell>Check-in & Breakfast</TableCell>
                    <TableCell>Lobby</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>10:00</TableCell>
                    <TableCell>Kickoff & Team Formation</TableCell>
                    <TableCell>Main Hall</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>13:00</TableCell>
                    <TableCell>Workshop: Shipping Fast</TableCell>
                    <TableCell>Room 201</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>17:00</TableCell>
                    <TableCell>Submission Deadline</TableCell>
                    <TableCell>Portal</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>18:00</TableCell>
                    <TableCell>Final Demos & Awards</TableCell>
                    <TableCell>Main Hall</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case "announcements":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Announcements</CardTitle>
              <CardDescription>Post updates for participants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea placeholder="New announcement..." rows={3} />
                <Button size="sm"><Megaphone className="h-4 w-4 mr-2" /> Post</Button>
              </div>
              <div className="space-y-3">
                <div className="rounded-md border p-3 bg-accent/50">
                  <div className="font-medium">Welcome Message</div>
                  <p className="text-sm text-muted-foreground">Wi-Fi: HACK2025. Snacks in lobby. Follow code of conduct.</p>
                </div>
                <div className="rounded-md border p-3">
                  <div className="font-medium">Deadline Reminder</div>
                  <p className="text-sm text-muted-foreground">Submissions due 5:00 PM. Late entries not accepted.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "rules":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" /> Rules</CardTitle>
              <CardDescription>{hackathon.rules}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={hackathon.rules}
                placeholder="Update rules here..."
                rows={6}
                className="mb-4"
              />
              <Button variant="outline">Save Rules</Button>
            </CardContent>
          </Card>
        );
      case "teams":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Teams ({hackathon.teams} / {hackathon.maxTeams})</CardTitle>
              <CardDescription>Approve joins or create teams.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teams.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.members.join(", ")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{t.points} pts</Badge>
                      <Button variant="outline" size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
                {teams.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No teams yet. Share join link to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      case "submissions":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>Review projects (connect OpenRouter for AI feedback later).</CardDescription>
              </div>
              <Button size="sm"><UploadCloud className="mr-2 h-4 w-4" /> New Submission</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.team}</TableCell>
                      <TableCell className="font-medium">{s.title}</TableCell>
                      <TableCell><Badge variant={s.status === "Reviewed" ? "outline" : "secondary"}>{s.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline">Review</Button>
                          <Button size="sm">Score</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {submissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions yet. Deadline: {hackathon.end} 5:00 PM.
                </div>
              )}
            </CardContent>
          </Card>
        );
      case "judges":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Judges Panel</CardTitle>
              <CardDescription>Assign judges and view scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {judges.map((name, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback>{name[0]}</AvatarFallback></Avatar>
                        <div>
                          <CardTitle className="text-base">{name}</CardTitle>
                          <CardDescription>Industry Judge</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Submissions Reviewed</span>
                        <Badge variant="secondary">5/25</Badge>
                      </div>
                      <Progress value={20} className="mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button className="mt-4" variant="outline">Invite Judge</Button>
            </CardContent>
          </Card>
        );
      case "judging":
        return (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5" /> Judging Rubric</CardTitle>
                <CardDescription>Criteria for all judges.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Criterion</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Max</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Innovation</TableCell>
                      <TableCell>Originality and creativity</TableCell>
                      <TableCell className="text-right">10</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Technical</TableCell>
                      <TableCell>Complexity and quality</TableCell>
                      <TableCell className="text-right">10</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Impact</TableCell>
                      <TableCell>Real-world value</TableCell>
                      <TableCell className="text-right">10</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Presentation</TableCell>
                      <TableCell>Demo clarity</TableCell>
                      <TableCell className="text-right">10</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enter Scores</CardTitle>
                <CardDescription>For selected submission.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Submission ID or Team" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Innovation (0-10)" />
                  <Input placeholder="Technical (0-10)" />
                  <Input placeholder="Impact (0-10)" />
                  <Input placeholder="Presentation (0-10)" />
                </div>
                <Textarea placeholder="Feedback..." rows={3} />
                <Button className="w-full">Submit Scores</Button>
              </CardContent>
            </Card>
          </div>
        );
      case "sponsors":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Sponsors</CardTitle>
              <CardDescription>Add your partners.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input placeholder="Sponsor name or logo URL" className="mb-4" />
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Base44</Badge>
                <Badge variant="secondary">Daytona</Badge>
                {/* Dynamic later */}
              </div>
              <Button variant="outline" size="sm" className="mt-2">Add Sponsor</Button>
            </CardContent>
          </Card>
        );
      case "faqs":
        return (
          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>Common questions from participants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-medium">How do I join?</h4>
                <p className="text-sm text-muted-foreground">Use the join link or contact organizer.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">Can I work solo?</h4>
                <p className="text-sm text-muted-foreground">Yes, teams up to 4 encouraged.</p>
              </div>
              <Input placeholder="Add FAQ question" className="mt-4" />
              <Textarea placeholder="Answer..." rows={2} className="mt-2" />
              <Button variant="outline" size="sm">Add FAQ</Button>
            </CardContent>
          </Card>
        );
      case "resources":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Share APIs, templates with participants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border p-3">
                <div className="font-medium">Starter Template</div>
                <p className="text-sm text-muted-foreground">GitHub repo for quick starts. (Link placeholder)</p>
              </div>
              <div className="rounded-md border p-3">
                <div className="font-medium">API Docs</div>
                <p className="text-sm text-muted-foreground">OpenRouter integration guide.</p>
              </div>
              <Button variant="outline" size="sm">Add Resource</Button>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{hackathon.name}</h1>
          <p className="text-muted-foreground mt-1">{hackathon.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{hackathon.start} – {hackathon.end}</span>
            <Badge variant="secondary">{hackathon.host}</Badge>
            <Badge variant={hackathon.status === "active" ? "default" : "outline"}>{hackathon.status.toUpperCase()}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/hackathons">← Back</Link>
          </Button>
          <Button>Edit Event</Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="text-sm text-muted-foreground">
          Teams: {hackathon.teams} / {hackathon.maxTeams}
        </div>
        <Progress value={(hackathon.teams / hackathon.maxTeams) * 100} className="w-24" />
      </div>

      <div className="flex gap-6">
        <aside className="w-64 hidden lg:block bg-background border rounded-lg p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="mt-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}