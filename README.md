# CryptoInvest - React + Vite

A crypto investment platform with tiered investment plans built with React, TypeScript, and Vite.

## Features

- **Landing Page** with hero section and tier cards (Silver, Gold, Platinum)
- **Investment Tiers** with different APR rates and minimum investments
- **Live Crypto Chart** showing BTC/ETH/USDT prices with mock data
- **User Dashboard** with portfolio overview and transaction history
- **Investment Modal** for creating new investments
- **Returns Estimator** to calculate potential earnings
- **Authentication** pages (Login/Signup) with mock functionality
- **Admin Panel** placeholder for user management
- **Responsive Design** that works on desktop and mobile

## Investment Tiers

- **Silver**: Min $1,000 - 6% APR
- **Gold**: Min $5,000 - 8% APR
- **Platinum**: Min $10,000 - 10% APR

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query + React Context
- **Charts**: Custom HTML5 Canvas implementation
- **Backend**: Express.js with in-memory storage (for demo)
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to:

```
http://localhost:5000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking with TypeScript

## Project Structure

```
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configs
├── server/                 # Express backend
├── shared/                 # Shared types and schemas
└── attached_assets/        # Static assets and images
```

## Key Pages

- `/` - Landing page with tier cards and preview chart
- `/login` - User login (mock)
- `/signup` - User registration (mock)
- `/dashboard` - User dashboard with portfolio and charts
- `/admin` - Admin panel (placeholder)

## Mock Data

The application uses mock data for:

- User authentication (any email/password works)
- Investment portfolio data
- Transaction history
- Crypto price charts

## Development Notes

- The backend uses in-memory storage (no database required)
- All authentication is mocked for demo purposes
- Crypto charts use randomly generated price data
- Investment calculations use real APR formulas
- Responsive design works on mobile and desktop

## Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## License

MIT License
