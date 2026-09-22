import React, { useState, useEffect } from 'react';
import * as teamService from '../../services/teamService';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { RoleBadge } from '../../components/common/Badge';
import { Users, Mail, CheckCircle2, Clock, CheckSquare, Calendar } from 'lucide-react';

export const TeamMembersPage = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await teamService.getMyTeam();
      setTeam(res.data.team);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const members = team?.members || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {team?.name || 'My Team'} Members
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Roster of employees assigned to your direct functional management group
        </p>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members assigned to this team"
          description="Contact an organization administrator to assign team members to your group."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        m.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=4f46e5&color=fff`
                      }
                      alt={m.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                      <div className="mt-0.5">
                        <RoleBadge role={m.role} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joined: {new Date(m.joined_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Task Metrics */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">Assigned</p>
                  <p className="text-lg font-bold text-slate-800">{m.assigned_tasks || 0}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <p className="text-[11px] text-emerald-600 font-medium">Completed</p>
                  <p className="text-lg font-bold text-emerald-700">{m.completed_tasks || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
