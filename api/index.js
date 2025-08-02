export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const path = url.replace('/api', '');

  // Health check - always works
  if (method === 'GET' && path === '/health') {
    return res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      path,
      method,
      env: {
        hasDb: !!process.env.DATABASE_URL,
        hasJwt: !!process.env.JWT_SECRET
      }
    });
  }

  try {
    // Dynamic imports for serverless
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');

    const prisma = new PrismaClient();

    // AUTH ENDPOINTS
    if (method === 'POST' && path === '/auth/login') {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        await prisma.$disconnect();
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        await prisma.$disconnect();
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      await prisma.$disconnect();
      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, bio: user.bio }
      });
    }

    if (method === 'POST' && path === '/auth/register') {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        await prisma.$disconnect();
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

    if (method === 'GET' && path === '/auth/me') {
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
    }

    // POSTS ENDPOINTS
    if (method === 'GET' && path === '/posts') {
      const posts = await prisma.post.findMany({
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      
      await prisma.$disconnect();
      return res.json({ posts });
    }

    if (method === 'POST' && path === '/posts') {
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

    // USER ENDPOINTS
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

    const userPostsMatch = path.match(/^\/users\/(\d+)\/posts$/);
    if (userPostsMatch && method === 'GET') {
      const userId = parseInt(userPostsMatch[1]);
      
      const posts = await prisma.post.findMany({
        where: { authorId: userId },
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      
      await prisma.$disconnect();
      return res.json({ posts });
    }

    // DELETE POST
    const deletePostMatch = path.match(/^\/posts\/(\d+)$/);
    if (deletePostMatch && method === 'DELETE') {
      const postId = parseInt(deletePostMatch[1]);
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      });
      
      if (!post) {
        await prisma.$disconnect();
        return res.status(404).json({ error: 'Post not found' });
      }
      
      if (post.authorId !== decoded.userId) {
        await prisma.$disconnect();
        return res.status(403).json({ error: 'Not authorized' });
      }

      await prisma.post.delete({ where: { id: postId } });
      await prisma.$disconnect();
      return res.json({ message: 'Post deleted' });
    }

    // UPDATE USER PROFILE
    if (userMatch && method === 'PUT') {
      const userId = parseInt(userMatch[1]);
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.userId !== userId) {
        await prisma.$disconnect();
        return res.status(403).json({ error: 'Not authorized' });
      }

      const { name, bio } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name required' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, bio: bio || '' },
        select: { id: true, name: true, email: true, bio: true, createdAt: true }
      });

      await prisma.$disconnect();
      return res.json({ user: updatedUser });
    }

    await prisma.$disconnect();
    return res.status(404).json({ error: 'Endpoint not found', path, method });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
}
