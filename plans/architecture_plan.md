# Faucet Simulator Architecture Plan - Clon de SimpleBits.io

## 1. Project Overview

This project implements a faucet simulator platform similar to SimpleBits.io with multiple earning mechanisms, virtual mining, and cryptocurrency withdrawals.

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 16 (already initialized)
- **UI Library**: Tailwind CSS (already installed)
- **State Management**: Zustand or Redux Toolkit
- **Icons**: Lucide React or Heroicons
- **Charts**: Recharts for mining statistics

### Backend
- **Runtime**: Node.js with Express/Fastify
- **Database**: PostgreSQL for persistence
- **Cache**: Redis for session management and rate limiting
- **Authentication**: JWT tokens
- **Real-time**: Socket.io for live updates

### Blockchain Integration
- **Library**: Ethers.js or Web3.js
- **Providers**: Infura/Alchemy for network access

## 3. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  token_balance DECIMAL(20, 8) DEFAULT 0,
  bound_token_balance DECIMAL(20, 8) DEFAULT 0,
  last_faucet_claim TIMESTAMP,
  hashpower_virtual DECIMAL(20, 8) DEFAULT 0,
  energy_points INTEGER DEFAULT 100,
  energy_regen_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Activities Log Table
```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL, -- faucet, ptc, offerwall, mining, withdrawal
  amount_tokens DECIMAL(20, 8),
  amount_bound_tokens DECIMAL(20, 8),
  metadata JSONB, -- Additional data specific to activity
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Mining Pools Table
```sql
CREATE TABLE mining_pools (
  id SERIAL PRIMARY KEY,
  pool_identifier VARCHAR(100) UNIQUE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  total_rewards DECIMAL(20, 8) NOT NULL,
  total_hashpower DECIMAL(20, 8) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Pool Contributions Table
```sql
CREATE TABLE mining_pool_contributions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  pool_id INTEGER REFERENCES mining_pools(id),
  contributed_hashpower DECIMAL(20, 8) NOT NULL,
  reward_share DECIMAL(20, 8),
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Withdrawals Table
```sql
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(20, 8) NOT NULL,
  crypto_currency VARCHAR(10) NOT NULL, -- BTC, LTC, DOGE, ADA, BCH, DASH
  address VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  transaction_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
```

## 4. Core Components Breakdown

### 4.1 User Authentication System
- Registration with username/email/password
- Login/logout functionality
- Password hashing with bcrypt
- JWT token generation and validation
- Session management

### 4.2 Faucet System
- Claim tokens every X minutes (configurable)
- Anti-bot measures (timing, CAPTCHA)
- Rate limiting per IP/user
- Progressive rewards based on level/activity

### 4.3 PTC (Paid To Click) System
- Ad display system
- Tracking click validity
- Reward distribution
- Publisher system for adding ads

### 4.4 Shortlinks System
- URL shortening service
- Tracking clicks and rewards
- Integration with external shortlink services

### 4.5 Virtual Mining Engine
- Simulated mining algorithm
- Pool-based mining (8-hour cycles)
- Hashpower calculation based on user upgrades
- Reward distribution proportional to contribution

### 4.6 Progression System
- XP accumulation from activities
- Level progression with milestones
- Achievement system
- Leaderboards

### 4.7 Economy System
- Internal token management
- Conversion to bound tokens
- Exchange rates and fees
- Transaction history

### 4.8 Withdrawal System
- Crypto wallet integration
- Multiple currency support (BTC, LTC, DOGE, etc.)
- Transaction processing queue
- Security verification

## 5. Implementation Phases

### Phase 1: Foundation
1. Set up database schema
2. Implement user authentication
3. Create basic dashboard
4. Implement token balance system

### Phase 2: Core Features
1. Build faucet functionality
2. Implement PTC system
3. Create shortlinks feature
4. Basic mining simulation

### Phase 3: Advanced Features
1. Progression system with levels
2. Virtual mining pools
3. Economy conversion system
4. Offerwalls integration

### Phase 4: Withdrawal & Security
1. Cryptocurrency withdrawal system
2. Anti-fraud measures
3. Security enhancements
4. Performance optimization

### Phase 5: Polish & Deployment
1. UI/UX improvements
2. Testing and bug fixes
3. Production deployment
4. Monitoring setup

## 6. Security Considerations

### Anti-Fraud Measures
- Rate limiting per IP and account
- CAPTCHA for sensitive operations
- Activity pattern analysis
- Suspicious behavior detection

### Data Protection
- Password encryption
- Secure token handling
- Input validation and sanitization
- SQL injection prevention

### Financial Security
- Withdrawal limits
- Multi-signature support for large transactions
- Transaction monitoring
- Audit trails

## 7. Real-time Updates

### WebSocket Implementation
- Live balance updates
- Mining pool status
- Notification system
- Chat functionality (optional)

## 8. Deployment Architecture

### Infrastructure
- Load balancer
- Application servers (auto-scaling)
- Database cluster
- Redis cluster
- CDN for static assets

### Monitoring
- Performance metrics
- Error tracking
- User activity analytics
- Financial transaction monitoring