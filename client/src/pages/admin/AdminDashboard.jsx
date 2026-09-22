import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as userService from '../../services/userService';
import * as activityService from '../../services/activityService';
import { CardSkeleton, TableSkeleton } from '../../components/common/SkeletonLoader';
import { RoleBadge } from '../../components/common/Badge';
import {
  Users,
  UserCheck,
  Briefcase,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  UserPlus,
  Clock
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, activityRes] = await Promise.all([
        userService.getSystemStats(),
        userService.getUsers({ page: 1, limit: 6 }),
        activityService.getActivityLogs({ limit: 6 })
      ]);
      setStats(statsRes.data);
      setRecentUsers(usersRes.data.users);
      setRecentActivity(activityRes.data.logs);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const totalUsers = stats?.users?.total || 0;
  const adminPct = totalUsers ? Math.round(((stats?.users?.admins || 0) / totalUsers) * 100) : 0;
  const managerPct = totalUsers ? Math.round(((stats?.users?.managers || 0) / totalUsers) * 100) : 0;
  const employeePct = totalUsers ? Math.round(((stats?.users?.employees || 0) / totalUsers) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Control Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organization-wide user management, teams, permissions, and system audit trails
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats?.users?.total ?? 0}</span>
            <span className="text-xs text-slate-400">across org</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Users</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats?.users?.active ?? 0}</span>
            <span className="text-xs text-emerald-600 font-medium">Healthy status</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Managers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats?.users?.managers ?? 0}</span>
            <span className="text-xs text-slate-400">team leads</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employees</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats?.users?.employees ?? 0}</span>
            <span className="text-xs text-slate-400">members</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: User Distribution & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">User Role Distribution</h3>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-6">
              <div style={{ width: `${adminPct}%` }} className="bg-indigo-600 h-full"></div>
              <div style={{ width: `${managerPct}%` }} className="bg-purple-500 h-full"></div>
              <div style={{ width: `${employeePct}%` }} className="bg-emerald-500 h-full"></div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <span className="font-medium text-slate-700">Administrators</span>
                </div>
                <span className="font-bold text-slate-900">{stats?.users?.admins || 0} ({adminPct}%)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span className="font-medium text-slate-700">Managers</span>
                </div>
                <span className="font-bold text-slate-900">{stats?.users?.managers || 0} ({managerPct}%)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-700">Employees</span>
                </div>
                <span className="font-bold text-slate-900">{stats?.users?.employees || 0} ({employeePct}%)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Total Teams: <strong>{stats?.teams?.total || 0}</strong></span>
            <span>Total Tasks: <strong>{stats?.tasks?.total || 0}</strong></span>
          </div>
        </div>

        {/* Recent Activity Audit Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent System Activity</h3>
            </div>
            <Link
              to="/admin/activity"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
            >
              <span>View All Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5 divide-y divide-slate-100">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No recent activity logged.</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        log.user_avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user_name || 'System')}&background=4f46e5&color=fff`
                      }
                      alt={log.user_name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {log.user_name || 'System'}{' '}
                        <span className="font-normal text-slate-600">
                          {log.action === 'USER_CREATED' && `created user account ${log.metadata?.name || ''}`}
                          {log.action === 'USER_REGISTERED' && `registered as a new employee`}
                          {log.action === 'TASK_CREATED' && `created task "${log.metadata?.task_title || ''}"`}
                          {log.action === 'TASK_STATUS_CHANGED' && `changed task status to ${log.metadata?.new_status || ''}`}
                          {log.action === 'ROLE_CHANGED' && `changed role for ${log.metadata?.user_name || ''} to ${log.metadata?.new_role || ''}`}
                          {log.action === 'TEAM_MEMBER_ADDED' && `added member to ${log.metadata?.team_name || 'team'}`}
                          {!['USER_CREATED', 'USER_REGISTERED', 'TASK_CREATED', 'TASK_STATUS_CHANGED', 'ROLE_CHANGED', 'TEAM_MEMBER_ADDED'].includes(log.action) &&
                            log.action.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {log.action}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Users</h3>
            <p className="text-xs text-slate-500">Latest active members registered in RoleFlow</p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            <span>View All Users</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={
                        u.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4f46e5&color=fff`
                      }
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">
                    {u.team_name || <span className="text-slate-400 italic">No team</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
