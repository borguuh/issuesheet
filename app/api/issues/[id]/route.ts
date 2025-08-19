import { type NextRequest, NextResponse } from "next/server"
import { updateIssue, deleteIssue } from "@/lib/google-sheets"
import { isValidSession } from "@/lib/auth"

interface RouteParams {
  params: {
    id: string
  }
}

// PUT /api/issues/[id] - Update an existing issue
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionToken = request.cookies.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = isValidSession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const { title, type, description, impact, status, expectedFixDate } = body

    // Validate field values if provided
    if (type && !["feature", "issue"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    if (status && !["open", "assigned", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (type !== undefined) updates.type = type
    if (description !== undefined) updates.description = description
    if (impact !== undefined) updates.impact = impact
    if (status !== undefined) updates.status = status
    if (expectedFixDate !== undefined) updates.expectedFixDate = expectedFixDate

    const updatedIssue = await updateIssue(params.id, updates, user.username)

    if (!updatedIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    return NextResponse.json({ issue: updatedIssue })
  } catch (error) {
    console.error("Failed to update issue:", error)
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}

// DELETE /api/issues/[id] - Delete an issue
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionToken = request.cookies.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = isValidSession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const success = await deleteIssue(params.id)

    if (!success) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete issue:", error)
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 })
  }
}
