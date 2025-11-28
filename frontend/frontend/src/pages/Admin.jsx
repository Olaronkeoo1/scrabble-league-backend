import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase-config';
import { playerAPI, matchAPI, leagueAPI } from '../services/supabase-api';
import './Admin.css';


function Admin() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([null, null]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchResults, setMatchResults] = useState({});

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await playerAPI.getAll();
      setPlayers(res.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await matchAPI.getUpcoming();
      setMatches(res.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleAddToLeague = async (playerId) => {
  try {
    await leagueAPI.addPlayerToLeague(playerId);
    // refresh standings or show success
  } catch (err) {
    console.error('Error adding to league:', err);
  }
};


  const handleScheduleMatch = async (e) => {
    e.preventDefault();
    if (!selectedPlayers[0] || !selectedPlayers[1] || !scheduledDate) {
      alert('Please select both players and a date');
      return;
    }

    setLoading(true);
    try {
      await matchAPI.scheduleMatch({
        player1_id: selectedPlayers[0],
        player2_id: selectedPlayers[1],
        scheduled_date: scheduledDate,
      });
      alert('Match scheduled successfully!');
      setSelectedPlayers([null, null]);
      setScheduledDate('');
      fetchMatches();
    } catch (error) {
      console.error('Error scheduling match:', error);
      alert('Error scheduling match');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordResult = async (matchId) => {
    const score1 = parseInt(matchResults[`${matchId}_p1`] || 0);
    const score2 = parseInt(matchResults[`${matchId}_p2`] || 0);

    try {
      await matchAPI.recordResult(matchId, {
        player1_score: score1,
        player2_score: score2,
      });
      alert('Result recorded!');
      fetchMatches();
    } catch (error) {
      console.error('Error recording result:', error);
      alert('Error recording result');
    }
  };

  return (
    <div className="admin">
      <h1>Admin Panel</h1>

      {/* NEW: Players list with Add to league button */}
      <div className="admin-section">
        <h2>Players</h2>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td>{p.display_name || 'No name'}</td>
                <td>{p.email}</td>
                <td>
                  <button onClick={() => handleAddToLeague(p.id)}>
                    Add to league
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-section">
        <h2>Schedule Match</h2>
        <form onSubmit={handleScheduleMatch}>
          <div className="form-group">
            <label>Player 1:</label>
            <select
              value={selectedPlayers[0] || ''}
              onChange={(e) =>
                setSelectedPlayers([e.target.value, selectedPlayers[1]])
              }
            >
              <option value="">Select player</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Player 2:</label>
            <select
              value={selectedPlayers[1] || ''}
              onChange={(e) =>
                setSelectedPlayers([selectedPlayers[0], e.target.value])
              }
            >
              <option value="">Select player</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Scheduled Date & Time:</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Match'}
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h2>Upcoming Matches</h2>
        <table>
          <thead>
            <tr>
              <th>Player 1</th>
              <th>Player 2</th>
              <th>Date</th>
              <th>Player 1 Score</th>
              <th>Player 2 Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id}>
                <td>{match.players1?.display_name}</td>
                <td>{match.players2?.display_name}</td>
                <td>{new Date(match.scheduled_date).toLocaleString()}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    placeholder="Score"
                    onChange={(e) =>
                      setMatchResults({
                        ...matchResults,
                        [`${match.id}_p1`]: e.target.value,
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    placeholder="Score"
                    onChange={(e) =>
                      setMatchResults({
                        ...matchResults,
                        [`${match.id}_p2`]: e.target.value,
                      })
                    }
                  />
                </td>
                <td>
                  <button onClick={() => handleRecordResult(match.id)}>
                    Record Result
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}  



export default Admin;
