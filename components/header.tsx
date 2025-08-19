"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issue Tracker</h1>
          <p className="text-sm text-muted-foreground">Internal issue and feature request management</p>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <>
              <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
