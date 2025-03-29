# Spotify Top Tracks App

A simple React application that displays your top tracks from Spotify.

## Features

- Display your top tracks from your Spotify listening history
- Configure the number of tracks to display (5, 10, 20, or 50)
- Choose the time range for your top tracks (4 weeks, 6 months, or all time)
- Play 30-second preview of tracks when available
- View detailed audio features for each track (danceability, energy, etc.)
- Browse your playlists
- Clean, responsive UI with Spotify-inspired design

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- A valid Spotify API token (pre-configured in the app for demo purposes)

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Important Note About Authentication

The app currently uses a hardcoded Spotify API token that expires after a short time. For a production app, you would need to implement the proper Spotify Authorization flow:

1. Register your app on [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Implement the OAuth 2.0 authorization flow using either:
   - [Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
   - [Implicit Grant Flow](https://developer.spotify.com/documentation/web-api/tutorials/implicit-flow)

## Possible Future Enhancements

- Add ability to create playlists from your top tracks
- Implement authentication flow for token refresh
- Add visualizations for audio features (radar charts, etc.)
- Add ability to compare different time periods
- Show related artists and recommendations
- Add support for multiple languages (i18n)

## Technologies Used

- React
- TypeScript
- styled-components
- Spotify Web API

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
