"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth/AuthForm"
import { useAuth } from "@/components/auth/AuthProvider"

export default function AuthPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // If user is already authenticated, redirect to hackathons
    if (user && !loading) {
      console.log('[AUTH PAGE] User already authenticated, redirecting to hackathons')
      router.push('/hackathons')
    }
  }, [user, loading, router])

  // Don't show loading spinner, just render the form
  // The form will handle its own loading states
  if (user) {
    return null  // Will redirect via useEffect
  }

  return <AuthForm />
}