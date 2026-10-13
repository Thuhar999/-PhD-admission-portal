import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, CheckCircle2, Clock, AlertTriangle, XCircle,
  Search, Filter, Download, ArrowLeft, RefreshCw,
  Hash, Eye, ShieldAlert,
  Send, X
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { DEPARTMENTS } from '@/data/departments'
import type { Application } from '@/types/application'
import { getReviewApplications, updateApplicationStatus, downloadDocumentWithAuth } from '@/services/api'
import { formatDate, saveCurrentApplication } from '@/utils/storage'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProgramme, setSelectedProgramme] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Active review modal state
  const [reviewApp, setReviewApp] = useState<Application | null>(null)
  const [reviewDecision, setReviewDecision] = useState<string>('UNDER_REVIEW')
  const [reviewNote, setReviewNote] = useState<string>('')
  const [submittingDecision, setSubmittingDecision] = useState(false)
  const [decisionFeedback, setDecisionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null)

  const loadApplications = async () => {
    setLoading(true)
    setError('')
    try {
      const filters: { status?: string; programme?: string } = {}
      if (selectedStatus !== 'ALL') filters.status = selectedStatus
      if (selectedProgramme !== 'ALL') filters.programme = selectedProgramme
      const list = await getReviewApplications(filters)
      setApplications(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch applications from the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadApplications()
  }, [selectedProgramme, selectedStatus])

  const openReviewModal = (app: Application) => {
    setReviewApp(app)
    setReviewDecision(
      app.workflowStatus === 'SUBMITTED' ? 'UNDER_REVIEW' : app.workflowStatus || 'UNDER_REVIEW'
    )
    setReviewNote('')
    setDecisionFeedback(null)
  }

  const handleUpdateStatus = async () => {
    if (!reviewApp) return
    setSubmittingDecision(true)
    setDecisionFeedback(null)
    try {
      const updated = await updateApplicationStatus(reviewApp.id, reviewDecision, reviewNote)
      setDecisionFeedback({ type: 'success', message: `Status updated to ${reviewDecision} successfully!` })
      setReviewApp(updated)
      // Update in master list
      setApplications(prev => prev.map(a => (a.id === updated.id ? updated : a)))
      setTimeout(() => {
        setReviewApp(null)
      }, 1500)
    } catch (err) {
      setDecisionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update application status.',
      })
    } finally {
      setSubmittingDecision(false)
    }
  }

  const handleDownloadDocument = async (downloadUrl: string, fileName: string, docId: string) => {
    setDownloadingDocId(docId)
    try {
      await downloadDocumentWithAuth(downloadUrl, fileName)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download document.')
    } finally {
      setDownloadingDocId(null)
    }
  }

  const handleViewFullDoc = (app: Application) => {
    saveCurrentApplication(app)
    navigate('/application/view')
  }

  // Filter applications by search query
  const filteredApps = applications.filter(app => {
    const matchesSearch =
      !searchQuery.trim() ||
      app.applicationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.scholar.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.scholar.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Quick Metrics
  const stats = {
    total: applications.length,
    submitted: applications.filter(a => (a.workflowStatus || a.status || '').toUpperCase() === 'SUBMITTED').length,
    underReview: applications.filter(a => (a.workflowStatus || a.status || '').toUpperCase() === 'UNDER_REVIEW').length,
    needsInfo: applications.filter(a => (a.workflowStatus || a.status || '').toUpperCase() === 'NEEDS_INFORMATION').length,
    approved: applications.filter(a => (a.workflowStatus || a.status || '').toUpperCase() === 'APPROVED').length,
    rejected: applications.filter(a => (a.workflowStatus || a.status || '').toUpperCase() === 'REJECTED').length,
  }

  const renderBadge = (status?: string) => {
    const st = (status || '').toUpperCase()
    if (st === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-100 text-green-800 font-bold text-[11px] rounded-full border border-green-200">
          <CheckCircle2 size={12} /> APPROVED
        </span>
      )
    }
    if (st === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-100 text-red-800 font-bold text-[11px] rounded-full border border-red-200">
          <XCircle size={12} /> REJECTED
        </span>
      )
    }
    if (st === 'NEEDS_INFORMATION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[11px] rounded-full border border-amber-300">
          <AlertTriangle size={12} /> NEEDS INFO
        </span>
      )
    }
    if (st === 'UNDER_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-[11px] rounded-full border border-blue-200">
          <Clock size={12} /> UNDER REVIEW
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full border border-emerald-200">
        <CheckCircle2 size={12} /> SUBMITTED
      </span>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-[#f8f9f6]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold mb-2">
              <ShieldAlert size={14} className="text-amber-700" />
              Administrative Staff Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Ph.D. Application Review & Decisions
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Verify submitted scholar details, certificates, supervisor information, and issue committee decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadApplications()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/phd-admission')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Candidate View
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total</span>
            <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Submitted</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">{stats.submitted}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Under Review</span>
            <div className="text-2xl font-extrabold text-blue-700 mt-0.5">{stats.underReview}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Needs Info</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-0.5">{stats.needsInfo}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-2xs">
            <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block">Approved</span>
            <div className="text-2xl font-extrabold text-green-700 mt-0.5">{stats.approved}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-red-200 shadow-2xs">
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">Rejected</span>
            <div className="text-2xl font-extrabold text-red-700 mt-0.5">{stats.rejected}</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by application number, candidate name, or email…"
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-100 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Filter size={14} />
              <span>Filters:</span>
            </div>

            {/* Programme Selector */}
            <select
              value={selectedProgramme}
              onChange={e => setSelectedProgramme(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-primary-600"
            >
              <option value="ALL">All Programmes</option>
              {DEPARTMENTS.map(d => (
                <option key={d.code} value={d.code}>Ph.D. in {d.name}</option>
              ))}
            </select>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-primary-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="NEEDS_INFORMATION">Needs Information</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => void loadApplications()} className="underline font-bold">Retry</button>
          </div>
        )}

        {/* Applications Data Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-36">App Number</th>
                  <th className="py-3.5 px-4">Research Scholar</th>
                  <th className="py-3.5 px-4">Programme</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading candidate applications…
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No applications found matching the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map(app => {
                    const dept = DEPARTMENTS.find(d => d.code === app.selectedProgramme)
                    return (
                      <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-maroon-800">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-maroon-50 rounded border border-maroon-200">
                            <Hash size={11} className="text-maroon-700" />
                            {app.applicationNumber || 'DRAFT'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{app.scholar.name || '—'}</div>
                          <div className="text-[11px] text-gray-500">{app.scholar.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-gray-800">Ph.D. – {app.selectedProgramme}</span>
                          <span className="text-[11px] text-gray-500 block">{dept?.fullName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {formatDate(app.submittedAt || app.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {renderBadge(app.workflowStatus || app.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openReviewModal(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                          >
                            <FileText size={13} /> Review
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewFullDoc(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                            title="Preview Printable Form"
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Review Modal / Drawer */}
      {reviewApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">
                      Application #{reviewApp.applicationNumber}
                    </h2>
                    {renderBadge(reviewApp.workflowStatus || reviewApp.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    Ph.D. in {reviewApp.selectedProgramme} • {reviewApp.scholar.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewApp(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {decisionFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold ${
                    decisionFeedback.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {decisionFeedback.message}
                </div>
              )}

              {/* Scholar Summary */}
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-3">
                  Candidate & Research Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium">Full Name:</span>
                    <p className="font-semibold text-gray-900">{reviewApp.scholar.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Email:</span>
                    <p className="font-semibold text-gray-900">{reviewApp.scholar.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Contact Number:</span>
                    <p className="font-semibold text-gray-900">{reviewApp.scholar.contactNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Study Mode:</span>
                    <p className="font-semibold text-primary-900">{reviewApp.scholar.studyMode || 'Full Time'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 font-medium">Proposed Topic:</span>
                    <p className="font-semibold text-gray-900 italic">"{reviewApp.scholar.proposedResearchTopic}"</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 font-medium">Supervisor:</span>
                    <p className="font-semibold text-gray-900">
                      {reviewApp.supervisor.name} ({reviewApp.supervisor.profession}) — {reviewApp.supervisor.addressOfInstitution}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Verification */}
              <div>
                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2.5">
                  Uploaded Certificates & Documents ({reviewApp.documents.length})
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {reviewApp.documents.map(doc => {
                    const isUploaded = doc.status === 'uploaded' && doc.downloadUrl
                    return (
                      <div key={doc.id} className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-gray-50/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={16} className={isUploaded ? 'text-primary-700' : 'text-gray-300'} />
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-800 truncate block">{doc.name}</span>
                            <span className="text-[11px] text-gray-400 block truncate">
                              {doc.fileName ?? (doc.optional ? 'Not provided (Optional)' : 'Pending upload')}
                            </span>
                          </div>
                        </div>

                        {isUploaded ? (
                          <button
                            type="button"
                            disabled={downloadingDocId === doc.id}
                            onClick={() => handleDownloadDocument(doc.downloadUrl!, doc.fileName ?? `${doc.name}.pdf`, doc.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0"
                          >
                            <Download size={13} />
                            {downloadingDocId === doc.id ? 'Downloading…' : 'Download'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-400 italic">Not Uploaded</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Status History / Audit Trail */}
              {reviewApp.statusHistory && reviewApp.statusHistory.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2">
                    Review Audit Trail
                  </h3>
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2 max-h-36 overflow-y-auto">
                    {reviewApp.statusHistory.map(entry => (
                      <div key={entry.id} className="text-[11px] border-b border-gray-200/70 pb-1.5 last:border-b-0">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-gray-800">{entry.status}</span>
                          <span className="text-gray-400">{formatDate(entry.createdAt)}</span>
                        </div>
                        {entry.note && <p className="text-gray-600 mt-0.5">{entry.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Committee Decision Action Box */}
              <div className="p-4 bg-primary-50/60 border border-primary-200 rounded-2xl space-y-3">
                <h3 className="font-bold text-primary-950 uppercase tracking-wide text-xs">
                  Issue Review Decision
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Decision Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reviewDecision}
                      onChange={e => setReviewDecision(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:border-primary-700"
                    >
                      <option value="UNDER_REVIEW">UNDER_REVIEW (In Progress)</option>
                      <option value="NEEDS_INFORMATION">NEEDS_INFORMATION (Request Corrections)</option>
                      <option value="APPROVED">APPROVED (Admit Candidate)</option>
                      <option value="REJECTED">REJECTED (Decline Application)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Reviewer Note / Remarks (Visible to Candidate)
                    </label>
                    <textarea
                      rows={2}
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      placeholder="e.g., Certificate copies verified. Approved for Departmental Research Committee interview."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:border-primary-700 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewApp(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => void handleUpdateStatus()}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    <Send size={13} />
                    {submittingDecision ? 'Saving Decision…' : 'Submit Decision'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
