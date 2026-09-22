import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as teamService from '../../services/teamService';
import * as taskService from '../../services/taskService';
import { CardSkeleton, TableSkeleton } from '../../components/common/SkeletonLoader';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { TaskDetailDrawer } from '../../components/tasks/TaskDetailDrawer';
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Briefcase
} from 'lucide-react';

export const ManagerDashboard = () => {
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      const [teamRes, tasksRes] = await Promise.all([
        teamService.getMyTeam(),
        taskService.getTasks({ limit: 8 })
      ]);
      setTeam(teamRes.data.team);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
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
        <TableSkeleton rows={5} />
      </div>
    );
  }

  const stats = team?.stats || { total: 0, todo: 0, in_progress: 0, completed: 0, overdue: 0 };
  const memberCount = team?.members?.length || 0;
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {team ? `${team.name} Dashboard` : 'Team Dashboard'}
            </h1>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
              Lead Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track team task execution, assign workloads, and monitor sprint completion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/manager/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team Task</span>
          </Link>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Team</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{memberCount}</span>
            <span className="text-xs text-slate-400">members assigned</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Tasks (Todo)</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.todo}</span>
            <span className="text-xs text-slate-400">pending start</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.in_progress}</span>
            <span className="text-xs text-blue-600 font-medium">active tasks</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.completed}</span>
            <span className="text-xs text-emerald-600 font-medium">{completionRate}% done</span>
          </div>
        </div>
      </div>

      {/* Team Progress Breakdown Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Team Task Velocity & Progress</h3>
            <p className="text-xs text-slate-500">Overall task distribution across states</p>
          </div>
          <span className="text-xs font-bold text-brand-600">{stats.total} Total Tasks</span>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }}
            className="bg-emerald-500 h-full"
            title="Completed"
          ></div>
          <div
            style={{ width: `${stats.total ? (stats.in_progress / stats.total) * 100 : 0}%` }}
            className="bg-blue-500 h-full"
            title="In Progress"
          ></div>
          <div
            style={{ width: `${stats.total ? (stats.todo / stats.total) * 100 : 0}%` }}
            className="bg-slate-300 h-full"
            title="To Do"
          ></div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-600">To Do: <strong>{stats.todo}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-600">In Progress: <strong>{stats.in_progress}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Completed: <strong>{stats.completed}</strong></span>
          </div>
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 text-rose-600 font-semibold ml-auto">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats.overdue} Overdue Tasks</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Team Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Team Tasks</h3>
            <p className="text-xs text-slate-500">Click any task to view discussion, status history, or comments</p>
          </div>
          <Link
            to="/manager/tasks"
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            <span>View All Tasks</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Task Title</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {t.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          t.assignee_avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(t.assignee_name || 'Unassigned')}&background=4f46e5&color=fff`
                        }
                        alt={t.assignee_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-800">
                        {t.assignee_name || <span className="text-slate-400 italic">Unassigned</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => loadManagerData()}
      />
    </div>
  );
};
