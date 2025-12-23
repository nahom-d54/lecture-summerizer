# Lecture Summarizer

A comprehensive AI-powered lecture summarizer application built with a modern monorepo architecture.

## Project Structure

```
lecture-summarizer/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript
└── package.json       # Monorepo root
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Getting Started

### Installation

```bash
# Install dependencies for all workspaces
npm install
```

### Development

```bash
# Run both frontend and backend in development mode
npm run dev

# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend
```



### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Building

```bash
# Build all workspaces
npm run build

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend
```

## Environment Variables

Copy `.env.example` files in both frontend and backend directories and configure them with your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS (ready to configure)

### Backend
- Node.js
- Express
- TypeScript
- Bull (job queue)
- Redis
- PostgreSQL (ready to configure)

### DevOps
- GitHub Actions CI/CD
- ESLint & Prettier

## License

MIT
