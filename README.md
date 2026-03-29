# 
```
 ██████╗██╗  ██╗ █████╗ ████████╗██╗   ██╗██╗██████╗ ███████╗
██╔════╝██║  ██║██╔══██╗╚══██╔══╝██║   ██║██║██╔══██╗██╔════╝
██║     ███████║███████║   ██║   ██║   ██║██║██████╔╝█████╗  
██║     ██╔══██║██╔══██║   ██║   ╚██╗ ██╔╝██║██╔══██╗██╔══╝  
╚██████╗██║  ██║██║  ██║   ██║    ╚████╔╝ ██║██████╔╝███████╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝     ╚═══╝  ╚═╝╚═════╝ ╚══════╝
```

**Connect. Chat. Vibe.**

A full-stack real-time chat application built with Next.js 14, Socket.io, MongoDB, and Framer Motion.

---

## Live Demo

- Frontend: https://chatvibe-online.vercel.app
- Socket Server: https://chatvibe-gqw1.onrender.com

---

## Tech Stack

**Frontend**
- Next.js 14 with App Router
- TypeScript in strict mode
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for client state management
- TanStack Query for server state
- NextAuth.js v5 for authentication
- React Hook Form and Zod for form validation

**Backend**
- Socket.io server deployed on Render
- MongoDB with Mongoose ODM
- Upstash Redis for online status tracking
- Cloudinary for image and file storage
- bcryptjs for password hashing

---

## Features

- Real-time messaging powered by Socket.io
- 1-on-1 and group conversations
- Live message deletion and emoji reactions without page refresh
- Image and file sharing via Cloudinary
- Typing indicators with animated dots
- Online and offline status tracking
- Read receipts with double checkmarks
- Unread message badges per conversation
- Tab filters for All Chats, Groups, and Unread
- Authentication via email and password, Google, and GitHub OAuth
- Dark and light theme toggle
- Responsive design for mobile and desktop
- Drag and drop file uploads

---

## Project Structure
```
chatvibe/
├── app/
│   ├── (auth)/                  # Login and register pages
│   ├── (main)/                  # Protected app pages
│   │   ├── chat/                # Chat pages
│   │   ├── contacts/            # Find people and groups
│   │   ├── settings/            # User settings
│   │   └── profile/             # User profile
│   └── api/                     # REST API routes
│       ├── auth/                # NextAuth handlers and register
│       ├── conversations/       # Conversation CRUD and seen tracking
│       ├── messages/            # Message CRUD and reactions
│       ├── users/               # User search and updates
│       └── upload/              # Cloudinary file upload
├── components/
│   ├── auth/                    # Login and register forms
│   ├── chat/                    # Chat header, bubbles, input, typing
│   ├── sidebar/                 # Sidebar, conversation list and items
│   └── modals/                  # Create group modal
├── server/
│   └── index.ts                 # Socket.io server entry point
├── models/                      # Mongoose schemas
├── lib/                         # Database, auth, redis, cloudinary, utils
├── providers/                   # React context providers
├── store/                       # Zustand state stores
├── hooks/                       # Custom React hooks
└── types/                       # TypeScript type definitions
```

---

## Local Development Setup

### Prerequisites

- Node.js 18 or higher
- A MongoDB Atlas account
- A Cloudinary account
- An Upstash Redis account

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/chatvibe.git
cd chatvibe
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory and fill in your values:
```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# NextAuth
NEXTAUTH_SECRET=your_random_secret_min_32_chars
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Socket Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 4. Run the development servers

Open two terminal windows.

Terminal 1 — Next.js frontend:
```bash
npm run dev:next
```

Terminal 2 — Socket.io server:
```bash
npm run dev:socket
```

Then open http://localhost:3000 in your browser.

---

## Deployment

### Frontend on Vercel

1. Push the repository to GitHub
2. Go to vercel.com and import the repository
3. Add all environment variables from your `.env.local`
4. Set `NEXTAUTH_URL` to your Vercel production domain
5. Set `NEXT_PUBLIC_SOCKET_URL` to your Render socket server URL
6. Deploy

### Socket Server on Render

The socket server lives in `server/index.ts` and is compiled to plain JavaScript before running.

Set these in your Render service settings:
```
Build Command:  npm ci && npm run build:socket
Start Command:  npm run start:socket
```

No additional environment variables are needed on Render. The `PORT` is injected automatically.

### MongoDB Atlas Network Access

Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`) so both Vercel and Render can connect to your database.

### Google and GitHub OAuth Callbacks

After deploying to Vercel, update your OAuth app settings:

Google Console — add this to Authorized Redirect URIs:
```
https://your-app.vercel.app/api/auth/callback/google
```

GitHub OAuth App — set the callback URL to:
```
https://your-app.vercel.app/api/auth/callback/github
```

---

## Available Scripts
```bash
npm run dev            # Run Next.js and socket server together
npm run dev:next       # Run Next.js only
npm run dev:socket     # Run socket server only with ts-node
npm run build          # Build Next.js for production
npm run build:socket   # Compile socket server TypeScript to dist/
npm run start:socket   # Run the compiled socket server
npm run lint           # Run ESLint
```

---

## Database Schemas

**User** — name, email, hashed password, avatar, bio, online status, friends list, settings

**Conversation** — participants, group info, last message reference, timestamps

**Message** — sender, content, type (text/image/file), reactions, read receipts, soft delete flag

**FriendRequest** — sender, receiver, status (pending/accepted/rejected)

---

## Free Services Used

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Vercel | Frontend hosting | Unlimited deployments |
| Render | Socket.io server | 750 hours per month |
| MongoDB Atlas | Database | 512MB storage |
| Cloudinary | Image and file storage | 25GB |
| Upstash Redis | Online status caching | 10,000 requests per day |

---

## What Was Changed to Make the Backend Deployable on Render

- Updated `server/index.ts` to use `process.env.PORT` first so Render can inject its required port, with fallback to `SOCKET_PORT` and then `3001`
- Added a simple HTTP health check response so Render marks the service as healthy instead of failing on startup
- Added `build:socket` script to `package.json` that compiles TypeScript with `tsc -p tsconfig.server.json`
- Added `start:socket` script to `package.json` that runs the compiled output with `node dist/index.js`
- Verified that `tsconfig.server.json` outputs the compiled entry point to `dist/index.js`

---

## License

MIT License. Feel free to use this project for learning or as a base for your own applications.

---

Built by Krish: a student project, built with curiosity and a lot of debugging.
