import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// Get league standings
router.get('/standings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('league_standings')
      .select(`
        *,
        players(display_name, email)
      `)
      .order('position', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get player stats
router.get('/stats/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { data, error } = await supabase
      .from('league_standings')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top players
router.get('/top/:limit', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.params.limit) || 10, 100);
    const { data, error } = await supabase
      .from('league_standings')
      .select(`
        *,
        players(display_name)
      `)
      .order('position', { ascending: true })
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/league/add-player', async (req, res) => {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      return res.status(400).json({ error: 'player_id is required' });
    }

    const { data, error } = await supabase
      .from('league_standings')
      .insert({
        player_id,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        games_played: 0,
        position: 1,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('add-player error', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;