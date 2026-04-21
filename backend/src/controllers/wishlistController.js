const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


// Adding product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body   // get userId and productId from request body

        // check if product actually exists in db
        const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } })

        if (!product || product.isDeleted || product.isWithdrawn) {
            return res.status(404).json({ message: 'Product not available' })
        }

        // find user wishlist if not create one 
        let wishlist = await prisma.wishlist.findUnique({ where: { userId: parseInt(userId) } })

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({ data: { userId: parseInt(userId) } }) 
        }

        // check if already in wishlist 
        const alreadyInWishlist = await prisma.wishlistItem.findFirst({
            where: {
                wishlistId: wishlist.id,
                productId: parseInt(productId)
            }
        })

        if (alreadyInWishlist) {
            return res.status(400).json({ message: 'Product already in wishlist' })
        }

        const wishlistItem = await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId: parseInt(productId)
            }
        })
          // product added 
        res.status(201).json({ message: 'Product added to wishlist', wishlistItem }) 

    } catch (error) {
        res.status(500).json({ message: 'Error adding product to wishlist', error: error.message })
    }
}


// Removing product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { userId } = req.body          
        const { productId } = req.params      

        // finding user wishlist 
        const wishlist = await prisma.wishlist.findUnique({ where: { userId: parseInt(userId) } })

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' })
        }

        // finding product in whislist to del 
        const wishlistItem = await prisma.wishlistItem.findFirst({
            where: {
                wishlistId: wishlist.id,
                productId: parseInt(productId)
            }
        })
          // product don't exist 
        if (!wishlistItem) {
            return res.status(404).json({ message: 'Product not found in wishlist' })
        }

        // product removed 
        await prisma.wishlistItem.delete({ where: { id: wishlistItem.id } })

        res.status(200).json({ message: 'Product removed from wishlist' })

    } catch (error) {
        res.status(500).json({ message: 'Error removing product from wishlist', error: error.message })
    }
}


// Wishlist of User -- helper func 
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params   

        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: parseInt(userId) },
            include: {
                items: {
                    include: { product: true }   
                }
            }
        })
        // incase it is empty 
        if (!wishlist) {
            return res.status(200).json({ message: 'Wishlist is empty', items: [] })
        }

        res.status(200).json(wishlist)

    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist', error: error.message })
    }
}


module.exports = { addToWishlist, removeFromWishlist, getWishlist }