// =================================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================================
// 1. Go to your Spotify Developer Dashboard: https://developer.spotify.com/dashboard/
// 2. Create a new app or use an existing one.
// 3. Copy your "Client ID" and paste it below.
// 4. Go to your app's "Settings" and add a "Redirect URI". For local testing,
//    this will likely be `http://localhost:3000` or the address of your web container.
// =================================================================================
export const spotifyConfig = {
  clientId: '05800070db55443b9386df964178e934', // <-- PASTE YOUR CLIENT ID HERE
  redirectUri: window.location.origin,
  scopes: [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-library-read",
    "user-library-modify",
    "user-read-playback-state",
    "user-modify-playback-state"
  ],
};
