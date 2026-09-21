import { useRef } from 'react'
import { Camera, X, RefreshCw } from 'lucide-react'
import { fileToBase64 } from '@/utils/storage'

interface Props {
  value?: string
  onChange: (data: string | undefined) => void
  readOnly?: boolean
}

export function PhotoUpload({ value, onChange, readOnly }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    onChange(b64)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => !readOnly && inputRef.current?.click()}
        className={`w-28 h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center overflow-hidden ${
          readOnly ? 'cursor-default' : 'cursor-pointer hover:border-primary-400 transition-colors'
        } ${value ? 'border-primary-300 bg-primary-50' : 'border-gray-300 bg-gray-50'}`}
      >
        {value ? (
          <img src={value} alt="Applicant" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 p-2 text-center">
            <Camera size={24} />
            <span className="text-xs font-medium">Applicant Photograph</span>
            <span className="text-xs">Click to upload</span>
          </div>
        )}
      </div>
      {!readOnly && value && (
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50 rounded transition-colors">
            <RefreshCw size={11} /> Replace
          </button>
          <button type="button" onClick={() => onChange(undefined)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors">
            <X size={11} /> Remove
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpg,image/jpeg,image/png" className="hidden" onChange={handleFile} />
    </div>
  )
}
