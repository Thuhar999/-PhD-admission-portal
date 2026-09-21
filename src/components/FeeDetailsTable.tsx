import { Plus, Trash2 } from 'lucide-react'
import { FormSection } from '@/components/FormSection'
import { PAYMENT_MODES } from '@/data/departments'
import type { FeePayment } from '@/types/application'

interface Props {
  data: FeePayment[]
  onChange: (data: FeePayment[]) => void
  readOnly?: boolean
}

export function FeeDetailsTableStep({ data, onChange, readOnly }: Props) {
  const addRow = () => {
    const newId = (data.length + 1).toString()
    onChange([
      ...data,
      { id: newId, academicYear: '', date: '', amount: '', modeOfPayment: 'UPI', details: '' }
    ])
  }

  const removeRow = (index: number) => {
    if (data.length <= 1) return
    const updated = data.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateCell = (index: number, field: keyof FeePayment, value: string) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  return (
    <FormSection number={6} title="Details of Fee Paid at Research Centre">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 font-medium">
          Enter details of tuition fee, registration fee, or research center fee paid so far.
        </p>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary-800 text-white font-semibold text-xs tracking-wider uppercase">
                <th className="py-3 px-4 w-12 text-center">Sl.</th>
                <th className="py-3 px-4 min-w-[150px]">Academic Year</th>
                <th className="py-3 px-4 min-w-[150px]">Date of Payment</th>
                <th className="py-3 px-4 min-w-[140px]">Amount (₹)</th>
                <th className="py-3 px-4 min-w-[160px]">Mode of Payment</th>
                <th className="py-3 px-4 min-w-[180px]">Reference / Details</th>
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
                      <span className="font-medium text-gray-800">{row.academicYear || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.academicYear}
                        placeholder="e.g., 2026-27"
                        onChange={e => updateCell(index, 'academicYear', e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-200 outline-none"
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="text-gray-700">{row.date || '—'}</span>
                    ) : (
                      <input
                        type="date"
                        value={row.date}
                        onChange={e => updateCell(index, 'date', e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-200 outline-none"
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="font-semibold text-gray-800">{row.amount ? `₹${row.amount}` : '—'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.amount}
                        placeholder="e.g., 25000"
                        onChange={e => updateCell(index, 'amount', e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-200 outline-none"
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="text-gray-800 font-medium">{row.modeOfPayment || '—'}</span>
                    ) : (
                      <select
                        value={row.modeOfPayment || 'UPI'}
                        onChange={e => updateCell(index, 'modeOfPayment', e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-200 outline-none bg-white"
                      >
                        {PAYMENT_MODES.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="text-gray-600 text-xs">{row.details || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.details}
                        placeholder="Txn ID / DD No. / Bank"
                        onChange={e => updateCell(index, 'details', e.target.value)}
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
            <Plus size={14} /> Add Payment
          </button>
        )}
      </div>
    </FormSection>
  )
}
