import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchAllUsers();
  }, [user, navigate]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const usersList = data.success ? (data.data || []) : (Array.isArray(data) ? data : []);
        setUsers(usersList);
        filterUsers(usersList, searchTerm, filterRole);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (userList, search, role) => {
    let filtered = userList;

    if (role !== 'all') {
      filtered = filtered.filter(u => u.role === role);
    }

    if (search) {
      filtered = filtered.filter(u =>
        u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.mobileNumber?.includes(search)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterUsers(users, value, filterRole);
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
    filterUsers(users, searchTerm, role);
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser({ ...userToEdit });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(editingUser)
      });

      if (response.ok) {
        const updated = await response.json();
        setUsers(users.map(u => u.id === editingUser.id ? (updated.data || editingUser) : u));
        filterUsers(users.map(u => u.id === editingUser.id ? (updated.data || editingUser) : u), searchTerm, filterRole);
        setShowEditModal(false);
        setEditingUser(null);
        alert('User updated successfully!');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          setUsers(users.filter(u => u.id !== userId));
          filterUsers(users.filter(u => u.id !== userId), searchTerm, filterRole);
          setSelectedUser(null);
          alert('User deleted successfully!');
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading users...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👨‍💼 User Management</h1>
        <p style={styles.subtitle}>Manage all users - view, edit, and modify user details</p>
      </div>

      <div style={styles.controlsSection}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterButtons}>
          <button
            onClick={() => handleRoleFilter('all')}
            style={{
              ...styles.filterBtn,
              ...(filterRole === 'all' ? styles.activeFilter : {})
            }}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => handleRoleFilter('USER')}
            style={{
              ...styles.filterBtn,
              ...(filterRole === 'USER' ? styles.activeFilter : {})
            }}
          >
            Buyers/Sellers ({users.filter(u => u.role === 'USER').length})
          </button>
          <button
            onClick={() => handleRoleFilter('AGENT')}
            style={{
              ...styles.filterBtn,
              ...(filterRole === 'AGENT' ? styles.activeFilter : {})
            }}
          >
            Agents ({users.filter(u => u.role === 'AGENT').length})
          </button>
          <button
            onClick={() => handleRoleFilter('ADMIN')}
            style={{
              ...styles.filterBtn,
              ...(filterRole === 'ADMIN' ? styles.activeFilter : {})
            }}
          >
            Admins ({users.filter(u => u.role === 'ADMIN').length})
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.usersList}>
          <div style={styles.usersHeader}>
            <h3>Users ({filteredUsers.length})</h3>
          </div>

          {filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <p>🔍 No users found</p>
            </div>
          ) : (
            <div style={styles.usersGrid}>
              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  style={{
                    ...styles.userCard,
                    backgroundColor: selectedUser?.id === u.id ? '#dbeafe' : 'white',
                    borderColor: selectedUser?.id === u.id ? '#3b82f6' : '#e2e8f0'
                  }}
                  onClick={() => setSelectedUser(u)}
                >
                  <div style={styles.userCardHeader}>
                    <div>
                      <h4 style={styles.userName}>{u.firstName} {u.lastName}</h4>
                      <p style={styles.userEmail}>{u.email}</p>
                    </div>
                    <span style={{
                      ...styles.roleBadge,
                      backgroundColor: getRoleColor(u.role)
                    }}>
                      {u.role}
                    </span>
                  </div>
                  <div style={styles.userInfo}>
                    <p>📱 {u.mobileNumber || 'N/A'}</p>
                    <p>📅 {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.userDetails}>
          {selectedUser ? (
            <div style={styles.detailsCard}>
              <h2 style={styles.detailsTitle}>User Details</h2>
              <div style={styles.detailsGrid}>
                <div>
                  <p style={styles.label}>First Name</p>
                  <p style={styles.value}>{selectedUser.firstName}</p>
                </div>
                <div>
                  <p style={styles.label}>Last Name</p>
                  <p style={styles.value}>{selectedUser.lastName}</p>
                </div>
                <div>
                  <p style={styles.label}>Email</p>
                  <p style={styles.value}>{selectedUser.email}</p>
                </div>
                <div>
                  <p style={styles.label}>Phone</p>
                  <p style={styles.value}>{selectedUser.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <p style={styles.label}>Role</p>
                  <span style={{...styles.roleBadge, backgroundColor: getRoleColor(selectedUser.role)}}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <p style={styles.label}>Member Since</p>
                  <p style={styles.value}>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedUser.address && (
                <div style={styles.addressSection}>
                  <p style={styles.label}>Address</p>
                  <p style={styles.value}>{selectedUser.address}</p>
                </div>
              )}

              <div style={styles.actionButtons}>
                <button
                  onClick={() => handleEditUser(selectedUser)}
                  style={styles.editBtn}
                >
                  ✏️ Edit User
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  style={styles.deleteBtn}
                >
                  🗑️ Delete User
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.emptyDetails}>
              <p>👈 Select a user to view details</p>
            </div>
          )}
        </div>
      </div>

      {showEditModal && editingUser && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Edit User</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                value={editingUser.firstName || ''}
                onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                value={editingUser.lastName || ''}
                onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                value={editingUser.mobileNumber || ''}
                onChange={(e) => setEditingUser({...editingUser, mobileNumber: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Role</label>
              <select
                value={editingUser.role || 'USER'}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                style={styles.input}
              >
                <option value="USER">User</option>
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Address</label>
              <textarea
                value={editingUser.address || ''}
                onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                style={styles.textarea}
              />
            </div>

            <div style={styles.modalButtons}>
              <button onClick={handleSaveUser} style={styles.saveBtn}>💾 Save Changes</button>
              <button onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getRoleColor = (role) => {
  const colors = {
    'USER': '#3b82f6',
    'AGENT': '#10b981',
    'ADMIN': '#f59e0b'
  };
  return colors[role] || '#6b7280';
};

const styles = {
  container: {
    maxWidth: 1600,
    margin: '0 auto',
    padding: '24px 32px',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  loading: {
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '18px',
    color: '#64748b'
  },
  controlsSection: {
    marginBottom: '24px'
  },
  searchBox: {
    marginBottom: '16px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  filterButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },
  usersList: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  usersHeader: {
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e2e8f0'
  },
  usersGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '70vh',
    overflowY: 'auto'
  },
  userCard: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  userCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  userEmail: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '10px',
    fontWeight: '600'
  },
  userInfo: {
    fontSize: '12px',
    color: '#64748b'
  },
  userDetails: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  detailsCard: {
    height: '100%'
  },
  detailsTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 16px 0'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '16px'
  },
  label: {
    fontSize: '12px',
    color: '#64748b',
    margin: '0 0 4px 0',
    fontWeight: '600'
  },
  value: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  addressSection: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  editBtn: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  deleteBtn: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  emptyDetails: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #e2e8f0'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b'
  },
  formGroup: {
    marginBottom: '16px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
    minHeight: '100px',
    fontFamily: 'inherit'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  saveBtn: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  cancelBtn: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#e2e8f0',
    color: '#1e293b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  }
};

export default AdminUsersPage;