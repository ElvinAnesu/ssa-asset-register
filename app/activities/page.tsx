"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, User, Calendar, Flag, Edit, Trash2, X, ClipboardList, FolderKanban, BarChart3, ListChecks, CheckCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import dynamic from "next/dynamic"
import { toast } from "@/components/ui/use-toast"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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

const mockActivities: Activity[] = [
  {
    id: 1,
    title: "Inventory Audit",
    description: "Complete the quarterly inventory check for all IT assets.",
    status: "Pending",
    dueDate: "2024-07-10",
    assignedBy: "Admin",
    assignedTo: "John Doe",
    priority: "High",
    createdAt: "2024-07-01",
  },
  {
    id: 2,
    title: "Device Assignment",
    description: "Assign new laptops to the HR department.",
    status: "In Progress",
    dueDate: "2024-07-12",
    assignedBy: "Jane Smith",
    assignedTo: "Mary Johnson",
    priority: "Medium",
    createdAt: "2024-07-03",
  },
  {
    id: 3,
    title: "Printer Maintenance",
    description: "Schedule maintenance for all office printers.",
    status: "Completed",
    dueDate: "2024-07-01",
    assignedBy: "Admin",
    assignedTo: "John Doe",
    priority: "Low",
    createdAt: "2024-06-25",
  },
  {
    id: 4,
    title: "Network Upgrade",
    description: "Upgrade office network switches.",
    status: "Pending",
    dueDate: "2024-07-15",
    assignedBy: "IT Manager",
    assignedTo: "Mary Johnson",
    priority: "High",
    createdAt: "2024-07-05",
  },
]

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

const defaultForm: Omit<Activity, "id" | "createdAt"> = {
  title: "",
  description: "",
  status: "Pending",
  dueDate: "",
  assignedBy: "",
  assignedTo: "",
  priority: "Medium",
}

const KanbanBoard = dynamic(() => import("./KanbanBoard"), { ssr: false })

const statusOptions = ["Pending", "In Progress", "Completed"];
const priorityOptions = ["High", "Medium", "Low"];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<Omit<Activity, "id" | "createdAt">>(defaultForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [nav, setNav] = useState<'activities' | 'analytics'>('activities')

  // Filtered and searched activities
  const filtered = activities.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "all" || a.status === filterStatus
    const matchesPriority = filterPriority === "all" || a.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Chart data
  const chartData = statusOptions.map(status => ({
    name: status,
    value: activities.filter(a => a.status === status).length
  }))

  // Add Activity Handlers
  const openAdd = () => {
    setForm(defaultForm)
    setShowAdd(true)
  }
  const closeAdd = () => {
    setShowAdd(false)
    setForm(defaultForm)
  }
  const saveAdd = () => {
    if (!form.title || !form.dueDate) return
    setActivities(prev => [
      {
        ...form,
        id: Math.max(0, ...prev.map(a => a.id)) + 1,
        createdAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ])
    toast({ title: "Activity added" })
    closeAdd()
  }

  // Edit Activity Handlers
  const openEdit = (activity: Activity) => {
    setEditId(activity.id)
    setForm({
      title: activity.title,
      description: activity.description,
      status: activity.status,
      dueDate: activity.dueDate,
      assignedBy: activity.assignedBy,
      assignedTo: activity.assignedTo,
      priority: activity.priority,
    })
    setShowEdit(true)
  }
  const closeEdit = () => {
    setShowEdit(false)
    setEditId(null)
    setForm(defaultForm)
  }
  const saveEdit = () => {
    if (!form.title || !form.dueDate) return
    setActivities(prev => prev.map(a =>
      a.id === editId ? { ...a, ...form } : a
    ))
    toast({ title: "Activity updated" })
    closeEdit()
  }

  // Delete Activity Handlers
  const openDelete = (id: number) => {
    setDeleteId(id)
    setShowDelete(true)
  }
  const closeDelete = () => {
    setShowDelete(false)
    setDeleteId(null)
  }
  const confirmDelete = () => {
    setActivities(prev => prev.filter(a => a.id !== deleteId))
    toast({ title: "Activity deleted" })
    closeDelete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col">
      {/* System Name/Header */}
      <header className="w-full h-16 flex items-center px-8 bg-white border-b shadow-sm sticky top-0 z-30">
        <span className="text-2xl font-extrabold text-blue-800 tracking-tight">My Activities</span>
      </header>
      <div className="flex flex-1">
        {/* Fixed Sidebar Navigation */}
        <aside className="w-64 bg-white border-r shadow-lg flex flex-col py-8 px-4 gap-6 z-20 min-h-screen sticky top-16">
          <nav className="flex flex-col gap-2 mt-4">
            <button
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-medium transition-all ${nav === 'activities' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setNav('activities')}
            >
              <ListChecks className="h-6 w-6" /> Activities
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-medium transition-all ${nav === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setNav('analytics')}
            >
              <BarChart3 className="h-6 w-6" /> Analytics
            </button>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center py-12 px-4">
          <div className="w-full max-w-4xl flex flex-col gap-4">
            <div className="flex justify-end items-center w-full mb-4">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg text-center transition-all duration-200"
                title="Back to Landing Page"
              >
                Back to Landing Page
              </Link>
            </div>
          </div>
          {nav === 'activities' && (
            <div className="w-full max-w-4xl flex flex-col gap-4">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h1 className="text-3xl font-bold text-gray-800">Activities</h1>
                <Button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
                  <Plus className="h-4 w-4" /> Add Activity
                </Button>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="border rounded px-3 py-2 w-48"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select
                  className="border rounded px-3 py-2"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  className="border rounded px-3 py-2"
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* Table */}
              <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 font-semibold">Title</th>
                      <th className="py-2 px-3 font-semibold">Description</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                      <th className="py-2 px-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(activity => (
                      <tr key={activity.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{activity.title}</td>
                        <td className="py-2 px-3">{activity.description}</td>
                        <td className="py-2 px-3">
                          <span className={
                            activity.status === "Completed"
                              ? "bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                              : activity.status === "In Progress"
                              ? "bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                              : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs"
                          }>
                            {activity.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(activity)} title="Edit">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openDelete(activity.id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination */}
                <div className="flex justify-end gap-2 mt-4">
                  <Button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                    Previous
                  </Button>
                  <span className="self-center">Page {page} of {totalPages}</span>
                  <Button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
          {nav === 'analytics' && (
            <div className="w-full max-w-4xl flex flex-col gap-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics</h1>
              {/* Status summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-400 rounded-lg p-4 flex items-center gap-3 shadow">
                  <span className="bg-yellow-400 text-white rounded-full p-2"><ListChecks className="h-6 w-6" /></span>
                  <div>
                    <div className="text-lg font-bold text-yellow-700">{activities.filter(a => a.status === 'Pending').length}</div>
                    <div className="text-yellow-700 text-sm font-medium">Pending</div>
                  </div>
                </div>
                <div className="bg-blue-100 border-l-4 border-blue-400 rounded-lg p-4 flex items-center gap-3 shadow">
                  <span className="bg-blue-400 text-white rounded-full p-2"><BarChart3 className="h-6 w-6" /></span>
                  <div>
                    <div className="text-lg font-bold text-blue-700">{activities.filter(a => a.status === 'In Progress').length}</div>
                    <div className="text-blue-700 text-sm font-medium">In Progress</div>
                  </div>
                </div>
                <div className="bg-green-100 border-l-4 border-green-400 rounded-lg p-4 flex items-center gap-3 shadow">
                  <span className="bg-green-400 text-white rounded-full p-2"><CheckCircle className="h-6 w-6" /></span>
                  <div>
                    <div className="text-lg font-bold text-green-700">{activities.filter(a => a.status === 'Completed').length}</div>
                    <div className="text-green-700 text-sm font-medium">Completed</div>
                  </div>
                </div>
                <div className="bg-gray-100 border-l-4 border-gray-400 rounded-lg p-4 flex items-center gap-3 shadow">
                  <span className="bg-gray-400 text-white rounded-full p-2"><ClipboardList className="h-6 w-6" /></span>
                  <div>
                    <div className="text-lg font-bold text-gray-700">{activities.length}</div>
                    <div className="text-gray-700 text-sm font-medium">Total</div>
                  </div>
                </div>
              </div>
              {/* Chart */}
              <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center min-h-[360px] mb-8 border border-blue-200">
                <h2 className="text-xl font-bold mb-6 text-blue-700">Activities Status Chart</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[...chartData, { name: 'Total', value: activities.length }]}> 
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Count" isAnimationActive>
                      {([...(chartData), { name: 'Total', value: activities.length }]).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={
                          entry.name === 'Pending' ? '#facc15' :
                          entry.name === 'In Progress' ? '#3b82f6' :
                          entry.name === 'Completed' ? '#22c55e' :
                          '#a3a3a3'
                        } />
                      ))}
                      <LabelList dataKey="value" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {/* Add Activity Modal */}
          {showAdd && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3" onClick={closeAdd}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4">Add Activity</h2>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveAdd(); }}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input className="w-full border rounded px-3 py-2" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea className="w-full border rounded px-3 py-2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select className="w-full border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ActivityStatus }))}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <select className="w-full border rounded px-3 py-2" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                        {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Due Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Add</Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={closeAdd}>Cancel</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Edit Activity Modal */}
          {showEdit && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3" onClick={closeEdit}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4">Edit Activity</h2>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input className="w-full border rounded px-3 py-2" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea className="w-full border rounded px-3 py-2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select className="w-full border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ActivityStatus }))}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <select className="w-full border rounded px-3 py-2" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                        {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Due Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={closeEdit}>Cancel</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Delete Confirmation Modal */}
          {showDelete && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
                <button className="absolute top-3 right-3" onClick={closeDelete}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4 text-red-600">Delete Activity</h2>
                <p className="mb-6">Are you sure you want to delete this activity? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeDelete}>Cancel</Button>
                  <Button variant="destructive" className="flex-1" onClick={confirmDelete}>Delete</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 