import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, url } = req;
    const path = url.replace('/api', '');

    // Health check
    if (method === 'GET' && path === '/health') {
      return res.json({ status: 'OK', timestamp: new Date().toISOString() });
    }

    // Auth routes
    if (path.startsWith('/auth')) {
      if (method === 'POST' && path === '/auth/register') {
        const { name, email, password } = req.body;
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
          data: { name, email, password: hashedPassword }
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        return res.json({
          token,
          user: { id: user.id, name: user.name, email: user.email, bio: user.bio }
        });
      }

      if (method === 'POST' && path === '/auth/login') {
        const { email, password } = req.body;
        
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        return res.json({
          token,
          user: { id: user.id, name: user.name, email: user.email, bio: user.bio }
        });
      }
    }

    // Posts routes
    if (path.startsWith('/posts')) {
      if (method === 'GET' && path === '/posts') {
        const posts = await prisma.post.findMany({
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        });
        return res.json({ posts });
      }

      if (method === 'POST' && path === '/posts') {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { content } = req.body;

        const post = await prisma.post.create({
          data: { content, authorId: decoded.userId },
          include: { author: { select: { id: true, name: true, email: true } } }
        });

        return res.json({ post });
      }
    }

    // Users routes
    if (path.startsWith('/users')) {
      const userIdMatch = path.match(/^\/users\/(\d+)$/);
      if (method === 'GET' && userIdMatch) {
        const userId = parseInt(userIdMatch[1]);
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, bio: true, createdAt: true }
        });
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.json({ user });
      }
    }

    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
