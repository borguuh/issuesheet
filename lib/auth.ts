// Simple hardcoded admin authentication
export interface AdminUser {
  username: string
  password: string
  name: string
}

// Hardcoded admin credentials - in production, use proper hashing
const ADMIN_USERS: AdminUser[] = [
  {
    username: "admin",
    password: "admin123", // In production, use bcrypt or similar
    name: "Administrator",
  },
]

export function validateAdmin(username: string, password: string): AdminUser | null {
  const user = ADMIN_USERS.find((u) => u.username === username && u.password === password)
  return user || null
}

export function isValidSession(token: string): AdminUser | null {
  try {
    // Simple base64 encoding for demo - use JWT in production
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [username, password] = decoded.split(":")
    return validateAdmin(username, password)
  } catch {
    return null
  }
}

export function createSession(username: string, password: string): string | null {
  const user = validateAdmin(username, password)
  if (!user) return null

  // Simple base64 encoding for demo - use JWT in production
  return Buffer.from(`${username}:${password}`).toString("base64")
}
