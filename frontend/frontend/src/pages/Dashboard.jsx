import React, { useState, useEffect } from 'react';
import { playerAPI, matchAPI, leagueAPI } from '../services/supabase-api';
import './Dashboard.css';

function Dashboard() {
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <header className="dashboard-header">
        <h1>Welcome, {player?.display_name}</h1>
        <p className="dashboard-subtitle">Your Scrabble league overview at a glance</p>
      </header>

      <main className="dashboard-grid">
        {/* Wide card: your personal stats */}
        <section className="card card-wide">
          <h2>Your Stats</h2>
          {playerStats && (
            <div className="stats">
              <div className="stat">
                <span className="label">Position</span>
                <span className="value">#{playerStats.position}</span>
              </div>
              <div className="stat">
                <span className="label">Points</span>
                <span className="value">{playerStats.points}</span>
              </div>
              <div className="stat">
                <span className="label">Wins</span>
                <span className="value">{playerStats.wins}</span>
              </div>
              <div className="stat">
                <span className="label">Draws</span>
                <span className="value">{playerStats.draws}</span>
              </div>
              <div className="stat">
                <span className="label">Losses</span>
                <span className="value">{playerStats.losses}</span>
              </div>
            </div>
          )}
        </section>

        {/* Left column: upcoming matches */}
        <section className="card">
          <h2>Upcoming Matches</h2>
          <div className="upcoming-matches-list">
            {upcomingMatches.length === 0 && (
              <p className="empty-text">No upcoming fixtures yet.</p>
            )}
            {upcomingMatches.map((m) => (
              <div key={m.id} className="upcoming-match-item">
                <div className="upcoming-match-title">
                  {m.players1?.display_name} vs {m.players2?.display_name}
                </div>
                <div className="upcoming-match-date">
                  {new Date(m.scheduled_date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right column: league overview */}
        <section className="card">
          <h2>League Overview</h2>
          {stats && (
            <div className="stats">
              <div className="stat">
                <span className="label">Players</span>
                <span className="value">{stats.totalPlayers}</span>
              </div>
              <div className="stat">
                <span className="label">Matches</span>
                <span className="value">{stats.totalMatches}</span>
              </div>
              <div className="stat">
                <span className="label">Upcoming</span>
                <span className="value">{stats.upcomingMatches}</span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;


