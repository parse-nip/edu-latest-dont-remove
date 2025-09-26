"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { Users, FileText, Trophy, Clock, Calendar, Target, Code, Presentation, Bell } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: "high" | "medium" | "low";
  timestamp: string;
}

interface Project {
  id: number;
  name: string;
  team: string;
  category: string;
  status: "submitted" | "in-review" | "scored";
  score?: number;
}

interface TeamInvitation {
  id: number;
  teamName: string;
  invitedBy: string;
  timestamp: string;
}

function HackathonDashboard() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the hackathon dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const announcements: Announcement[] = [
    {
      id: 1,
      title: "Submission Deadline Extended",
      content: "The project submission deadline has been extended to 11:59 PM tomorrow.",
      priority: "high",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      title: "Lunch Break",
      content: "Lunch will be served in the main hall from 12:00 PM to 1:00 PM.",
      priority: "medium",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      title: "WiFi Information",
      content: "WiFi Network: HackathonGuest, Password: hack2024",
      priority: "low",
      timestamp: "6 hours ago"
    }
  ];

  const projects: Project[] = [
    {
      id: 1,
      name: "EcoTracker",
      team: "Green Coders",
      category: "Sustainability",
      status: "submitted"
    },
    {
      id: 2,
      name: "HealthBot AI",
      team: "MedTech Innovators",
      category: "Healthcare",
      status: "in-review"
    },
    {
      id: 3,
      name: "FinanceFlow",
      team: "Money Masters",
      category: "Fintech",
      status: "scored",
      score: 85
    }
  ];

  const teamInvitations: TeamInvitation[] = [
    {
      id: 1,
      teamName: "Code Warriors",
      invitedBy: "John Doe",
      timestamp: "1 hour ago"
    },
    {
      id: 2,
      teamName: "Tech Titans",
      invitedBy: "Jane Smith",
      timestamp: "3 hours ago"
    }
  ];

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted": return "secondary";
      case "in-review": return "outline";  
      case "scored": return "default";
      default: return "secondary";
    }
  };

  const renderParticipantView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Teams</p>
              <p className="text-xl font-semibold">156</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Submissions</p>
              <p className="text-xl font-semibold">89</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Updates</p>
              <p className="text-xl font-semibold">12</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Time Left</p>
              <p className="text-xl font-semibold">18h 42m</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-l-2 border-primary/30 pl-4 py-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm">{announcement.title}</h4>
                  <Badge variant={getPriorityVariant(announcement.priority)} className="text-xs">
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{announcement.content}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">{announcement.timestamp}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div>
                  <h4 className="font-medium text-sm">{invitation.teamName}</h4>
                  <p className="text-sm text-muted-foreground">Invited by {invitation.invitedBy}</p>
                  <p className="text-xs text-muted-foreground/70">{invitation.timestamp}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderJudgeView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">To Review</p>
              <p className="text-xl font-semibold">23</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-semibold">15</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg. Time</p>
              <p className="text-xl font-semibold">12m</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects to Evaluate</CardTitle>
          <CardDescription>Review and score submitted projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{project.name}</h4>
                <p className="text-sm text-muted-foreground">{project.team} • {project.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusVariant(project.status)}>
                  {project.status.replace("-", " ")}
                </Badge>
                <Button size="sm">Review</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Judging Criteria</CardTitle>
          <CardDescription>Each project is evaluated on these four dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Innovation (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Originality and creativity</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Technical (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Quality and execution</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Impact (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Real-world value</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Presentation className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Presentation (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Demo and communication</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrganizerView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-xl font-semibold">342</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Submissions</p>
              <p className="text-xl font-semibold">89</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Judges</p>
              <p className="text-xl font-semibold">12</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-xl font-semibold">73%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>Manage your hackathon event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Bell className="h-4 w-4 mr-3" />
              Send Announcement
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-3" />
              Manage Teams
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Trophy className="h-4 w-4 mr-3" />
              View Submissions
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-3" />
              Export Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm">New team "AI Innovators" registered</p>
              <span className="text-xs text-muted-foreground ml-auto">5m ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">Project "EcoTracker" submitted</p>
              <span className="text-xs text-muted-foreground ml-auto">12m ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm">Judge completed review for "HealthBot AI"</p>
              <span className="text-xs text-muted-foreground ml-auto">25m ago</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Manage all event submissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{project.name}</h4>
                <p className="text-sm text-muted-foreground">{project.team} • {project.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusVariant(project.status)}>
                  {project.status.replace("-", " ")}
                </Badge>
                {project.score && (
                  <span className="text-sm font-medium">{project.score}/100</span>
                )}
                <Button size="sm" variant="outline">Manage</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.displayName}
          </p>
          <Badge variant="outline" className="mt-2">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>

        {user.role === "participant" && renderParticipantView()}
        {user.role === "judge" && renderJudgeView()}
        {user.role === "organizer" && renderOrganizerView()}
      </div>
    </div>
  );
}

export const HackathonPlatform: React.FC = () => {
  return <HackathonDashboard />;
};