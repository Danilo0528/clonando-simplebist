
# Blueprint: SimpleBits Clone Reconstruction

## Overview

This document outlines the reconstruction plan for the SimpleBits clone application after an accidental discard of 17 changes. The primary goal is to restore the compact, visually appealing, and efficient UI components that were developed.

The reconstruction will be based on the descriptions found in the `test_verification.js` file.

## Core Application Features (Recovered from `README.md`)

- **Authentication:** User registration, login, and logout.
- **User Data:** Profile and balance management.
- **Earning Methods:** Faucet, PTC, Shortlinks, Mining, Offerwalls.
- **Economy:** Token conversion and stats.
- **Withdrawals:** Requesting withdrawals.
- **Progression:** User level and XP tracking.
- **Security:** Rate limiting and activity detection.

## Reconstruction Plan: Phase 1 (Compact UI)

This phase focuses on rebuilding the lost UI components and re-integrating them into their respective pages.

### Step 1: Recreate `DashboardCompact` Component
- **File:** `components/dashboard/DashboardCompact.js`
- **Description:** A compact and visually attractive dashboard.
- **Features:**
    - Combine multiple views into a single screen.
    - Display key stats in highlighted cards (e.g., balance, energy, level).
    - Include a section for the Faucet.
    - Include a section for active mining.
    - Include a section for recent user activity.

### Step 2: Recreate `MiningCompact` Component
- **File:** `components/mining/MiningCompact.js`
- **Description:** A more compact and efficient mining view.
- **Features:**
    - Display mining statistics in highlighted cards.
    - Show a list of available mining blocks in an optimized format.
    - Include direct action buttons to join mining blocks.

### Step 3: Recreate `ProgressionCompact` Component
- **File:** `components/progression/ProgressionCompact.js`
- **Description:** A more visual and compact level progression view.
- **Features:**
    - Display level statistics in highlighted cards.
    - Implement an improved XP progress bar.
    - Show an optimized leaderboard (Top 5).
    - Provide information on level benefits and the next rank.

### Step 4: Update Pages to Use New Components
- **Target Pages:**
    - `app/(main)/dashboard/page.js` will be updated to use `<DashboardCompact />`.
    - `app/(main)/mining/page.js` will be updated to use `<MiningCompact />`.
    - `app/(main)/progression/page.js` will be updated to use `<ProgressionCompact />`.

