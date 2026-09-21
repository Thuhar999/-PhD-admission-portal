export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto text-xs text-gray-500 text-center font-poppins no-print">
      <div className="max-w-7xl mx-auto px-4 space-y-1">
        <p className="font-semibold text-gray-700">
          Sahyadri College of Engineering & Management, Mangaluru
        </p>
        <p>
          An Autonomous Institution, Affiliated to Visvesvaraya Technological University (VTU), Belagavi • NAAC A+ Grade • NBA Accredited
        </p>
        <p className="text-gray-400 text-[11px] pt-1">
          © {new Date().getFullYear()} Sahyadri CEM. All Rights Reserved. Ph.D. Admissions & Research Centre.
        </p>
      </div>
    </footer>
  )
}
