import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as taskService from '../../services/taskService';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { TaskDetailDrawer } from '../../components/tasks/TaskDetailDrawer';
import { EmptyState } from '../../components/common/EmptyState';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    loadEmployeeTasks();
  }, []);

  const loadEmployeeTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks({ assignedTo: user?.id, limit: 20 });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to load employee tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatus = async (task, nextStatus, e) => {
    e.stopPropagation();
    try {
      await taskService.updateTaskStatus(task.id, nextStatus);
      showSuccess(`Task marked as ${nextStatus.replace('_', ' ')}!`);

      if (nextStatus === 'completed') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      }

      loadEmployeeTasks();
    } catch (err) {
      showError(err.message || 'Could not update status');
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
      </div>
    );
  }

  const assignedCount = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(
    (t) => t.due_date && t.due_date.split('T')[0] < todayStr && t.status !== 'completed'
  ).length;

  const urgentTasks = tasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Employee Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100 leading-relaxed">
            You have <strong>{inProgressCount}</strong> task{inProgressCount === 1 ? '' : 's'} in progress and{' '}
            <strong>{assignedCount - completedCount}</strong> open action items to deliver.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{assignedCount}</span>
            <span className="text-xs text-slate-400">total tasks</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{inProgressCount}</span>
            <span className="text-xs text-blue-600 font-medium">active focus</span>
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
            <span className="text-3xl font-bold text-slate-900">{completedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">delivered</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{overdueCount}</span>
            <span className="text-xs text-rose-600 font-medium">needs attention</span>
          </div>
        </div>
      </div>

      {/* Focus / Today's Tasks Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Priority Tasks For You</h2>
            <p className="text-xs text-slate-500">Quickly transition statuses or open task discussion</p>
          </div>
          <Link
            to="/employee/tasks"
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            <span>View All My Tasks</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {urgentTasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All caught up!"
            description="You have no pending tasks awaiting completion. Great job!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-elevated transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    {t.due_date && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(t.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{t.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {t.description || 'No detailed instructions provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.comment_count || 0} comments</span>
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {t.status === 'todo' && (
                      <button
                        onClick={(e) => handleQuickStatus(t, 'in_progress', e)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                      >
                        Start Task →
                      </button>
                    )}
                    {t.status === 'in_progress' && (
                      <button
                        onClick={(e) => handleQuickStatus(t, 'completed', e)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition"
                      >
                        Mark Completed ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => loadEmployeeTasks()}
      />
    </div>
  );
};
