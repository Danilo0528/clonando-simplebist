# Phase 1: Foundation Implementation Specification

## Overview
Phase 1 focuses on establishing the core infrastructure for the faucet simulator. This includes setting up the database schema, implementing user authentication, creating the basic dashboard, and establishing the token balance system.

## 1. Database Setup

### 1.1 Install Dependencies
- PostgreSQL client library
- Prisma ORM (for database operations)
- Redis client (for caching/session management)

### 1.2 Initialize Database Schema
Create the following tables:

#### Users table
- id (SERIAL, PRIMARY KEY)
- username (VARCHAR(50), UNIQUE, NOT NULL)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password_hash (TEXT, NOT NULL)
- level (INTEGER, DEFAULT 1)
- xp (INTEGER, DEFAULT 0)
- token_balance (DECIMAL(20, 8), DEFAULT 0)
- bound_token_balance (DECIMAL(20, 8), DEFAULT 0)
- last_faucet_claim (TIMESTAMP)
- hashpower_virtual (DECIMAL(20, 8), DEFAULT 0)
- energy_points (INTEGER, DEFAULT 100)
- energy_regen_timestamp (TIMESTAMP, DEFAULT NOW())
- created_at (TIMESTAMP, DEFAULT NOW())
- updated_at (TIMESTAMP, DEFAULT NOW())

#### ActivityLogs table
- id (SERIAL, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY to Users.id)
- activity_type (VARCHAR(50), NOT NULL) - values: 'faucet', 'ptc', 'offerwall', 'mining', 'withdrawal'
- amount_tokens (DECIMAL(20, 8))
- amount_bound_tokens (DECIMAL(20, 8))
- metadata (JSONB) - Additional data specific to activity
- created_at (TIMESTAMP, DEFAULT NOW())

## 2. User Authentication System

### 2.1 Registration Endpoint
- Route: POST `/api/auth/register`
- Input validation:
  - Username (3-50 chars, alphanumeric + underscore)
  - Email (valid email format)
  - Password (minimum 8 chars, complexity requirements)
- Password hashing using bcrypt
- Create new user record
- Return success/error response

### 2.2 Login Endpoint
- Route: POST `/api/auth/login`
- Validate credentials against stored hash
- Generate JWT token
- Return token and user profile

### 2.3 Logout Endpoint
- Route: POST `/api/auth/logout`
- Invalidate current session/token

### 2.4 Middleware
- JWT verification middleware
- User session validation

## 3. Basic Dashboard

### 3.1 Dashboard Page Structure
- User profile section
- Token balances display (internal tokens, bound tokens)
- Recent activity feed
- Navigation to other sections

### 3.2 Balance Display Components
- Current token balance
- Current bound token balance
- Level and XP progress bar
- Energy points indicator

## 4. Token Balance System

### 4.1 Token Operations API
- GET `/api/user/balance` - Get current balances
- POST `/api/user/transfer` - Transfer between token types (internal to bound)

### 4.2 Balance Updates
- Functions to credit/debit tokens
- Transaction logging
- Validation checks

## 5. Implementation Steps

### Step 1: Environment Setup
1. Install required dependencies
2. Set up database connection
3. Configure environment variables

### Step 2: Database Models
1. Define Prisma schema
2. Generate Prisma client
3. Run migrations

### Step 3: Authentication API
1. Create auth API routes
2. Implement registration logic
3. Implement login logic
4. Create middleware

### Step 4: Dashboard Components
1. Create dashboard layout
2. Implement balance display
3. Add recent activity component

### Step 5: Token System
1. Create token operation utilities
2. Implement balance retrieval API
3. Add transaction logging

## 6. Security Considerations
- Password strength requirements
- Rate limiting for auth endpoints
- Secure JWT configuration
- Input validation and sanitization

## 7. Testing Requirements
- Unit tests for authentication functions
- Integration tests for API endpoints
- Database operation tests
- Security validation tests