import React, { useState, useEffect } from 'react';
import * as teamService from '../../services/teamService';
import * as userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Building2,
  Users,
  CheckSquare,
  Plus,
  UserPlus,
  Trash2,
  Briefcase,
  X
} from 'lucide-react';

export const TeamManagement = () => {
  const { showSuccess, showError } = useToast();

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Form states
  const [teamForm, setTeamForm] = useState({ name: '', description: '', manager_id: '' });
  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamsRes, usersRes] = await Promise.all([
        teamService.getTeams(),
        userService.getUsers({ limit: 100 })
      ]);
      setTeams(teamsRes.data.teams);
      setUsers(usersRes.data.users);
    } catch (err) {
      showError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teamService.createTeam(teamForm);
      showSuccess(`Team "${teamForm.name}" created successfully!`);
      setIsCreateModalOpen(false);
      setTeamForm({ name: '', description: '', manager_id: '' });
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const openMembersModal = async (team) => {
    try {
      const res = await teamService.getTeamById(team.id);
      setSelectedTeam(res.data.team);
      setIsMembersModalOpen(true);
    } catch (err) {
      showError(err.message || 'Failed to fetch team members');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedNewMemberId || !selectedTeam) return;
    setSubmitting(true);
    try {
      await teamService.addTeamMember(selectedTeam.id, selectedNewMemberId);
      showSuccess('Member added to team.');
      setSelectedNewMemberId('');
      // Reload team details
      const res = await teamService.getTeamById(selectedTeam.id);
      setSelectedTeam(res.data.team);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedTeam) return;
    try {
      await teamService.removeTeamMember(selectedTeam.id, userId);
      showSuccess('Member removed from team.');
      const res = await teamService.getTeamById(selectedTeam.id);
      setSelectedTeam(res.data.team);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to remove member');
    }
  };

  // Managers list for dropdown
  const eligibleManagers = users.filter((u) => u.role === 'manager' || u.role === 'admin');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Organizational Teams</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure functional departments, assign managers, and delegate team memberships
          </p>
        </div>

        <button
          onClick={() => {
            setTeamForm({ name: '', description: '', manager_id: '' });
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No teams configured"
          description="Create your first department to start grouping team members and tasks."
          actionLabel="+ Create First Team"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {t.member_count} members
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t.description || 'No description provided.'}
                </p>

                {/* Manager Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <img
                    src={
                      t.manager_avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(t.manager_name || 'Unassigned')}&background=6366f1&color=fff`
                    }
                    alt={t.manager_name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="text-xs min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {t.manager_name || <span className="text-slate-400 italic">No Lead Assigned</span>}
                    </p>
                    <p className="text-[10px] text-slate-400">Team Manager</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>{t.completed_task_count || 0}</strong>/{t.task_count || 0} tasks done
                  </span>
                </div>

                <button
                  onClick={() => openMembersModal(t)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Manage Members
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Functional Team"
        subtitle="Group projects, assign manager, and organize workforce units."
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Infrastructure & DevOps"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of team mandate..."
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Assign Manager
            </label>
            <select
              value={teamForm.manager_id}
              onChange={(e) => setTeamForm({ ...teamForm, manager_id: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select a manager</option>
              {eligibleManagers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email}) - {m.role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title={`Manage ${selectedTeam?.name} Members`}
        subtitle="Add or remove employees assigned to this team"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* Add member inline form */}
          <form onSubmit={handleAddMember} className="flex items-center gap-2">
            <select
              value={selectedNewMemberId}
              onChange={(e) => setSelectedNewMemberId(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select an employee to add...</option>
              {users
                .filter((u) => !selectedTeam?.members?.some((m) => m.id === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - {u.role}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              disabled={!selectedNewMemberId || submitting}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Members list */}
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
            {selectedTeam?.members?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No members assigned to this team yet.</p>
            ) : (
              selectedTeam?.members?.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        m.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=4f46e5&color=fff`
                      }
                      alt={m.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{m.name}</p>
                      <p className="text-[10px] text-slate-400">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {m.role}
                    </span>
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove from team"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
