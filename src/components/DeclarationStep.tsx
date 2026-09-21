import { FormSection } from '@/components/FormSection'
import { SignaturePad } from '@/components/SignaturePad'
import { DECLARATION_TEXT } from '@/data/departments'
import type { Declaration, Signature } from '@/types/application'

interface Props {
  declaration: Declaration
  signature: Signature
  onDeclarationChange: (d: Declaration) => void
  onSignatureChange: (s: Signature) => void
  error?: string
  readOnly?: boolean
}

export function DeclarationStep({
  declaration,
  signature,
  onDeclarationChange,
  onSignatureChange,
  error,
  readOnly,
}: Props) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <FormSection number="7" title="Declaration">
        <div className="space-y-6">
          {/* Declaration Text Box */}
          <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-5 text-gray-800 text-sm leading-relaxed font-normal whitespace-pre-line">
            {DECLARATION_TEXT}
          </div>

          {/* Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={declaration.agreed}
                onChange={e =>
                  onDeclarationChange({
                    agreed: e.target.checked,
                    date: e.target.checked ? (declaration.date || today) : '',
                  })
                }
                className="mt-1 w-4 h-4 text-primary-700 rounded border-gray-300 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-primary-800 transition-colors">
                I confirm that I have read and understood the declaration and that the information provided by me is true and correct.
              </span>
            </label>
            {error && <p className="text-xs text-red-600 font-medium mt-1.5 ml-7">{error}</p>}
          </div>

          {/* Date and Signature Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={declaration.date || today}
                onChange={e => onDeclarationChange({ ...declaration, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Applicant Signature <span className="text-red-500">*</span>
              </label>
              <SignaturePad
                value={signature}
                onChange={onSignatureChange}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  )
}
