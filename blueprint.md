# Project Blueprint

## Overview

This document outlines the architecture, features, and development plan for the Next.js application. The application is a "crypto faucet" and "get-paid-to" platform where users can earn cryptocurrency by completing tasks.

## Implemented Features

### Design and Style

*   **Layout:** The application uses a main layout with a sidebar and a top bar for navigation.
*   **Theme:** The application has a dark theme with a color palette centered around dark grays, cyans, yellows, greens, and purples.
*   **Components:** The application is built with reusable components for different UI elements like banners, cards, and navigation.

### Core Features

*   **Dashboard:** The main dashboard displays a welcome message, quick actions, a live feed of activities, and featured offerwalls.
*   **User Authentication:** The application has a basic authentication system with login and register functionality.
*   **Static Data:** The dashboard currently displays static data for earnings and other statistics.

## Current Plan: Dynamic Username in Welcome Banner

The current implementation of the `WelcomeBanner` component has a hardcoded username. The plan is to make the username dynamic by fetching it from the backend.

### Steps:

1.  **Create a function to get user data:** A new function will be created to fetch the current user's data from the server.
2.  **Update `WelcomeBanner.js`:** The `WelcomeBanner` component will be updated to use the new function to fetch the user's data and display the username dynamically.
3.  **Verify the change:** The application will be checked to ensure that the UI is not broken and that the username is displayed correctly.
