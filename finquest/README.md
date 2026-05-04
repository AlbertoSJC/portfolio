# FinQuest - Gamified Personal Finance Adventure

Transform your financial goals into an exciting adventure! FinQuest gamifies personal finance by letting you embark on quests, complete challenges, and unlock achievements while managing your money.

## Setup

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

Following hexagonal architecture:

- **src/app/** - Next.js app directory with file-based routing
- **src/components/** - React UI components organized by feature
- **src/domain/** - Core business logic and domain models
- **src/services/** - API and external service integrations
- **src/stores/** - Zustand state management
- **src/types/** - TypeScript type definitions
- **src/utils/** - Utility functions
- **tests/** - Test files

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checker

## Features

- **Quest System**: Create and track financial goals as quests
- **Progress Dashboard**: Visualize financial growth with charts and animations
- **Achievement Badges**: Unlock rewards for milestones
- **Learning Modules**: Bite-sized financial education
