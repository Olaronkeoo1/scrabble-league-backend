import express from 'express';
import { supabase } from '../server.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('auth_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update player profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { display_name, phone } = req.body;

    const { data, error } = await supabase
      .from('players')
      .update({
        display_name,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('auth_id', req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all players (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('id, display_name, email, created_at');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search players
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .ilike('display_name', `%${query}%`)
      .limit(10);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;