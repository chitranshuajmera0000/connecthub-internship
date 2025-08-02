# ConnectHub - Mini LinkedIn Clone

A modern, full-stack community platform built with React, Node.js, Express, and Prisma. This application provides a LinkedIn-like experience with user authentication, profile management, and social posting features.

## 🌟 **Live Demo**

- **🌐 Frontend**: [Coming Soon - Deploy to Vercel]
- **⚡ Backend API**: [Coming Soon - Deploy to Railway] 
- **📱 Try it now**: Register or use demo account

### **🧪 Demo Account**
```
Email: demo@connecthub.com
Password: demo123
```

---

## 🚀 Features

### ✅ User Authentication
- **Register/Login** with email and password
- **JWT-based authentication** with secure token storage
- **Password hashing** using bcryptjs
- **Protected routes** and middleware

### ✅ User Profiles
- **Complete user profiles** with name, email, and bio
- **Profile editing** for authenticated users
- **Profile views** for other users
- **Join date** and post count display

### ✅ Post Management
- **Create text-only posts** with character limit (1000 chars)
- **Real-time post feed** with author information and timestamps
- **Delete own posts** with confirmation
- **Responsive post cards** with hover effects

### ✅ Additional Features
- **Responsive design** optimized for mobile, tablet, and desktop
- **Modern UI/UX** with smooth animations and micro-interactions
- **Error handling** with user-friendly messages
- **Loading states** and skeleton screens
- **Rate limiting** and security middleware

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Node.js** with Express
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Express Rate Limit** for API protection

### Database
- **Prisma** as ORM
- **PostgreSQL** (recommended) or any Prisma-supported database
- **Automatic migrations** and type generation

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or your preferred database)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd connecthub-linkedin-clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
# Database - Replace with your actual database URL
DATABASE_URL="postgresql://username:password@localhost:5432/connecthub"

# JWT Secret - Generate a secure random string
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 5. Start Development Server
```bash
# Start both frontend and backend concurrently
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Database Studio**: `npm run db:studio` (optional)

## 🎨 Design & UI

### Color Scheme
- **Primary**: Blue (#0077B5) - LinkedIn-inspired professional blue
- **Secondary**: Gray (#6B7280) - Modern neutral tone
- **Success**: Green (#10B981) - Positive actions
- **Error**: Red (#EF4444) - Error states
- **Background**: Light gray (#F9FAFB) - Clean, minimal backdrop

### Key Design Elements
- **Apple-level aesthetics** with meticulous attention to detail
- **Smooth animations** and hover effects throughout
- **Card-based layouts** with subtle shadows and rounded corners
- **Responsive grid system** with mobile-first approach
- **Consistent spacing** using 8px system
- **Modern typography** with proper hierarchy

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔐 Security Features

- **Password hashing** with bcryptjs (12 rounds)
- **JWT tokens** with 7-day expiration
- **Rate limiting** (100 requests per 15 minutes)
- **CORS protection** with configurable origins
- **Helmet security headers**
- **Input validation** and sanitization
- **SQL injection protection** via Prisma

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)

### Users  
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/posts` - Get user's posts
- `PUT /api/users/:id` - Update user profile (auth required)

## 🧪 Demo Account

For testing purposes, you can create a demo account or use these credentials after registering:

```
Email: demo@connecthub.com
Password: demo123
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables for production

### Backend (Render/Railway/Heroku)
1. Set production environment variables
2. Run database migrations: `npm run db:migrate`
3. Start the server: `node server/index.js`

### Database (PostgreSQL)
- **Local**: PostgreSQL server
- **Cloud**: Supabase, PlanetScale, Railway, or Neon

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NODE_ENV=production
PORT=3001
```

## 📁 Project Structure

```
connecthub-linkedin-clone/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── PostCard.tsx
│   │   ├── CreatePost.tsx
│   │   └── ProfileCard.tsx
│   ├── pages/              # Main application pages
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Home.tsx
│   │   └── Profile.tsx
│   ├── contexts/           # React context providers
│   │   └── AuthContext.tsx
│   ├── utils/              # Utility functions
│   │   └── api.ts
│   └── App.tsx             # Main application component
├── server/                 # Backend Express server
│   ├── routes/             # API route handlers
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── users.js
│   ├── middleware/         # Custom middleware
│   │   └── auth.js
│   └── index.js            # Server entry point
├── prisma/                 # Database schema and migrations
│   └── schema.prisma
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help with setup, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

---

**Built with ❤️ for the CIAAN Cyber Tech Internship Challenge**