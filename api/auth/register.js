export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const bcryptModule = await import('bcryptjs');
    const jwtModule = await import('jsonwebtoken');
    
    const bcrypt = bcryptModule.default;
    const jwt = jwtModule.default;
    const prisma = new PrismaClient();

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

  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
}
