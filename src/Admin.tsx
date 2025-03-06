/* eslint-disable react/style-prop-object */
import React, { useState, useEffect } from 'react';
import './admin.css';

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  company: string;
  admin: boolean;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null); // מזהה המשתמש שעובר עריכה
  const [editedFields, setEditedFields] = useState<Partial<User>>({}); // השדות שעברו עריכה

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error fetching users');
        }
      } catch (err) {
        console.error('API error:', err);
        setError('Server error');
      }
    };

    fetchUsers();
  }, []);

  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedFields),
      });

      if (response.ok) {
        alert('User updated successfully');
        setUsers(users.map(user => (user.id === id ? { ...user, ...editedFields } : user)));
        setEditingUserId(null); 
        setEditedFields({});
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error updating user');
      }
    } catch (err) {
      console.error('API error:', err);
      setError('Server error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete user with ID ${id}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('User deleted successfully');
        setUsers(users.filter((user) => user.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error deleting user');
      }
    } catch (err) {
      console.error('API error:', err);
      setError('Server error');
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Page</h1>

      {error && <p className="error-message">{error}</p>}

      <table className="user-table">
        <thead className='user-thead'>
          <tr className='user-tr'>
            <th className='user-th'>ID</th>
            <th className='user-th'>Name</th>
            <th className='user-th'>Password</th>
            <th className='user-th'>Email</th>
            <th className='user-th'>Company</th>
            <th className='user-th'>Admin</th>
            <th className='user-th'>Actions</th>
          </tr>
        </thead>
        <tbody className='user-tbody'>
          {users.map((user) => (
            <tr className='user-tr' key={user.id}>
              <td className='user-td'>{user.id}</td>
              <td className='user-td'>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    defaultValue={user.username}
                    onChange={(e) => setEditedFields({ ...editedFields, username: e.target.value })}
                  />
                ) : (
                  user.username
                )}
              </td>
              <td className='user-td'>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    defaultValue={user.password}
                    onChange={(e) => setEditedFields({ ...editedFields, password: e.target.value })}
                  />
                ) : (
                  '********'
                )}
              </td>
              <td className='user-td'>
                {editingUserId === user.id ? (
                  <input
                    type="email"
                    defaultValue={user.email}
                    onChange={(e) => setEditedFields({ ...editedFields, email: e.target.value })}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className='user-td'>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    defaultValue={user.company}
                    onChange={(e) => setEditedFields({ ...editedFields, company: e.target.value })}
                  />
                ) : (
                  user.company
                )}
              </td>
              <td className='user-td'>
                {editingUserId === user.id ? (
                  <select
                    defaultValue={user.admin ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditedFields({ ...editedFields, admin: e.target.value === 'true' })
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : user.admin ? (
                  'Yes'
                ) : (
                  'No'
                )}
              </td>
              <td className='user-td'>
                {editingUserId === user.id ? (
                  <>
                      <button className="btn-23" onClick={() => handleUpdate(user.id)}>
                        <span className="text">Save</span>
                        <span  className="marquee">Save</span>
                      </button>
                      
                      <button className="btn-23" onClick={() => setEditingUserId(null)} >
                        <span className="text">Exit</span>
                        <span  className="marquee">Exit</span>
                      </button>
                  </>
                ) : (
                  <>
                    <button className="editBtn" onClick={() => setEditingUserId(user.id)}>
                      <svg height="1em" viewBox="0 0 512 512">
                        <path
                          d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                      </svg>
                    </button>

                    <button className='ui-btn'  onClick={() => handleDelete(user.id)} > delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
