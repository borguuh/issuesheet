import { NextResponse } from "next/server"
import { initializeSheet } from "@/lib/google-sheets"

// POST /api/issues/init - Initialize the Google Sheet with headers
export async function POST() {
  try {
    await initializeSheet()
    return NextResponse.json({ success: true, message: "Sheet initialized successfully" })
  } catch (error) {
    console.error("Failed to initialize sheet:", error)
    return NextResponse.json({ error: "Failed to initialize sheet" }, { status: 500 })
  }
}
