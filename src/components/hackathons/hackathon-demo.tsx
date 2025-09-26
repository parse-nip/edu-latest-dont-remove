"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, CalendarDays } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"

export const HackathonDemo = () => {
  const { user } = useAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Hackathon Platform
        </CardTitle>
        <CardDescription>
          {user 
            ? "Access your personalized hackathon dashboard with role-based features."
            : "Sign in to access the full hackathon platform experience."
          }
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
        
        <div className="flex gap-2">
          {user ? (
            <>
              <Button asChild className="flex-1">
                <Link href="/hackathons/demo">View Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/hackathons">Browse Events</Link>
              </Button>
            </>
          ) : (
            <Button asChild className="w-full">
              <Link href="/auth">Sign In to Get Started</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default HackathonDemo