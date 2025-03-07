import React, { useState, useEffect } from 'react';
import './requestUser.css';
interface User {
  id: number;
  name: string;
  password: string;
  email: string;
  company: string;
  admin: boolean;
}

const Requests = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/request');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        } else {
          setError('Error fetching users');
        }
      } catch (err) {
        console.error('API error:', err);
        setError('Server error');
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = async (user: User) => {
    try {
      const response = await fetch('http://localhost:3001/api/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: user.id,
            name: user.name,
            password: user.password,
            email: user.email,
            company: user.company,
            admin: user.admin, 
          }),
      });

      if (response.ok) {
        alert('User approved and added successfully');

        await handleReject(user.id);

        setUsers(users.filter((u) => u.id !== user.id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error adding user');
      }
    } catch (err) {
      console.error('API error:', err);
      setError('Server error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/request/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('User request rejected');
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
      <h1>Pending User Requests</h1>

      {error && <p className="error-message">{error}</p>}

      <table className="request-table">
        <thead className='request-thead'>
          <tr className='request-tr'>
            <th className='request-th'>ID</th>
            <th className='request-th'>Name</th>
            <th className='request-th'>Password</th>
            <th className='request-th'>Email</th>
            <th className='request-th'>Company</th>
            <th className='request-th'>Admin</th>
            <th className='request-th'>Actions</th>
          </tr>
        </thead>
        <tbody className='request-tbody'>
          {users.map((user) => (
            <tr key={user.id}>
              <td className='request-td'>{user.id}</td>
              <td className='request-td'>{user.name}</td>
              <td className='request-td'>********</td>
              <td className='request-td'>{user.email}</td>
              <td className='request-td'>{user.company}</td>
              <td className='request-td'>{user.admin ? 'Yes' : 'No'}</td>
              <td className='request-td'>
                <button  onClick={() => handleApprove(user)} className="approve-btn">
                  אישור
                </button>
                <button onClick={() => handleReject(user.id)} className="reject-btn">
                  דחייה
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Requests;
