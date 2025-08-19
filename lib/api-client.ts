"use client"

import type { Issue } from "./google-sheets"

export interface CreateIssueData {
  title: string
  type: "feature" | "issue"
  description: string
  impact: string
  status?: "open" | "assigned" | "closed"
}

export interface UpdateIssueData {
  title?: string
  type?: "feature" | "issue"
  description?: string
  impact?: string
  status?: "open" | "assigned" | "closed"
  expectedFixDate?: string
}

export interface IssueFilters {
  type?: string
  status?: string
  search?: string
}

class ApiClient {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }))
      throw new Error(error.error || "Request failed")
    }

    return response.json()
  }

  async getIssues(filters: IssueFilters = {}): Promise<Issue[]> {
    const params = new URLSearchParams()
    if (filters.type) params.set("type", filters.type)
    if (filters.status) params.set("status", filters.status)
    if (filters.search) params.set("search", filters.search)

    const url = `/api/issues${params.toString() ? `?${params.toString()}` : ""}`
    const response = await this.request<{ issues: Issue[] }>(url)
    return response.issues
  }

  async createIssue(data: CreateIssueData): Promise<Issue> {
    const response = await this.request<{ issue: Issue }>("/api/issues", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.issue
  }

  async updateIssue(id: string, data: UpdateIssueData): Promise<Issue> {
    const response = await this.request<{ issue: Issue }>(`/api/issues/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.issue
  }

  async deleteIssue(id: string): Promise<void> {
    await this.request<{ success: boolean }>(`/api/issues/${id}`, {
      method: "DELETE",
    })
  }

  async initializeSheet(): Promise<void> {
    await this.request<{ success: boolean }>("/api/issues/init", {
      method: "POST",
    })
  }
}

export const apiClient = new ApiClient()
