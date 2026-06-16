import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

type LoginForm = {
  email: string
  password: string
}

const roleDefaults: Record<string, string> = {
  teacher: '/teacher/dashboard',
  paraprofessional: '/teacher/dashboard',
  coach: '/coach/dashboard',
  admin: '/admin/overview',
  district_admin: '/district-admin/dashboard',
  researcher: '/researcher/analytics',
  super_admin: '/super-admin/dashboard',
}

const demoAccounts = [
  { label: 'Anna Carter', sub: 'Teacher · Grade 3 · Lincoln K-8', email: 'anna.carter@example.org' },
  { label: 'Brian Lee', sub: 'Teacher · Grade 4 · Lincoln K-8', email: 'brian.lee@example.org' },
  { label: 'Carla Nguyen', sub: 'Teacher · Grade 5 · Lincoln K-8', email: 'carla.nguyen@example.org' },
  { label: 'David Brooks', sub: 'Teacher · Grade 6 · Washington Middle', email: 'david.brooks@example.org' },
  { label: 'Elena Martinez', sub: 'Teacher · Grade 7 · Washington Middle', email: 'elena.martinez@example.org' },
  { label: 'Sarah Kim', sub: 'Paraprofessional · Lincoln K-8', email: 'sarah.kim@example.org' },
  { label: 'Rachel Stone', sub: 'Coach · Lincoln K-8', email: 'rachel.stone@example.org' },
  { label: 'Monica Hill', sub: 'Principal of School · Lincoln K-8', email: 'monica.hill@example.org' },
  { label: 'James Patel', sub: 'Principal of School · Washington Middle', email: 'james.patel@example.org' },
  { label: 'Margaret Rivera', sub: 'Superintendent · Riverside Unified', email: 'margaret.rivera@dist1.edu' },
  { label: 'Charles Lee', sub: 'Superintendent · Lakeside', email: 'charles.lee@dist2.edu' },
  { label: 'Dr. Jing Researcher', sub: 'Researcher · All Districts', email: 'researcher@example.org' },
  { label: 'Alex Super', sub: 'Platform Admin · All Districts', email: 'superadmin@example.org' },
  { label: 'Testing – Teacher', sub: 'Test account · Lincoln K-8', email: 'test.teacher@demo.com' },
  { label: 'Testing – Coach', sub: 'Test account · Lincoln K-8', email: 'test.coach@demo.com' },
  { label: 'Testing – Principal of School', sub: 'Test account · Lincoln K-8', email: 'test.admin@demo.com' },
  { label: 'Testing – Superintendent 1', sub: 'Test account · Riverside Unified', email: 'test.dist1@demo.com' },
  { label: 'Testing – Superintendent 2', sub: 'Test account · Lakeside', email: 'test.dist2@demo.com' },
  { label: 'Testing – Platform Admin', sub: 'Test account · All Districts', email: 'test.district@demo.com' },
  { label: 'Testing – Researcher', sub: 'Test account · All Districts', email: 'test.researcher@demo.com' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = (data: LoginForm) => {
    setAuthError('')
    const success = login(data.email, data.password)
    if (!success) {
      setAuthError('Invalid email or password. Try a demo account below.')
      return
    }
    const store = useAppStore.getState()
    const dest = roleDefaults[store.currentRole] ?? '/teacher/dashboard'
    navigate(dest, { replace: true })
  }

  const fillDemo = (email: string) => {
    setValue('email', email)
    setValue('password', 'demo1234')
    setAuthError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-white font-bold text-2xl shadow-lg mb-4">
            M
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MathImpl</h1>
          <p className="text-sm text-gray-500 mt-1">K–8 Mathematics Research Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@district.edu"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-10 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Auth error */}
            {authError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {authError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors cursor-pointer mt-2"
            >
              <LogIn size={16} />
              Sign In
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 text-center font-medium uppercase tracking-wide">
              Demo Accounts — all use password: <span className="font-mono text-gray-700">demo1234</span>
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{acc.label}</p>
                    <p className="text-xs text-gray-400">{acc.sub}</p>
                  </div>
                  <p className="text-xs text-gray-400 truncate shrink-0">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
