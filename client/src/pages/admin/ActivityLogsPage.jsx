import React, { useState, useEffect } from 'react';
import * as activityService from '../../services/activityService';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { RoleBadge } from '../../components/common/Badge';
import {
  History,
  Activity,
  Filter,
  User,
  CheckSquare,
  Building2,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

export const ActivityLogsPage = () => {
  const { showError } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await activityService.getActivityLogs({
        limit: 100,
        entityType: entityFilter || undefined
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      showError(err.message || 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'user':
        return <User className="w-3.5 h-3.5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'team':
        return <Building2 className="w-3.5 h-3.5 text-purple-500" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Activity Audit Log</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable chronological record of security, authorization, task transitions, and user actions
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter by Entity:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Entities</option>
            <option value="user">User Events</option>
            <option value="task">Task Events</option>
            <option value="team">Team Events</option>
            <option value="comment">Comment Events</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Showing <strong>{logs.length}</strong> of {total} events
        </span>
      </div>

      {/* Activity Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity events recorded"
          description="Actions performed in the system will automatically appear here."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            log.user_avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user_name || 'System')}&background=4f46e5&color=fff`
                          }
                          alt={log.user_name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {log.user_name || 'System'}
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize">{log.user_role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
                        {getEntityIcon(log.entity_type)}
                        <span>{log.entity_type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <span className="font-mono text-[11px] text-slate-700">
                          {JSON.stringify(log.metadata)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No extra metadata</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
