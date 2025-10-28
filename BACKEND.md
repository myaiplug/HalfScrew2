# HalfScrew Backend Setup

This document describes how to set up and run the backend server for email collection.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Server

Start the backend server:
```bash
npm run server
```

The server will start on `http://localhost:3000` by default.

## Environment Variables

You can customize the port by setting the `PORT` environment variable:
```bash
PORT=8080 npm run server
```

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Save Email
- **POST** `/api/save-email`
- Body: `{ "email": "user@example.com" }`
- Saves user email to database

### Get All Users
- **GET** `/api/users`
- Returns list of all registered users (for admin purposes)

## Database

The application uses SQLite for storing user emails. The database file is located at:
```
data/users.db
```

The database is automatically created when the server starts for the first time.

## Development

For development, you can run both the frontend and backend:

1. Terminal 1 - Frontend:
```bash
npm start
```

2. Terminal 2 - Backend:
```bash
npm run server
```

Then open `http://localhost:3000` in your browser.

## Production Deployment

For production deployment:

1. Update the frontend API URL in `script.js` from `http://localhost:3000` to your production API URL
2. Set up proper CORS configuration in `server.js`
3. Consider using a process manager like PM2 to keep the server running
4. Set up proper database backups for the SQLite database

## Security Notes

- Email validation is performed on the backend
- Duplicate emails are handled gracefully
- CORS is enabled for local development (update for production)
- Consider adding rate limiting for production use
