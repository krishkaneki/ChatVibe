# ChatVibe 💬✨

> Real-time chat application built with Next.js 14, Socket.io, MongoDB, and Framer Motion.

![ChatVibe Screenshot](https://res.cloudinary.com/dhc52hnqf/image/upload/v1/chatvibe/preview.png)

## 🚀 Features

- **Real-time messaging** with Socket.io
- **1-on-1 & Group chats**
- **Typing indicators** with animated dots
- **Online/offline status** with pulse animation
- **Read receipts** (double checkmarks)
- **Message reactions** (emoji)
- **Image & file sharing** via Cloudinary
- **Authentication** — Email/Password, Google, GitHub (NextAuth.js v5)
- **Dark/Light theme** toggle
- **Framer Motion animations** throughout
- **Fully responsive** — mobile + desktop
- **Unread message badges**
- **Message deletion**
- **Group creation** with photo upload

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Real-time | Socket.io |
| Auth | NextAuth.js v5 |
| Database | MongoDB + Mongoose |
| Cache | Upstash Redis |
| Storage | Cloudinary |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |

## 📦 Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Upstash Redis account (free tier)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/chatvibe.git
cd chatvibe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatvibe

# NextAuth
NEXTAUTH_SECRET=your-random-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Socket Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 4. Run development servers

You need **two terminal windows**:

**Terminal 1 — Next.js app:**
```bash
npm run dev:next
```

**Terminal 2 — Socket.io server:**
```bash
npm run dev:socket
```

Or run both together:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🚀 Deployment

### Deploy Frontend on Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add all environment variables
5. Click **Deploy**

> ⚠️ Update `NEXTAUTH_URL` to your Vercel URL after deployment

### Deploy Socket Server

Since Vercel is serverless (no WebSocket support), deploy the Socket.io server separately:

**Option A: Railway (recommended)**
```bash
# Connect your GitHub repo on railway.app
# Set start command: npx ts-node --project tsconfig.server.json server/index.ts
```

**Option B: Render**
```bash
# Create Web Service on render.com
# Build: npm install
# Start: npx ts-node --project tsconfig.server.json server/index.ts
```

After deploying socket server, update `NEXT_PUBLIC_SOCKET_URL` in Vercel environment variables.

## 📁 Project Structure

```
chatvibe/
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (main)/          # Protected app pages
│   │   ├── chat/        # Chat pages
│   │   ├── contacts/    # Find people
│   │   └── settings/    # User settings
│   └── api/             # API routes
├── components/
│   ├── auth/            # Auth forms
│   ├── chat/            # Chat UI components
│   ├── modals/          # Modal components
│   └── sidebar/         # Sidebar components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── models/              # Mongoose models
├── providers/           # React context providers
├── server/              # Socket.io server
├── store/               # Zustand stores
└── types/               # TypeScript types
```

## 🔧 Free Services Used

| Service | Free Tier | Link |
|---------|-----------|------|
| MongoDB Atlas | 512MB storage | [mongodb.com/atlas](https://mongodb.com/atlas) |
| Cloudinary | 25GB storage | [cloudinary.com](https://cloudinary.com) |
| Upstash Redis | 10K requests/day | [upstash.com](https://upstash.com) |
| Vercel | Unlimited deployments | [vercel.com](https://vercel.com) |
| Railway | $5 credit/month | [railway.app](https://railway.app) |

## 🎨 Design System

ChatVibe uses a custom "Luminous Noir" design system:

- **Colors**: Deep obsidians (#0e0e0e) + electric violets (#a8a4ff)
- **Gradient**: `linear-gradient(135deg, #667eea, #764ba2)`
- **Typography**: Plus Jakarta Sans (headlines) + Inter (body)
- **Animations**: Framer Motion with spring physics
- **Glass morphism**: `backdrop-filter: blur(20px)` on overlays

## 📝 Scripts

```bash
npm run dev          # Run Next.js + Socket server together
npm run dev:next     # Next.js only
npm run dev:socket   # Socket.io server only
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — feel free to use this for your own projects!

---

Built with ❤️ and ✨ vibes
