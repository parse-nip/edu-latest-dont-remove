"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Trophy } from "lucide-react"
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
}

export default function JoinHackathonPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    displayName: "",
    role: "participant",
    joinCode: ""
  })

  useEffect(() => {
    if (!loading && user) {
      fetchHackathon()
      setFormData(prev => ({ ...prev, displayName: user.displayName }))
    } else if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, params.id])

  const fetchHackathon = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setHackathon(data)
    } catch (err) {
      console.error('Error fetching hackathon:', err)
      setError('Failed to load hackathon details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsJoining(true)
    setError(null)

    try {
      const response = await fetch(`/api/hackathons/${params.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: formData.displayName.trim(),
          role: formData.role,
          join_code: formData.joinCode.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join hackathon')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/hackathons/${params.id}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join hackathon')
    } finally {
      setIsJoining(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted rounded"></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (error && !hackathon) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
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

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Successfully Joined!</CardTitle>
            <CardDescription>
              You've successfully joined {hackathon?.name}. Redirecting to the hackathon dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Trophy className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/hackathons">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hackathons
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Join Hackathon</h1>
        <p className="text-muted-foreground">
          Join {hackathon?.name} and start building amazing projects!
        </p>
      </div>

      {hackathon && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{hackathon.name}</CardTitle>
            <CardDescription>{hackathon.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium">Start Date</div>
                <div className="text-muted-foreground">
                  {format(new Date(hackathon.start_at), "MMM d, yyyy 'at' HH:mm")}
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">End Date</div>
                <div className="text-muted-foreground">
                  {format(new Date(hackathon.end_at), "MMM d, yyyy 'at' HH:mm")}
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Status</div>
                <Badge variant={hackathon.status === 'active' ? 'default' : 'outline'}>
                  {hackathon.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Max Team Size</div>
                <div className="text-muted-foreground">{hackathon.max_team_size} members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Join as Participant</CardTitle>
          <CardDescription>
            Choose your role and provide your details to join the hackathon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="How you want to appear to other participants"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                required
                disabled={isJoining}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                disabled={isJoining}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participant
                    </div>
                  </SelectItem>
                  <SelectItem value="judge">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Judge
                    </div>
                  </SelectItem>
                  <SelectItem value="organizer">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Organizer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinCode">Join Code (Optional)</Label>
              <Input
                id="joinCode"
                placeholder="Enter code from organizer if provided"
                value={formData.joinCode}
                onChange={(e) => setFormData(prev => ({ ...prev, joinCode: e.target.value }))}
                disabled={isJoining}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isJoining || !formData.displayName.trim()}>
              {isJoining ? "Joining..." : "Join Hackathon"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}