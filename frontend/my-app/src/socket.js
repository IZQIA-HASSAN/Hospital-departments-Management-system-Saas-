// socket.js
import { io } from 'socket.io-client';

const API_URL =  'http://localhost:5000';

const socket = io(API_URL, {
  autoConnect: false, // don't connect immediately — components call socket.connect() themselves
});

export default socket;