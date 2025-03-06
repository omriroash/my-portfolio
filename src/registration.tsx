import React, { useEffect, useState } from 'react';
import './registration.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    [x: string]: any; email?: string; password?: string
  }>({});
  
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [idValid, setIdValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [usernameValidations, setUsernameValidations] = useState({
    upper: false,
    number: false,
    lower: false,
    length: false,
  });
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    numberOrSymbol: false,
  });

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setId(value);
    setIdValid(/^\d{9}$/.test(value));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    setUsernameValidations({
      upper: /[A-Z]/.test(value[0]),
      number: /\d/.test(value),
      lower: /[a-z]/.test(value),
      length: value.length >= 5 && value.length <= 8,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    setPasswordValidations({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      numberOrSymbol: /\d|[!@#$%^&*]/.test(value),
    });
  };

  const isUsernameValid = Object.values(usernameValidations).every(Boolean);
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const isValid = idValid && emailValid && isUsernameValid && isPasswordValid;
  const hasErrors = Object.values(errors).some(error => error !== undefined);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSuccess(true);
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, username, password, email, company }),
      });

      if (response.ok) {
        setId('');
        setUsername('');
        setPassword('');
        setEmail('');
        setCompany('');
        alert('Your request has been sent');
      } else {
        alert('An error occurred during registration.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => setSuccess(false), 5000);
    }
  }, [success]);

  return (
    <div className="register-container">
      <h1 className="h1-registration">REGISTRATION FORM</h1>
      <form className="form-registration" onSubmit={handleRegister}>
        <input
          className={`input-registration ${idValid ? '' : 'input-invalid'}`}
          type="text"
          placeholder="ID"
          value={id}
          onChange={handleIdChange}
        />
        <input
          className={`input-registration ${usernameValidations.length && usernameValidations.upper && usernameValidations.number && usernameValidations.lower ? '' : 'input-invalid'}`}
          type="text"
          placeholder="USERNAME"
          value={username}
          onChange={handleUsernameChange}
        />
        <input
          className={`input-registration ${passwordValidations.length && passwordValidations.upper && passwordValidations.lower && passwordValidations.numberOrSymbol ? '' : 'input-invalid'}`}
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={handlePasswordChange}
        />
        <input
          className={`input-registration ${emailValid ? '' : 'input-invalid'}`}
          type="email"
          placeholder="EMAIL"
          value={email}
          onChange={handleEmailChange}
        />
        <select
          className="input-registration"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        >
          <option value="" disabled>Select a role</option>
          <option value="solela a">Manager A</option>
          <option value="solela b">Manager B</option>
          <option value="solela c">Manager C</option>
          <option value="himosh">Himosh</option>
          <option value="hativa">Hativa</option>
        </select>

        <button
          type="submit"
          className={`register-button ${isValid ? '' : 'disabled'}`}
          disabled={!isValid}
        >
          Register
        </button>
      </form>

      {success && (
        <div className="successfull show">
          <span>Your request has been sent to the manager</span>
          <i className="fa fa-check-circle" id="icon"></i>
        </div>
      )}
      <div className='check-contanier'>
      <div className="valid-checklist">
        <ul>
        <p>USERNAME</p>
          <li className={usernameValidations.upper ? 'valid' : 'invalid'}>First letter is uppercase</li>
          <li className={usernameValidations.number ? 'valid' : 'invalid'}>Contains at least one number</li>
          <li className={usernameValidations.lower ? 'valid' : 'invalid'}>Contains at least one lowercase letter</li>
          <li className={usernameValidations.length ? 'valid' : 'invalid'}>Username must be 5-8 characters</li>
        </ul>
      </div>

      <div className="valid-checklist">
        <ul>
        <p>PASSWORD</p>
          <li className={passwordValidations.length ? 'valid' : 'invalid'}>At least 8 characters</li>
          <li className={passwordValidations.upper ? 'valid' : 'invalid'}>Contains at least one uppercase letter</li>
          <li className={passwordValidations.lower ? 'valid' : 'invalid'}>Contains at least one lowercase letter</li>
          <li className={passwordValidations.numberOrSymbol ? 'valid' : 'invalid'}>Contains at least one number or special character</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default Register;
