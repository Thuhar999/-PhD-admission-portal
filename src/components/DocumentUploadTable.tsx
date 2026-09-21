import { useRef } from 'react'
import { Upload, CheckCircle2, AlertCircle, RefreshCw, X, FileText } from 'lucide-react'
import { FormSection } from '@/components/FormSection'
import type { DocumentInfo } from '@/types/application'
import { fileToBase64 } from '@/utils/storage'

interface Props {
  data: DocumentInfo[]
  onChange: (docs: DocumentInfo[]) => void
  readOnly?: boolean
}

export function DocumentUploadTableStep({ data, onChange, readOnly }: Props) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    const updated = data.map(doc => {
      if (doc.id === id) {
        return {
          ...doc,
          fileName: file.name,
          fileData: b64,
          status: 'uploaded' as const,
        }
      }
      return doc
    })
    onChange(updated)
    if (fileInputRefs.current[id]) {
      fileInputRefs.current[id]!.value = ''
    }
  }

  const handleRemove = (id: string) => {
    const updated = data.map(doc => {
      if (doc.id === id) {
        return {
          ...doc,
          fileName: undefined,
          fileData: undefined,
          status: 'pending' as const,
        }
      }
      return doc
    })
    onChange(updated)
  }

  return (
    <FormSection number={5} title="Documents to be submitted">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 font-medium">
          Upload clear scanned copies of the original certificates (PDF, JPG, JPEG, PNG). Maximum file size: 5MB per file.
        </p>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary-800 text-white font-semibold text-xs tracking-wider uppercase">
                <th className="py-3 px-4 w-12 text-center">Sl.</th>
                <th className="py-3 px-4 min-w-[220px]">Document Description</th>
                <th className="py-3 px-4 min-w-[160px]">File Name</th>
                <th className="py-3 px-4 w-32 text-center">Status</th>
                {!readOnly && <th className="py-3 px-4 w-44 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((doc) => {
                const isUploaded = doc.status === 'uploaded'
                return (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-center text-xs font-semibold text-gray-500">
                      {doc.slNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className={isUploaded ? "text-primary-700" : "text-gray-400"} />
                        <span className="font-semibold text-gray-800">{doc.name}</span>
                      </div>
                      {doc.optional && (
                        <span className="inline-block mt-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Optional - if claimed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {doc.fileName ? (
                        <span className="font-medium text-gray-700 truncate block max-w-[200px]" title={doc.fileName}>
                          {doc.fileName}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No file chosen</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={12} /> Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          <AlertCircle size={12} /> Pending
                        </span>
                      )}
                    </td>
                    {!readOnly && (
                      <td className="py-3 px-4 text-center">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          ref={el => { fileInputRefs.current[doc.id] = el }}
                          className="hidden"
                          onChange={e => handleUpload(doc.id, e)}
                        />
                        {isUploaded ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[doc.id]?.click()}
                              className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:bg-primary-50 px-2 py-1 rounded transition-colors"
                            >
                              <RefreshCw size={12} /> Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemove(doc.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                              <X size={12} /> Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 text-white rounded-md text-xs font-semibold hover:bg-primary-800 transition-colors shadow-sm"
                          >
                            <Upload size={12} /> Upload
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </FormSection>
  )
}
