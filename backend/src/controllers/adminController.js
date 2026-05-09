const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const manageUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { action } = req.body;
    
    try {
        // TODO: Later we'll check if req.user.role === 'admin'
        // For now, anyone can do this (testing only!)
        
        const user = await prisma.User.findUnique({   // find user
            where: { id: parseInt(userId) }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (action === "suspend") {
            await prisma.User.update({
                where: { id: parseInt(userId) },
                data: { isSuspended: true }
            });
            return res.json({ message: "User suspended successfully" });
        }
        
        if (action === "reactivate") {
            await prisma.User.update({
                where: { id: parseInt(userId) },
                data: { isSuspended: false }
            });
            return res.json({ message: "User reactivated successfully" });
        }
        
        return res.status(400).json({ 
            message: "Invalid action. Use 'suspend' or 'reactivate'" 
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error managing user status",
            error: error.message
        });
    }
};

const getPlatformMetrics = async (req, res) => {
    try {
        // Basic counts
        const totalUsers = await prisma.User.count();
        const totalOrders = await prisma.Order.count();
        const totalProducts = await prisma.Product.count();
        
        // Total revenue
        const totalRevenue = await prisma.Order.aggregate({
            _sum: { total: true }
        });
        
        // Recent activity (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const recentUsers = await prisma.User.count({
            where: { createdAt: { gte: oneDayAgo } }
        });
        
        const recentOrders = await prisma.Order.count({
            where: { createdAt: { gte: oneDayAgo } }
        });
        
        // Mock graph data matching Figma
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthlySales = months.map(month => ({
            name: month,
            sales: Math.floor(Math.random() * 50) + 10,
            revenue: Math.floor(Math.random() * 5000) + 1000
        }));
        
        const recentBarData = [
            { name: 'May 03', value: 8 },
            { name: 'May 05', value: 5 },
            { name: 'May 08', value: 4 },
            { name: 'May 12', value: 3 },
            { name: 'May 15', value: 6 },
            { name: 'May 19', value: 8 },
            { name: 'May 22', value: 9 },
            { name: 'May 27', value: 4 },
            { name: 'May 29', value: 6 },
            { name: 'May 31', value: 6 }
        ];

        return res.json({
            metrics: {
                totalUsers,
                totalOrders,
                totalProducts,
                totalRevenue: totalRevenue._sum.total || 0,
                recentUsers,
                recentOrders
            },
            graphs: {
                monthlySales,
                recentActivity: recentBarData
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching platform metrics",
            error: error.message
        });
    }
};

// Get User Details
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const orders = await prisma.order.findMany({
            where: { customerId: parseInt(userId) },
            orderBy: { createdAt: 'desc' }
        });

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const lastOrderDate = totalOrders > 0 ? orders[0].createdAt : null;

        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: parseInt(userId) },
            include: { items: true }
        });
        const wishlistCount = wishlist ? wishlist.items.length : 0;

        const reviewsCount = await prisma.review.count({
            where: { customerId: parseInt(userId) }
        });

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            isSuspended: user.isSuspended,
            createdAt: user.createdAt,
            totalOrders,
            totalSpent,
            lastOrderDate,
            wishlistCount,
            reviewsCount
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user details", error: error.message });
    }
};

// Reviewing pending applications 
const getPendingApplications = async (req, res) => {
try {
    // applications waiting for admin review
    const applications = await prisma.storeApplication.findMany({
        where: {status: 'pending'},
        orderBy: { createdAt: 'desc'}
    })
    if (applications.length === 0) {
        return res.status(200).json({ message: "No pending applications" })
    }
    return res.json({ applications });
}
catch(error){
     res.status(500).json({message: "Error fetching pending applications",error: error.message});
}

};

// Get an application by Id 
const getApplicationById = async (req , res ) => {
    try{
        const { applicationId } = req.params // id of the application to review
        const application = await prisma.storeApplication.findUnique({
            where: { id: parseInt(applicationId) }
        })
        if (!application) {
            return res.status(404).json({ message: "Application not found" })
        }
        res.status(200).json( application)

    }
    catch(error)
    {
        res.status(500).json({message: "Error fetching application",error: error.message});
    }
};

// Manage store application 
const manageApplication = async (req, res) => {
   try{
    const { applicationId } = req.params
    const { action, rejectReason } = req.body  

    // finding the application 
    const application = await prisma.storeApplication.findUnique({
        where: { id: parseInt(applicationId) }
    })
    if(!application)
    {return res.status(404).json({message: "Application not found"})}

    //  approval of application
    if(action === 'approve')
    {const updates = await prisma.storeApplication.update({
        where: { id: parseInt(applicationId) },
        data: { status: 'approved' }
    })
    await prisma.user.update({
        where: { id: application.ownerId },
        data: { isActive: true }
    });
    return res.json({message: "Application approved", application: updates})
    }

    // rejection of application 
    if(action === 'reject')
    {
        const updates = await prisma.storeApplication.update({
            where:{ id: parseInt(applicationId) },
            data: { status: 'rejected',rejectReason}
        })
        return res.json({message: "Application rejected", application: updates})
    }
    res.status(400).json({message: "Invalid action!\nUse 'approve' or 'reject'"})
   }
   catch(error){
    res.status(500).json({message: "Error managing application",error: error.message});
   }


};

// Search Users 
const searchUsers = async (req , res ) =>
{
  try{

    const { q } = req.query // search query 
        const users = await prisma.user.findMany({
            where: q ? {
                OR: [
                    { name: { contains: q } },    // search by name
                    { email: { contains: q } }    // or by email
                ]
            } : {},   
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                isSuspended: true,
                createdAt: true
                 
            }
        })
 
        if (users.length === 0) 
        {
            return res.status(200).json({ message: 'No users found matching your search' })
        }
 
        res.status(200).json({ count: users.length, users })

  }
  catch(error){
    res.status(500).json({message: "Error searching users",error: error.message});
  }

};



module.exports = {manageUserStatus,getPlatformMetrics, getPendingApplications, getApplicationById, manageApplication, searchUsers, getUserDetails }