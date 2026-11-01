# MERN Student Management System

MongoDB + Express + React + Node. The React app is built into `client/dist` and served by the Express server,
so the whole project runs as one web service.

## Run locally
Needs NodeJS 18+ and MongoDB (local `mongod` or a free MongoDB Atlas cluster).
```
npm install
cp .env.example .env        # then put your MongoDB connection string in MONGODB_URI
npm run build               # installs and builds the React client
npm start                   # http://localhost:5000
```
Development with hot reload: run `npm run dev` (server) and `npm --prefix client run dev` (React on 5173, proxies /api).

Tests (need a running MongoDB, they use a separate `student_test` database):
```
npm test
# or: MONGODB_URI_TEST=mongodb+srv://... npm test
```

## Environment variables (never commit the real values)
- `MONGODB_URI` : MongoDB connection string (required)
- `PORT` : port, set automatically by Render

## API
- `GET /api/students` : list. Query: `search`, `branch`, `year`, `sort` (name, cgpa, year, createdAt, rollNo; add `-` for descending), `page`, `limit`
- `GET /api/students/stats/branches` : aggregation, students and average CGPA per branch
- `GET /api/students/:id`, `POST /api/students`, `PUT /api/students/:id`, `DELETE /api/students/:id`
- `GET /api/health`
- Errors are JSON: `{ "success": false, "message": "...", "errors": { "field": "..." } }`. Status codes: 200, 201, 400, 404, 409, 413, 500.

## Deploy (MongoDB Atlas + Render)
1. Atlas: create a free M0 cluster, a database user, and under Network Access allow `0.0.0.0/0` (Render has no fixed IP).
   Copy the connection string and put your database name in it (for example `/studentdb`).
2. Render: New Web Service from the GitHub repo. Build command `npm install && npm run build`, start command `npm start`.
3. Environment: add `MONGODB_URI` with the Atlas string. Do not put it in the code or the repo.
