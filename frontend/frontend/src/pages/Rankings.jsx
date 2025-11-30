import React, { useState, useEffect } from 'react';
import { leagueAPI } from '../services/supabase-api';
import './Rankings.css';

function Rankings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await leagueAPI.getStandings();
        setStandings(res.data || []);
      } catch (error) {
        console.error('Error fetching standings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  useEffect(() => {
    console.log('Standings data:', standings);
  }, [standings]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="rankings">
      <h1>League Rankings</h1>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Player</th>
            <th>Games</th>
            <th>Wins</th>
            <th>Draws</th>
            <th>Losses</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => (
            <tr key={row.id}>
              <td>{row.position ?? idx + 1}</td>
              <td>{row.players?.display_name || row.player_id}</td>
              <td>{row.games_played}</td>
              <td>{row.wins}</td>
              <td>{row.draws}</td>
              <td>{row.losses}</td>
              <td className="points">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Rankings;

