# Lecture Summarizer - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 2. Environment Setup

Create environment files from examples:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edit the `.env` files with your actual values.
- For `backend/.env`, use the Neon Database URL provided by the team lead.

### 2.1 Setup Database

Update the database schema and generate the client:

```bash
cd backend
npx prisma generate
npx prisma db push
cd ..
```

### 3. Start Development



### 3. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

## Project Structure

```
lecture-summarizer/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       ├── ci.yml          # Main CI pipeline
│       ├── codeql.yml      # Security scanning
│       └── dependency-review.yml
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── logger.ts   # Winston logger
│   │   │   └── redis.ts    # Redis connection
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   │   └── errorHandler.ts
│   │   ├── models/         # Data models
│   │   ├── queues/         # Bull queue processors
│   │   │   ├── index.ts    # Queue setup
│   │   │   ├── emailProcessor.ts
│   │   │   └── aiProcessor.ts
│   │   ├── routes/         # API routes
│   │   │   ├── index.ts
│   │   │   └── queue.routes.ts
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│   ├── Dockerfile          # Production build
│   ├── Dockerfile.dev      # Development build
│   ├── .env.example        # Environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   │   └── Home.tsx
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── test/           # Test utilities
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/             # Static assets
│   ├── Dockerfile          # Production build
│   ├── Dockerfile.dev      # Development build
│   ├── nginx.conf          # Nginx configuration
│   ├── .env.example        # Environment template
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── tailwind.config.js
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
├── package.json            # Root workspace config
├── .prettierrc             # Prettier config
└── README.md
```

## Available Scripts

### Root Level

```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both workspaces
npm run lint             # Lint all workspaces
npm run lint:fix         # Fix linting issues
npm run format           # Format all code
npm run format:check     # Check formatting
npm run test             # Run all tests

```

### Backend

```bash
cd backend
npm run dev              # Start development server
npm run build            # Build TypeScript
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Frontend

```bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm test                 # Run Vitest tests
npm run test:ui          # Run tests with UI
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript

- **Logging**: Winston
- **Testing**: Jest
- **Linting**: ESLint + Prettier

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

### DevOps
- **CI/CD**: GitHub Actions
- **Security**: CodeQL + Dependency Review

## Development Workflow

### 1. Create a New Feature

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Lint and format
npm run lint:fix
npm run format

# Run tests
npm test

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Add New API Endpoint

1. Create route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Add service logic in `backend/src/services/`
4. Update route index file
5. Add tests

### 3. Add New React Component

1. Create component in `frontend/src/components/`
2. Use path aliases: `@components/YourComponent`
3. Add tests in same directory
4. Export from index file if needed



## Deployment to Vercel

The easiest way to deploy is using the [Vercel CLI](https://vercel.com/docs/cli).

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```



## Environment Variables

### Backend Required Variables

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@host-url/dbname?sslmode=require"
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
```

### Frontend Required Variables

```env
VITE_API_URL=http://localhost:5000
```

## Troubleshooting



### Port Already in Use

```bash
# Find process using port 5000 (backend)
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Module Resolution Issues

```bash
# Clear all node_modules and reinstall
npm run clean
npm install
```



## Testing

### Run All Tests

```bash
npm test
```

### Run Backend Tests

```bash
cd backend
npm test

# With coverage
npm run test:coverage
```

### Run Frontend Tests

```bash
cd frontend
npm test

# With UI
npm run test:ui
```

## CI/CD

The project includes GitHub Actions workflows:

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Linting and formatting checks
  - Backend tests
  - Frontend tests
  - Docker image builds (on main branch)

- **CodeQL Analysis** (`.github/workflows/codeql.yml`):
  - Security scanning
  - Runs weekly and on PRs

- **Dependency Review** (`.github/workflows/dependency-review.yml`):
  - Checks for vulnerable dependencies in PRs

## Next Steps

1. **Configure Database**: Add PostgreSQL/MongoDB connection
2. **Add Authentication**: Implement JWT auth middleware
3. **Integrate AI/LLM**: Connect to OpenAI/Anthropic APIs
4. **Add Real-time**: Implement WebSocket for chat
5. **Add Monitoring**: Set up logging and monitoring (Sentry, etc.)
6. **Deploy**: Set up production deployment (AWS, Azure, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT
