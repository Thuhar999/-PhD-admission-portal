import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { PhDAdmission } from '@/pages/PhDAdmission'
import { ApplicationForm } from '@/pages/ApplicationForm'
import { Review } from '@/pages/Review'
import { Submitted } from '@/pages/Submitted'
import { ViewApplication } from '@/pages/ViewApplication'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Portal Login */}
        <Route path="/" element={<Login />} />

        {/* Ph.D. Programme Selection */}
        <Route path="/phd-admission" element={<PhDAdmission />} />

        {/* Multi-step Application Form */}
        <Route path="/application" element={<ApplicationForm />} />

        {/* Review Application */}
        <Route path="/review" element={<Review />} />

        {/* Submission Confirmation */}
        <Route path="/submitted" element={<Submitted />} />

        {/* Final Document View & Print */}
        <Route path="/application/view" element={<ViewApplication />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
