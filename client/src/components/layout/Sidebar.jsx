import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
  History,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  Briefcase,
  UserCheck
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout, demoLogin } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', to: '/admin/users', icon: Users },
    { name: 'Teams', to: '/admin/teams', icon: Building2 },
    { name: 'Activity Log', to: '/admin/activity', icon: History },
    { name: 'My Profile', to: '/profile', icon: User }
  ];

  const managerLinks = [
    { name: 'Team Dashboard', to: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Team Tasks', to: '/manager/tasks', icon: CheckSquare },
    { name: 'Team Members', to: '/manager/team', icon: Users },
    { name: 'My Profile', to: '/profile', icon: User }
  ];

  const employeeLinks = [
    { name: 'My Workspace', to: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Tasks', to: '/employee/tasks', icon: CheckSquare },
    { name: 'My Profile', to: '/profile', icon: User }
  ];

  const links = role === 'admin' ? adminLinks : role === 'manager' ? managerLinks : employeeLinks;

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Employee
          </span>
        );
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Role<span className="text-brand-600">Flow</span></span>
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">Workplace OS</p>
            </div>
          </div>

          {/* User Profile Mini Bar */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-100/80">
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff&bold=true`
                }
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold border-r-2 border-brand-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Quick Demo Role Switcher & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100/70 text-xs">
            <span className="text-[11px] font-bold text-indigo-900 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" /> Quick Role Switcher
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => demoLogin('admin')}
                className={`px-1.5 py-1 text-[11px] font-medium rounded transition ${
                  role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-indigo-100'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => demoLogin('manager')}
                className={`px-1.5 py-1 text-[11px] font-medium rounded transition ${
                  role === 'manager' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-indigo-100'
                }`}
              >
                Manager
              </button>
              <button
                onClick={() => demoLogin('employee')}
                className={`px-1.5 py-1 text-[11px] font-medium rounded transition ${
                  role === 'employee' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-indigo-100'
                }`}
              >
                Employee
              </button>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
