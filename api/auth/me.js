export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const jwtModule = await import('jsonwebtoken');
    
    const jwt = jwtModule.default;
    const prisma = new PrismaClient();

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, bio: true, createdAt: true }
    });
    
    if (!user) {
      await prisma.$disconnect();
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.$disconnect();
    return res.json({ user });

  } catch (error) {
    console.error('Auth Me Error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
}
