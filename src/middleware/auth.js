import jwt from 'jsonwebtoken';
import { supabase } from '../server.js';

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('verifyToken error', err);
    return res.status(401).json({ error: 'Token verification failed' });
  }
}

export function verifyAdmin(req, res, next) {
  // Check if user has admin role in Supabase
  // This would typically be stored in user metadata
  if (req.user.user_metadata?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}