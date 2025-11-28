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
        setStandings(res.data);
      } catch (error) {
        console.error('Error fetching standings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

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
          {standings.map((player, idx) => (
            <tr key={player.id}>
              <td>{idx + 1}</td>
              <td>{player.players?.display_name || 'Unknown'}</td>
              <td>{player.games_played}</td>
              <td>{player.wins}</td>
              <td>{player.draws}</td>
              <td>{player.losses}</td>
              <td className="points">{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Rankings;