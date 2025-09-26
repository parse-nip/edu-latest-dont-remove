"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import { Users, FileText, Trophy, Clock, Calendar, Target, Code, Presentation, Bell, Plus } from "lucide-react"
import Link from "next/link"

interface HackathonStats {
  totalHackathons: number
  totalTeams: number
  totalSubmissions: number
  totalJudges: number
  totalParticipants: number
}

export const HackathonPlatform: React.FC = () => {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<HackathonStats>({
    totalHackathons: 0,
    totalTeams: 0,
    totalSubmissions: 0,
    totalJudges: 0,
    totalParticipants: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      fetchStats()
    } else if (!loading) {
      setIsLoadingStats(false)
    }
  }, [user, loading])

  const fetchStats = async () => {
    try {
      const [hackathonsRes, teamsRes, submissionsRes, judgesRes, participantsRes] = await Promise.all([
        supabase.from('hackathons').select('id', { count: 'exact', head: true }),
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('submissions').select('id', { count: 'exact', head: true }),
        supabase.from('judges').select('id', { count: 'exact', head: true }),
        supabase.from('hackathon_participants').select('id', { count: 'exact', head: true })
      ])

      setStats({
        totalHackathons: hackathonsRes.count || 0,
        totalTeams: teamsRes.count || 0,
        totalSubmissions: submissionsRes.count || 0,
        totalJudges: judgesRes.count || 0,
        totalParticipants: participantsRes.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  if (loading || isLoadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Hackathon Platform</CardTitle>
            <CardDescription>
              Sign in to access your personalized hackathon dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-center">
              <div className="space-y-2">
                <Trophy className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Compete & Win</h3>
                <p className="text-sm text-muted-foreground">
                  Join hackathons and showcase your skills to win amazing prizes
                </p>
              </div>
              <div className="space-y-2">
                <Users className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Build Teams</h3>
                <p className="text-sm text-muted-foreground">
                  Collaborate with talented developers from around the world
                </p>
              </div>
              <div className="space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Organize Events</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage your own hackathon events with ease
                </p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/auth">Sign In to Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderParticipantView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Available Hackathons</p>
              <p className="text-xl font-semibold">{stats.totalHackathons}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Teams</p>
              <p className="text-xl font-semibold">{stats.totalTeams}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Submissions</p>
              <p className="text-xl font-semibold">{stats.totalSubmissions}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Community</p>
              <p className="text-xl font-semibold">{stats.totalParticipants}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/hackathons">
                <Trophy className="h-4 w-4 mr-3" />
                Browse Hackathons
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/hackathons/create">
                <Plus className="h-4 w-4 mr-3" />
                Create New Event
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/profile">
                <Users className="h-4 w-4 mr-3" />
                View Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm">Real-time team collaboration</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">Automated judging system</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm">Live leaderboards</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm">Project submissions tracking</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderJudgeView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">To Review</p>
              <p className="text-xl font-semibold">{stats.totalSubmissions}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg. Time</p>
              <p className="text-xl font-semibold">-</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Judging Criteria</CardTitle>
          <CardDescription>Standard evaluation criteria for all submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Innovation (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Originality and creativity of the solution</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Technical (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Code quality and technical execution</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Impact (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Real-world value and potential</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Presentation className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Presentation (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Demo quality and communication</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" asChild>
            <Link href="/hackathons">
              <Trophy className="h-4 w-4 mr-3" />
              View All Hackathons
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderOrganizerView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">My Hackathons</p>
              <p className="text-xl font-semibold">{stats.totalHackathons}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Participants</p>
              <p className="text-xl font-semibold">{stats.totalParticipants}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Submissions</p>
              <p className="text-xl font-semibold">{stats.totalSubmissions}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Events</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>Manage your hackathon events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/hackathons/create">
                <Plus className="h-4 w-4 mr-3" />
                Create New Hackathon
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/hackathons">
                <Trophy className="h-4 w-4 mr-3" />
                Manage Existing Events
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Bell className="h-4 w-4 mr-3" />
              Send Announcements
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-3" />
              Export Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Event Completion Rate</span>
              <span className="text-sm font-medium">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg. Team Size</span>
              <span className="text-sm font-medium">3.2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Submission Rate</span>
              <span className="text-sm font-medium">73%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Judge Satisfaction</span>
              <span className="text-sm font-medium">4.8/5</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.displayName}!
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
  )
}