export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const jwtModule = await import('jsonwebtoken');
    
    const jwt = jwtModule.default;
    const prisma = new PrismaClient();

    if (req.method === 'GET') {
      const posts = await prisma.post.findMany({
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      
      await prisma.$disconnect();
      return res.json({ posts });
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content required' });
      }

      const post = await prisma.post.create({
        data: { content, authorId: decoded.userId },
        include: { author: { select: { id: true, name: true, email: true } } }
      });

      await prisma.$disconnect();
      return res.json({ post });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Posts Error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
}
