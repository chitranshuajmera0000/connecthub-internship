export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  
  // Extract path correctly - Vercel passes full URL path
  let path = url;
  if (path.startsWith('/api')) {
    path = path.replace('/api', '');
  }
  if (!path) path = '/';

  console.log(`API Request: ${method} ${url} -> ${path}`);

  // Health check
  if ((method === 'GET' && path === '/health') || (method === 'GET' && path === '/')) {
    return res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      method,
      originalUrl: url,
      processedPath: path,
      env: {
        hasDb: !!process.env.DATABASE_URL,
        hasJwt: !!process.env.JWT_SECRET
      }
    });
  }

  try {
    // Only import dependencies when needed for other endpoints
    if (path !== '/health' && path !== '/') {
      const { PrismaClient } = await import('@prisma/client');
      const bcryptModule = await import('bcryptjs');
      const jwtModule = await import('jsonwebtoken');
      
      const bcrypt = bcryptModule.default;
      const jwt = jwtModule.default;
      const prisma = new PrismaClient();

      // AUTH LOGIN
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

      // AUTH REGISTER
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

      // AUTH ME
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

      // GET POSTS
      if (method === 'GET' && path === '/posts') {
        const posts = await prisma.post.findMany({
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        });
        
        await prisma.$disconnect();
        return res.json({ posts });
      }

      // CREATE POST
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

      // USER PROFILE
      const userMatch = path.match(/^\/users\/([a-zA-Z0-9]+)$/);
      if (userMatch && method === 'GET') {
        const userId = userMatch[1];
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

      // USER POSTS
      const userPostsMatch = path.match(/^\/users\/([a-zA-Z0-9]+)\/posts$/);
      if (userPostsMatch && method === 'GET') {
        const userId = userPostsMatch[1];
        
        const posts = await prisma.post.findMany({
          where: { authorId: userId },
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        });
        
        await prisma.$disconnect();
        return res.json({ posts });
      }

      // DELETE POST
      const deletePostMatch = path.match(/^\/posts\/([a-zA-Z0-9]+)$/);
      if (deletePostMatch && method === 'DELETE') {
        const postId = deletePostMatch[1];
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
        const userId = userMatch[1];
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
    }

    return res.status(404).json({ 
      error: 'Endpoint not found', 
      path, 
      method,
      originalUrl: url,
      availableEndpoints: ['/health', '/auth/login', '/auth/register', '/auth/me', '/posts', '/users/{id}', '/users/{id}/posts']
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
