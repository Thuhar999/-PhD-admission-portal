import type { Programme } from '@/types/application'

interface Props {
  programme?: Programme
  showTitle?: boolean
}

export function CollegeHeader({ programme, showTitle = true }: Props) {
  return (
    <div className="text-center py-4 border-b-2 border-primary-800">
      <div className="flex items-center justify-center gap-4 mb-2">
        <img src="/sahyadri-logo.png" alt="Sahyadri" className="h-16 w-auto object-contain" />
        <div className="text-left">
          <h1 className="text-xl font-bold text-primary-800 tracking-widest">SAHYADRI</h1>
          <p className="text-sm font-semibold text-gray-700">COLLEGE OF ENGINEERING & MANAGEMENT</p>
          <p className="text-xs text-gray-500 font-medium">An Autonomous Institution • MANGALURU</p>
        </div>
      </div>
      {showTitle && (
        <div className="mt-3">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Registration Form / Admission for Ph.D.</h2>
          {programme && (
            <p className="text-sm font-semibold text-primary-700 mt-1">
              ADMISSION FOR Ph.D. UNDER: <span className="text-maroon-700">{programme}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
