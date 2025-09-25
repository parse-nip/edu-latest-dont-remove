"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
        const [teamsRes, subsRes, judgesRes, lbRes] = await Promise.all([
          fetch(`/api/hackathons/${selectedId}/teams`, { headers: { ...authHeaders() } }),
          fetch(`/api/hackathons/${selectedId}/submissions`, { headers: { ...authHeaders() } }),
          fetch(`/api/hackathons/${selectedId}/judges`, { headers: { ...authHeaders() } }),
          fetch(`/api/hackathons/${selectedId}/leaderboard`, { headers: { ...authHeaders() } }),
        ]);
        const [teamsJson, subsJson, judgesJson, lbJson] = await Promise.all([
          teamsRes.json(),
          subsRes.json(),
          judgesRes.json(),
          lbRes.json(),
        ]);
        if (teamsRes.ok) setTeams(teamsJson);
        if (subsRes.ok) setSubmissions(subsJson);
        if (judgesRes.ok) setJudges(judgesJson);
        if (lbRes.ok) setLeaderboard(lbJson);
      } catch (e) {
        // ignore soft failures
      }
    };
    load();
  }, [selectedId]);

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

  return (
    <div className="space-y-6">
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
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2 flex gap-2">
              <Input placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              <Button onClick={createTeam} disabled={!teamName || !selectedId}>Create Team</Button>
            </div>
            <div className="sm:col-span-1 flex gap-2">
              <FallbackSelect
                value={teamJoinId}
                onValueChange={setTeamJoinId}
                placeholder="Select team"
                options={teams.map((t) => ({ label: t.name, value: String(t.id) }))}
              />
              <Button variant="outline" onClick={joinTeam} disabled={!teamJoinId || !joinedParticipant}>
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

      {/* Judges & Scoring */}
      <Card>
        <CardHeader>
          <CardTitle>Judges & Scoring</CardTitle>
          <CardDescription>Add judges and submit scores for submissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2 flex gap-2">
              <Input placeholder="Judge name" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} />
              <Button onClick={addJudge} disabled={!judgeName || !selectedId}>Add Judge</Button>
            </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

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