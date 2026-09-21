import { Plus, Trash2 } from 'lucide-react'
import { FormSection } from '@/components/FormSection'
import type { Qualification } from '@/types/application'

interface Props {
  data: Qualification[]
  onChange: (data: Qualification[]) => void
  readOnly?: boolean
}

export function QualificationTableStep({ data, onChange, readOnly }: Props) {
  const addRow = () => {
    const newId = (data.length + 1).toString()
    onChange([
      ...data,
      { id: newId, degree: '', university: '', percentage: '' }
    ])
  }

  const removeRow = (index: number) => {
    if (data.length <= 1) return
    const updated = data.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateCell = (index: number, field: keyof Qualification, value: string) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  return (
    <FormSection number={4} title="Qualification Details">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 font-medium">
          Please enter your undergraduate (UG), postgraduate (PG), and other relevant academic qualifications.
        </p>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary-800 text-white font-semibold text-xs tracking-wider uppercase">
                <th className="py-3 px-4 w-12 text-center">Sl.</th>
                <th className="py-3 px-4 min-w-[200px]">Degree – UG & PG Details</th>
                <th className="py-3 px-4 min-w-[200px]">University / Board</th>
                <th className="py-3 px-4 w-32">Percentage / CGPA</th>
                {!readOnly && <th className="py-3 px-4 w-16 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-4 text-center text-xs font-semibold text-gray-500">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="font-medium text-gray-800">{row.degree || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.degree}
                        placeholder={index === 0 ? "e.g., B.E. / B.Tech (Computer Science)" : index === 1 ? "e.g., M.Tech / M.E. / M.Sc" : "Degree Name"}
                        onChange={e => updateCell(index, 'degree', e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-200 outline-none"
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="text-gray-700">{row.university || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.university}
                        placeholder="e.g., VTU, Belagavi"
                        onChange={e => updateCell(index, 'university', e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-200 outline-none"
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="font-semibold text-gray-800">{row.percentage || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.percentage}
                        placeholder="e.g., 78.5% or 8.2"
                        onChange={e => updateCell(index, 'percentage', e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-200 outline-none"
                      />
                    )}
                  </td>
                  {!readOnly && (
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={data.length <= 1}
                        title="Delete entry"
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 border border-primary-700 text-primary-700 rounded-lg text-xs font-semibold hover:bg-primary-50 transition-colors"
          >
            <Plus size={14} /> Add Qualification
          </button>
        )}
      </div>
    </FormSection>
  )
}
