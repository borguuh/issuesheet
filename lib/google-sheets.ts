import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

// Initialize Google Sheets client
export async function getGoogleSheetsClient() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/spreadsheets"],
  })

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID!, serviceAccountAuth)
  await doc.loadInfo()

  return doc
}

// Issue type definitions
export interface Issue {
  id: string
  title: string
  type: "feature" | "issue"
  description: string
  impact: string
  status: "open" | "assigned" | "closed"
  expectedFixDate?: string
  createdAt: string
  updatedAt: string
}

export interface IssueWithAudit extends Issue {
  lastModifiedBy: string
}

// Get all issues from the sheet
export async function getIssues(): Promise<Issue[]> {
  const doc = await getGoogleSheetsClient()
  const sheet = doc.sheetsByIndex[0]

  const rows = await sheet.getRows()

  return rows.map((row) => ({
    id: row.get("ID") || "",
    title: row.get("Title") || "",
    type: row.get("Type") || "issue",
    description: row.get("Description") || "",
    impact: row.get("Impact") || "",
    status: row.get("Status") || "open",
    expectedFixDate: row.get("Expected Fix Date") || "",
    createdAt: row.get("Created At") || "",
    updatedAt: row.get("Updated At") || "",
  }))
}

// Create a new issue
export async function createIssue(
  issue: Omit<Issue, "id" | "createdAt" | "updatedAt">,
  modifiedBy: string,
): Promise<Issue> {
  const doc = await getGoogleSheetsClient()
  const sheet = doc.sheetsByIndex[0]

  const id = `ISS-${Date.now()}`
  const now = new Date().toISOString()

  const newIssue: IssueWithAudit = {
    ...issue,
    id,
    createdAt: now,
    updatedAt: now,
    lastModifiedBy: modifiedBy,
  }

  await sheet.addRow({
    ID: newIssue.id,
    Title: newIssue.title,
    Type: newIssue.type,
    Description: newIssue.description,
    Impact: newIssue.impact,
    Status: newIssue.status,
    "Expected Fix Date": newIssue.expectedFixDate || "",
    "Created At": newIssue.createdAt,
    "Updated At": newIssue.updatedAt,
    "Last Modified By": newIssue.lastModifiedBy,
  })

  return {
    id: newIssue.id,
    title: newIssue.title,
    type: newIssue.type,
    description: newIssue.description,
    impact: newIssue.impact,
    status: newIssue.status,
    expectedFixDate: newIssue.expectedFixDate,
    createdAt: newIssue.createdAt,
    updatedAt: newIssue.updatedAt,
  }
}

// Update an existing issue
export async function updateIssue(
  id: string,
  updates: Partial<Omit<Issue, "id" | "createdAt">>,
  modifiedBy: string,
): Promise<Issue | null> {
  const doc = await getGoogleSheetsClient()
  const sheet = doc.sheetsByIndex[0]

  const rows = await sheet.getRows()
  const row = rows.find((r) => r.get("ID") === id)

  if (!row) return null

  const now = new Date().toISOString()

  // Update fields
  if (updates.title !== undefined) row.set("Title", updates.title)
  if (updates.type !== undefined) row.set("Type", updates.type)
  if (updates.description !== undefined) row.set("Description", updates.description)
  if (updates.impact !== undefined) row.set("Impact", updates.impact)
  if (updates.status !== undefined) {
    row.set("Status", updates.status)
    // Set expected fix date when status changes to assigned
    if (updates.status === "assigned" && !row.get("Expected Fix Date")) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() + 7) // Default 7 days from now
      row.set("Expected Fix Date", expectedDate.toISOString().split("T")[0])
    }
  }
  if (updates.expectedFixDate !== undefined) row.set("Expected Fix Date", updates.expectedFixDate)

  row.set("Updated At", now)
  row.set("Last Modified By", modifiedBy)

  await row.save()

  return {
    id: row.get("ID"),
    title: row.get("Title"),
    type: row.get("Type"),
    description: row.get("Description"),
    impact: row.get("Impact"),
    status: row.get("Status"),
    expectedFixDate: row.get("Expected Fix Date"),
    createdAt: row.get("Created At"),
    updatedAt: row.get("Updated At"),
  }
}

// Delete an issue
export async function deleteIssue(id: string): Promise<boolean> {
  const doc = await getGoogleSheetsClient()
  const sheet = doc.sheetsByIndex[0]

  const rows = await sheet.getRows()
  const row = rows.find((r) => r.get("ID") === id)

  if (!row) return false

  await row.delete()
  return true
}

// Initialize the sheet with headers if it's empty
export async function initializeSheet(): Promise<void> {
  const doc = await getGoogleSheetsClient()
  const sheet = doc.sheetsByIndex[0]

  const rows = await sheet.getRows()

  if (rows.length === 0) {
    await sheet.setHeaderRow([
      "ID",
      "Title",
      "Type",
      "Description",
      "Impact",
      "Status",
      "Expected Fix Date",
      "Created At",
      "Updated At",
      "Last Modified By",
    ])
  }
}
