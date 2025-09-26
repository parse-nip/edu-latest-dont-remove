"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"

export default function CreateHackathonPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    status: "upcoming",
    maxTeamSize: 4,
  })

  if (loading) {
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted rounded"></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be signed in to create hackathons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Get auth token from Supabase client
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/hackathons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          start_at: formData.startDate.toISOString(),
          end_at: formData.endDate.toISOString(),
          status: formData.status,
          max_team_size: formData.maxTeamSize,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create hackathon')
      }

      const newHackathon = await response.json()
      router.push(`/hackathons/${newHackathon.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create hackathon')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateChange = (date: Date | undefined, field: "startDate" | "endDate") => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date }))
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Create New Hackathon</h1>
        <p className="text-muted-foreground">
          Set up your event details. Participants can join and submit projects once created.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Setup</CardTitle>
          <CardDescription>
            Fill in the basics—add schedules, rules, and resources in the management dashboard after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                placeholder="e.g., Fall Build Sprint"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What makes this hackathon special? (e.g., Focus on AI tools and rapid prototyping)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isSubmitting}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange(date, "startDate")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isSubmitting}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleDateChange(date, "endDate")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTeamSize">Max Team Size</Label>
                <Input
                  id="maxTeamSize"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxTeamSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxTeamSize: parseInt(e.target.value) || 4 }))}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Hackathon"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}