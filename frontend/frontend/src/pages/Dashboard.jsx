import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase-config';
import { playerAPI, matchAPI, leagueAPI } from '../services/supabase-api';
import './Dashboard.css';

function Dashboard() {
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) return;

        const profileRes = await playerAPI.getProfile();
        setPlayer(profileRes.data);

        const statsRes = await leagueAPI.getStats(sessionData.session.user.id);
        setStats(statsRes.data);

        const matchesRes = await matchAPI.getUpcoming();
        setUpcomingMatches(matchesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {player?.display_name}</h1>
      
      <div className="dashboard-grid">
        <div className="card">
          <h2>Your Stats</h2>
          {stats && (
            <div className="stats">
              <div className="stat">
                <span className="label">Position</span>
                <span className="value">#{stats.position}</span>
              </div>
              <div className="stat">
                <span className="label">Points</span>
                <span className="value">{stats.points}</span>
              </div>
              <div className="stat">
                <span className="label">Wins</span>
                <span className="value">{stats.wins}</span>
              </div>
              <div className="stat">
                <span className="label">Draws</span>
                <span className="value">{stats.draws}</span>
              </div>
              <div className="stat">
                <span className="label">Losses</span>
                <span className="value">{stats.losses}</span>
              </div>
            </div>
          )}
        </div>








        <div className="card">
          <h2>Upcoming Matches</h2>
          {upcomingMatches.length > 0 ? (
            <ul className="matches-list">
              {upcomingMatches.map(match => (
                <li key={match.id}>
                  <span>
                    {match.players1?.display_name} vs {match.players2?.display_name}
                  </span>
                  <span>{new Date(match.scheduled_date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming matches</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

