import { useRef, useState, useEffect } from 'react'
import { Pen, Upload, Trash2, Save } from 'lucide-react'
import type { Signature } from '@/types/application'
import { fileToBase64 } from '@/utils/storage'
import { cn } from '@/lib/utils'

interface Props {
  value: Signature
  onChange: (sig: Signature) => void
  readOnly?: boolean
}

export function SignaturePad({ value, onChange, readOnly }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'draw' | 'upload'>('draw')
  const [drawing, setDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [mode])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); setDrawing(true); setHasDrawn(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!drawing) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y); ctx.stroke()
  }

  const endDraw = () => setDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    onChange({ type: 'none' })
  }

  const saveDrawn = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onChange({ type: 'drawn', data: canvas.toDataURL('image/png') })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ type: 'uploaded', data: await fileToBase64(file) })
  }

  if (readOnly) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 w-48 h-20 flex items-center justify-center bg-gray-50">
        {value.data ? (
          <img src={value.data} alt="Signature" className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-xs text-gray-400 font-medium">No signature</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['draw', 'upload'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              mode === m ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {m === 'draw' ? <Pen size={12} /> : <Upload size={12} />}
            {m === 'draw' ? 'Draw Signature' : 'Upload Signature'}
          </button>
        ))}
      </div>
      {mode === 'draw' ? (
        <div className="space-y-2">
          <canvas ref={canvasRef} width={400} height={120}
            className="sig-canvas w-full h-28 border-2 border-dashed border-gray-300 rounded-lg bg-white"
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
          <p className="text-xs text-gray-400">Sign above using your mouse or touch</p>
          <div className="flex gap-2">
            <button type="button" onClick={clearCanvas}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              <Trash2 size={12} /> Clear
            </button>
            <button type="button" onClick={saveDrawn} disabled={!hasDrawn}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors disabled:opacity-50">
              <Save size={12} /> Save Signature
            </button>
          </div>
          {value.type === 'drawn' && (
            <p className="text-xs text-green-700 font-semibold">✓ Signature saved</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center">
            <Upload size={16} /> Upload Signature Image
          </button>
          {value.type === 'uploaded' && value.data && (
            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex items-center gap-3">
              <img src={value.data} alt="Signature" className="h-12 object-contain" />
              <span className="text-xs text-green-700 font-semibold">✓ Uploaded</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={handleUpload} />
        </div>
      )}
    </div>
  )
}
