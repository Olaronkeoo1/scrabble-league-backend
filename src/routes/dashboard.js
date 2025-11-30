import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
try {
// For now, just return something basic the Dashboard can use.
// Later you can compute real stats from players/matches.
res.json({
playersCount: 0,
upcomingMatchesCount: 0,
});
} catch (err) {
console.error('Error in /api/dashboard:', err);
res.status(500).json({ error: 'Failed to load dashboard data' });
}
});

export default router;