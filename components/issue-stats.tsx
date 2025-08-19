"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Issue } from "@/lib/google-sheets"
import { BarChart3, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface IssueStatsProps {
  issues: Issue[]
}

export function IssueStats({ issues }: IssueStatsProps) {
  const stats = {
    total: issues.length,
    open: issues.filter((issue) => issue.status === "open").length,
    assigned: issues.filter((issue) => issue.status === "assigned").length,
    closed: issues.filter((issue) => issue.status === "closed").length,
    features: issues.filter((issue) => issue.type === "feature").length,
    bugs: issues.filter((issue) => issue.type === "issue").length,
  }

  const statCards = [
    {
      title: "Total Issues",
      value: stats.total,
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "Open",
      value: stats.open,
      icon: AlertCircle,
      color: "text-red-600",
    },
    {
      title: "Assigned",
      value: stats.assigned,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Closed",
      value: stats.closed,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
