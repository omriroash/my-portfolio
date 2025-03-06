import React, { useState, useEffect, JSX } from 'react';
import {  Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Registration from './registration';
import HomePage from './homePage';
import Login from './logintest';
import AmmoList from './Ammo';
import Admin from './Admin';
import './App.css';
import axios from 'axios';
import Hativa from './Hativa';
import Requests from './requestUser';
import AmmoHistory from './ammoHistory'; 

export const fetchAnnouncements = async (company : string) => {
  try {
      const response = await axios.get('http://localhost:3001/api/announcements'); 
      if (company === 'hativa') {
        return response.data.filter((announccement:any) => announccement.type === 'order');
      }
      else if(company === 'himosh'){
      return response.data;
      }
      else {
        return response.data.filter((announcement:any) => announcement.type !== 'order');
      }
  } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
  }
};

interface ProtectedRouteProps {
  isLoggedIn: boolean;
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/logintest" />;
};


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [isHimosh , setHimosh] = useState(() => localStorage.getItem('company') === 'himosh' || localStorage.getItem('company') === 'hativa');
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const company = localStorage.getItem('company');
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    localStorage.removeItem('company');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/logintest'); 
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const adminStatus = localStorage.getItem('isAdmin') === 'true';
      const company = localStorage.getItem('company');
      const companyStatus = company === 'himosh' || company === 'hativa';

      console.log(company , companyStatus);
      setHimosh(companyStatus);
      setIsLoggedIn(loggedIn);
      setIsAdmin(adminStatus);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  useEffect(() => {
    const loadAnnouncements = async () => {
      const company = localStorage.getItem('company')
        const data = await fetchAnnouncements(company || '');
        setAnnouncements(data);
    };
    loadAnnouncements();
}, []);
const handleNewAnnouncement = async () => {
  if (!newAnnouncement.title || !newAnnouncement.content) {
    alert("Both title and content are required");
    return;
  }

  try {
    await axios.post("http://localhost:3001/api/announcements", newAnnouncement);
    alert("Announcement added successfully!");
    setNewAnnouncement({ title: "", content: "" });
    fetchAnnouncements(company || ''); 
  } catch (error) {
    console.error("Error adding announcement:", error);
    alert("Failed to add announcement.");
  }
};

useEffect(() => {
  fetchAnnouncements(company || '');
}, [company]);

  return (
    <div>
      <header>
        <nav>
          {!isLoggedIn ? (
            <>
              <Link to="/" className="main-link">MAIN</Link>
              <Link to="/logintest" className="main-link">LOG-IN</Link>
              <Link to="/secondPage" className="main-link">REGISTRATION</Link>
            </>
          ) : (
            <>
              <button onClick={handleLogout} className="main-link">LOG-OUT</button>
              <Link to="/ammo" className="main-link">AMMO LIST</Link>
              {isAdmin && <Link to="/admin" className="main-link">ADMIN PAGE</Link>}
              {isAdmin && <Link to="/requestUser" className='main-link'>Request</Link>}
              {isAdmin && <Link to="/ammoHistory" className='main-link'>History</Link>}
              {isHimosh && <Link to="/Hativa" className='main-link'>Hativa</Link>}
            </>
          )}
        </nav>
      </header>
      <main>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/secondPage" element={<Registration />} />
          <Route path="/logintest" element={<Login />} />
          <Route
            path="/ammo"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <AmmoList />
              </ProtectedRoute>
            }
          />
          {isAdmin && <Route path="/admin" element={<Admin />} />}
          {isAdmin && <Route path="/ammoHistory" element={<AmmoHistory/>}/>}
          {isAdmin && <Route path='/requestUser' element={<Requests />}/>}
          {isHimosh && <Route path='/hativa' element={<Hativa />}/>}
        </Routes>
      </main>
      <div className="relative min-h-screen bg-gray-100">
      {isLoggedIn && ( 
            <button
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className="sidebar-toggle-button"
      >
        ☰
      </button>
      )}
      
      <div className={`sidebar ${isDrawerOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>הודעות</h2>
        </div>
        <div className="sidebar-content">
          {announcements.length > 0 ? (
            announcements.map((announcement, index) => (
              <div key={index} className="announcement">
                <h3 className="announcement-title">{announcement.title}</h3>
                <label className="announcement-content">{announcement.content}</label>
                <label className="announcement-time">
                  {new Date(announcement.created_at).toLocaleString()}
                </label>
              </div>
            ))
          ) : (
            <p className="announcement-content">אין הודעות להצגה כרגע.</p>
          )}
        </div>
        {isAdmin && (
              <div className='newAnnoucement'>
                <h2> הערה חדשה</h2>
                <input
                  type="text"
                  placeholder="כותרת"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                />
                <textarea
                  placeholder="תוכן"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                />
                <button  className='buttonNewAnnouncement' onClick={handleNewAnnouncement}>הוספת הערה</button>
              </div>
            )}
      </div>
        </div>
    </div>
  );
};

export default App;
