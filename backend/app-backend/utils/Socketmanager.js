import Staff from "../models/Staff.js";

function initSocket(io) {
  io.on('connection', (socket) => {
    socket.on('staff:online', async (staffId) => {
      try {
        if (!staffId) return;
        socket.staffId = staffId;

        const staff = await Staff.findByPk(staffId);
        if (!staff) return;

        await staff.update({
          isOnline: true,
          socketId: socket.id,
          lastSeen: new Date(),
        });

        // FIX: correct event name (matches frontend listener),
        // correct field name (staff.id not staff.is),
        // correct value (true, matching what we just set)
        io.emit("staff:statusChanged", { id: staff.id, isOnline: true });
      } catch (err) {
        console.error('staff:online error:', err.message);
      }
    });

    // ADDED: was completely missing — this is why nobody ever went offline
    socket.on('disconnect', async () => {
      try {
        if (!socket.staffId) return;

        const staff = await Staff.findByPk(socket.staffId);
        if (!staff) return;

        await staff.update({
          isOnline: false,
          socketId: null,
          lastSeen: new Date(),
        });

        io.emit("staff:statusChanged", { id: staff.id, isOnline: false });
      } catch (err) {
        console.error('staff:disconnect error:', err.message);
      }
    });
  });
}

export default initSocket;