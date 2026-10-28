import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft, FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Navbar } from '@/components/Navbar'
import { ApplicationDocument } from '@/components/ApplicationDocument'
import type { Application } from '@/types/application'
import { loadDraft } from '@/utils/storage'

export function ViewApplication() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [app, setApp] = useState<Application | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    void (async () => {
      const data = await loadDraft()
      if (!data) {
        navigate('/phd-admission')
        return
      }
      setApp(data)

      // Trigger print dialog if directed with ?print=true
      if (searchParams.get('print') === 'true') {
        setTimeout(() => {
          window.print()
        }, 500)
      }
    })()
  }, [navigate, searchParams])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    const element = document.getElementById('application-document')
    if (!element || !app) return
    setIsGeneratingPdf(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const imgData = canvas.toDataURL('image/png')

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      pdf.save(`PhD_Application_${app.applicationNumber || 'Draft'}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Could not generate PDF. Please use the Print option instead.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (!app) return null

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-[#f0f2f5] print:bg-white print:m-0 print:p-0">
      {/* Portal Navbar (hidden on print) */}
      <Navbar applicationNumber={app.applicationNumber} />

      {/* Action Header Bar (hidden on print) */}
      <div className="bg-white border-b border-gray-200 py-3.5 px-4 sm:px-6 shadow-xs sticky top-16 z-30 no-print">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={app.status === 'submitted' ? "/submitted" : "/application"}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-800">
                Official Ph.D. Registration Form
              </span>
              {app.applicationNumber && (
                <span className="text-xs font-mono font-bold text-maroon-700 bg-maroon-50 px-2 py-0.5 rounded border border-maroon-200">
                  {app.applicationNumber}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Printer size={15} />
              PRINT APPLICATION (A4)
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-5 py-2 bg-maroon-700 hover:bg-maroon-800 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown size={15} />
                  DOWNLOAD PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <main id="application-document" className="flex-1 max-w-5xl w-full mx-auto px-2 sm:px-6 py-6 print:p-0 print:max-w-none print:m-0">
        <ApplicationDocument application={app} />
      </main>

      {/* Screen-only footer note */}
      <div className="text-center py-6 text-xs text-gray-400 no-print">
        Sahyadri College of Engineering & Management • Official Doctoral Registration Record
      </div>
    </div>
  )
}
