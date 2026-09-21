import type { Application } from '@/types/application'
import { formatDate } from '@/utils/storage'
import { DECLARATION_TEXT } from '@/data/departments'

interface Props {
  application: Application
}

export function ApplicationDocument({ application }: Props) {
  const { scholar, supervisor, coSupervisor, qualifications, documents, feePayments, declaration, signature } = application

  return (
    <div className="print-doc bg-white mx-auto max-w-4xl shadow-lg border border-gray-200 text-gray-900 font-poppins text-xs leading-relaxed print:shadow-none print:border-none print:max-w-none print:text-black">
      {/* ========================================================================= */}
      {/* PAGE 1                                                                    */}
      {/* ========================================================================= */}
      <div className="p-8 sm:p-10 page-break-after">
        {/* College Header */}
        <div className="text-center pb-3 border-b-2 border-primary-900">
          <div className="flex items-center justify-center gap-4 mb-1">
            <img src="/sahyadri-logo.png" alt="Sahyadri Logo" className="h-16 w-auto object-contain" />
            <div className="text-left">
              <h1 className="text-lg font-bold tracking-widest text-primary-900 uppercase">SAHYADRI</h1>
              <p className="text-xs font-bold text-gray-800 tracking-wide">COLLEGE OF ENGINEERING & MANAGEMENT</p>
              <p className="text-[10px] text-gray-600 font-medium">An Autonomous Institution, Affiliated to VTU, Belagavi • MANGALURU</p>
            </div>
          </div>
          <div className="mt-2 text-center">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider underline">
              REGISTRATION FORM / ADMISSION FOR Ph.D.
            </h2>
            <div className="inline-block mt-1 px-4 py-0.5 border border-primary-800 bg-primary-50/50 text-primary-900 font-bold text-xs uppercase">
              ADMISSION FOR Ph.D. UNDER: {application.selectedProgramme}
            </div>
            {application.applicationNumber && (
              <p className="text-[11px] font-semibold text-maroon-700 mt-1">
                Application No: <span className="font-bold">{application.applicationNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Top bar with photo */}
        <div className="flex justify-between items-start my-3">
          <div className="text-[11px] text-gray-600">
            <p><span className="font-semibold text-gray-800">Status:</span> {application.status.toUpperCase()}</p>
            <p><span className="font-semibold text-gray-800">Date of Submission:</span> {formatDate(application.submittedAt || application.createdAt)}</p>
          </div>
          {/* Photo Box */}
          <div className="w-24 h-32 border-2 border-dashed border-gray-400 rounded flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 text-center p-1">
            {application.photograph ? (
              <img src={application.photograph} alt="Scholar Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-[10px] text-gray-400">
                Affix Passport Size Photograph
              </div>
            )}
          </div>
        </div>

        {/* SECTION 1: Details of Research Scholar */}
        <div className="mb-4">
          <div className="bg-primary-900 text-white px-3 py-1 font-bold text-xs tracking-wide">
            1. Details of Research Scholar
          </div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50 w-1/3">Name</td>
                <td className="border border-gray-300 p-2 font-medium" colSpan={3}>{scholar.name || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Email ID</td>
                <td className="border border-gray-300 p-2">{scholar.email || '—'}</td>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Contact number</td>
                <td className="border border-gray-300 p-2">{scholar.contactNumber || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">WhatsApp</td>
                <td className="border border-gray-300 p-2">{scholar.whatsapp || '—'}</td>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Alternate number</td>
                <td className="border border-gray-300 p-2">{scholar.alternateNumber || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Proposed Research Topic</td>
                <td className="border border-gray-300 p-2 font-medium" colSpan={3}>{scholar.proposedResearchTopic || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Profession</td>
                <td className="border border-gray-300 p-2">{scholar.profession || '—'}</td>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Part Time / Full Time</td>
                <td className="border border-gray-300 p-2 font-bold text-primary-900">{scholar.studyMode || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Name of Father / Guardian / Spouse</td>
                <td className="border border-gray-300 p-2" colSpan={3}>{scholar.fatherGuardianSpouseName || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50 align-top">Address for communication</td>
                <td className="border border-gray-300 p-2 whitespace-pre-line" colSpan={3}>{scholar.addressForCommunication || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2: Details of Research Supervisor */}
        <div className="mb-4">
          <div className="bg-primary-900 text-white px-3 py-1 font-bold text-xs tracking-wide">
            2. Details of Research Supervisor
          </div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50 w-1/3">Name</td>
                <td className="border border-gray-300 p-2 font-medium" colSpan={3}>{supervisor.name || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Email</td>
                <td className="border border-gray-300 p-2">{supervisor.email || '—'}</td>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Contact number</td>
                <td className="border border-gray-300 p-2">{supervisor.contactNumber || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">WhatsApp</td>
                <td className="border border-gray-300 p-2">{supervisor.whatsapp || '—'}</td>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Profession</td>
                <td className="border border-gray-300 p-2">{supervisor.profession || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50 align-top">Address of the Institution</td>
                <td className="border border-gray-300 p-2 whitespace-pre-line" colSpan={3}>{supervisor.addressOfInstitution || '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50 align-top">Address for communication</td>
                <td className="border border-gray-300 p-2 whitespace-pre-line" colSpan={3}>{supervisor.addressForCommunication || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 3: Details of Co - Research Supervisor */}
        <div>
          <div className="bg-primary-900 text-white px-3 py-1 font-bold text-xs tracking-wide">
            3. Details of Co - Research Supervisor (if any)
          </div>
          {coSupervisor.hasCoSupervisor ? (
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold bg-gray-50 w-1/3">Name</td>
                  <td className="border border-gray-300 p-2 font-medium" colSpan={3}>{coSupervisor.name || '—'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Email</td>
                  <td className="border border-gray-300 p-2">{coSupervisor.email || '—'}</td>
                  <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Contact number</td>
                  <td className="border border-gray-300 p-2">{coSupervisor.contactNumber || '—'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold bg-gray-50">WhatsApp</td>
                  <td className="border border-gray-300 p-2">{coSupervisor.whatsapp || '—'}</td>
                  <td className="border border-gray-300 p-2 font-semibold bg-gray-50">Profession</td>
                  <td className="border border-gray-300 p-2">{coSupervisor.profession || '—'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold bg-gray-50 align-top">Address of the Institution</td>
                  <td className="border border-gray-300 p-2 whitespace-pre-line" colSpan={3}>{coSupervisor.addressOfInstitution || '—'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-semibold bg-gray-50 align-top">Address for communication</td>
                  <td className="border border-gray-300 p-2 whitespace-pre-line" colSpan={3}>{coSupervisor.addressForCommunication || '—'}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="border border-gray-300 p-3 text-center text-gray-500 italic bg-gray-50">
              Not Applicable / No Co-Research Supervisor
            </div>
          )}
        </div>

        <div className="text-right text-[10px] text-gray-400 mt-4">
          Page 1 of 2
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2                                                                    */}
      {/* ========================================================================= */}
      <div className="p-8 sm:p-10 page-break-before">
        <div className="text-center pb-2 mb-4 border-b border-gray-300">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            Sahyadri College of Engineering & Management • Ph.D. Admission Registration Form
          </p>
        </div>

        {/* SECTION 4: Qualification Details */}
        <div className="mb-4">
          <div className="bg-primary-900 text-white px-3 py-1 font-bold text-xs tracking-wide">
            4. Qualification Details
          </div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100 font-semibold text-gray-800">
                <th className="border border-gray-300 p-2 text-center w-12">Sl. No.</th>
                <th className="border border-gray-300 p-2 text-left">Degree – UG & PG Details</th>
                <th className="border border-gray-300 p-2 text-left">University</th>
                <th className="border border-gray-300 p-2 text-center w-28">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {qualifications.map((q, idx) => (
                <tr key={q.id || idx}>
                  <td className="border border-gray-300 p-2 text-center text-gray-600 font-medium">{idx + 1}</td>
                  <td className="border border-gray-300 p-2 font-medium">{q.degree || '—'}</td>
                  <td className="border border-gray-300 p-2">{q.university || '—'}</td>
                  <td className="border border-gray-300 p-2 text-center font-semibold">{q.percentage || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 5: Documents to be submitted */}
        <div className="mb-4">
          <div className="bg-primary-900 text-white px-3 py-1 font-bold text-xs tracking-wide">
            5. Documents to be submitted
          </div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100 font-semibold text-gray-800">
                <th className="border border-gray-300 p-2 text-center w-12">Sl. No.</th>
                <th className="border border-gray-300 p-2 text-left">Documents</th>
                <th className="border border-gray-300 p-2 text-center w-36">Enclosed / Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td className="border border-gray-300 p-2 text-center text-gray-600 font-medium">{d.slNo}</td>
                  <td className="border border-gray-300 p-2">
                    {d.name} {d.optional && <span className="text-[10px] text-gray-500 italic">(if claimed)</span>}
                  </td>
                  <td className="border border-gray-300 p-2 text-center font-semibold">
                    {d.status === 'uploaded' ? (
                      <span className="text-green-800">YES (Uploaded)</span>
                    ) : (
                      <span className="text-gray-400">NO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 6: Details of Fee Paid at Research Centre */}
        <div className="mb-4">
          <div className="bg-primary-900 text-white px-3 py-1 font-bold text-xs tracking-wide">
            6. Details of Fee Paid at Research Centre
          </div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100 font-semibold text-gray-800">
                <th className="border border-gray-300 p-2 text-center w-12">Sl. No.</th>
                <th className="border border-gray-300 p-2 text-left">Academic Year</th>
                <th className="border border-gray-300 p-2 text-left">Date</th>
                <th className="border border-gray-300 p-2 text-left">Amount</th>
                <th className="border border-gray-300 p-2 text-left">Details / Mode of Payment</th>
              </tr>
            </thead>
            <tbody>
              {feePayments.map((f, idx) => (
                <tr key={f.id || idx}>
                  <td className="border border-gray-300 p-2 text-center text-gray-600 font-medium">{idx + 1}</td>
                  <td className="border border-gray-300 p-2">{f.academicYear || '—'}</td>
                  <td className="border border-gray-300 p-2">{f.date || '—'}</td>
                  <td className="border border-gray-300 p-2 font-semibold">{f.amount ? `₹${f.amount}` : '—'}</td>
                  <td className="border border-gray-300 p-2">
                    {f.modeOfPayment || '—'} {f.details ? `(${f.details})` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Declaration */}
        <div className="mb-4 border border-gray-300 p-3 bg-gray-50/50 rounded text-justify">
          <h4 className="font-bold text-gray-900 mb-1">Declaration:</h4>
          <p className="text-[11px] text-gray-700 leading-normal whitespace-pre-line mb-4">
            {DECLARATION_TEXT}
          </p>
          <div className="flex justify-between items-end pt-3 border-t border-gray-200">
            <div>
              <p><span className="font-semibold">Date:</span> {declaration.date || formatDate(application.createdAt)}</p>
              <p className="mt-1"><span className="font-semibold">Place:</span> Mangaluru</p>
            </div>
            <div className="text-center">
              {signature.data ? (
                <div className="mb-1">
                  <img src={signature.data} alt="Applicant Signature" className="h-10 mx-auto object-contain" />
                </div>
              ) : (
                <div className="h-10 mb-1 border-b border-gray-400 w-36 mx-auto"></div>
              )}
              <p className="font-bold text-gray-900 border-t border-gray-400 pt-1 px-4">Applicant Signature</p>
            </div>
          </div>
        </div>

        {/* Remarks and Official Signatures */}
        <div className="border border-gray-300 p-3 bg-white avoid-break">
          <h4 className="font-bold text-gray-900 mb-2 underline uppercase text-[11px]">
            Remarks & Official Signatures (For Official Use Only)
          </h4>
          <div className="mb-6">
            <p className="text-[11px] text-gray-600 font-medium">Remarks:</p>
            <div className="h-6 border-b border-dashed border-gray-300"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center pt-2">
            <div className="border-t border-gray-400 pt-1">
              <p className="text-[10px] text-amber-700 font-semibold mb-3">Pending Verification</p>
              <p className="font-semibold text-gray-800 text-[10px] leading-tight">Research Supervisor</p>
            </div>
            <div className="border-t border-gray-400 pt-1">
              <p className="text-[10px] text-amber-700 font-semibold mb-3">Pending Verification</p>
              <p className="font-semibold text-gray-800 text-[10px] leading-tight">Head of Research Centre</p>
            </div>
            <div className="border-t border-gray-400 pt-1">
              <p className="text-[10px] text-amber-700 font-semibold mb-3">Pending Verification</p>
              <p className="font-semibold text-gray-800 text-[10px] leading-tight">Research Coordinator</p>
            </div>
            <div className="border-t border-gray-400 pt-1">
              <p className="text-[10px] text-amber-700 font-semibold mb-3">Pending Verification</p>
              <p className="font-semibold text-gray-800 text-[10px] leading-tight">Academic Administrative Officer</p>
            </div>
            <div className="border-t border-gray-400 pt-1">
              <p className="text-[10px] text-amber-700 font-semibold mb-3">Pending Approval</p>
              <p className="font-bold text-gray-900 text-[10px] leading-tight">Principal</p>
            </div>
          </div>
        </div>

        <div className="text-right text-[10px] text-gray-400 mt-4">
          Page 2 of 2
        </div>
      </div>
    </div>
  )
}
