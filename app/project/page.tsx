"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, X, BarChart3, FolderKanban, FileDown } from "lucide-react"
import Link from "next/link"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Badge } from "@/components/ui/badge"
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

// Types
const statusOptions = ["Planned", "In Progress", "Completed"] as const;
type ProjectStatus = typeof statusOptions[number];

interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  created_at: string;
}

const navOptions = [
  { key: 'projects', label: 'Projects', icon: <FolderKanban className="h-6 w-6" /> },
  { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-6 w-6" /> },
]

const defaultForm: Omit<Project, "id" | "created_at"> = {
  name: "",
  description: "",
  status: "Planned",
  start_date: "",
  end_date: "",
}

export default function ProjectPage() {
  const [nav, setNav] = useState<'projects' | 'analytics'>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<Omit<Project, "id" | "created_at">>(defaultForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const pageSize = 5
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteId, setDeleteId] = useState<number|null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      setError(null)
      const supabaseConfigured = isSupabaseConfigured()
      if (!supabaseConfigured) {
        setError("Supabase is not configured.")
        setLoading(false)
        return
      }
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("project")
        .select("id, name, description, status, start_date, end_date, created_at")
        .order("created_at", { ascending: false })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setProjects(data || [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  // Filtered projects
  const filtered = projects.filter(p => {
    const matchesStatus = filterStatus === "all" || p.status === filterStatus
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Chart data
  const chartData = statusOptions.map(status => ({
    name: status,
    value: projects.filter(p => p.status === status).length
  }))

  // Add Project Handlers
  const openAdd = () => { setForm(defaultForm); setShowAdd(true) }
  const closeAdd = () => { setShowAdd(false); setForm(defaultForm) }
  const saveAdd = async () => {
    if (!form.name || !form.start_date || !form.end_date) return
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("project")
      .insert({
        name: form.name,
        description: form.description,
        status: form.status,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      .select()
    if (error) {
      setError(error.message)
      return
    }
    if (data && data[0]) {
      setProjects(prev => [data[0], ...prev])
    }
    closeAdd()
  }

  // Edit Project Handlers
  const openEdit = (project: Project) => {
    setEditId(project.id)
    setForm({
      name: project.name,
      description: project.description,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
    })
    setShowEdit(true)
  }
  const closeEdit = () => { setShowEdit(false); setEditId(null); setForm(defaultForm) }
  const saveEdit = async () => {
    if (!form.name || !form.start_date || !form.end_date) return
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from("project")
      .update({
        name: form.name,
        description: form.description,
        status: form.status,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      .eq("id", editId)
    if (error) {
      setError(error.message)
      return
    }
    setProjects(prev => prev.map(p =>
      p.id === editId ? { ...p, ...form } : p
    ))
    closeEdit()
  }

  // Delete Project
  const deleteProject = async (id: number) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from("project")
      .delete()
      .eq("id", id)
    if (error) {
      setError(error.message)
      return
    }
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    // Header
    doc.setFontSize(20)
    doc.text("Hesu Investment Limited", pageWidth / 2, 15, { align: "center" })
    doc.setFontSize(16)
    doc.text("Project Management Report", pageWidth / 2, 25, { align: "center" })
    doc.setFontSize(10)
    const reportDate = new Date().toLocaleDateString()
    doc.text(`Report Date: ${reportDate}`, pageWidth / 2, 35, { align: "center" })
    // Table
    autoTable(doc, {
      startY: 45,
      head: [[
        "Name",
        "Description",
        "Status",
        "Start Date",
        "End Date"
      ]],
      body: filtered.map(project => [
        project.name,
        project.description,
        project.status,
        project.start_date,
        project.end_date
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 2,
        lineColor: [6, 182, 212], // cyan border
        lineWidth: 0.7,
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [6, 182, 212],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.7,
        lineColor: [6, 182, 212],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 10 },
      theme: 'grid',
      didDrawPage: function(data) {
        doc.setDrawColor(6, 182, 212)
        doc.setLineWidth(2)
        doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.height - 20, 'D')
      }
    })
    // Footer
    const docAny = doc as any;
    const pageCount = docAny.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      docAny.setPage(i);
      docAny.setFontSize(8);
      docAny.text(
        `Page ${i} of ${pageCount} - Generated on ${reportDate}`,
        pageWidth / 2,
        docAny.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    doc.save(`projects_${Date.now()}.pdf`)
    return doc
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-600">Loading projects...</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-red-600">{error}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex">
      {/* Fixed Sidebar Navigation */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg flex flex-col py-8 px-4 gap-6 z-30 justify-between">
        <div>
          <nav className="flex flex-col gap-2 mt-4">
            {navOptions.map(opt => (
              <button
                key={opt.key}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150 ${nav === opt.key ? 'bg-cyan-100 text-cyan-700 shadow font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setNav(opt.key as 'projects' | 'analytics')}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </nav>
        </div>
        <Button onClick={exportToPDF} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded shadow w-full font-semibold">
          <FileDown className="h-5 w-5" /> Export to PDF
        </Button>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 w-full h-16 flex items-center px-8 bg-white border-b shadow-sm">
          <span className="text-2xl font-extrabold text-cyan-800 tracking-tight">Project Management</span>
          <div className="ml-auto">
            <Link href="/">
              <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded shadow">
                Back to Landing Page
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center px-4">
          <div className="w-full max-w-5xl flex flex-col gap-6 flex-1 justify-center">
            {nav === 'projects' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-cyan-800">Projects</h1>
                  <Button onClick={openAdd} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded shadow">
                    <Plus className="h-4 w-4" /> Add Project
                  </Button>
                </div>
                {/* Filters and Search */}
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Search by name or description"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    style={{ minWidth: 200 }}
                  />
                  <select className="border rounded px-3 py-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {/* Project Table */}
                <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 font-semibold">Name</th>
                        <th className="py-2 px-3 font-semibold">Description</th>
                        <th className="py-2 px-3 font-semibold">Status</th>
                        <th className="py-2 px-3 font-semibold">Start Date</th>
                        <th className="py-2 px-3 font-semibold">End Date</th>
                        <th className="py-2 px-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400">No projects found.</td>
                        </tr>
                      ) : paged.map((project, idx) => (
                        <tr key={project.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">{project.name}</td>
                          <td className="py-2 px-3">{project.description}</td>
                          <td className="py-2 px-3">
                            <Badge className={
                              project.status === "Planned" ? "bg-yellow-100 text-yellow-800" :
                              project.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                              project.status === "Completed" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-700"
                            }>{project.status}</Badge>
                          </td>
                          <td className="py-2 px-3">{project.start_date}</td>
                          <td className="py-2 px-3">{project.end_date}</td>
                          <td className="py-2 px-3 flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(project)} title="Edit">
                              <Edit className="h-4 w-4 text-cyan-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { setDeleteId(project.id); setShowDelete(true) }} title="Delete">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                      <span>Page {page} of {totalPages}</span>
                      <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                    </div>
                  )}
                </div>
              </>
            )}
            {nav === 'analytics' && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Projects by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Count" isAnimationActive fill="#06b6d4">
                        <LabelList dataKey="value" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Add Project Modal */}
          {showAdd && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3" onClick={closeAdd}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4">Add Project</h2>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveAdd(); }}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea className="w-full border rounded px-3 py-2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select className="w-full border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white">Add</Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={closeAdd}>Cancel</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Edit Project Modal */}
          {showEdit && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3" onClick={closeEdit}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4">Edit Project</h2>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea className="w-full border rounded px-3 py-2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select className="w-full border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white">Save</Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={closeEdit}>Cancel</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Delete Confirmation Dialog */}
          {showDelete && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3" onClick={() => setShowDelete(false)}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete this project?</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => { deleteProject(deleteId!); setShowDelete(false) }} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 