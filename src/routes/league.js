import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();


// Get stats for the single league (for dashboard)
router.get('/stats', async (req, res) => {
  try {
    // Total players in the league
    const { count: playersCount, error: playersError } = await supabase
      .from('league_players')
      .select('*', { count: 'exact', head: true });

    if (playersError) throw playersError;

    // Total matches
    const { count: matchesCount, error: matchesError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true });

    if (matchesError) throw matchesError;

    // Upcoming matches
    const { count: upcomingCount, error: upcomingError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled');

    if (upcomingError) throw upcomingError;

    res.json({
      totalPlayers: playersCount || 0,
      totalMatches: matchesCount || 0,
      upcomingMatches: upcomingCount || 0,
    });
  } catch (err) {
    console.error('league stats error', err);
    res.status(500).json({ error: err.message });
  }
});

// Get top N players in a league (simple)
router.get('/top/:limit', async (req, res) => {
  const limit = parseInt(req.params.limit, 10) || 10;

  try {
    const { data, error } = await supabase
      .from('league_standings')
      .select('*') // no nested players
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
// Get league standings with player names
// Get league standings with player names
router.get('/standings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('league_standings')
      .select(`
        id,
        player_id,
        wins,
        losses,
        draws,
        points,
        games_played,
        position,
        players!league_standings_player_id_fkey (
          id,
          display_name
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

// GET /api/league/player-stats/:playerId
router.get('/player-stats/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    const { data, error } = await supabase
      .from('league_standings')
      .select('positions, points, wins, draws, losses')
      .eq('player_id', playerId)
      .single();

    if (error) throw error;

    res.json({
      position: data.position || 0,
      points: data.points || 0,
      wins: data.wins || 0,
      draws: data.draws || 0,
      losses: data.losses || 0,
      
    });
  } catch (err) {
    console.error('player-stats error', err);
    res.status(500).json({ error: err.message });
  }
});



export default router;

