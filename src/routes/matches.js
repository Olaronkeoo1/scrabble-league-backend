import express from 'express';
import { supabase } from '../server.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { sendMatchNotification } from '../services/notifications.js';

const router = express.Router();

// Schedule match (admin only)
router.post('/schedule', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { player1_id, player2_id, scheduled_date } = req.body;

    // Validate
    if (!player1_id || !player2_id || !scheduled_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (player1_id === player2_id) {
      return res.status(400).json({ error: 'Cannot play against yourself' });
    }

    // Create match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        player1_id,
        player2_id,
        scheduled_date,
        status: 'scheduled'
      })
      .select();

    if (matchError) throw matchError;

    // Create notifications
    await Promise.all([
      sendMatchNotification(player1_id, match[0].id, scheduled_date),
      sendMatchNotification(player2_id, match[0].id, scheduled_date)
    ]);

    res.json({ success: true, matchId: match[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record match result (admin only)
router.put('/:matchId/result', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { player1_score, player2_score } = req.body;

    let winner = 'draw';
    if (player1_score > player2_score) winner = 'player1';
    if (player2_score > player1_score) winner = 'player2';

    // Update match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .update({
        player1_score,
        player2_score,
        winner,
        status: 'completed',
        played_date: new Date().toISOString()
      })
      .eq('id', matchId)
      .select();

    if (matchError) throw matchError;

    // Update league standings
    await updateStandings(match[0]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/matches/upcoming?playerId=...
router.get('/upcoming', async (req, res) => {
  try {
    const { playerId } = req.query; // players.id

    const query = supabase
      .from('matches')
      .select(`
        id,
        player1_id,
        player2_id,
        scheduled_date,
        status,
        players1:players!matches_player1_id_fkey (id, display_name),
        players2:players!matches_player2_id_fkey (id, display_name)
      `)
      .eq('status', 'scheduled');

    // If a playerId is provided, filter to only that player's fixtures
    if (playerId) {
      query.or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('upcoming matches for player error', err);
    res.status(500).json({ error: err.message });
  }
});


// Get match history
router.get('/history/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
      .eq('status', 'completed')
      .order('played_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  res.json({ message: 'Matches root endpoint' });
});


// Helper function to update standings
async function updateStandings(match) {
  const { player1_id, player2_id, winner } = match;

  // Calculate points
  const getPoints = (playerWinner) => {
    if (playerWinner === 'draw') return 1;
    return playerWinner ? 2 : 0;
  };

  const player1Points = getPoints(winner === 'player1' ? true : winner === 'draw' ? 'draw' : false);
  const player2Points = getPoints(winner === 'player2' ? true : winner === 'draw' ? 'draw' : false);

  // Update player 1 standings
  const { data: p1Standing } = await supabase
    .from('league_standings')
    .select('*')
    .eq('player_id', player1_id)
    .single();

  if (p1Standing) {
    await supabase
      .from('league_standings')
      .update({
        wins: winner === 'player1' ? p1Standing.wins + 1 : p1Standing.wins,
        losses: winner === 'player2' ? p1Standing.losses + 1 : p1Standing.losses,
        draws: winner === 'draw' ? p1Standing.draws + 1 : p1Standing.draws,
        points: p1Standing.points + player1Points,
        games_played: p1Standing.games_played + 1,
        updated_at: new Date().toISOString()
      })
      .eq('player_id', player1_id);
  }

  // Update player 2 standings
  const { data: p2Standing } = await supabase
    .from('league_standings')
    .select('*')
    .eq('player_id', player2_id)
    .single();

  if (p2Standing) {
    await supabase
      .from('league_standings')
      .update({
        wins: winner === 'player2' ? p2Standing.wins + 1 : p2Standing.wins,
        losses: winner === 'player1' ? p2Standing.losses + 1 : p2Standing.losses,
        draws: winner === 'draw' ? p2Standing.draws + 1 : p2Standing.draws,
        points: p2Standing.points + player2Points,
        games_played: p2Standing.games_played + 1,
        updated_at: new Date().toISOString()
      })
      .eq('player_id', player2_id);
  }

  // Recalculate positions
  const { data: allStandings } = await supabase
    .from('league_standings')
    .select('*')
    .order('points', { ascending: false });

  for (let i = 0; i < allStandings.length; i++) {
    await supabase
      .from('league_standings')
      .update({ position: i + 1 })
      .eq('id', allStandings[i].id);
  }
}

export default router;
