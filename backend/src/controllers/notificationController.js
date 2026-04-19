const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const getUserNotifications = async(req,res)=> {
    const {userId} = req.params;
    try{
        const notifications = await prisma.Notification.findMany({
            where:{
                userId:parseInt(userId)
            },
            orderBy:{
                createdAt:'desc'
            },
            take:50
        });
        return res.json({notifications});
        

    }   catch (error){
        return res.status(500).json({
            message: "Error fetching notification",
            error: error.message
        });
    }
}



const markAsRead = async (req,res) => {
    const {notifId} = req.params;
    try {
         await  prisma.Notification.update({
            where: { 
                id:parseInt(notifId)
            },
            data:{isRead:true}
        })
        return res.json({ message: "Notification marked as read" });



    }catch(error){
        return res.status(500).json({
            message: "Error updating notification",
            error: error.message
        });

    }



}

module.exports = {getUserNotifications,markAsRead};

