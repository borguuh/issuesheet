export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"
import { getIssues, createIssue, initializeSheet } from "@/lib/google-sheets"
import { isValidSession } from "@/lib/auth"

// GET /api/issues - Get all issues with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Initialize sheet if needed
    await initializeSheet()

    const issues = await getIssues()
    const { searchParams } = new URL(request.url)

    let filteredIssues = issues

    // Apply filters
    const typeFilter = searchParams.get("type")
    const statusFilter = searchParams.get("status")
    const search = searchParams.get("search")

    if (typeFilter && typeFilter !== "all") {
      filteredIssues = filteredIssues.filter((issue) => issue.type === typeFilter)
    }

    if (statusFilter && statusFilter !== "all") {
      filteredIssues = filteredIssues.filter((issue) => issue.status === statusFilter)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredIssues = filteredIssues.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description.toLowerCase().includes(searchLower) ||
          issue.impact.toLowerCase().includes(searchLower),
      )
    }

    // Sort by creation date (newest first)
    filteredIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ issues: filteredIssues })
  } catch (error) {
    console.error("Failed to fetch issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}

// POST /api/issues - Create a new issue
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("admin-session")?.value
    const user = sessionToken ? isValidSession(sessionToken) : null

    const body = await request.json()
    const { title, type, description, impact, status = "open" } = body

    // Validate required fields
    if (!title || !type || !description || !impact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate field values
    if (!["feature", "issue"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    if (!["open", "assigned", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Initialize sheet if needed
    await initializeSheet()

    const modifiedBy = user ? user.username : "anonymous"

    const newIssue = await createIssue(
      {
        title,
        type,
        description,
        impact,
        status,
      },
      modifiedBy,
    )

    return NextResponse.json({ issue: newIssue }, { status: 201 })
  } catch (error) {
    console.error("Failed to create issue:", error)
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}
