const PocketBase = require('pocketbase/cjs');

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token, null);

    if (!pb.authStore.isValid) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Verify the token with PocketBase
    const authData = await pb.collection('users').authRefresh();
    req.user = authData.record;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
}

module.exports = authMiddleware;
