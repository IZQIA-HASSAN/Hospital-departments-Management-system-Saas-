import Notification from "../models/Notification.js"

let io = null;
function initnotify(socketioinstance) {
    io = socketioinstance
}

async function notify({ hospitalId, type, message, severity = "info", meta = {}, createdBy }) {
    const notifications = await Notification.create({
        hospitalId,
        type,
        message,
        severity,
        meta,
        createdBy,
    });

    if(io){
        io.to(`hospital:${hospitalId}`).emit("notification:new", notifications)
    }

    return notifications
}


export default {initnotify , notify}