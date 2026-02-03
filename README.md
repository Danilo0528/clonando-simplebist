# Faucet Simulator - Clone de SimpleBits.io

This is a comprehensive faucet simulator platform that replicates the functionality of SimpleBits.io, featuring multiple earning methods, virtual mining, and cryptocurrency withdrawals.

## Features

- **User Authentication**: Complete registration, login, and session management
- **Faucet System**: Hourly token claims with timing restrictions
- **PTC (Paid To Click)**: Advertisement viewing system with rewards
- **Shortlinks**: URL shortening and visiting for rewards
- **Virtual Mining**: Pool-based mining simulation with hashpower mechanics
- **Progression System**: Levels, experience points, and leaderboards
- **Economy System**: Internal tokens convertible to bound tokens
- **Withdrawal System**: Bound token withdrawals as cryptocurrency
- **Security Measures**: Rate limiting, fraud detection, and account protection
- **Offerwalls Integration**: Partner network integration for additional earnings
- **Real-time Updates**: Server-Sent Events for live balance updates

## Technology Stack

- **Frontend**: Next.js 16 with React
- **Backend**: Node.js with Next.js API routes
- **Database**: PostgreSQL (with SQLite for development)
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS
- **Real-time**: Server-Sent Events (SSE)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clonando-simplebist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` and configure your database URL and JWT secret.

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
├── app/                    # Next.js 16 App Router pages
│   ├── dashboard/         # User dashboard
│   ├── faucet/           # Faucet claiming page
│   ├── ptc/              # PTC ads page
│   ├── shortlinks/       # Shortlinks page
│   ├── mining/           # Mining simulation page
│   ├── progression/      # Level and XP page
│   ├── economy/          # Token conversion page
│   ├── withdraw/         # Withdrawal page
│   ├── offerwalls/       # Offerwalls page
│   ├── security/         # Security information page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── page.js          # Landing page
│   └── layout.js        # Global layout
├── pages/                # Next.js API routes
├── lib/                  # Business logic libraries
│   ├── auth.js          # Authentication utilities
│   ├── economy.js       # Economy system
│   ├── faucet.js        # Faucet functionality
│   ├── mining.js        # Mining simulation
│   ├── progression.js   # Level and XP system
│   ├── ptc.js           # PTC functionality
│   ├── shortlinks.js    # Shortlinks functionality
│   ├── withdrawal.js    # Withdrawal system
│   ├── security.js      # Security utilities
│   ├── offerwalls.js    # Offerwalls integration
│   ├── blockchain.js    # Blockchain connector
│   ├── realtime.js      # Real-time updates
│   └── websocket.js     # WebSocket service
├── prisma/               # Database schema and migrations
├── plans/                # Architecture and planning documents
└── README.md
```

## Environment Variables

- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., '24h')
- `BASE_URL`: Base URL of the application

## Key Components

### 1. User System
- Complete authentication with register/login
- Password hashing with bcrypt
- JWT-based session management
- Account security with rate limiting

### 2. Earning Methods
- **Faucet**: Claim tokens every hour
- **PTC**: Earn by viewing advertisements
- **Shortlinks**: Visit shortened URLs for rewards
- **Mining**: Virtual mining with pool participation
- **Offerwalls**: Complete offers from partner networks

### 3. Economy
- Two-token system: Internal tokens and Bound tokens
- Conversion between token types
- Virtual mining rewards
- Withdrawal-ready bound tokens

### 4. Progression
- Level system based on experience points
- XP gained from various activities
- Leaderboards and rankings
- Level-based rewards and features

### 5. Security
- Rate limiting for all earning methods
- Suspicious activity detection
- Account reputation system
- Input validation and sanitization

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Data
- `GET /api/user/profile` - Get user profile
- `GET /api/user/balances` - Get user balances

### Earning Methods
- `GET/POST /api/faucet/claim` - Faucet claiming
- `GET/POST /api/ptc/ad` - PTC ads
- `GET/POST /api/shortlinks` - Shortlinks management
- `GET/POST /api/mining/action` - Mining actions
- `GET/POST /api/offerwalls` - Offerwalls

### Economy
- `POST /api/economy/convert` - Token conversion
- `GET /api/economy/stats` - Economy statistics

### Withdrawals
- `GET/POST /api/withdrawal/request` - Withdrawal requests

### Progression
- `GET /api/progression` - User progression data

## Testing

To test the system:

1. Register a new account
2. Navigate through different earning methods:
   - Claim faucet every hour (use small intervals for testing)
   - View PTC ads
   - Create and visit shortlinks
   - Participate in mining
   - Complete offerwalls
3. Check your balance updates
4. Convert internal tokens to bound tokens
5. Request withdrawals

## Security Features

- Rate limiting prevents automation
- Suspicious activity detection
- Account reputation scoring
- Input validation and sanitization
- Secure password handling
- JWT token security

## Deployment

For production deployment:

1. Set up a production database
2. Configure environment variables for production
3. Build the application:
```bash
npm run build
```
4. Start the production server:
```bash
npm start
```

## License

This project is licensed under the MIT License.
