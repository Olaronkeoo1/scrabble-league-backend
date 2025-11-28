import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase-config';

import Dashboard from './pages/Dashboard';
import Rankings from './pages/Rankings';
import Admin from './pages/Admin';
import Login from './pages/Login';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);

      if (data.session?.user?.user_metadata?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false); // ensure reset when not admin
      }

      setLoading(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);

        if (session?.user?.user_metadata?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false); // ensure reset when user logs out / not admin
        }

        setLoading(false); // ensure we never stay stuck on Loading...
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>🎮 Scrabble League</h1>
          <ul>
            {user ? (
              <>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/rankings">Rankings</a></li>
                {isAdmin && <li><a href="/admin">Admin</a></li>}
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <li><a href="/login">Login</a></li>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/dashboard" />} />
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
