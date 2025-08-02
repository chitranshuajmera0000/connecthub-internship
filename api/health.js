export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      hasDb: !!process.env.DATABASE_URL,
      hasJwt: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV
    }
  });
}
