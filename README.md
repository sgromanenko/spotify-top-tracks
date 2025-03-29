# Spotify Top Tracks App

A React application that displays your top tracks from Spotify with their audio features.

## Features

- Display your top tracks from your Spotify listening history
- Configure the number of tracks to display (10, 20, 30, or 50)
- Choose the time range for your top tracks (last month, 6 months, or all time)
- Play 30-second preview of tracks when available
- View detailed audio features for each track (danceability, energy, etc.)
- Browse your playlists
- Clean, responsive UI with Spotify-inspired design
- OAuth authentication with Spotify

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- A Spotify account (free or premium)
- A registered Spotify application (see Authentication Setup below)

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Set up authentication (see next section)
4. Start the development server:

```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Authentication Setup

1. Visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the required information:
   - App name: "Spotify Top Tracks" (or any name you prefer)
   - App description: Brief description of the app
   - Redirect URI: `http://localhost:3000/callback`
   - Website: Optional
5. Accept the terms and click "Create"
6. On your app's dashboard, click "Settings"
7. Copy the Client ID
8. Create a `.env` file in the root of the project (copy from `.env.example`):

```
REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
REACT_APP_REDIRECT_URI=http://localhost:3000/callback
```

9. Replace `your_client_id_here` with the Client ID you copied

## How Authentication Works

This app uses the Spotify OAuth 2.0 Implicit Grant Flow:

1. User clicks "Login with Spotify" button
2. User is redirected to Spotify's authorization page
3. User grants permission for the app to access their data
4. Spotify redirects back to the app with an access token
5. The app stores the token and uses it for API requests
6. Token expires after 1 hour, and the user needs to log in again

In a production environment, you might want to implement the Authorization Code Flow with PKCE for more security and automatic token refresh.

## Technologies Used

- React
- TypeScript
- styled-components
- React Router
- Spotify Web API

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run lint`

Runs ESLint to check for code quality issues.

### `npm run format`

Runs Prettier to format the code according to the defined style.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
