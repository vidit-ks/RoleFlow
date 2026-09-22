import React, { useState, useEffect } from 'react';
import * as userService from '../../services/userService';
import * as teamService from '../../services/teamService';
import { useToast } from '../../context/ToastContext';
import { RoleBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Shield,
  UserX,
  UserCheck,
  Check,
  AlertTriangle
} from 'lucide-react';

export const UserManagement = () => {
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    teamId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [roleFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, teamsRes] = await Promise.all([
        userService.getUsers({ search, role: roleFilter, status: statusFilter }),
        teamService.getTeams()
      ]);
      setUsers(usersRes.data.users);
      setTeams(teamsRes.data.teams);
    } catch (err) {
      showError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userService.createUser(formData);
      showSuccess(`User ${formData.name} created successfully!`);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'employee', teamId: '' });
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userService.updateUser(selectedUser.id, {
        name: formData.name,
        email: formData.email
      });
      showSuccess(`User details updated.`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (newRole) => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userService.updateUserRole(selectedUser.id, newRole);
      showSuccess(`Role for ${selectedUser.name} changed to ${newRole}`);
      setIsRoleModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const nextStatus = !selectedUser.is_active;
      await userService.updateUserStatus(selectedUser.id, nextStatus);
      showSuccess(`User successfully ${nextStatus ? 'activated' : 'deactivated'}.`);
      setIsStatusModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to change status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision accounts, assign organizational roles, and enforce account statuses
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', email: '', password: '', role: 'employee', teamId: '' });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add User</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Deactivated</option>
          </select>

          <button
            onClick={loadData}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try changing your search term or filter criteria."
          actionLabel="+ Add New User"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4">Tasks</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={
                          u.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4f46e5&color=fff`
                        }
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {u.team_name || <span className="text-slate-400 italic">No team</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{u.completed_task_count || 0}</span>
                      <span className="text-slate-400">/{u.task_count || 0}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Edit Details"
                          onClick={() => {
                            setSelectedUser(u);
                            setFormData({ name: u.name, email: u.email, role: u.role, teamId: u.team_id || '' });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          title="Change Role"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsRoleModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>

                        <button
                          title={u.is_active ? 'Deactivate User' : 'Reactivate User'}
                          onClick={() => {
                            setSelectedUser(u);
                            setIsStatusModalOpen(true);
                          }}
                          className={`p-1.5 rounded-lg transition ${
                            u.is_active
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Organization User"
        subtitle="Provision a new account with customized role and initial team assignment."
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Neha Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Work Email
            </label>
            <input
              type="email"
              required
              placeholder="neha@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Temporary Password (min 8 chars, 1 uppercase, 1 number)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RoleFlow2026!"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Assign Team
              </label>
              <select
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">No initial team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Profile"
        subtitle={`Updating details for ${selectedUser?.name}`}
      >
        <form onSubmit={handleEditUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change Access Role"
        subtitle={`Select a new permission level for ${selectedUser?.name}`}
      >
        <div className="space-y-3">
          <button
            onClick={() => handleChangeRole('admin')}
            disabled={submitting}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
              selectedUser?.role === 'admin'
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-indigo-900">Administrator</p>
              <p className="text-[11px] text-slate-500">Full platform privileges, user management, and audit visibility.</p>
            </div>
            {selectedUser?.role === 'admin' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => handleChangeRole('manager')}
            disabled={submitting}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
              selectedUser?.role === 'manager'
                ? 'border-purple-500 bg-purple-50/50'
                : 'border-slate-200 hover:border-purple-300'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-purple-900">Manager</p>
              <p className="text-[11px] text-slate-500">Manages team members, task delegations, and productivity reports.</p>
            </div>
            {selectedUser?.role === 'manager' && <Check className="w-4 h-4 text-purple-600" />}
          </button>

          <button
            onClick={() => handleChangeRole('employee')}
            disabled={submitting}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
              selectedUser?.role === 'employee'
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-emerald-900">Employee</p>
              <p className="text-[11px] text-slate-500">Can view assigned tasks, update task statuses, and post comments.</p>
            </div>
            {selectedUser?.role === 'employee' && <Check className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </Modal>

      {/* Deactivate / Reactivate Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={selectedUser?.is_active ? 'Deactivate User Account' : 'Reactivate User Account'}
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {selectedUser?.is_active
                ? `Deactivating ${selectedUser?.name} sets is_active = false. The user will be unable to log in, but all associated tasks, comments, and audit records will be safely preserved.`
                : `Reactivating ${selectedUser?.name} will restore login access to their RoleFlow account.`}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={submitting}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition ${
                selectedUser?.is_active
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {submitting
                ? 'Updating...'
                : selectedUser?.is_active
                ? 'Confirm Deactivation'
                : 'Confirm Reactivation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
