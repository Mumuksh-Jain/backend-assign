# Scalable REST API with Auth & RBAC

A MERN stack project with JWT authentication, role-based authorization, and task management APIs.

## Tech Stack
- Node.js
- Express
- MongoDB
- React.js
- JWT
- bcrypt

## Project Structure
- `server/` - Express API, auth, RBAC, MongoDB models, middleware
- `client/` - React frontend (auth pages + dashboard)

## Setup
1. Clone the repository.
2. Install backend dependencies:
   - `cd server`
   - `npm install`
3. Create environment file:
   - Copy `.env.example` to `.env`
4. Install frontend dependencies:
   - `cd ../client`
   - `npm install`
5. Run both apps in separate terminals:
   - Terminal 1 (backend): `cd server && npm run dev`
   - Terminal 2 (frontend): `cd client && npm run dev`

## Environment Variables (`.env.example`)
```env
PORT=3000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
NODE_ENV=development
```

## API Routes
Base URL: `http://localhost:3000/api/v1`

| Method | Path | Auth Required | Role Required | Description |
|---|---|---|---|---|
| POST | `/auth/register` | No | None | Register a new user and return JWT |
| POST | `/auth/login` | No | None | Login user and return JWT |
| POST | `/auth/logout` | Yes | Any authenticated user | Logout user |
| GET | `/tasks` | Yes | Any authenticated user | Get tasks (admin: all, user: own tasks) |
| POST | `/tasks` | Yes | Any authenticated user | Create a new task |
| GET | `/tasks/:id` | Yes | Any authenticated user | View a single task |
| PUT | `/tasks/:id` | Yes | Any authenticated user (owner/admin logic in controller) | Update a task |
| DELETE | `/tasks/:id` | Yes | Admin | Delete a task |

## Security
- JWT authentication using Bearer token and httpOnly cookie support
- Password hashing with `bcrypt`
- Request validation and sanitization using `express-validator`
- RBAC via `adminOnly` middleware for protected actions

## Scalability
- **Modular MVC**: each feature isolated, new modules plug in fast
- **Docker**: containerize server + client for consistent deploys
- **Redis**: cache `GET /tasks` to reduce DB hits under load
- **Load balancer**: Nginx routes across multiple Node instances
- **Microservices**: auth and tasks can split into separate services
- **MongoDB Atlas**: managed horizontal scaling for DB layer
