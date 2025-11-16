# MoviePlix Backend API

Node.js backend server for the MoviePlix OTT platform.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/movieplix
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

4. **Run the Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user (Protected)

### Health Check

- `GET /api/health` - Server health check

## Frontend Configuration

Update your frontend `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

