"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/login-form"

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
}

export function ProtectedRoute({ children, requireAuth = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <LoginForm />
  }

  return <>{children}</>
}
