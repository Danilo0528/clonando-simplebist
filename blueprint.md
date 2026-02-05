# Project Blueprint

## Overview

This document outlines the architecture, features, and development plan for the Next.js application. The application is a "crypto faucet" and "get-paid-to" platform where users can earn cryptocurrency by completing tasks.

## Implemented Features

### Design and Style

*   **Layout:** The application uses a main layout with a sidebar and a top bar for navigation.
*   **Theme:** The application has a dark theme with a color palette centered around dark grays, cyans, yellows, greens, and purples.
*   **Components:** The application is built with reusable components for different UI elements like banners, cards, and navigation.
*   **Breadcrumb Navigation:** A breadcrumb component has been added to the top bar to improve navigation and provide users with a clear understanding of their location within the application.

### Core Features

*   **Dashboard:** The main dashboard displays a welcome message, quick actions, a live feed of activities, and featured offerwalls.
*   **Dynamic Data:** The dashboard now displays dynamic data for the welcome banner, the live feed, and featured offerwalls.
*   **User Authentication:**
    *   The application has a robust, cookie-based authentication system.
    *   Login and logout functionality is implemented, using `js-cookie` to manage JWT tokens.
    *   An API endpoint at `/api/auth/login` handles user authentication and token generation.
    *   The token expiration has been increased to 24 hours.
*   **Daily Rewards:** A daily reward system to encourage user engagement. Users can claim a reward every 24 hours.
*   **Dynamic Offerwalls Page:** A dedicated page that dynamically loads and displays a variety of offerwall providers and the user's completion history.
*   **Dynamic Wallet Page:** A comprehensive wallet page that shows the user's balance, transaction history, and withdrawal options.
*   **Withdrawal Functionality:** A complete, user-friendly withdrawal system that allows users to transfer their earnings.
*   **Crypto Faucet:** A feature allowing users to claim free currency at regular intervals to drive engagement.

## Crypto Faucet (Completed)

This plan focused on implementing a core feature for user retention: a crypto faucet that rewards users with a small amount of currency at regular intervals.

### Steps Taken:

1.  **Created the Faucet Page and UI:**
    *   A new route was established at `app/(main)/faucet/page.js`.
    *   The primary UI component was built at `components/faucet/Faucet.js`, featuring a modern card design, a clear reward display, a countdown timer, and a dynamic claim button.

2.  **Built the Faucet API Endpoint:**
    *   A dedicated API endpoint was created at `pages/api/faucet.js`.
    *   It handles `GET` requests to check the user's claim status (readiness and time remaining) and `POST` requests to process a claim, including cooldown logic.

3.  **Refactored `StatsContext` for Global State Updates:**
    *   A critical improvement was made to the global state management.
    *   The `context/StatsContext.js` was modified to expose a `refreshUserData` function. This allows any component in the application to trigger a manual refresh of the user's balance and stats from the server.

4.  **Integrated Frontend, Backend, and State:**
    *   The `Faucet.js` component was fully connected to the `/api/faucet` endpoint.
    *   It fetches the faucet status on load and sends a claim request when the user interacts with the button.
    *   Upon a successful claim, it calls the new `refreshUserData` function to ensure the user's balance is instantly updated across the entire application, providing immediate and gratifying feedback.

## Wallet Logic Refactor (Completed)

This plan focused on improving code quality and maintainability by extracting the wallet's business logic into a reusable custom hook.

### Steps Taken:

1.  **Created `useWallet` Custom Hook:**
    *   A new hook was created at `hooks/useWallet.js` to encapsulate all logic related to the user's wallet.
    *   The hook is responsible for fetching transaction data, managing loading and error states, calculating balances, and providing a function to add new transactions to the state.

2.  **Refactored the Wallet Page:**
    *   The `app/(main)/wallet/page.js` component was refactored to use the new `useWallet` hook.
    *   This dramatically simplified the page component, removing complex data-fetching and state management logic, and making it a purely presentational component.

## Withdrawal Functionality (Completed)

This plan focused on building a secure and interactive process for users to withdraw their earned currency.

### Steps Taken:

1.  **Created `WithdrawModal.js`:**
    *   Designed a comprehensive modal for the withdrawal process.
    *   The modal includes a form for selecting a cryptocurrency, entering a wallet address, and specifying an amount.
    *   It manages its own internal state for form inputs, validation, and submission status (submitting, success, error).

2.  **Integrated the Modal:**
    *   The `WithdrawModal` was integrated into the main wallet page (`app/(main)/wallet/page.js`).
    *   State management was added to the wallet page to control the modal's visibility.
    *   The "Withdraw" button in the `WalletSummary` component was connected to a handler to open the modal.

3.  **Built `/api/withdraw` Endpoint:**
    *   Created a secure API endpoint at `pages/api/withdraw.js` to handle `POST` requests.
    *   The endpoint performs server-side validation and simulates the processing of a withdrawal request.

4.  **Connected Frontend to API:**
    *   The `WithdrawModal` form was linked to the `/api/withdraw` endpoint.
    *   The modal now provides real-time feedback to the user, displaying success or error messages returned from the API.

5.  **Real-Time UI Updates:**
    *   Implemented a callback function (`onWithdrawalSuccess`) that is passed from the wallet page to the modal.
    *   Upon a successful withdrawal, this function adds the new withdrawal transaction to the top of the transaction list in the UI, providing immediate visual confirmation and updating the user's balance.

## Dynamic Wallet and Transactions (Completed)

This plan focused on building a complete wallet experience for the user from the ground up.

### Steps Taken:

1.  **Created the Wallet Page:**
    *   Built the main page file at `app/(main)/wallet/page.js`.
    *   The page is responsible for fetching transaction data, calculating wallet stats, and displaying the relevant components.
    *   Includes loading and error states for a smooth user experience.

2.  **API Endpoint for Transactions:**
    *   Established a new endpoint at `pages/api/transactions.js` to serve a mock history of user transactions, including earnings, rewards, and withdrawals.

3.  **`WalletSummary` Component:**
    *   Designed and created `components/wallet/WalletSummary.js`.
    *   This component provides a high-level overview of the user's finances, including current balance, total earned, and total withdrawn, along with "Withdraw" and "Deposit" buttons.

4.  **`TransactionHistoryTable` Component:**
    *   Designed and created `components/wallet/TransactionHistoryTable.js`.
    *   This component displays a detailed, easy-to-read table of all transactions, with icons and colors to denote transaction type and status.

## Offerwalls Page Enhancement (Completed)

This plan focused on significantly improving the design, user experience, and data presentation of the Offerwalls page.

### Steps Taken:

1.  **Redesigned `OfferwallCard.js`:**
    *   The component was overhauled to be more visual and informative.
    *   Replaced simple icons with prominent banner images (`image_url`).
    *   Added "Average Earnings" and a "Popular" tag to guide user decisions.
    *   Improved the overall layout with a modern, clean design and a clear call-to-action button.

2.  **Improved `HistoryTable.js`:**
    *   The history table was enhanced for better readability and at-a-glance information.
    *   Added a "Status" column with colored badges (e.g., Completed, Pending, Reversed).
    *   Included provider logos for easier visual identification.
    *   Improved typography and added icons for rewards and dates.

3.  **Created Supporting API Endpoints:**
    *   Created `/api/offerwalls.js` to serve mock data for offerwall providers, including the new `image_url` field.
    *   Created `/api/history.js` to provide mock data for the completion history, including the new `status` and `provider_logo` fields.

4.  **Updated `offerwalls/page.js`:**
    *   Refactored the main page to remove outdated logic (like the old `iconMap`).
    *   Integrated the newly designed `OfferwallCard` and `HistoryTable` components seamlessly.
    *   Added a loading skeleton effect for the offerwall cards to improve the perceived loading speed.

## Daily Rewards Implementation (Completed)

This plan focused on implementing a fully functional daily reward system.

### Steps Taken:

1.  **API Endpoint for Rewards:**
    *   Created a new API endpoint at `pages/api/rewards.js`.
    *   The endpoint handles `GET` requests to check reward status and `POST` requests to claim rewards.
    *   It includes logic for a 24-hour cooldown period and updates a mock user database.

2.  **Frontend Component Logic:**
    *   Overhauled the `components/sidebar/DailyReward.js` component.
    *   The component now fetches the reward status from the API on load.
    *   It dynamically displays either a "Claim" button or a countdown timer.
    *   Claiming the reward triggers an API call and refreshes the user's stats to show the updated balance.

## UI/UX Enhancements (Completed)

This plan focused on improving the visual appeal and user experience of the application's main navigation and information panels.

### Steps Taken:

1.  **Sidebar Icon Enhancement:**
    *   Updated the icons in the main sidebar (`components/Sidebar.js`) to be more representative and visually appealing.
    *   Imported new icons from `react-icons/fa` for "Challenges", "Hardware", "Mining", and "Inventory".

2.  **Stats Panel Redesign:**
    *   Redesigned the `components/sidebar/StatsPanel.js` component.
    *   Integrated dynamic user data from `useStats`, including level and XP.
    *   Added a visual XP progress bar.
    *   Incorporated icons for each statistic to improve readability and visual appeal.

## Compact View Refactor (Completed)

This plan focused on refactoring the Dashboard, Mining, and Progression pages to use a more compact and unified view. This improves code modularity and user experience.

### Steps Taken:

1.  **Dashboard Compact View:**
    *   Created `components/dashboard/DashboardCompact.js` to consolidate the main dashboard components.
    *   Refactored `app/(main)/dashboard/page.js` to use the new `DashboardCompact` component.
2.  **Mining Compact View:**
    *   Created `components/mining/MiningCompact.js` to combine the coin selection and mining interface.
    *   Refactored `app/(main)/mining/page.js` to use the new `MiningCompact` component.
    *   Removed the now-redundant `app/(main)/mining/[coin]/page.js`.
3.  **Progression Compact View:**
    *   Created `components/progression/ProgressionCompact.js` to provide a consolidated view of user progression.
    *   Refactored `app/(main)/progression/page.js` to use the new `ProgressionCompact` component.

## Breadcrumb Navigation (Completed)

This plan focused on improving the application's navigation by adding a breadcrumb component.

### Steps Taken:

1.  **Created `Breadcrumb.js` component:** A new component was created to display the user's current location in the application.
2.  **Integrated Breadcrumb into `TopBar.js`:** The `Breadcrumb` component was added to the main top bar, making it visible across all pages.
