
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import dashboardRouter from './routes/dashboard.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // use service key on backend
);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',              // for local dev
    'https://scrabble-league-backend.vercel.app'  // for production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
import playerRoutes from './routes/players.js';
import matchRoutes from './routes/matches.js';
import leagueRouter from './routes/league.js';

import { verifyToken } from './middleware/auth.js';

app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/league', leagueRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.use('/api/dashboard', dashboardRouter);
router.post('/api/league/add-player', async (req, res) => {
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



router.get('/stats/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    const { data: standing, error: standingError } = await supabase
      .from('league_standings')
      .select('wins, losses, draws, points, games_played')
      .eq('player_id', playerId)
      .single();

    if (standingError) throw standingError;

    const totalGames = standing.games_played || 0;
    const winRate = totalGames
      ? standing.wins / totalGames
      : 0;

    res.json({
      wins: standing.wins,
      losses: standing.losses,
      draws: standing.draws,
      points: standing.points,
      gamesPlayed: totalGames,
      winRate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


import sgMail from '@sendgrid/mail';
import router from './routes/league.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'bakareolaronke@gmail.com',
  from: 'bakareanjolaoluwa23@gmail.com',
  subject: 'Test Email',
  text: 'Hello from Scrabble League!',
};

await sgMail.send(msg);
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
