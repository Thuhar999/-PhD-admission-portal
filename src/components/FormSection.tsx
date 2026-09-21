import { cn } from '@/lib/utils'

interface Props {
  number: number | string
  title: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ number, title, children, className }: Props) {
  return (
    <div className={cn('border border-gray-200 rounded-xl overflow-hidden bg-white', className)}>
      <div className="bg-primary-800 px-5 py-3">
        <h3 className="text-sm font-bold text-white tracking-wide">
          {number}. {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function Field({
  label, required, error, children, className
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 font-medium mt-0.5">{error}</p>}
    </div>
  )
}

export function Input({
  value, onChange, placeholder, type = 'text', className, disabled, readOnly
}: {
  value: string; onChange?: (v: string) => void; placeholder?: string
  type?: string; className?: string; disabled?: boolean; readOnly?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={cn(
        'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400',
        'outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all',
        disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
        readOnly && 'bg-gray-50 cursor-default',
        className
      )}
    />
  )
}

export function Textarea({
  value, onChange, placeholder, rows = 3, className, disabled
}: {
  value: string; onChange?: (v: string) => void; placeholder?: string
  rows?: number; className?: string; disabled?: boolean
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 resize-none',
        'outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all',
        disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
        className
      )}
    />
  )
}
