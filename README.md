# Urban Loop

Urban Loop is a full-stack local social platform for city communities. It combines a social feed, user profiles, real-time chat, voice and video calls, groups, community rooms, polls, local exploration, places, events, and a responsive animated UI with global light and dark themes.

The project is split into a Vite React frontend and an Express/MongoDB backend. The backend is designed for deployment on Render, while the frontend is ready for deployment on Vercel.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend Routes](#frontend-routes)
- [Backend API Surface](#backend-api-surface)
- [Realtime Socket Features](#realtime-socket-features)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Data Models](#data-models)
- [UI and Theme System](#ui-and-theme-system)
- [Known Operational Notes](#known-operational-notes)

## Overview

Urban Loop helps users stay connected with their local city through:

- A personalized social feed.
- User profiles with posts, followers, following, profile editing, and post creation.
- Real-time one-to-one and group chat.
- Voice and video calls using WebRTC and Socket.IO signaling.
- Community rooms for public or private group spaces.
- Polls in chats and communities.
- Explore pages for city news, weather, must-visit places, heritage spots, and upcoming events.
- Fully responsive layouts for desktop, tablet, and mobile.
- Global light and dark theme support.

## Core Features

### Landing Page

- Responsive animated landing experience.
- Light and dark theme toggle.
- Login and register actions.
- Service and feature sections explaining the platform.
- Footer with project credits.
- Authenticated users are redirected away from the landing page to the feed, so the Urban Loop logo does not send logged-in users back to the public page.

### Authentication

- User registration.
- User login.
- JWT cookie based authentication.
- Protected frontend routes.
- `/auth/me` session check.
- Logout support.
- Production cookie behavior can be configured with `COOKIE_SAMESITE`.

### Feed

- Main authenticated home page.
- Displays posts from users and followed/local activity.
- Supports post cards, media, likes, comments, and modal viewing.
- Uses the shared floating navigation pill.

### Profile

- User profile page for self and other users.
- Profile avatar, name, city, stats, posts, followers, and following.
- Create post workflow.
- Post gallery with lazy-loaded media.
- Delete own posts.
- Follow and unfollow other users.
- Settings menu.
- Edit profile is available under settings.
- Edit profile modal supports profile details and avatar update.

### Posts

- Create posts with uploaded media.
- Like and unlike posts.
- Comment on posts.
- Delete posts owned by the current user.
- View posts in a modal.
- Cloudinary-backed media upload through the backend.

### Chat

- Real-time one-to-one conversations.
- Group chat creation.
- Chat sidebar with search and unread states.
- Message sending with text and file attachments.
- Image, video, audio, PDF, document, spreadsheet, ZIP, and generic file metadata handling.
- Camera capture modal for photo/video attachments.
- Voice message recording.
- Emoji picker with theme-aware styling.
- Message editing.
- Message deletion.
- Message reactions.
- Message forwarding.
- Read receipts and unread message count.
- Typing indicators.
- Mobile layout switches between chat list and conversation view.
- Back button on mobile conversation screen.
- Navigation pill converges in chat and expands without shifting the chat layout.

### Calls

- Incoming call notification.
- Voice calls.
- Video calls.
- Direct and group call modes.
- WebRTC peer connections.
- Socket.IO signaling.
- Mute and unmute.
- Camera on/off.
- Flip camera.
- Screen share support.
- Add participants to calls.
- Call duration display.
- Connection quality indicator.
- Call history and call logging.
- Responsive video layout for mobile, tablet, and desktop.

### Communities

- Explore available communities.
- Create communities with avatar upload.
- Join and leave communities.
- View personal communities.
- Community room page.
- Send community messages.
- Upload images in community messages.
- Create and vote on community polls.
- Update community settings.
- Delete communities when permitted.

### Explore

- City-based explore route: `/explore/:city`.
- Weather information through OpenWeather.
- Local news through NewsAPI.
- Must-visit and heritage places using OpenStreetMap data.
- Curated fallback places for major cities when external APIs are unavailable.
- Events through PredictHQ where configured.
- Suggested fallback event data when no external events are available.
- Category filters for places.
- Search within places.
- Map modal with Leaflet and OpenStreetMap tiles.
- Google Maps direction links.

### Global Theme

- Light and dark theme managed in the auth context.
- Theme class applied globally on the document root.
- Shared UI classes for urban surfaces, cards, inputs, pills, and animated shells.
- Chat-specific light mode readability fixes.
- Theme toggle in the floating navigation pill and landing page.

### Responsive UI

- Desktop centered navigation pill.
- Mobile icon-first navigation pill.
- Chat-specific docked navigation logo behavior.
- Responsive chat list/detail layout.
- Responsive video call grid and controls.
- Responsive landing page, explore page, profile page, communities, modals, and core components.

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS 4
- Framer Motion
- React Router
- Socket.IO Client
- Axios
- Lucide React icons
- Emoji Picker React
- Leaflet and React Leaflet

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- Socket.IO
- JWT
- Cookie Parser
- CORS
- Multer
- Cloudinary
- Streamifier
- Express Rate Limit
- Axios

## Project Structure

```text
Urban-Loop/
  Backend/
    config/
      db.js
    controllers/
      authController.js
      chatController.js
      communityController.js
      exploreController.js
      messageController.js
      postController.js
      userController.js
    middleware/
      authMiddleware.js
      upload.js
    models/
      CallLog.js
      Chat.js
      Community.js
      Message.js
      Post.js
      User.js
    routes/
      authRoutes.js
      callRoutes.js
      chatRoutes.js
      communityRoutes.js
      exploreRoutes.js
      messageRoutes.js
      postRoutes.js
      userRoutes.js
    socket/
      socket.js
    server.js
    package.json
    .env.example

  Frontend/
    src/
      components/
      context/
      pages/
      services/
      socket.js
      App.jsx
      App.css
    vercel.json
    package.json
    .env.example
```

## Frontend Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | Login page |
| `/register` | Public | Register page |
| `/feed` | Protected | Main social feed |
| `/profile/:id` | Protected | User profile, including `/profile/me` |
| `/chat` | Protected | Chat inbox |
| `/chat/:userId` | Protected | Open or create a chat with a user |
| `/communities` | Protected | Community discovery and management |
| `/communities/:id` | Protected | Community room |
| `/explore/:city` | Protected | City news, weather, places, and events |

## Backend API Surface

All protected routes require the authentication cookie set by login.

### Auth

Base path: `/api/auth`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/register` | Register a user |
| `POST` | `/login` | Login and set auth cookie |
| `GET` | `/me` | Return current authenticated user |
| `POST` | `/logout` | Clear auth cookie |

### Users

Base path: `/api/users`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | List/search users |
| `GET` | `/me` | Get current user |
| `GET` | `/:id` | Get user profile |
| `PUT` | `/:id/follow` | Follow a user |
| `PUT` | `/:id/unfollow` | Unfollow a user |
| `PUT` | `/me` | Update current user profile and avatar |

### Posts

Base path: `/api/posts`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/` | Create a post with image upload |
| `GET` | `/` | Get posts |
| `GET` | `/feed` | Get feed posts |
| `DELETE` | `/:id` | Delete a post |
| `PUT` | `/like/:id` | Like or unlike a post |
| `POST` | `/comment/:id` | Add a comment |

### Chats

Base path: `/api/chat`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/create` | Get or create a one-to-one chat |
| `POST` | `/group` | Create a group chat |
| `GET` | `/` | Get current user's chats |
| `DELETE` | `/:chatId` | Delete a chat |

### Messages

Base path: `/api/messages`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/` | Send text or file message |
| `POST` | `/poll` | Send a chat poll |
| `POST` | `/forward` | Forward a message |
| `POST` | `/:messageId/vote` | Vote on a poll |
| `GET` | `/:chatId` | Get paginated chat messages |
| `GET` | `/unread/count` | Get unread message count |
| `PUT` | `/read/:chatId` | Mark messages as read |
| `PUT` | `/:messageId` | Edit a message |
| `DELETE` | `/:messageId` | Delete a message |
| `POST` | `/:messageId/react` | React to a message |

### Communities

Base path: `/api/community`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Explore communities |
| `GET` | `/mine` | Get communities joined/owned by current user |
| `GET` | `/:id` | Get a community |
| `POST` | `/` | Create a community with avatar |
| `POST` | `/:id/join` | Join a community |
| `POST` | `/:id/leave` | Leave a community |
| `POST` | `/:id/message` | Send community message |
| `POST` | `/:id/poll` | Create community poll |
| `POST` | `/:id/poll/:msgId/vote` | Vote on community poll |
| `PATCH` | `/:id/settings` | Update community settings |
| `DELETE` | `/:id` | Delete community |

### Calls

Base path: `/api/calls`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/ice-servers` | Get ICE server configuration |
| `GET` | `/history` | Get call history |
| `POST` | `/log` | Create call log |
| `PATCH` | `/log/:roomId/end` | End call log |
| `PATCH` | `/log/:roomId/participant` | Update participant call status |

### Explore

Base path: `/api/explore`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/:city` | Get weather, news, places, and events for a city |

## Realtime Socket Features

Socket.IO is used for all realtime behavior:

- User online presence.
- Online user broadcast.
- New message delivery.
- New message notification.
- Typing and stop typing events.
- Message read/seen events.
- Message edit/delete updates.
- Reaction updates.
- Poll updates.
- Chat deletion notifications.
- Call invitation.
- Call accept/reject flow.
- WebRTC signaling.
- Participant updates during calls.

The frontend socket URL is configured with `VITE_SOCKET_URL`.

## Environment Variables

### Backend

Create `Backend/.env` using `Backend/.env.example` as a template.

```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
CLIENT_ORIGINS=https://your-vercel-app.vercel.app
COOKIE_SAMESITE=None

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

OPENWEATHER_KEY=your_openweather_key
NEWSAPI_KEY=your_newsapi_key
PREDICTHQ_KEY=your_predicthq_key
```

Required for core app:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_ORIGINS`
- Cloudinary credentials if media upload is needed

Optional but recommended for Explore:

- `OPENWEATHER_KEY`
- `NEWSAPI_KEY`
- `PREDICTHQ_KEY`

### Frontend

Create `Frontend/.env` using `Frontend/.env.example` as a template.

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_SOCKET_URL=https://your-render-backend.onrender.com
```

For local development:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Pranavjha2004/Urban-Loop.git
cd Urban-Loop
```

### 2. Install backend dependencies

```bash
cd Backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../Frontend
npm install
```

### 4. Configure environment files

Create:

- `Backend/.env`
- `Frontend/.env`

Use the example files in each folder.

### 5. Start the backend

```bash
cd Backend
npm run dev
```

Default backend URL:

```text
http://localhost:5000
```

### 6. Start the frontend

```bash
cd Frontend
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

If Vite uses another port, add that port to backend `CLIENT_ORIGINS`.

## Production Deployment

### Backend on Render

Recommended Render service settings:

| Setting | Value |
| --- | --- |
| Root Directory | `Backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | Node |

Set backend environment variables in Render using `Backend/.env.example`.

Important:

- `CLIENT_ORIGINS` must include the deployed Vercel frontend URL.
- `COOKIE_SAMESITE=None` is recommended for cross-site Vercel-to-Render cookies.
- `NODE_ENV=production` should be set.
- Make sure the controller filename is `communityController.js` exactly. Linux deployments are case-sensitive.

### Frontend on Vercel

Recommended Vercel settings:

| Setting | Value |
| --- | --- |
| Root Directory | `Frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Set frontend environment variables in Vercel:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_SOCKET_URL=https://your-render-backend.onrender.com
```

The included `Frontend/vercel.json` handles SPA routing by rewriting all routes to `index.html`.

## Data Models

### User

Stores identity, authentication data, profile details, avatar, city, followers, and following relationships.

### Post

Stores uploaded media, captions/content, author, likes, comments, and timestamps.

### Chat

Stores one-to-one and group conversations, participants, group metadata, unread states, and chat relationships.

### Message

Stores chat messages, text, file metadata, reactions, read status, edit/delete state, polls, and sender references.

### Community

Stores community information, avatar, members, messages, polls, settings, ownership, and membership state.

### CallLog

Stores call history, room ID, participants, call type, duration, and call lifecycle state.

## UI and Theme System

The frontend uses a shared visual system in `Frontend/src/App.css`.

Key classes:

- `urban-shell`: page-level background and ambient visual treatment.
- `urban-surface`: glass-style surfaces and modal panels.
- `urban-card`: reusable cards.
- `urban-input`: shared form input styling.
- `urban-pill`: primary gradient action style.
- `floating-nav`: global navigation pill.
- `chat-page-shell`: chat-specific layout and light-mode readability.
- `call-stage`: call screen background.

The theme is stored in local storage and applied to the document root using `light` and `dark` classes.

## Known Operational Notes

- Render runs on Linux, so import paths and filenames must match case exactly.
- Real-time chat and calls require both users to be connected to the same deployed backend/socket server. Two separate localhost backends will not share realtime state.
- WebRTC calls may require TURN servers for some networks. The current API exposes ICE server configuration through `/api/calls/ice-servers`.
- For Vercel plus Render cookie auth, CORS and cookie settings must be correct:
  - Backend `CLIENT_ORIGINS` must contain the Vercel URL.
  - Frontend `VITE_API_URL` must point to the Render `/api` URL.
  - Axios must send credentials.
  - Production cookie SameSite should be `None` for cross-site deployment.

## Build Checks

Frontend production build:

```bash
cd Frontend
npm run build
```

Backend startup:

```bash
cd Backend
npm start
```

Community route import smoke test:

```bash
cd Backend
node -e "import('./routes/communityRoutes.js').then(()=>console.log('community route import ok')).catch((e)=>{console.error(e); process.exit(1)})"
```

## Credits

Developed with love by Pranav Jha.
