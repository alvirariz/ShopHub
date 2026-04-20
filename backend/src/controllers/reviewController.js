const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const writeReview = async (req, res) => {
    try{
        const {customerId, productId, rating, title, body} = req.body;

        // verify that customer exists 
        const customer = await prisma.customer.findUnique({where:{id:customerId}});
        if(!customer){
            return res.status(404).json({message:'Customer not found'});
        }

        // verify purchase 
        const purchase = await prisma.orderItem.findFirst({
            where: {
                productId: productId,
                order: {
                    customerId: customerId
                }
            }
        });
        if(!purchase){
            return res.status(403).json({message:'You can only review purchased products'});
        }

        // validate required fields 
        if(!rating || !title || !body){
            return res.status(400).json({message:'Rating, title, and body are required'});
        }
        if(rating < 1 || rating > 5){
            return res.status(400).json({message:'Rating must be between 1 and 5'});
        }

        // check if review alrfeady exists for this person 
        const existingReview = await prisma.review.findFirst({
            where: {
                customerId: customerId,
                productId: productId
            }
        });
        if(existingReview){
            return res.status(400).json({message:'You have already reviewed this product'});
        }

        // save review 
        const review = await prisma.review.create({
            data:{
                customerId: customerId,
                productId: productId,
                rating: rating,
                title: title,
                body: body
            }
        });

        // recaluclate average rating for the product
        const allReviews = await prisma.review.findMany({
            where:{productId: productId}
        });
        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        res.status(201).json({
            message:'Review submitted successfully', 
            review,
            averageRating: averageRating.toFixed(2)
        });

    }
    catch(error){
        res.status(500).json({message:'Error submitting review', error: error.message});
    }
}


// get all reviewss for a product 
const getProductReviews = async (req, res) => {
    try{
        const {productId} = req.params;

        // verify that product exists
        const product = await prisma.product.findUnique({where:{id:parseInt(productId)}});
        if(!product){
            return res.status(404).json({message:'Product not found'});
        }

        // fetch all reviews for the product
        const reviews = await prisma.review.findMany({
            where: { productId: parseInt(productId) },
            orderBy: { createdAt: 'desc' }
        });

        // if no reviews 
        if(reviews.length === 0){
            return res.status(200).json({message:'No reviews for this product yet'});
        }

        // averahe rating
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        res.status(200).json({ 
            count: reviews.length,
            averageRating: averageRating.toFixed(2),
            reviews 
        });
    }
    catch(error){
        res.status(500).json({message:'Error fetching reviews', error: error.message});
    }
}


module.exports = {
    writeReview,
    getProductReviews
}