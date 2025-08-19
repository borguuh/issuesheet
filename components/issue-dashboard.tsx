"use client"

import { useState, useEffect } from "react"
import { IssueList } from "@/components/issue-list"
import { IssueFiltersComponent } from "@/components/issue-filters"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import type { Issue } from "@/lib/google-sheets"
import type { CreateIssueData, UpdateIssueData, IssueFilters } from "@/lib/api-client"

export function IssueDashboard() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isInitializing, setIsInitializing] = useState(false)
  const [filters, setFilters] = useState<IssueFilters>({})

  const loadIssues = async (currentFilters: IssueFilters = filters) => {
    try {
      setError("")
      const fetchedIssues = await apiClient.getIssues(currentFilters)
      setIssues(fetchedIssues)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issues")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitializeSheet = async () => {
    setIsInitializing(true)
    try {
      await apiClient.initializeSheet()
      await loadIssues()
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize sheet")
    } finally {
      setIsInitializing(false)
    }
  }

  const handleCreateIssue = async (data: CreateIssueData) => {
    await apiClient.createIssue(data)
    await loadIssues()
  }

  const handleUpdateIssue = async (id: string, data: UpdateIssueData) => {
    await apiClient.updateIssue(id, data)
    await loadIssues()
  }

  const handleDeleteIssue = async (id: string) => {
    await apiClient.deleteIssue(id)
    await loadIssues()
  }

  const handleFiltersChange = (newFilters: IssueFilters) => {
    setFilters(newFilters)
    setIsLoading(true)
    loadIssues(newFilters)
  }

  useEffect(() => {
    loadIssues()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading issues...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {error.includes("Failed to fetch") && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              It looks like the Google Sheet might not be set up yet. Click below to initialize it.
            </p>
            <Button onClick={handleInitializeSheet} disabled={isInitializing}>
              {isInitializing ? "Initializing..." : "Initialize Google Sheet"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <IssueFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} issueCount={issues.length} />
      <IssueList
        issues={issues}
        onCreateIssue={handleCreateIssue}
        onUpdateIssue={handleUpdateIssue}
        onDeleteIssue={handleDeleteIssue}
      />
    </div>
  )
}
