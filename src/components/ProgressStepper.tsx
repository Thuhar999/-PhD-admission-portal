import { Check } from 'lucide-react'
import { FORM_STEPS } from '@/data/departments'
import type { FormStep } from '@/types/application'
import { cn } from '@/lib/utils'

interface Props {
  currentStep: FormStep
  onStepClick?: (step: FormStep) => void
}

export function ProgressStepper({ currentStep, onStepClick }: Props) {
  return (
    <div className="w-full overflow-x-auto no-print">
      <div className="flex items-start min-w-max px-4 py-3 gap-0">
        {FORM_STEPS.map((s, idx) => {
          const done = s.step < currentStep
          const active = s.step === currentStep
          return (
            <div key={s.step} className="flex items-start">
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => done && onStepClick?.(s.step as FormStep)}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                  done  ? 'bg-primary-700 border-primary-700 text-white' :
                  active ? 'bg-white border-primary-700 text-primary-700 ring-2 ring-primary-200' :
                           'bg-white border-gray-300 text-gray-400'
                )}>
                  {done ? <Check size={14} /> : s.step}
                </div>
                <span className={cn(
                  'mt-1 text-xs font-medium text-center whitespace-nowrap max-w-[72px] leading-tight',
                  active ? 'text-primary-700' : done ? 'text-primary-600' : 'text-gray-400'
                )}>{s.shortLabel}</span>
              </div>
              {idx < FORM_STEPS.length - 1 && (
                <div className={cn(
                  'h-0.5 w-8 mt-4 mx-1 flex-shrink-0 transition-colors',
                  done ? 'bg-primary-700' : 'bg-gray-200'
                )} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
