import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase-config';
import { playerAPI, matchAPI, leagueAPI } from '../services/supabase-api';
import './Dashboard.css';



function Dashboard() {
  const [player, setPlayer] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
const [playerStats, setPlayerStats] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const profileRes = await playerAPI.getProfile();
      const currentPlayer = profileRes.data;
      setPlayer(currentPlayer);

      const statsRes = await leagueAPI.getStats();
      setStats(statsRes.data);

      const playerStatsRes = await leagueAPI.getPlayerStats(currentPlayer.id);
      setPlayerStats(playerStatsRes.data);

      const upcomingRes = await matchAPI.getUpcoming(currentPlayer.id);
      setUpcomingMatches(upcomingRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
  <div className="upcoming-matches-list">
    {upcomingMatches.map((m) => (
      <div key={m.id} className="upcoming-match-item">
        <div>{m.players1?.display_name} vs {m.players2?.display_name}</div>
        <div>{new Date(m.scheduled_date).toLocaleString()}</div>
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  );
}

export default Dashboard;

