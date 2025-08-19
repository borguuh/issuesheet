"use client"

import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/protected-route"
import { IssueDashboard } from "@/components/issue-dashboard"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <IssueDashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}
