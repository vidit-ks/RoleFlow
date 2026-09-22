import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff, Sparkles, ShieldCheck, Briefcase, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.name}!`);

      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setDemoLoading(true);
    setErrorMessage('');
    try {
      const user = await demoLogin(role);
      showSuccess(`Logged in as Demo ${role.toUpperCase()}: ${user.name}`);

      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'manager') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-white selection:bg-indigo-500 selection:text-white">
      {/* Left Branding Hero Section */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Subtle glowing radial background */}
        <div className="absolute top-0 -left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RoleFlow</span>
          </div>

          <div className="mt-20 max-w-sm">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Manage people. <br />
              Manage work. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">
                Move forward.
              </span>
            </h1>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Enterprise role-based access control, task delegation, team productivity metrics, and activity audit trails tailored for modern teams.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-3 border-t border-slate-800/80 pt-6 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Multi-level RBAC: Admin, Manager, and Employee scopes</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Manager team task delegation & status lifecycle</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>PostgreSQL audit activity logging & soft deactivation</span>
          </div>
        </div>
      </div>

      {/* Right Login Form & Demo Cards */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 max-w-xl mx-auto w-full">
        {/* Mobile Header Branding */}
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">RoleFlow</span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500">Sign in to your RoleFlow organization workspace</p>
        </div>

        {/* 1-Click Demo Section */}
        <div className="mt-5 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Try 1-Click Demo Accounts
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold bg-white px-2 py-0.5 rounded-full border border-indigo-100">
              Instant
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={demoLoading || loading}
              onClick={() => handleDemo('admin')}
              className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white text-slate-800 rounded-xl border border-indigo-200/80 text-center transition group shadow-xs disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-1 font-semibold text-xs mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white" /> Admin
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-indigo-100">Full Control</p>
            </button>

            <button
              type="button"
              disabled={demoLoading || loading}
              onClick={() => handleDemo('manager')}
              className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white text-slate-800 rounded-xl border border-indigo-200/80 text-center transition group shadow-xs disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-1 font-semibold text-xs mb-0.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-600 group-hover:text-white" /> Manager
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-indigo-100">Team Scope</p>
            </button>

            <button
              type="button"
              disabled={demoLoading || loading}
              onClick={() => handleDemo('employee')}
              className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white text-slate-800 rounded-xl border border-indigo-200/80 text-center transition group shadow-xs disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-1 font-semibold text-xs mb-0.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" /> Employee
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-indigo-100">Assigned Tasks</p>
            </button>
          </div>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">Or enter credentials manually</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="e.g. admin@roleflow.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
