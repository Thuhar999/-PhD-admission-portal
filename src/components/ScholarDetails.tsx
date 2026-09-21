import { FormSection, Field, Input, Textarea } from '@/components/FormSection'
import type { ScholarDetails } from '@/types/application'
import type { ValidationErrors } from '@/utils/storage'

interface Props {
  data: ScholarDetails
  onChange: (data: ScholarDetails) => void
  errors: ValidationErrors
  readOnly?: boolean
}

export function ScholarDetailsStep({ data, onChange, errors, readOnly }: Props) {
  const set = (key: keyof ScholarDetails) => (val: string) =>
    onChange({ ...data, [key]: val })

  return (
    <FormSection number={1} title="Details of Research Scholar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name" required error={errors.name} className="md:col-span-2">
          <Input value={data.name} onChange={set('name')} placeholder="Full name of research scholar" disabled={readOnly} />
        </Field>

        <Field label="Email ID" required error={errors.email}>
          <Input value={data.email} onChange={set('email')} type="email" placeholder="email@example.com" disabled={readOnly} />
        </Field>

        <Field label="Contact Number" required error={errors.contactNumber}>
          <Input value={data.contactNumber} onChange={set('contactNumber')} type="tel" placeholder="+91 XXXXX XXXXX" disabled={readOnly} />
        </Field>

        <Field label="WhatsApp Number">
          <Input value={data.whatsapp} onChange={set('whatsapp')} type="tel" placeholder="+91 XXXXX XXXXX" disabled={readOnly} />
        </Field>

        <Field label="Alternate Number">
          <Input value={data.alternateNumber} onChange={set('alternateNumber')} type="tel" placeholder="Alternate contact number" disabled={readOnly} />
        </Field>

        <Field label="Proposed Research Topic" required error={errors.proposedResearchTopic} className="md:col-span-2">
          <Textarea
            value={data.proposedResearchTopic}
            onChange={set('proposedResearchTopic')}
            placeholder="Enter your proposed research topic"
            rows={3}
            disabled={readOnly}
          />
        </Field>

        <Field label="Profession" required error={errors.profession}>
          <Input value={data.profession} onChange={set('profession')} placeholder="e.g., Software Engineer, Assistant Professor" disabled={readOnly} />
        </Field>

        <Field label="Name of Father / Guardian / Spouse" required error={errors.fatherGuardianSpouseName}>
          <Input value={data.fatherGuardianSpouseName} onChange={set('fatherGuardianSpouseName')} placeholder="Father / Guardian / Spouse name" disabled={readOnly} />
        </Field>

        <Field label="Part Time / Full Time" required error={errors.studyMode} className="md:col-span-2">
          {readOnly ? (
            <div className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900">
              {data.studyMode || '—'}
            </div>
          ) : (
            <div className="flex gap-3">
              {(['Part Time', 'Full Time'] as const).map(mode => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => !readOnly && onChange({ ...data, studyMode: mode })}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      data.studyMode === mode
                        ? 'border-primary-700 bg-primary-700'
                        : 'border-gray-300 group-hover:border-primary-400'
                    }`}
                  >
                    {data.studyMode === mode && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          )}
        </Field>

        <Field label="Address for Communication" required error={errors.addressForCommunication} className="md:col-span-2">
          <Textarea
            value={data.addressForCommunication}
            onChange={set('addressForCommunication')}
            placeholder="Complete postal address for communication"
            rows={3}
            disabled={readOnly}
          />
        </Field>
      </div>
    </FormSection>
  )
}
