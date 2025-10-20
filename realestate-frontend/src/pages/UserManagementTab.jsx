import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group'; // For smooth expand/collapse animations

const localStyles = {
  container: { padding: '24px', minHeight: '400px', backgroundColor: '#f9fafb' },
  summaryBar: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' },
  summaryCard: {
    flex: '1 1 150px',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#f3f4f6',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
    cursor: 'pointer',
  },
  summaryNumber: { fontSize: '22px', fontWeight: 'bold', color: '#111827' },
  summaryLabel: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  searchContainer: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: {
    padding: '22px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    display: 'inline-block',
    marginRight: '14px',
    textAlign: 'center',
    lineHeight: '50px',
    fontWeight: 'bold',
    color: '#6b7280',
    fontSize: '18px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  modalContent: { backgroundColor: '#fff', padding: '28px', borderRadius: '14px', width: '420px', maxWidth: '95%' },
};

// Role helpers
const getDisplayRole = (role) => {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'AGENT') return 'AGENT';
  return 'USER';
};

const getRoleColor = (role) => {
  switch (role) {
    case 'ADMIN': return 'bg-red-500';
    case 'AGENT': return 'bg-blue-500';
    case 'USER': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
};

const UserManagementDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [expandedUsers, setExpandedUsers] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: '', email: '', password: '', role: 'AGENT' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      setError("Authorization token missing. Please log in as an administrator.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/users/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      });

      if (response.status === 403) {
        logout();
        navigate('/login');
        throw new Error('Authorization Failed. Please log back in.');
      }

      if (!response.ok) throw new Error(`Failed to load users (Status: ${response.status})`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      } else setUsers([]);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, isAuthenticated, navigate, fetchUsers]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => Object.values(u).some(val => String(val).toLowerCase().includes(term)));
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(u => getDisplayRole(u.role) === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleAgentDetailsClick = (userId) => navigate(`/admin-agent-details/${userId}`);
  const toggleExpand = (userId) => setExpandedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);

  const handleAddUser = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    try {
      const response = await fetch('http://localhost:8080/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(newUserData),
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setShowAddModal(false);
        setNewUserData({ username: '', email: '', password: '', role: 'AGENT' });
      } else {
        alert(data.message || 'Failed to add user.');
      }
    } catch (err) {
      console.error('Add user error:', err);
      alert('Error adding user.');
    }
  };

  if (loading) return <div style={localStyles.container}><p>Loading users...</p></div>;
  if (error) return <div style={localStyles.container}><p className="text-red-600">{error}</p></div>;

  const totalUsers = users.filter(u => !['ADMIN','AGENT'].includes(u.role)).length;
  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
  const totalAgents = users.filter(u => u.role === 'AGENT').length;

  return (
    <div style={localStyles.container}>
      {/* Clickable Summary Bar */}
      <div style={localStyles.summaryBar}>
        {[
          { label: 'Users', count: totalUsers, role: 'USER', color: '#d1fae5' },
          { label: 'Admins', count: totalAdmins, role: 'ADMIN', color: '#fee2e2' },
          { label: 'Agents', count: totalAgents, role: 'AGENT', color: '#dbeafe' },
        ].map((s) => (
          <div
            key={s.role}
            style={{ ...localStyles.summaryCard, backgroundColor: roleFilter === s.role ? s.color : localStyles.summaryCard.backgroundColor }}
            className="hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
            onClick={() => setRoleFilter(roleFilter === s.role ? 'ALL' : s.role)}
          >
            <div style={localStyles.summaryNumber}>{s.count}</div>
            <div style={localStyles.summaryLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter + Add */}
      <div style={localStyles.searchContainer}>
        <input
          type="text"
          placeholder="Search all fields..."
          className="px-4 py-2 border rounded-lg flex-1 focus:outline-none focus:ring focus:ring-indigo-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="AGENT">Agent</option>
          <option value="USER">User</option>
        </select>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={() => setShowAddModal(true)}
        >
          Add User
        </button>
      </div>

      {/* Users Grid */}
      <div style={localStyles.grid}>
        <TransitionGroup component={null}>
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 col-span-full">No users found.</p>
          ) : (
            filteredUsers.map((u) => {
              const isExpanded = expandedUsers.includes(u.id);
              return (
                <CSSTransition key={u.id} timeout={300} classNames="fade">
                  <div
                    style={localStyles.card}
                    className="hover:-translate-y-1 hover:shadow-xl transition-transform duration-300"
                    onClick={() => toggleExpand(u.id)}
                  >
                    <div className="flex items-center mb-2">
                      <div style={localStyles.avatar}>{u.username?.charAt(0)?.toUpperCase()}</div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{u.username}</h3>
                        <p className="text-gray-500 text-sm">{u.email}</p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getRoleColor(getDisplayRole(u.role))}`}>
                          {getDisplayRole(u.role)}
                        </span>
                        {u.propertiesCount != null && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500 text-white">
                            {u.propertiesCount} properties
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 text-gray-600 text-sm transition-all duration-300">
                        {Object.entries(u).map(([key, val]) => {
                          if (['id','username','email','password','propertiesCount'].includes(key)) return null;
                          return (
                            <p key={key}><span className="font-semibold">{key}:</span> {String(val)}</p>
                          );
                        })}
                        {getDisplayRole(u.role) === 'AGENT' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAgentDetailsClick(u.id); }}
                            className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
                          >
                            View Agent Dashboard
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </CSSTransition>
              );
            })
          )}
        </TransitionGroup>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={localStyles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={localStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Username" className="px-3 py-2 border rounded" value={newUserData.username} onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })} />
              <input type="email" placeholder="Email" className="px-3 py-2 border rounded" value={newUserData.email} onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })} />
              <input type="password" placeholder="Password" className="px-3 py-2 border rounded" value={newUserData.password} onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })} />
              <select className="px-3 py-2 border rounded" value={newUserData.role} onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}>
                <option value="ADMIN">Admin</option>
                <option value="AGENT">Agent</option>
                <option value="SELLER">User</option>
                <option value="BUYER">User</option>
              </select>
              <div className="flex justify-end gap-3 mt-2">
                <button className="px-4 py-2 border rounded" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleAddUser}>Add User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementDashboard;
