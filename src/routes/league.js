import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// Get league standings
router.get('/standings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('league_standings')
      .select(`
        id,
        league_id,
        player_id,
        wins,
        losses,
        draws,
        points,
        games_played,
        position,
        players:player_id (
          display_name,
          email
        )
      `)
      .order('position', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('standings error', err);
    res.status(500).json({ error: err.message });
  }
});

// Get stats for a league (for dashboard)
router.get('/stats/:leagueId', async (req, res) => {
  const { leagueId } = req.params;

  try {
    // Total players in this league
    const { data: playersData, error: playersError } = await supabase
      .from('league_players')
      .select('id', { count: 'exact', head: true })
      .eq('league_id', leagueId);

    if (playersError) throw playersError;

    const totalPlayers = playersData ? playersData.length : 0;

    // Total matches in this league
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('league_id', leagueId);

    if (matchesError) throw matchesError;

    const totalMatches = matchesData ? matchesData.length : 0;

    // Upcoming matches in this league
    const { data: upcomingMatches, error: upcomingError } = await supabase
      .from('matches')
      .select('id')
      .eq('league_id', leagueId)
      .eq('status', 'scheduled');

    if (upcomingError) throw upcomingError;

    const upcomingMatchesCount = upcomingMatches ? upcomingMatches.length : 0;

    res.json({
      totalPlayers,
      totalMatches,
      upcomingMatches: upcomingMatchesCount,
    });
  } catch (err) {
    console.error('league stats error', err);
    res.status(500).json({ error: err.message });
  }
});

// Get stats for a specific player
router.get('/stats/player/:playerId', async (req, res) => {
  const { playerId } = req.params;

  try {
    const { data, error } = await supabase
      .from('league_standings')
      .select('*')
      .eq('player_id', playerId);

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('player stats error', err);
    res.status(500).json({ error: err.message });
  }
});

// Get top N players in a league
router.get('/top/:limit', async (req, res) => {
  const limit = parseInt(req.params.limit, 10) || 10;

  try {
    const { data, error } = await supabase
      .from('league_standings')
      .select(`
        id,
        league_id,
        player_id,
        wins,
        losses,
        draws,
        points,
        games_played,
        position,
        players:player_id (
          display_name,
          email
        )
      `)
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('top players error', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a player to league standings
router.post('/add-player', async (req, res) => {
  const { league_id, player_id } = req.body;

  if (!league_id || !player_id) {
    return res.status(400).json({ error: 'league_id and player_id are required' });
  }

  try {
    const { data, error } = await supabase
      .from('league_standings')
      .insert({
        league_id,
        player_id,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        games_played: 0,
        position: 1,
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(500).json({ error: 'Failed to insert league_standings row' });
    }

    res.json(data);
  } catch (err) {
    console.error('add-player error', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
