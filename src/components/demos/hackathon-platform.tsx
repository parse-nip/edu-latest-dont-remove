"use client"

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  Trophy,
  Plus,
  Trash2,
  Bell,
  FileText,
  Gavel,
  HelpCircle,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
}

interface Rule {
  id: string;
  title: string;
  description: string;
}

interface JudgingCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface Judge {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
}

interface Team {
  id: string;
  name: string;
  members: string[];
  project: string;
  status: "registered" | "submitted" | "judging";
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface HackathonData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  maxTeamSize: number;
  announcements: Announcement[];
  rules: Rule[];
  judgingCriteria: JudgingCriteria[];
  judges: Judge[];
  teams: Team[];
  faqs: FAQ[];
}

export const HackathonPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"participant" | "admin">(
    "participant"
  );
  const [currentRole, setCurrentRole] = useState<string>("participant");
  
  // Read role from localStorage on mount
  useEffect(() => {
    try {
      const role = localStorage.getItem("demoRole") || "participant";
      setCurrentRole(role);
    } catch {}
  }, []);

  // Enforce non-admin tab when not organizer
  useEffect(() => {
    if (currentRole !== "organizer" && activeTab === "admin") {
      setActiveTab("participant");
    }
  }, [currentRole, activeTab]);

  const [hackathonData, setHackathonData] = useState<HackathonData>({
    name: "TechHack 2024",
    description: "Build the future with cutting-edge technology",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    maxParticipants: 200,
    maxTeamSize: 4,
    announcements: [
      {
        id: "1",
        title: "Welcome to TechHack 2024!",
        content:
          "Registration is now open. Get ready for an amazing weekend of innovation!",
        timestamp: "2024-02-15T10:00:00Z",
        priority: "high",
      },
      {
        id: "2",
        title: "Venue Information",
        content:
          "The hackathon will be held at Tech Center, 123 Innovation Drive.",
        timestamp: "2024-02-20T14:30:00Z",
        priority: "medium",
      },
    ],
    rules: [
      {
        id: "1",
        title: "Team Formation",
        description:
          "Teams can have 1-4 members. You can form teams before or during the event.",
      },
      {
        id: "2",
        title: "Project Requirements",
        description:
          "All code must be written during the hackathon. You can use existing APIs and libraries.",
      },
      {
        id: "3",
        title: "Submission Deadline",
        description:
          "All projects must be submitted by Sunday 6 PM. Late submissions will not be accepted.",
      },
    ],
    judgingCriteria: [
      {
        id: "1",
        name: "Innovation",
        description: "How creative and original is the solution?",
        weight: 30,
      },
      {
        id: "2",
        name: "Technical Implementation",
        description: "Quality of code and technical execution",
        weight: 25,
      },
      {
        id: "3",
        name: "Impact",
        description: "Potential real-world impact and usefulness",
        weight: 25,
      },
      {
        id: "4",
        name: "Presentation",
        description: "Quality of demo and pitch",
        weight: 20,
      },
    ],
    judges: [
      {
        id: "1",
        name: "Sarah Chen",
        title: "Senior Software Engineer",
        company: "Google",
        expertise: ["AI/ML", "Backend Development"],
      },
      {
        id: "2",
        name: "Mike Rodriguez",
        title: "Product Manager",
        company: "Microsoft",
        expertise: ["Product Strategy", "UX Design"],
      },
    ],
    teams: [
      {
        id: "1",
        name: "Code Warriors",
        members: ["Alice Johnson", "Bob Smith", "Carol Davis"],
        project: "AI-Powered Study Assistant",
        status: "registered",
      },
      {
        id: "2",
        name: "Tech Innovators",
        members: ["David Wilson", "Eva Brown"],
        project: "Sustainable Transport App",
        status: "submitted",
      },
    ],
    faqs: [
      {
        id: "1",
        question: "What should I bring to the hackathon?",
        answer:
          "Bring your laptop, charger, and any hardware you might need. We'll provide food, drinks, and WiFi.",
      },
      {
        id: "2",
        question: "Can I participate remotely?",
        answer:
          "This is an in-person event, but we may consider hybrid participation for special circumstances.",
      },
      {
        id: "3",
        question: "What are the prizes?",
        answer:
          "First place: $5000, Second place: $3000, Third place: $1000, plus various sponsor prizes.",
      },
    ],
  });

  const [newAnnouncement, setNewAnnouncement] = useState<{
    title: string;
    content: string;
    priority: "low" | "medium" | "high";
  }>({ title: "", content: "", priority: "medium" });
  const [newRule, setNewRule] = useState({ title: "", description: "" });
  const [newCriteria, setNewCriteria] = useState({
    name: "",
    description: "",
    weight: 0,
  });
  const [newJudge, setNewJudge] = useState({
    name: "",
    title: "",
    company: "",
    expertise: "",
  });
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });

  const addAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      const announcement: Announcement = {
        id: Date.now().toString(),
        ...newAnnouncement,
        timestamp: new Date().toISOString(),
      };
      setHackathonData((prev) => ({
        ...prev,
        announcements: [announcement, ...prev.announcements],
      }));
      setNewAnnouncement({ title: "", content: "", priority: "medium" });
    }
  };

  const addRule = () => {
    if (newRule.title && newRule.description) {
      const rule: Rule = {
        id: Date.now().toString(),
        ...newRule,
      };
      setHackathonData((prev) => ({
        ...prev,
        rules: [...prev.rules, rule],
      }));
      setNewRule({ title: "", description: "" });
    }
  };

  const addCriteria = () => {
    if (newCriteria.name && newCriteria.description && newCriteria.weight > 0) {
      const criteria: JudgingCriteria = {
        id: Date.now().toString(),
        ...newCriteria,
      };
      setHackathonData((prev) => ({
        ...prev,
        judgingCriteria: [...prev.judgingCriteria, criteria],
      }));
      setNewCriteria({ name: "", description: "", weight: 0 });
    }
  };

  const addJudge = () => {
    if (newJudge.name && newJudge.title && newJudge.company) {
      const judge: Judge = {
        id: Date.now().toString(),
        ...newJudge,
        expertise: newJudge.expertise
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e),
      };
      setHackathonData((prev) => ({
        ...prev,
        judges: [...prev.judges, judge],
      }));
      setNewJudge({ name: "", title: "", company: "", expertise: "" });
    }
  };

  const addFAQ = () => {
    if (newFAQ.question && newFAQ.answer) {
      const faq: FAQ = {
        id: Date.now().toString(),
        ...newFAQ,
      };
      setHackathonData((prev) => ({
        ...prev,
        faqs: [...prev.faqs, faq],
      }));
      setNewFAQ({ question: "", answer: "" });
    }
  };

  const ParticipantView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">{hackathonData.name}</h1>
        <p className="text-xl text-muted-foreground">{hackathonData.description}</p>
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(hackathonData.startDate).toLocaleDateString()} -
            {" "}
            {new Date(hackathonData.endDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Max {hackathonData.maxParticipants} participants
          </div>
        </div>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hackathonData.announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="border-l-4 border-primary pl-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{announcement.title}</h3>
                <Badge
                  variant={
                    announcement.priority === "high"
                      ? "destructive"
                      : announcement.priority === "medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {announcement.priority}
                </Badge>
              </div>
              <p className="text-muted-foreground">{announcement.content}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(announcement.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rules & Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hackathonData.rules.map((rule, index) => (
            <div key={rule.id} className="space-y-2">
              <h3 className="font-semibold">
                {index + 1}. {rule.title}
              </h3>
              <p className="text-muted-foreground">{rule.description}</p>
              {index < hackathonData.rules.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Judging Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Judging Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hackathonData.judgingCriteria.map((criteria) => (
            <div key={criteria.id} className="flex justify-between items-start">
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold">{criteria.name}</h3>
                <p className="text-muted-foreground">{criteria.description}</p>
              </div>
              <Badge variant="outline">{criteria.weight}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Judges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Judges
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {hackathonData.judges.map((judge) => (
            <div key={judge.id} className="space-y-2 p-4 border rounded-lg">
              <h3 className="font-semibold">{judge.name}</h3>
              <p className="text-sm text-muted-foreground">
                {judge.title} at {judge.company}
              </p>
              <div className="flex flex-wrap gap-1">
                {judge.expertise.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {hackathonData.faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );

  const AdminView = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Hackathon Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Hackathon Name</Label>
              <Input
                id="name"
                value={hackathonData.name}
                onChange={(e) =>
                  setHackathonData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={hackathonData.maxParticipants}
                onChange={(e) =>
                  setHackathonData((prev) => ({
                    ...prev,
                    maxParticipants: parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={hackathonData.startDate}
                onChange={(e) =>
                  setHackathonData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={hackathonData.endDate}
                onChange={(e) =>
                  setHackathonData((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={hackathonData.description}
              onChange={(e) =>
                setHackathonData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Manage Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Input
              placeholder="Announcement title"
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Textarea
              placeholder="Announcement content"
              value={newAnnouncement.content}
              onChange={(e) =>
                setNewAnnouncement((prev) => ({ ...prev, content: e.target.value }))
              }
            />
            <div className="flex gap-2">
              <Select
                value={newAnnouncement.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setNewAnnouncement((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addAnnouncement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {hackathonData.announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <h4 className="font-medium">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {announcement.content}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manage Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Input
              placeholder="Rule title"
              value={newRule.title}
              onChange={(e) =>
                setNewRule((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Textarea
              placeholder="Rule description"
              value={newRule.description}
              onChange={(e) =>
                setNewRule((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <Button onClick={addRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
          <div className="space-y-2">
            {hackathonData.rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <h4 className="font-medium">{rule.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manage Judging Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Judging Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Input
              placeholder="Criteria name"
              value={newCriteria.name}
              onChange={(e) =>
                setNewCriteria((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Textarea
              placeholder="Criteria description"
              value={newCriteria.description}
              onChange={(e) =>
                setNewCriteria((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <Input
              type="number"
              placeholder="Weight (%)"
              value={newCriteria.weight || ""}
              onChange={(e) =>
                setNewCriteria((prev) => ({
                  ...prev,
                  weight: parseInt(e.target.value) || 0,
                }))
              }
            />
            <Button onClick={addCriteria}>
              <Plus className="h-4 w-4 mr-2" />
              Add Criteria
            </Button>
          </div>
          <div className="space-y-2">
            {hackathonData.judgingCriteria.map((criteria) => (
              <div
                key={criteria.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <h4 className="font-medium">
                    {criteria.name} ({criteria.weight}%)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {criteria.description}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manage Judges */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Judges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Judge name"
              value={newJudge.name}
              onChange={(e) =>
                setNewJudge((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              placeholder="Title"
              value={newJudge.title}
              onChange={(e) =>
                setNewJudge((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Input
              placeholder="Company"
              value={newJudge.company}
              onChange={(e) =>
                setNewJudge((prev) => ({ ...prev, company: e.target.value }))
              }
            />
            <Input
              placeholder="Expertise (comma-separated)"
              value={newJudge.expertise}
              onChange={(e) =>
                setNewJudge((prev) => ({ ...prev, expertise: e.target.value }))
              }
            />
          </div>
          <Button onClick={addJudge}>
            <Plus className="h-4 w-4 mr-2" />
            Add Judge
          </Button>
          <div className="grid gap-4 md:grid-cols-2">
            {hackathonData.judges.map((judge) => (
              <div
                key={judge.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <h4 className="font-medium">{judge.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {judge.title} at {judge.company}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manage Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Teams ({hackathonData.teams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hackathonData.teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div>
                  <h4 className="font-medium">{team.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Members: {team.members.join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Project: {team.project}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      team.status === "submitted" ? "default" : "secondary"
                    }
                  >
                    {team.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    {/* Edit placeholder */}
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manage FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Manage FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Input
              placeholder="Question"
              value={newFAQ.question}
              onChange={(e) =>
                setNewFAQ((prev) => ({ ...prev, question: e.target.value }))
              }
            />
            <Textarea
              placeholder="Answer"
              value={newFAQ.answer}
              onChange={(e) =>
                setNewFAQ((prev) => ({ ...prev, answer: e.target.value }))
              }
            />
            <Button onClick={addFAQ}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
          <div className="space-y-2">
            {hackathonData.faqs.map((faq) => (
              <div
                key={faq.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <h4 className="font-medium">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "participant" | "admin")
          }
          className="w-full"
        >
          <TabsList className="grid w-full mb-8" style={{ gridTemplateColumns: currentRole === "organizer" ? "1fr 1fr" : "1fr" }}>
            <TabsTrigger value="participant">Participant View</TabsTrigger>
            {currentRole === "organizer" && (
              <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="participant">
            <ParticipantView />
          </TabsContent>

          {currentRole === "organizer" && (
            <TabsContent value="admin">
              <AdminView />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};