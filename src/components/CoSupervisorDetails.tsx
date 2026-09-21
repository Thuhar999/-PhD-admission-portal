import { FormSection, Field, Input, Textarea } from '@/components/FormSection'
import type { CoSupervisorDetails } from '@/types/application'

interface Props {
  data: CoSupervisorDetails
  onChange: (data: CoSupervisorDetails) => void
  readOnly?: boolean
}

export function CoSupervisorDetailsStep({ data, onChange, readOnly }: Props) {
  const set = (key: keyof CoSupervisorDetails) => (val: string | boolean) =>
    onChange({ ...data, [key]: val })

  return (
    <FormSection number={3} title="Details of Co - Research Supervisor (if any)">
      <div className="space-y-6">
        {/* Toggle Question */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Do you have a Co-Research Supervisor?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => set('hasCoSupervisor')(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                data.hasCoSupervisor
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              YES
            </button>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => set('hasCoSupervisor')(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                !data.hasCoSupervisor
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {/* Co-supervisor fields if YES */}
        {data.hasCoSupervisor ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <Field label="Name of Co-Supervisor" className="md:col-span-2">
              <Input
                value={data.name}
                onChange={set('name')}
                placeholder="Dr. / Prof. Full Name"
                disabled={readOnly}
              />
            </Field>

            <Field label="Email ID">
              <Input
                value={data.email}
                onChange={set('email')}
                type="email"
                placeholder="cosupervisor@institution.edu"
                disabled={readOnly}
              />
            </Field>

            <Field label="Contact Number">
              <Input
                value={data.contactNumber}
                onChange={set('contactNumber')}
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                disabled={readOnly}
              />
            </Field>

            <Field label="WhatsApp Number">
              <Input
                value={data.whatsapp}
                onChange={set('whatsapp')}
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                disabled={readOnly}
              />
            </Field>

            <Field label="Profession / Designation">
              <Input
                value={data.profession}
                onChange={set('profession')}
                placeholder="e.g., Associate Professor, Department of CSE"
                disabled={readOnly}
              />
            </Field>

            <Field label="Address of the Institution" className="md:col-span-2">
              <Textarea
                value={data.addressOfInstitution}
                onChange={set('addressOfInstitution')}
                placeholder="Name and complete postal address of the research institution"
                rows={3}
                disabled={readOnly}
              />
            </Field>

            <Field label="Address for Communication" className="md:col-span-2">
              <Textarea
                value={data.addressForCommunication}
                onChange={set('addressForCommunication')}
                placeholder="Residential / office communication address"
                rows={3}
                disabled={readOnly}
              />
            </Field>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-sm font-medium">No Co-Research Supervisor selected.</p>
            <p className="text-xs text-gray-400 mt-1">
              Select "YES" above if your Ph.D. research involves a co-supervisor.
            </p>
          </div>
        )}
      </div>
    </FormSection>
  )
}
