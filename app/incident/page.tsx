"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, X, BarChart3, ListChecks, FileDown } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from "recharts"
import * as XLSX from "xlsx"
import Link from "next/link"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Badge } from "@/components/ui/badge"
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

const statusOptions = ["Open", "In Progress", "Resolved", "Closed"]

type Incident = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  status: string;
  date: string;
};

function getDefaultIncident() {
  return {
    id: 0,
    created_at: "",
    title: "",
    description: "",
    status: "Open",
    date: new Date().toISOString().slice(0, 10),
  }
}

export default function IncidentPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(getDefaultIncident())
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("")
  const [nav, setNav] = useState<'incidents' | 'analytics'>('incidents')
  const pageSize = 5
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteIdx, setDeleteIdx] = useState<number|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Analytics data
  const chartData = statusOptions.map(status => ({
    name: status,
    value: incidents.filter(i => i.status === status).length
  }))

  // Filtered incidents
  const filtered = incidents.filter(i => {
    const matchesStatus = filterStatus === "all" || i.status === filterStatus
    const matchesDate = !filterDate || i.date === filterDate
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesDate && matchesSearch
  })
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Incidents")
    XLSX.writeFile(wb, `incidents_${Date.now()}.xlsx`)
  }

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    // Header
    doc.setFontSize(20)
    doc.text("SSA Logistics", pageWidth / 2, 15, { align: "center" })
    doc.setFontSize(16)
    doc.text("Incident Management Report", pageWidth / 2, 25, { align: "center" })
    doc.setFontSize(10)
    const reportDate = new Date().toLocaleDateString()
    doc.text(`Report Date: ${reportDate}`, pageWidth / 2, 35, { align: "center" })
    // Table
    autoTable(doc, {
      startY: 45,
      head: [[
        "Title",
        "Description",
        "Status",
        "Date"
      ]],
      body: filtered.map(incident => [
        incident.title,
        incident.description,
        incident.status,
        incident.date
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 10 },
      theme: 'grid',
      didDrawPage: function(data) {
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.5)
        doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.height - 20)
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
    doc.save(`incidents_${Date.now()}.pdf`)
  }

  // Add Incident
  const openAdd = () => { setForm(getDefaultIncident()); setShowAdd(true) }
  const closeAdd = () => { setShowAdd(false); setForm(getDefaultIncident()) }
  const saveAdd = async () => {
    if (!form.title || !form.status || !form.date) return
    const supabase = createSupabaseClient() as NonNullable<ReturnType<typeof createSupabaseClient>>
    const { data, error } = await supabase
      .from("incident")
      .insert({
        title: form.title,
        description: form.description,
        status: form.status,
        date: form.date,
      })
      .select()
    if (error) {
      setError(error.message)
      return
    }
    if (data && data[0]) {
      const newIncident: Incident = {
        id: Number(data[0].id),
        created_at: String(data[0].created_at),
        title: String(data[0].title),
        description: String(data[0].description),
        status: String(data[0].status),
        date: String(data[0].date),
      }
      setIncidents(prev => [newIncident, ...prev])
    }
    closeAdd()
  }

  // Edit Incident
  const openEdit = (idx: number) => {
    setEditIdx(idx)
    setForm(incidents[idx])
    setShowEdit(true)
  }
  const closeEdit = () => { setShowEdit(false); setEditIdx(null); setForm(getDefaultIncident()) }
  const saveEdit = async () => {
    if (!form.title || !form.status || !form.date) return
    const supabase = createSupabaseClient() as NonNullable<ReturnType<typeof createSupabaseClient>>
    const { error } = await supabase
      .from("incident")
      .update({
        title: form.title,
        description: form.description,
        status: form.status,
        date: form.date,
      })
      .eq("id", form.id)
    if (error) {
      setError(error.message)
      return
    }
    setIncidents(prev => prev.map(i =>
      i.id === form.id ? {
        ...i,
        title: form.title,
        description: form.description,
        status: form.status,
        date: form.date,
      } : i
    ))
    closeEdit()
  }

  // Delete Incident
  const deleteIncident = async (idx: number) => {
    const incident = paged[idx]
    const supabase = createSupabaseClient() as NonNullable<ReturnType<typeof createSupabaseClient>>
    const { error } = await supabase
      .from("incident")
      .delete()
      .eq("id", incident.id)
    if (error) {
      setError(error.message)
      return
    }
    setIncidents(prev => prev.filter(i => i.id !== incident.id))
  }

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true)
      setError(null)
      const supabaseConfigured = isSupabaseConfigured()
      if (!supabaseConfigured) {
        setError("Supabase is not configured.")
        setLoading(false)
        return
      }
      const supabase = createSupabaseClient() as NonNullable<ReturnType<typeof createSupabaseClient>>
      const { data, error } = await supabase
        .from("incident")
        .select("id, created_at, title, description, status, date")
        .order("created_at", { ascending: false })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setIncidents(
        (data || []).map((item: any) => ({
          id: Number(item.id),
          created_at: String(item.created_at),
          title: String(item.title),
          description: String(item.description),
          status: String(item.status),
          date: String(item.date),
        }))
      )
      setLoading(false)
    }
    fetchIncidents()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-600">Loading incidents...</span>
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
            <button
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150 ${nav === 'incidents' ? 'bg-blue-100 text-blue-700 shadow font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setNav('incidents')}
            >
              <ListChecks className="h-6 w-6" /> Incidents
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150 ${nav === 'analytics' ? 'bg-blue-100 text-blue-700 shadow font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setNav('analytics')}
            >
              <BarChart3 className="h-6 w-6" /> Analytics
            </button>
          </nav>
        </div>
        <Button onClick={exportToPDF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow w-full font-semibold">
          <FileDown className="h-5 w-5" /> Export to PDF
        </Button>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 w-full h-16 flex items-center px-8 bg-white border-b shadow-sm">
          <span className="text-2xl font-extrabold text-blue-800 tracking-tight">Incident Management</span>
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
            {nav === 'incidents' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-blue-800">Incidents</h1>
                  <Button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
                    <Plus className="h-4 w-4" /> Report Incident
                  </Button>
                </div>
                {/* Filters and Search */}
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Search by title or description"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    style={{ minWidth: 200 }}
                  />
                  <select className="border rounded px-3 py-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="date" className="border rounded px-3 py-2" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                </div>
                {/* Incident Table */}
                <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 font-semibold">Title</th>
                        <th className="py-2 px-3 font-semibold">Description</th>
                        <th className="py-2 px-3 font-semibold">Status</th>
                        <th className="py-2 px-3 font-semibold">Date</th>
                        <th className="py-2 px-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-400">No incidents found.</td>
                        </tr>
                      ) : paged.map((incident, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">{incident.title}</td>
                          <td className="py-2 px-3">{incident.description}</td>
                          <td className="py-2 px-3">
                            <Badge className={
                              incident.status === "Open" ? "bg-yellow-100 text-yellow-800" :
                              incident.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                              incident.status === "Resolved" ? "bg-green-100 text-green-800" :
                              incident.status === "Closed" ? "bg-gray-200 text-gray-700" :
                              "bg-gray-100 text-gray-700"
                            }>{incident.status}</Badge>
                          </td>
                          <td className="py-2 px-3">{incident.date}</td>
                          <td className="py-2 px-3 flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(idx)} title="Edit">
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { setDeleteIdx(idx); setShowDelete(true) }} title="Delete">
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
                  <CardTitle>Incidents by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Count" isAnimationActive fill="#3b82f6">
                        <LabelList dataKey="value" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Add Incident Modal */}
          {showAdd && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3" onClick={closeAdd}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4">Report Incident</h2>
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
                      <select className="w-full border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
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
          {/* Edit Incident Modal */}
          {showEdit && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3" onClick={closeEdit}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4">Edit Incident</h2>
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
                      <select className="w-full border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
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
          {/* Delete Confirmation Dialog */}
          {showDelete && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3" onClick={() => setShowDelete(false)}><X className="h-5 w-5 text-gray-400" /></button>
                <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete this incident?</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => { deleteIncident(deleteIdx!); setShowDelete(false) }} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
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