

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // use service key on backend
);


// Routes
import playerRoutes from './routes/players.js';
import matchRoutes from './routes/matches.js';
import leagueRoutes from './routes/league.js';

// Middleware
import { verifyToken } from './middleware/auth.js';



app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/league', leagueRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
  
app.post('/api/league/add-player', async (req, res) => {
  const { player_id } = req.body;
  try {
    const { error } = await supabase
      .from('league_standings')
      .insert({
        player_id,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        games_played: 0,
      });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('add-player error', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});