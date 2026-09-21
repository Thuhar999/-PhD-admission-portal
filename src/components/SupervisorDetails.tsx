import { FormSection, Field, Input, Textarea } from '@/components/FormSection'
import type { SupervisorDetails } from '@/types/application'
import type { ValidationErrors } from '@/utils/storage'

interface Props {
  data: SupervisorDetails
  onChange: (data: SupervisorDetails) => void
  errors: ValidationErrors
  readOnly?: boolean
}

export function SupervisorDetailsStep({ data, onChange, errors, readOnly }: Props) {
  const set = (key: keyof SupervisorDetails) => (val: string) =>
    onChange({ ...data, [key]: val })

  return (
    <FormSection number={2} title="Details of Research Supervisor">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name of Supervisor" required error={errors.name} className="md:col-span-2">
          <Input
            value={data.name}
            onChange={set('name')}
            placeholder="Dr. / Prof. Full Name"
            disabled={readOnly}
          />
        </Field>

        <Field label="Email ID" required error={errors.email}>
          <Input
            value={data.email}
            onChange={set('email')}
            type="email"
            placeholder="supervisor@institution.edu"
            disabled={readOnly}
          />
        </Field>

        <Field label="Contact Number" required error={errors.contactNumber}>
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

        <Field label="Profession / Designation" required error={errors.profession}>
          <Input
            value={data.profession}
            onChange={set('profession')}
            placeholder="e.g., Professor & Head, Department of CSE"
            disabled={readOnly}
          />
        </Field>

        <Field label="Address of the Institution" required error={errors.addressOfInstitution} className="md:col-span-2">
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
    </FormSection>
  )
}
