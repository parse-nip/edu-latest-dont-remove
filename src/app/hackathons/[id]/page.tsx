"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Clock, Users, Trophy, CloudUpload as UploadCloud, Megaphone, Gavel, Scale, BookOpen, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

interface Hackathon {
  id: string
  name: string
  description: string | null
  start_at: string
  end_at: string
  status: string
  max_team_size: number
  created_at: string
  created_by: string | null
}

interface Team {
  id: string
  name: string
  created_by: string | null
  created_at: string
}

interface Submission {
  id: string
  title: string
  description: string | null
  repo_url: string | null
  demo_url: string | null
  team_id: string
  submitted_at: string
}

interface Judge {
  id: string
  name: string
  user_id: string | null
  created_at: string
}

interface Participant {
  id: string
  display_name: string
  role: string
  user_id: string
  created_at: string
}

export default function HackathonDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [judges, setJudges] = useState<Judge[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Form states
  const [teamName, setTeamName] = useState("")
  const [judgeName, setJudgeName] = useState("")
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [isCreatingJudge, setIsCreatingJudge] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      fetchHackathonData()
    } else if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, params.id])

  const fetchHackathonData = async () => {
    try {
      // Fetch hackathon details
      const { data: hackathonData, error: hackathonError } = await supabase
        .from('hackathons')
        .select('*')
        .eq('id', params.id)
        .single()

      if (hackathonError) throw hackathonError
      setHackathon(hackathonData)

      // Fetch related data
      await Promise.all([
        fetchTeams(),
        fetchSubmissions(),
        fetchJudges(),
        fetchParticipants()
      ])
    } catch (err) {
      console.error('Error fetching hackathon:', err)
      setError('Failed to load hackathon details')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('hackathon_id', params.id)
      .order('created_at', { ascending: false })

    if (!error) setTeams(data || [])
  }

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('hackathon_id', params.id)
      .order('submitted_at', { ascending: false })

    if (!error) setSubmissions(data || [])
  }

  const fetchJudges = async () => {
    const { data, error } = await supabase
      .from('judges')
      .select('*')
      .eq('hackathon_id', params.id)
      .order('created_at', { ascending: false })

    if (!error) setJudges(data || [])
  }

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('hackathon_participants')
      .select('*')
      .eq('hackathon_id', params.id)
      .order('created_at', { ascending: false })

    if (!error) setParticipants(data || [])
  }

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return
    
    setIsCreatingTeam(true)
    try {
      const response = await fetch(`/api/hackathons/${params.id}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create team')
      }

      setTeamName("")
      await fetchTeams()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team')
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const createJudge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!judgeName.trim()) return
    
    setIsCreatingJudge(true)
    try {
      const response = await fetch(`/api/hackathons/${params.id}/judges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: judgeName.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create judge')
      }

      setJudgeName("")
      await fetchJudges()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create judge')
    } finally {
      setIsCreatingJudge(false)
    }
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "teams", label: "Teams", icon: Users },
    { id: "submissions", label: "Submissions", icon: UploadCloud },
    { id: "judges", label: "Judges", icon: Gavel },
    { id: "participants", label: "Participants", icon: Users },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Overview</CardTitle>
                <CardDescription>
                  {hackathon?.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Status</h3>
                    <Badge variant="outline">{hackathon?.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Max Team Size</h3>
                    <span className="text-sm">{hackathon?.max_team_size} members</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{teams.length}</div>
                    <div className="text-sm text-muted-foreground">Teams</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{submissions.length}</div>
                    <div className="text-sm text-muted-foreground">Submissions</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{judges.length}</div>
                    <div className="text-sm text-muted-foreground">Judges</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{participants.length}</div>
                    <div className="text-sm text-muted-foreground">Participants</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "teams":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Teams ({teams.length})</CardTitle>
                <CardDescription>Manage teams for this hackathon</CardDescription>
              </div>
              <form onSubmit={createTeam} className="flex gap-2">
                <Input
                  placeholder="Team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={isCreatingTeam}
                  className="w-40"
                />
                <Button type="submit" size="sm" disabled={isCreatingTeam || !teamName.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No teams yet. Create the first team above.
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{team.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Created {format(new Date(team.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "submissions":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Submissions ({submissions.length})</CardTitle>
              <CardDescription>Projects submitted by teams</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions yet. Teams can submit their projects when ready.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Links</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.title}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {submission.description || "No description"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {submission.repo_url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={submission.repo_url} target="_blank" rel="noopener noreferrer">
                                  Repo
                                </a>
                              </Button>
                            )}
                            {submission.demo_url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                                  Demo
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(submission.submitted_at), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">Review</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )

      case "judges":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Judges ({judges.length})</CardTitle>
                <CardDescription>Experts evaluating submissions</CardDescription>
              </div>
              <form onSubmit={createJudge} className="flex gap-2">
                <Input
                  placeholder="Judge name"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  disabled={isCreatingJudge}
                  className="w-40"
                />
                <Button type="submit" size="sm" disabled={isCreatingJudge || !judgeName.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              {judges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No judges assigned yet. Add judges above to evaluate submissions.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {judges.map((judge) => (
                    <Card key={judge.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{judge.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{judge.name}</CardTitle>
                            <CardDescription>Judge</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Reviews</span>
                          <Badge variant="secondary">0/{submissions.length}</Badge>
                        </div>
                        <Progress value={0} className="mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "participants":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Participants ({participants.length})</CardTitle>
              <CardDescription>All registered participants</CardDescription>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No participants yet. Share the hackathon link to get participants.
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{participant.display_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{participant.display_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {participant.role} • Joined {format(new Date(participant.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{participant.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (loading || isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchHackathonData} variant="outline">
              Try Again
            </Button>
            <Button asChild>
              <Link href="/hackathons">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hackathons
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Hackathon Not Found</CardTitle>
            <CardDescription>
              The hackathon you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/hackathons">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hackathons
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/hackathons">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{hackathon.name}</h1>
          </div>
          <p className="text-muted-foreground">{hackathon.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {format(new Date(hackathon.start_at), "MMM d")} – {format(new Date(hackathon.end_at), "MMM d, yyyy")}
            </span>
            <Badge variant={hackathon.status === "active" ? "default" : "outline"}>
              {hackathon.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => setError(null)} variant="outline" size="sm" className="mt-2">
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        <aside className="w-64 hidden lg:block">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
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
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}