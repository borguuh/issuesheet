"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { IssueForm } from "@/components/issue-form"
import { useAuth } from "@/hooks/use-auth"
import type { Issue } from "@/lib/google-sheets"
import type { CreateIssueData, UpdateIssueData } from "@/lib/api-client"
import { Pencil, Trash2, Plus } from "lucide-react"

interface IssueListProps {
  issues: Issue[]
  onCreateIssue: (data: CreateIssueData) => Promise<void>
  onUpdateIssue: (id: string, data: UpdateIssueData) => Promise<void>
  onDeleteIssue: (id: string) => Promise<void>
}

function getStatusColor(status: string) {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "assigned":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "closed":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "feature":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "issue":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function IssueList({ issues, onCreateIssue, onUpdateIssue, onDeleteIssue }: IssueListProps) {
  const { isAuthenticated } = useAuth()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDeleteIssue(id)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Issues & Feature Requests</h2>
          <p className="text-muted-foreground">Manage and track project issues and feature requests</p>
        </div>
        {isAuthenticated && (
          <IssueForm
            onSubmit={onCreateIssue}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Issue
              </Button>
            }
            title="Create New Issue"
          />
        )}
      </div>

      {issues.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No issues found. Create your first issue to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{issue.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getTypeColor(issue.type)}>
                        {issue.type === "feature" ? "Feature Request" : "Issue"}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(issue.status)}>
                        {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      <IssueForm
                        issue={issue}
                        onSubmit={(data) => onUpdateIssue(issue.id, data)}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                        title="Edit Issue"
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={deletingId === issue.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this issue? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(issue.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Impact</h4>
                  <p className="text-sm text-muted-foreground">{issue.impact}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(issue.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {formatDate(issue.updatedAt)}
                  </div>
                  {issue.expectedFixDate && (
                    <div className="col-span-2">
                      <span className="font-medium">Expected Fix:</span> {formatDate(issue.expectedFixDate)}
                    </div>
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
