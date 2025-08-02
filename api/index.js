export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple health check first
  const { method, url } = req;
  const path = url.replace('/api', '');

  if (method === 'GET' && path === '/health') {
    return res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      path: path,
      method: method
    });
  }

  try {
    // Import Prisma and other modules
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');

    // Initialize Prisma
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    console.log(`Processing: ${method} ${path}`);

    // Auth routes
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      await prisma.$disconnect();
      
      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, bio: user.bio }
      });
    }

    if (path === '/auth/register' && method === 'POST') {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword }
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      await prisma.$disconnect();
      
      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, bio: user.bio }
      });
    }

    if (path === '/auth/me' && method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, bio: true, createdAt: true }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await prisma.$disconnect();
      
      return res.json({ user });
    }

    // Posts routes
    if (path === '/posts' && method === 'GET') {
      const posts = await prisma.post.findMany({
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      
      await prisma.$disconnect();
      
      return res.json({ posts });
    }

    // User routes
    const userMatch = path.match(/^\/users\/(\d+)$/);
    if (userMatch && method === 'GET') {
      const userId = parseInt(userMatch[1]);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, bio: true, createdAt: true }
      });
      
      if (!user) {
        await prisma.$disconnect();
        return res.status(404).json({ error: 'User not found' });
      }

      await prisma.$disconnect();
      
      return res.json({ user });
    }

    await prisma.$disconnect();
    
    return res.status(404).json({ error: 'Route not found', path, method });
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Ensure Prisma disconnects even on error
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Disconnect error:', disconnectError);
    }
    
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message
    });
  }
}
