# Travelah FYP

Full-stack travel planning application built with **React** (Vite) and **Node.js** (Express).

## Project structure

```
Travelah_FYP/
├── client/          # React frontend (Vite)
├── server/          # Node.js API (Express)
└── package.json     # Root scripts to run both
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm

## Setup

Install all dependencies (root, client, and server):

```bash
npm run install:all
```

Copy the server environment file (optional):

```bash
copy server\.env.example server\.env
```

## Run development

Start both frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:server   # API at http://localhost:5000
npm run dev:client   # App at http://localhost:3000
```

## API endpoints

| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | `/api/health`       | Health check             |
| GET    | `/api/destinations` | Sample destination list  |

## Build for production

```bash
npm run build
```

The built frontend will be in `client/dist/`.
