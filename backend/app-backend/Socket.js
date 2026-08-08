import { io } from 'socket.io-client';

// autoConnect: false — the dashboard component connects when it mounts
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
  autoConnect: false,
});

export default socket;