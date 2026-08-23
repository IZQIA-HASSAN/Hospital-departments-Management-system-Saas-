// client/useSocketConnection.js
//
// Call this ONCE, in your root layout component (the one that stays mounted
// while tab content swaps in and out) — never inside an individual tab/page.
// That's the whole fix: the socket's lifetime should match "is this person
// logged in", not "is this specific tab currently rendered".

import { useEffect } from "react";
import socket, { connectSocket } from "./socket.js"; // adjust path to match your project

export function useSocketConnection() {
  useEffect(() => {
    connectSocket();

    function onConnectError(err) {
      // Surfaces auth failures instead of failing silently — this is what
      // would have caught the stale-token bug immediately instead of
      // looking like "nothing is happening".
      console.error("Socket connection failed:", err.message);
    }
    socket.on("connect_error", onConnectError);

    // Only runs when the LAYOUT unmounts — i.e. actual logout/app teardown,
    // not "user clicked a different tab". If your layout genuinely never
    // unmounts until logout, this is correct as-is. If logout is a
    // separate action (a button, not an unmount), also call
    // disconnectSocket() directly from that logout handler — don't rely
    // on this cleanup alone to catch it.
    return () => {
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);
}