"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Fallbacks if some UI pieces are missing in the codebase
// If Select doesn't exist, we provide a basic fallback using native <select>
function FallbackSelect(props: {
  value: string | undefined;
  onValueChange: (v: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <select
      className={cn("h-10 w-full rounded-md border bg-background px-3 text-sm", props.className)}
      value={props.value}
      onChange={(e) => props.onValueChange(e.target.value)}
    >
      <option value="" disabled>
        {props.placeholder || "Select"}
      </option>
      {props.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

type Hackathon = {
  id: number;
  name: string;
  description?: string | null;
  startAt: number;
  endAt: number;
  status: string;
  maxTeamSize: number;
};

type Team = { id: number; name: string; hackathonId: number };

type Participant = { id: number; hackathonId: number; displayName: string; role: string };

type Submission = {
  id: number;
  title: string;
  teamId: number;
  repoUrl?: string | null;
  demoUrl?: string | null;
  description?: string | null;
  avgScore?: number;
  totalScore?: number;
};

type Judge = { id: number; hackathonId: number; name: string };

type LeaderboardRow = {
  submissionId: number;
  title: string;
  teamName: string;
  repoUrl?: string | null;
  demoUrl?: string | null;
  totalScore: number;
};

type Review = {
  id: number;
  rating: number;
  comments?: string | null;
  createdAt: number;
  submissionId: number;
  title: string;
  judgeId: number;
  judgeName: string;
  submissionAverageRating: number;
};

type EnhancedSubmission = Submission & {
  avgRating: number;
};

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const HackathonDemo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const selectedHackathon = useMemo(
    () => hackathons.find((h) => String(h.id) === selectedId),
    [hackathons, selectedId]
  );

  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("participant");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [ratingForm, setRatingForm] = useState({ rating: "", comments: "" });

  // Local state for actions
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("participant");
  const [joinedParticipant, setJoinedParticipant] = useState<Participant | null>(null);

  const [teamName, setTeamName] = useState("");
  const [teamJoinId, setTeamJoinId] = useState<string>("");

  const [judgeName, setJudgeName] = useState("");
  const [scoreSubmissionId, setScoreSubmissionId] = useState<string>("");
  const [judgeIdForScore, setJudgeIdForScore] = useState<string>("");
  const [scoresForm, setScoresForm] = useState({ innovation: "8", impact: "8", technical: "8" });

  // Demo personas and simple rules/announcements (client-only demo state)
  const [persona, setPersona] = useState<"organizer" | "participant">("participant");
  const [rulesByHackathon, setRulesByHackathon] = useState<Record<string, string>>({});
  const [announcementsByHackathon, setAnnouncementsByHackathon] = useState<Record<string, string>>({});
  // New: join by code + team policy and submission form state
  const [joinCode, setJoinCode] = useState("");
  const [teamPolicyByHackathon, setTeamPolicyByHackathon] = useState<Record<string, "open" | "preassigned">>({});
  const [submitTeamId, setSubmitTeamId] = useState<string>("");
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitRepo, setSubmitRepo] = useState("");
  const [submitDemo, setSubmitDemo] = useState("");
  const [submitDesc, setSubmitDesc] = useState("");

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hackathons", { headers: { ...authHeaders() } });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load hackathons");
        setHackathons(data);
        if (data?.length && !selectedId) setSelectedId(String(data[0].id));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  // Load per-hackathon lists
  useEffect(() => {
    if (!selectedId) return;
    const load = async () => {
      try {
        const [teamsRes, subsRes, judgesRes, lbRes, reviewsRes] = await Promise.all([
          fetch(`/api/hackathons/${selectedId}/teams`, { headers: { ...authHeaders() } }),
          fetch(`/api/hackathons/${selectedId}/submissions`, { headers: { ...authHeaders() } }),
          fetch(`/api/hackathons/${selectedId}/judges`, { headers: { ...authHeaders() } }),
          fetch(`/api/hackathons/${selectedId}/leaderboard`, { headers: { ...authHeaders() } }),
          fetch(`/api/hackathons/${selectedId}/reviews`, { headers: { ...authHeaders() } }),
        ]);
        const [teamsJson, subsJson, judgesJson, lbJson, reviewsJson] = await Promise.all([
          teamsRes.json(),
          subsRes.json(),
          judgesRes.json(),
          lbRes.json(),
          reviewsRes.json(),
        ]);
        if (teamsRes.ok) setTeams(teamsJson);
        if (subsRes.ok) {
          // Type assertion since API now includes avgRating
          setSubmissions(subsJson as EnhancedSubmission[]);
        }
        if (judgesRes.ok) setJudges(judgesJson);
        if (lbRes.ok) setLeaderboard(lbJson);
        if (reviewsRes.ok) setReviews(reviewsJson);
      } catch (e) {
        // ignore soft failures
      }
    };
    load();
  }, [selectedId]);

  useEffect(() => {
    const savedRole = localStorage.getItem("demoRole") || "participant";
    setCurrentRole(savedRole);
  }, []);

  const joinHackathon = async () => {
    if (!selectedId || !displayName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hackathons/${selectedId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ display_name: displayName, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to join");
      setJoinedParticipant(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!selectedId || !teamName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hackathons/${selectedId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name: teamName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create team");
      setTeamName("");
      setTeams((prev) => [data, ...prev]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async () => {
    if (!teamJoinId || !joinedParticipant?.id) {
      setError("Join the hackathon first to get a participant ID");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${teamJoinId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ participant_id: joinedParticipant.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to join team");
      // Refresh nothing special here
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addJudge = async () => {
    if (!selectedId || !judgeName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hackathons/${selectedId}/judges`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name: judgeName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add judge");
      setJudges((prev) => [data, ...prev]);
      setJudgeName("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitScores = async () => {
    if (!scoreSubmissionId || !judgeIdForScore) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        submission_id: parseInt(scoreSubmissionId),
        judge_id: parseInt(judgeIdForScore),
        scores: [
          { criteria: "innovation", score: parseInt(scoresForm.innovation) },
          { criteria: "impact", score: parseInt(scoresForm.impact) },
          { criteria: "technical", score: parseInt(scoresForm.technical) },
        ],
      };
      const res = await fetch(`/api/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit scores");
      // refresh subs + leaderboard after scoring
      const [subsRes, lbRes] = await Promise.all([
        fetch(`/api/hackathons/${selectedId}/submissions`, { headers: { ...authHeaders() } }),
        fetch(`/api/hackathons/${selectedId}/leaderboard`, { headers: { ...authHeaders() } }),
      ]);
      if (subsRes.ok) setSubmissions(await subsRes.json());
      if (lbRes.ok) setLeaderboard(await lbRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const quickJoin = async (name: string, r: "participant" | "judge" | "host") => {
    if (!selectedId) return;
    setDisplayName(name);
    setRole(r);
    setPersona(r === "host" ? "organizer" : "participant");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hackathons/${selectedId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ display_name: name, role: r }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to join");
      setJoinedParticipant(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!selectedSubmissionId || !selectedJudgeId || !ratingForm.rating) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          submission_id: selectedSubmissionId,
          judge_id: parseInt(selectedJudgeId),
          rating: parseInt(ratingForm.rating),
          comments: ratingForm.comments || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit review");
      // Clear form and close modal
      setRatingForm({ rating: "", comments: "" });
      setShowRatingModal(false);
      setSelectedSubmissionId(null);
      // Refresh data
      const [subsRes, reviewsRes] = await Promise.all([
        fetch(`/api/hackathons/${selectedId}/submissions`, { headers: { ...authHeaders() } }),
        fetch(`/api/hackathons/${selectedId}/reviews`, { headers: { ...authHeaders() } }),
      ]);
      if (subsRes.ok) setSubmissions(await subsRes.json() as EnhancedSubmission[]);
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isOrganizer = persona === "organizer" || joinedParticipant?.role === "host";
  const currentRules = rulesByHackathon[selectedId] || "";
  const currentAnnouncements = announcementsByHackathon[selectedId] || "";
  const teamPolicy = teamPolicyByHackathon[selectedId] || "open";
  const isPreassigned = teamPolicy === "preassigned";

  // Function to check if submission is reviewed by selected judge
  const isReviewed = (submissionId: number, judgeId: number) => {
    return reviews.some(r => r.submissionId === submissionId && r.judgeId === judgeId);
  };

  // New: submit project (participant)
  const submitProject = async () => {
    if (!selectedId || !submitTeamId || !submitTitle) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hackathons/${selectedId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          team_id: parseInt(submitTeamId),
          title: submitTitle,
          repo_url: submitRepo || null,
          demo_url: submitDemo || null,
          description: submitDesc || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit project");
      // clear and refresh
      setSubmitTitle("");
      setSubmitRepo("");
      setSubmitDemo("");
      setSubmitDesc("");
      const [subsRes, lbRes] = await Promise.all([
        fetch(`/api/hackathons/${selectedId}/submissions`, { headers: { ...authHeaders() } }),
        fetch(`/api/hackathons/${selectedId}/leaderboard`, { headers: { ...authHeaders() } }),
      ]);
      if (subsRes.ok) setSubmissions(await subsRes.json());
      if (lbRes.ok) setLeaderboard(await lbRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Persona Switch */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Personas</CardTitle>
          <CardDescription>
            Switch between Organizer and Participant to see gated actions. These are client-side demo accounts only.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Current: {isOrganizer ? "Organizer" : "Participant"}</Badge>
            {selectedId && (
              <span className="text-sm text-muted-foreground">Hackathon #{selectedId}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={isOrganizer ? "default" : "outline"}
              onClick={() => quickJoin("Organizer Demo", "host")}
              disabled={!selectedId || loading}
            >
              Use Organizer Demo
            </Button>
            <Button
              variant={!isOrganizer ? "default" : "outline"}
              onClick={() => quickJoin("Participant Demo", "participant")}
              disabled={!selectedId || loading}
            >
              Use Participant Demo
            </Button>
            <Button
              variant={currentRole === "judge" ? "default" : "outline"}
              onClick={() => {
                if (!selectedId || loading) return;
                localStorage.setItem("demoRole", "judge");
                setCurrentRole("judge");
                quickJoin("Judge Demo", "judge");
              }}
              disabled={!selectedId || loading}
            >
              Use Judge Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hackathon Demo</CardTitle>
          <CardDescription>
            End-to-end demo: join a hackathon, create/join a team, add judges, score submissions, and view the leaderboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Select Hackathon</label>
              <FallbackSelect
                value={selectedId}
                onValueChange={setSelectedId}
                placeholder="Choose hackathon"
                options={hackathons.map((h) => ({ label: h.name, value: String(h.id) }))}
              />
            </div>
            <div className="flex items-end gap-2">
              <Badge variant="secondary">Status: {selectedHackathon?.status || "-"}</Badge>
              <Badge variant="outline">Max Team Size: {selectedHackathon?.maxTeamSize ?? "-"}</Badge>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {loading && <div className="text-sm text-muted-foreground">Working...</div>}
        </CardContent>
      </Card>

      {/* Join Section */}
      <Card>
        <CardHeader>
          <CardTitle>Join Hackathon</CardTitle>
          <CardDescription>Create a participant entry as participant/judge/host.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium">Display name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium">Role</label>
            <FallbackSelect
              value={role}
              onValueChange={setRole}
              options={[
                { label: "Participant", value: "participant" },
                { label: "Judge", value: "judge" },
                { label: "Host", value: "host" },
              ]}
            />
          </div>
          <div className="flex items-end sm:col-span-1">
            <Button className="w-full" onClick={joinHackathon} disabled={!selectedId || !displayName}>
              Join
            </Button>
          </div>
          {/* Join by Code (Schools share a code) */}
          <div className="sm:col-span-3 grid gap-2">
            <label className="mb-1 block text-sm font-medium">Join Code</label>
            <div className="flex gap-2">
              <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Enter code from your school" />
              <Button variant="outline" disabled={!joinCode || !selectedId}>Apply Code</Button>
            </div>
            <p className="text-xs text-muted-foreground">Students receive a code to join. In this demo, select a hackathon above and use any code to simulate.</p>
          </div>
          {joinedParticipant && (
            <div className="sm:col-span-3 text-sm text-muted-foreground">
              Joined as <span className="font-medium text-foreground">{joinedParticipant.displayName}</span> (ID {joinedParticipant.id}, role {joinedParticipant.role})
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Create or join a team in the selected hackathon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Organizer team policy control */}
          {isOrganizer ? (
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm font-medium">Team Policy</div>
              <div className="flex items-center gap-2">
                <FallbackSelect
                  value={teamPolicy}
                  onValueChange={(v) => setTeamPolicyByHackathon((p) => ({ ...p, [selectedId]: v as any }))}
                  options={[
                    { label: "Open (students can create/join)", value: "open" },
                    { label: "Preassigned (students cannot create/join)", value: "preassigned" },
                  ]}
                />
                <Badge variant="outline" className="whitespace-nowrap">{teamPolicy === "open" ? "Open" : "Preassigned"}</Badge>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Team policy set by organizer: <span className="font-medium text-foreground">{teamPolicy === "open" ? "Open" : "Preassigned"}</span></div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2 flex gap-2">
              <Input placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              <Button onClick={createTeam} disabled={!teamName || !selectedId || (isPreassigned && !isOrganizer)}>Create Team</Button>
            </div>
            <div className="sm:col-span-1 flex gap-2">
              <FallbackSelect
                value={teamJoinId}
                onValueChange={setTeamJoinId}
                placeholder="Select team"
                options={teams.map((t) => ({ label: t.name, value: String(t.id) }))}
              />
              <Button variant="outline" onClick={joinTeam} disabled={!teamJoinId || !joinedParticipant || (isPreassigned && !isOrganizer)}>
                Join Team
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.name}</TableCell>
                  </TableRow>
                ))}
                {teams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground text-sm">
                      No teams yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Submit Project (Participants) */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Project</CardTitle>
          <CardDescription>Participants submit once their project is ready.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOrganizer ? (
            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Team</label>
                <FallbackSelect
                  value={submitTeamId}
                  onValueChange={setSubmitTeamId}
                  placeholder="Select your team"
                  options={teams.map((t) => ({ label: t.name, value: String(t.id) }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Project Title</label>
                <Input value={submitTitle} onChange={(e) => setSubmitTitle(e.target.value)} placeholder="e.g. Campus Navigator" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Repository URL</label>
                  <Input value={submitRepo} onChange={(e) => setSubmitRepo(e.target.value)} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Demo URL</label>
                  <Input value={submitDemo} onChange={(e) => setSubmitDemo(e.target.value)} placeholder="https://demo.example.com" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm">Description</label>
                <Textarea value={submitDesc} onChange={(e) => setSubmitDesc(e.target.value)} placeholder="Brief overview of your project" className="min-h-24" />
              </div>
              <div>
                <Button onClick={submitProject} disabled={!submitTeamId || !submitTitle || !selectedId}>Submit</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">Participants see a friendly submit form here. Switch to Participant demo to view.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rules & Announcements</CardTitle>
          <CardDescription>
            {isOrganizer ? "Organizers can edit these fields for the selected hackathon." : "Read-only for participants in this demo."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium">Rules</label>
            {isOrganizer ? (
              <Textarea
                placeholder="Add rules here..."
                value={currentRules}
                onChange={(e) =>
                  setRulesByHackathon((prev) => ({ ...prev, [selectedId]: e.target.value }))
                }
                className="min-h-28"
              />
            ) : (
              <div className="rounded-md border p-3 text-sm text-muted-foreground whitespace-pre-wrap min-h-14">
                {currentRules || "No rules added yet."}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium">Announcements</label>
            {isOrganizer ? (
              <Textarea
                placeholder="Post announcements here..."
                value={currentAnnouncements}
                onChange={(e) =>
                  setAnnouncementsByHackathon((prev) => ({ ...prev, [selectedId]: e.target.value }))
                }
                className="min-h-28"
              />
            ) : (
              <div className="rounded-md border p-3 text-sm text-muted-foreground whitespace-pre-wrap min-h-14">
                {currentAnnouncements || "No announcements yet."}
              </div>
            )}
          </div>
          {isOrganizer && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Changes auto-save in this demo.</div>
              <div className="text-xs text-muted-foreground">
                Invite link: <span className="font-mono">/hackathons/{selectedId}?invite=demo</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Judging Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Judging Panel</CardTitle>
          <CardDescription>Add judges and submit scores for submissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2 flex gap-2">
              <Input placeholder="Judge name" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} />
              <Button onClick={addJudge} disabled={!judgeName || !selectedId || !isOrganizer}>Add Judge</Button>
            </div>
            {!isOrganizer && (
              <div className="sm:col-span-1 text-sm text-muted-foreground">
                Only organizers can add judges in this demo.
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-medium">Submissions</div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="w-24 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s.id} className={cn(String(s.id) === scoreSubmissionId && "bg-muted/40")}
                        onClick={() => setScoreSubmissionId(String(s.id))}
                      >
                        <TableCell>{s.id}</TableCell>
                        <TableCell className="truncate max-w-[260px]">{s.title}</TableCell>
                        <TableCell className="text-right">{Math.round((s.totalScore ?? 0) as number)}</TableCell>
                      </TableRow>
                    ))}
                    {submissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground text-sm">
                          No submissions yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Score Selected Submission</div>
              {!isOrganizer ? (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  Only organizers can submit scores in this demo.
                </div>
              ) : (
                <div className="grid gap-2">
                  <div>
                    <label className="mb-1 block text-sm">Submission ID</label>
                    <Input value={scoreSubmissionId} onChange={(e) => setScoreSubmissionId(e.target.value)} placeholder="e.g. 1" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Judge</label>
                    <FallbackSelect
                      value={judgeIdForScore}
                      onValueChange={setJudgeIdForScore}
                      placeholder="Select judge"
                      options={judges.map((j) => ({ label: `${j.name} (#${j.id})`, value: String(j.id) }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-xs">Innovation (1-10)</label>
                      <Input
                        value={scoresForm.innovation}
                        onChange={(e) => setScoresForm((p) => ({ ...p, innovation: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs">Impact (1-10)</label>
                      <Input value={scoresForm.impact} onChange={(e) => setScoresForm((p) => ({ ...p, impact: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs">Technical (1-10)</label>
                      <Input
                        value={scoresForm.technical}
                        onChange={(e) => setScoresForm((p) => ({ ...p, technical: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button onClick={submitScores} disabled={!scoreSubmissionId || !judgeIdForScore}>Submit Scores</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Judging Dashboard */}
      {(currentRole === "judge" || joinedParticipant?.role === "judge") && (
        <Card>
          <CardHeader>
            <CardTitle>Judging Dashboard</CardTitle>
            <CardDescription>Review all project submissions and leave ratings (1-10) with optional comments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Select Judge</label>
                <FallbackSelect
                  value={selectedJudgeId}
                  onValueChange={setSelectedJudgeId}
                  placeholder="Choose judge profile"
                  options={judges.map((j) => ({ label: j.name, value: String(j.id) }))}
                />
              </div>
              {selectedJudgeId && (
                <div className="flex items-end">
                  <Badge variant="secondary">Reviewing as: {judges.find(j => String(j.id) === selectedJudgeId)?.name}</Badge>
                </div>
              )}
            </div>

            {selectedJudgeId ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Avg Rating</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => {
                      const reviewed = isReviewed(s.id, parseInt(selectedJudgeId));
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.title}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{s.description || "No description"}</TableCell>
                          <TableCell className="text-right">{s.avgRating ? `${s.avgRating}/10` : "N/A"}</TableCell>
                          <TableCell>
                            <Dialog open={showRatingModal && selectedSubmissionId === s.id} onOpenChange={() => {
                              if (!showRatingModal || selectedSubmissionId !== s.id) return;
                              setShowRatingModal(false);
                              setSelectedSubmissionId(null);
                              setRatingForm({ rating: "", comments: "" });
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant={reviewed ? "outline" : "default"}
                                  size="sm"
                                  disabled={!selectedJudgeId}
                                  onClick={() => {
                                    setSelectedSubmissionId(s.id);
                                    setShowRatingModal(true);
                                    // Preload existing if reviewed
                                    const existing = reviews.find(r => r.submissionId === s.id && r.judgeId === parseInt(selectedJudgeId));
                                    if (existing) {
                                      setRatingForm({ rating: String(existing.rating), comments: existing.comments || "" });
                                    }
                                  }}
                                >
                                  {reviewed ? "Update Rating" : "Rate Project"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Rate {s.title}</DialogTitle>
                                  <DialogDescription>Provide your rating (1-10) and optional comments.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Rating (1-10)</label>
                                    <FallbackSelect
                                      value={ratingForm.rating}
                                      onValueChange={(v) => setRatingForm(p => ({ ...p, rating: v }))}
                                      options={Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Comments (Optional)</label>
                                    <Textarea
                                      value={ratingForm.comments}
                                      onChange={(e) => setRatingForm(p => ({ ...p, comments: e.target.value }))}
                                      placeholder="Your feedback..."
                                      className="min-h-24"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit" onClick={submitReview} disabled={!ratingForm.rating || loading}>
                                    {reviewed ? "Update" : "Submit Rating"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {submissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                          No submissions to review yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a judge profile above to start reviewing submissions.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Ranked by total score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="w-24 text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((row, idx) => (
                  <TableRow key={row.submissionId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="truncate max-w-[260px]">{row.title}</TableCell>
                    <TableCell>{row.teamName}</TableCell>
                    <TableCell className="text-right font-medium">{row.totalScore}</TableCell>
                  </TableRow>
                ))}
                {leaderboard.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                      No leaderboard yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HackathonDemo;