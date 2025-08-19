import { type NextRequest, NextResponse } from "next/server"
import { isValidSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("admin-session")?.value

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const user = isValidSession(sessionToken)

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: user.username,
      name: user.name,
    },
  })
}
