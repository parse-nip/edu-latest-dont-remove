"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CalendarDays, Users, Trophy, Plus, Search, Clock } from "lucide-react"
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

export default function HackathonsPage() {
  const { user, loading } = useAuth()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      fetchHackathons()
    } else if (!loading && !user) {
      setIsLoading(false)
    }
  }, [user, loading])

  const fetchHackathons = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setHackathons(data || [])
    } catch (err) {
      console.error('Error fetching hackathons:', err)
      setError('Failed to load hackathons')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'upcoming': return 'secondary'
      case 'past': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'upcoming': return 'text-blue-600'
      case 'past': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Hackathons</CardTitle>
            <CardDescription>
              Sign in to create and join hackathons, manage teams, and participate in exciting coding events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3 text-center">
              <div className="space-y-2">
                <Trophy className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Compete</h3>
                <p className="text-sm text-muted-foreground">Join exciting hackathons and showcase your skills</p>
              </div>
              <div className="space-y-2">
                <Users className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Collaborate</h3>
                <p className="text-sm text-muted-foreground">Form teams and work together on innovative projects</p>
              </div>
              <div className="space-y-2">
                <CalendarDays className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Organize</h3>
                <p className="text-sm text-muted-foreground">Create and manage your own hackathon events</p>
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

  const filteredHackathons = hackathons.filter(hackathon =>
    hackathon.name.toLowerCase().includes(search.toLowerCase()) ||
    (hackathon.description && hackathon.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hackathons</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.displayName}! Create events, join teams, and build amazing projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/hackathons/create">
            <Plus className="h-4 w-4 mr-2" />
            Create New Hackathon
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hackathons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchHackathons} variant="outline" size="sm" className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredHackathons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            {search ? (
              <>
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hackathons found</h3>
                <p className="text-muted-foreground mb-4">
                  No hackathons match your search "{search}"
                </p>
                <Button onClick={() => setSearch("")} variant="outline">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hackathons yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create a hackathon event!
                </p>
                <Button asChild>
                  <Link href="/hackathons/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Hackathon
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHackathons.map((hackathon) => (
            <Card key={hackathon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="line-clamp-1">{hackathon.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {hackathon.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(hackathon.status)} className="ml-2">
                    {hackathon.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(hackathon.start_at), "MMM d")} - {format(new Date(hackathon.end_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Max team size: {hackathon.max_team_size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${getStatusColor(hackathon.status)}`} />
                    <span className={getStatusColor(hackathon.status)}>
                      {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/hackathons/${hackathon.id}`}>
                      View Details
                    </Link>
                  </Button>
                  {hackathon.status === 'upcoming' && (
                    <Button asChild variant="outline">
                      <Link href={`/hackathons/${hackathon.id}/join`}>
                        Join
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}