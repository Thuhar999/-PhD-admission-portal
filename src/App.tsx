import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { PhDAdmission } from '@/pages/PhDAdmission'
import { ApplicationForm } from '@/pages/ApplicationForm'
import { Review } from '@/pages/Review'
import { Submitted } from '@/pages/Submitted'
import { ViewApplication } from '@/pages/ViewApplication'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public: Portal Login & Registration */}
        <Route path="/" element={<Login />} />

        {/* Protected Applicant Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Ph.D. Programme Selection & Applicant Dashboard */}
          <Route path="/phd-admission" element={<PhDAdmission />} />

          {/* Multi-step Application Form */}
          <Route path="/application" element={<ApplicationForm />} />

          {/* Review Application */}
          <Route path="/review" element={<Review />} />

          {/* Submission Confirmation */}
          <Route path="/submitted" element={<Submitted />} />

          {/* Final Document View & Print */}
          <Route path="/application/view" element={<ViewApplication />} />
        </Route>

        {/* Protected Staff & Reviewer Portal */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'REVIEWER']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
