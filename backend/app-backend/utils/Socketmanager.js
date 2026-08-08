import Staff from "../models/Staff.js"

function initSocket(io){
    io.on('connection' , (socket)=>{
        socket.on('staff:online' , async(staffId)=>{
            try{
                if(!staffId) return 
                socket.staffId = staffId

                const staff = await Staff.findByPk(staffId)
                if(!staff) return 

                await staff.update({
                    isOnline :true,
                    socketId :socket.id,
                    lastSeen : new Date(),
                });

                io.emit("staff:statuschanges" , {id:staff.is , isOnline:false})
            }catch(err){
                console.error('staff:disconnect error:', err.message);
            }
        })
    })
}

export default initSocket