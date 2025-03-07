import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Handle login called');
    try {
      console.log('Sending request to /api/login');
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User data from server:', data.user);

        const isAdmin = data.user.isAdmin === 1 || data.user.isAdmin === true;
        console.log('Computed isAdmin value:', isAdmin);
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('company', data.user.company);

        console.log('Saved to localStorage:');
        console.log('isLoggedIn:', localStorage.getItem('isLoggedIn'));
        console.log('isAdmin:', localStorage.getItem('isAdmin'));
        console.log('username:', localStorage.getItem('username'));
        console.log('company:', localStorage.getItem('company'));

        console.log('Navigating to /ammo');
        window.location.href = '/ammo';
      

      } else {
        const errorData = await response.json();
        console.log('Failed to log in:', errorData);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  return (
    <div className="login-container">
      <h1>LOGIN FORM</h1>
      <form className='form-login' onSubmit={handleLogin}>
        <input className='login-input'
          type="text"
          placeholder="USERNAME"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input className='login-input'
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className='button-login' type="submit">LOG-IN</button>
      </form>
    </div>
  );
};

export default Login;
