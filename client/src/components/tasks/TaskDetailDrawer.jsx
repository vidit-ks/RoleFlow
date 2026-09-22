import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as taskService from '../../services/taskService';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  X,
  Calendar,
  User,
  Users,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TaskDetailDrawer = ({ taskId, isOpen, onClose, onTaskUpdated }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (taskId && isOpen) {
      loadTaskData();
    }
  }, [taskId, isOpen]);

  const loadTaskData = async () => {
    setLoading(true);
    try {
      const [taskRes, commentsRes] = await Promise.all([
        taskService.getTaskById(taskId),
        taskService.getTaskComments(taskId)
      ]);
      setTask(taskRes.data.task);
      setComments(commentsRes.data.comments || []);
    } catch (err) {
      showError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!task || task.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await taskService.updateTaskStatus(task.id, newStatus);
      setTask((prev) => ({ ...prev, status: newStatus }));
      showSuccess(`Task status changed to ${newStatus.replace('_', ' ')}`);

      if (newStatus === 'completed') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }

      if (onTaskUpdated) onTaskUpdated(res.data.task);
    } catch (err) {
      showError(err.message || 'Could not update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await taskService.addComment(task.id, newComment);
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment('');
      showSuccess('Comment added.');
    } catch (err) {
      showError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              TASK DETAILS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 p-6 space-y-4 animate-pulse">
            <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-100 rounded-xl"></div>
            <div className="h-32 bg-slate-100 rounded-xl"></div>
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.team_name && (
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {task.team_name}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h2>
            </div>

            {/* Status Transition Control Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Update Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('todo')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                    task.status === 'todo'
                      ? 'bg-white text-slate-900 border-slate-400 shadow-xs'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-white hover:text-slate-800'
                  }`}
                >
                  To Do
                </button>
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('in_progress')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                    task.status === 'in_progress'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  In Progress
                </button>
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('completed')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                    task.status === 'completed'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</h4>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                {task.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Assigned To
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {task.assignee_name || 'Unassigned'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </span>
                <p className="font-semibold text-slate-800">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Created By
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {task.creator_name || 'System'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Created At
                </span>
                <p className="font-semibold text-slate-800">
                  {new Date(task.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Comments Stream */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <h4 className="text-sm font-bold text-slate-900">Activity & Comments ({comments.length})</h4>
              </div>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No comments on this task yet. Start the conversation!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              c.user_avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name)}&background=4f46e5&color=fff`
                            }
                            alt={c.user_name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-slate-800">{c.user_name}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 px-1 py-0.2 bg-slate-200/60 rounded">
                            {c.user_role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-7">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Comment Input Footer */}
        <form onSubmit={handlePostComment} className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submittingComment}
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
