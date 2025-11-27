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
export default router;