// socket.js
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000';

// Backend now authenticates the socket handshake using a token, passed via
// `auth`, not a header. It's read once at connect time — see connectSocket()
// below for why a plain `io()` call at module load isn't enough anymore.
const socket = io(API_URL, {
  autoConnect: false, // don't connect immediately — components call connectSocket() themselves
  auth: {
    token: localStorage.getItem('token'),
  },
});

// `socket.auth` is only read by socket.io-client at the moment `.connect()`
// runs. Since this module loads once and the token can change later (login,
// logout, token refresh), calling socket.connect() directly can send a
// stale or missing token. Always go through this helper instead so the
// token is re-read fresh each time.
export function connectSocket() {
  const token = localStorage.getItem('token');
  if (!token) return; // don't attempt to connect while logged out
  socket.auth = { token };
  socket.connect();
}

export default socket;