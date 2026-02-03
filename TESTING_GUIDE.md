# Testing Guide for Faucet Simulator

This document provides comprehensive instructions for testing all systems in the faucet simulator platform.

## Pre-requisites

- Node.js 16 or higher
- npm or yarn
- A modern web browser

## Getting Started

1. Clone and install the project:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Start the development server:
```bash
npm run dev
```

4. Access the application at `http://localhost:3000`

## Test Plan

### 1. User Authentication System

**Test Registration:**
- Navigate to `/register`
- Fill in valid credentials (username, email, password)
- Verify account creation
- Check for proper validation (password requirements, duplicate emails)

**Test Login:**
- Navigate to `/login`
- Use valid credentials
- Verify successful login and redirection to dashboard
- Test with invalid credentials and verify proper error handling

**Test Logout:**
- Click logout button
- Verify session termination
- Try accessing protected routes without authentication

### 2. Dashboard System

**Test Dashboard Loading:**
- Access `/dashboard` after login
- Verify user profile information displays correctly
- Check that balance information is accurate
- Confirm mining statistics appear

### 3. Faucet System

**Test Faucet Claiming:**
- Navigate to `/faucet`
- Verify faucet is available (ready to claim)
- Click "Claim Faucet" button
- Confirm reward is added to balance
- Try claiming again immediately (should fail with time restriction)
- Note: For testing, faucet interval is set to 1 hour by default

### 4. PTC (Paid To Click) System

**Test PTC Functionality:**
- Navigate to `/ptc`
- View an available ad
- Click the "View Ad" button
- Verify reward is added to balance
- Test rate limiting (try clicking multiple times quickly)

### 5. Shortlinks System

**Test Shortlinks Creation:**
- Navigate to `/shortlinks`
- Enter a valid URL in the "Create New Shortlink" form
- Verify shortlink is created successfully
- Copy and visit the created shortlink
- Confirm reward is added to balance

### 6. Virtual Mining System

**Test Mining Actions:**
- Navigate to `/mining`
- Verify current mining pool information
- Click "Mine" button to contribute hashpower
- Confirm energy points decrease
- Check that contribution is recorded in the pool
- Test mining upgrade functionality

### 7. Economy System

**Test Token Conversion:**
- Navigate to `/economy`
- Verify balance display
- Try converting internal tokens to bound tokens
- Verify the conversion happens correctly
- Try converting bound tokens back to internal tokens

### 8. Progression System

**Test Level and XP:**
- Navigate to `/progression`
- Verify current level and XP
- Check level progress bar
- Review leaderboard
- Confirm XP is earned from various activities

### 9. Withdrawal System

**Test Withdrawal Process:**
- Navigate to `/withdraw`
- Verify bound token balance
- Enter withdrawal details (amount, cryptocurrency, address)
- Submit withdrawal request
- Verify withdrawal appears in history with "pending" status

### 10. Offerwalls Integration

**Test Offerwalls:**
- Navigate to `/offerwalls`
- Verify available offers are displayed
- Check offer details and rewards
- Review recent completion history

### 11. Security Measures

**Test Rate Limiting:**
- Try claiming faucet multiple times in quick succession
- Attempt to click PTC ads too frequently
- Verify rate limits are enforced

**Test Suspicious Activity Detection:**
- Perform rapid successive actions
- Verify suspicious activities are logged

### 12. Real-time Updates

**Test Live Balance Updates:**
- Perform an earning action on one tab
- Observe balance changes reflected in real-time on another tab
- Verify "Last Updated" timestamp refreshes

## Expected Behaviors

### Authentication
- Registration requires valid email and strong password
- Login persists session via JWT tokens
- Protected routes redirect unauthenticated users

### Earning Methods
- Faucet: 0.01 tokens every hour
- PTC: 0.005 tokens per valid click
- Shortlinks: 0.002 tokens per visit
- Mining: Variable rewards based on pool participation
- Offerwalls: Variable rewards from partner networks

### Economy
- Internal tokens earned through activities
- Convert internal to bound tokens at 1:1 ratio
- Bound tokens used for withdrawals
- Withdrawal fees of 2% applied

### Security
- Rate limits prevent automation
- Suspicious activity detection
- Account reputation scoring
- Input validation on all forms

## Troubleshooting

**Common Issues:**
- If database migrations fail, try `npx prisma migrate reset`
- If authentication fails, clear browser storage and retry
- If real-time updates don't work, check browser console for errors

**Error Messages:**
- "Rate limit exceeded" - Wait before trying again
- "Insufficient balance" - Earn more tokens first
- "Invalid address" - Check cryptocurrency address format
- "Session expired" - Log in again

## Success Criteria

All systems should pass these tests:
- ✅ User can register and login
- ✅ All earning methods work correctly
- ✅ Balances update accurately
- ✅ Token conversion works
- ✅ Withdrawal requests are processed
- ✅ Security measures prevent abuse
- ✅ Real-time updates function
- ✅ All UI components render properly
- ✅ Error handling works appropriately

## Performance Testing

- Test concurrent users accessing the system
- Verify database performance under load
- Check that real-time updates scale appropriately
- Monitor memory usage during extended operation

## Security Testing

- Test for SQL injection (should be prevented by Prisma)
- Verify rate limiting effectiveness
- Test for session hijacking possibilities
- Confirm input sanitization works