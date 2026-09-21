import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, LogIn, GraduationCap,
  ShieldCheck, Sparkles
} from 'lucide-react'
import { saveAuth } from '@/utils/storage'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      saveAuth(email)
      setLoading(false)
      navigate('/phd-admission')
    }, 400)
  }

  const fillDemo = () => {
    setEmail('scholar.phd@sahyadri.edu.in')
    setPassword('Sahyadri@2026')
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col font-poppins relative bg-gray-900">
      {/* ── Clean Top Navigation Bar ── */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          {/* Sahyadri Shield Logo + Title */}
          <div className="flex items-center gap-3.5">
            <img
              src="/sahyadri-logo.png"
              alt="Sahyadri Logo"
              className="h-13 w-auto object-contain"
            />
            <div>
              <div className="font-extrabold text-primary-900 text-base leading-tight tracking-wider">
                SAHYADRI
              </div>
              <div className="text-xs font-semibold text-gray-700 leading-tight">
                COLLEGE OF ENGINEERING & MANAGEMENT
              </div>
              <div className="text-[10px] font-medium text-gray-500 leading-tight">
                An Autonomous Institution • MANGALURU
              </div>
            </div>
          </div>

          {/* Right Portal Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-50 text-primary-800 text-xs font-bold rounded-lg border border-primary-200 shadow-2xs">
              <GraduationCap size={15} className="text-primary-700" />
              Ph.D. Admission Portal
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main Hero Section with High-Res Campus Aerial Photo ── */}
      <div className="relative flex-1 flex items-center justify-center min-h-[calc(100vh-72px)] overflow-hidden">
        {/* Background Image: High-res Campus Aerial Photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="/campus-aerial.webp"
            alt="Sahyadri Campus Aerial View"
            className="w-full h-full object-cover object-center scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
          />
          {/* Natural gradient scrim so photo is visible and crisp */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/92 via-primary-950/78 to-primary-950/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-transparent to-primary-950/30" />
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Side: "Reimagining Education." */}
          <div className="lg:col-span-7 text-white space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-gold-300 border border-white/15 shadow-sm">
              <Sparkles size={13} className="text-gold-400" />
              <span>NAAC A+ Grade • NBA Accredited • VTU Autonomous</span>
            </div>

            {/* Giant Bold Headline */}
            <div className="space-y-0.5">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-none">
                Reimagining
              </h1>
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-none">
                Education<span className="text-gold-400">.</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-white/85 font-normal max-w-xl leading-relaxed">
              Ph.D. Admission & Doctoral Registration Portal for VTU-recognized Research Centres at Sahyadri College of Engineering & Management.
            </p>

            {/* Research Centres tags */}
            <div className="pt-2">
              <p className="text-[11px] uppercase font-bold tracking-wider text-white/60 mb-2">
                PH.D. RESEARCH CENTRES:
              </p>
              <div className="flex flex-wrap gap-2">
                {['CSE', 'ECE', 'Chemistry', 'Physics', 'Mathematics', 'MBA', 'Mechanical'].map((dept) => (
                  <span
                    key={dept}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium text-white border border-white/10 transition-colors"
                  >
                    Ph.D. in {dept}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">27+</div>
                <div className="text-xs text-white/70">Years of Excellence</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gold-400">1200+</div>
                <div className="text-xs text-white/70">Research Publications</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">7</div>
                <div className="text-xs text-white/70">Research Centres</div>
              </div>
            </div>
          </div>

          {/* Right Side: Floating Login Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-7 sm:p-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Doctoral Portal</h2>
                  <p className="text-xs text-gray-500">Sign in to begin or resume your Ph.D. registration</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={20} />
                </div>
              </div>

              {/* Demo Credentials Auto-Fill Box */}
              <div className="bg-primary-50/80 border border-primary-200/80 rounded-xl p-3 mb-5 text-xs text-primary-900 flex items-center justify-between">
                <div>
                  <span className="font-bold text-primary-800 block">Quick Demo Login:</span>
                  <span className="text-[11px] text-gray-600">Click to fill credentials</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="px-2.5 py-1 bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    EMAIL ADDRESS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="scholar.phd@sahyadri.edu.in"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    PASSWORD <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('For this demo, any valid email & password can be entered or click Auto-fill!')}
                    className="font-semibold text-primary-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={16} />
                      Sign In to Ph.D. Portal
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1 text-gray-600">
                  <ShieldCheck size={13} className="text-primary-700" />
                  Official Research Centre
                </span>
                <span className="text-gray-400">VTU Affiliated</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Sub-footer ── */}
      <footer className="bg-[#0b1a10] text-white/60 text-xs py-3 px-4 sm:px-8 border-t border-white/10 z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div>
            © {new Date().getFullYear()} Sahyadri College of Engineering & Management. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <span>Adyar, Mangaluru - 575007</span>
            <span>•</span>
            <span>research@sahyadri.edu.in</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
