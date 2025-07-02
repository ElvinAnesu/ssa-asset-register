"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Calendar, Flag, Edit, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import React from "react"

// Types
 type ActivityStatus = "Pending" | "In Progress" | "Completed";
 type Priority = "High" | "Medium" | "Low";

interface Activity {
  id: number;
  title: string;
  description: string;
  status: ActivityStatus;
  dueDate: string; // ISO string
  assignedBy: string;
  assignedTo: string;
  priority: Priority;
  createdAt: string; // ISO string
}

const statusColors: Record<ActivityStatus, string> = {
  "Pending": "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Completed": "bg-green-100 text-green-800",
}
const priorityColors: Record<Priority, string> = {
  "High": "bg-red-100 text-red-700",
  "Medium": "bg-orange-100 text-orange-700",
  "Low": "bg-gray-100 text-gray-700",
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const statusOrder: ActivityStatus[] = ["Pending", "In Progress", "Completed"]

interface KanbanBoardProps {
  activities: Activity[]
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>
  search: string
  filterStatus: "all" | ActivityStatus
  filterPriority: "all" | Priority
  filterAssignedTo: string
  openAdd?: () => void
  openEdit: (activity: Activity) => void
  openDelete: (id: number) => void
}

export default function KanbanBoard({
  activities,
  setActivities,
  search,
  filterStatus,
  filterPriority,
  filterAssignedTo,
  openEdit,
  openDelete,
}: KanbanBoardProps) {
  // Group activities by status (filtered)
  const grouped: Record<ActivityStatus, Activity[]> = {
    "Pending": [],
    "In Progress": [],
    "Completed": [],
  }
  activities.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "all" || a.status === filterStatus
    const matchesPriority = filterPriority === "all" || a.priority === filterPriority
    const matchesAssignedTo = filterAssignedTo === "all" || a.assignedTo === filterAssignedTo
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignedTo
  }).forEach((a) => grouped[a.status].push(a))

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
      {statusOrder.map((status) => (
        <div key={status} className="flex flex-col min-h-[200px] bg-white rounded-lg shadow border p-4">
          <div className={`mb-4 text-lg font-semibold px-2 py-1 rounded ${statusColors[status]}`}>{status}</div>
          <div className="flex flex-col gap-6">
            {grouped[status].length === 0 ? (
              <Card className="text-center py-8 border-dashed border-2 border-gray-200 bg-gray-50">
                <CardContent>
                  <p className="text-gray-400">No activities</p>
                </CardContent>
              </Card>
            ) : (
              grouped[status].map((activity) => (
                <div key={activity.id} className="mb-2">
                  <Card className="shadow-md border-none relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-lg">
                          {getInitials(activity.assignedTo)}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold mb-1">{activity.title}</CardTitle>
                          <CardDescription className="text-gray-500 mb-1">{activity.description}</CardDescription>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge className={priorityColors[activity.priority]}><Flag className="h-3 w-3 mr-1 inline" />{activity.priority} Priority</Badge>
                            <Badge className="bg-gray-200 text-gray-700"><User className="h-3 w-3 mr-1 inline" />{activity.assignedTo}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end min-w-[120px] mt-2 md:mt-0">
                        <Badge className="bg-gray-100 text-gray-700 mb-1"><Calendar className="h-3 w-3 mr-1 inline" />Due: {format(parseISO(activity.dueDate), 'MMM d, yyyy')}</Badge>
                        <span className="text-xs text-gray-400">Created: {format(parseISO(activity.createdAt), 'MMM d, yyyy')}</span>
                        <div className="flex gap-2 mt-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(activity)} title="Edit">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openDelete(activity.id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 