
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

//the ucecase
//have to witdarw product listing 
//steps:
// Store owner navigates to product listings and selects a product
// System displays product options including "Delete" and "Delist"

// Store owner selects "Delete" or "Delist"
//System displays a confirmation prompt

//Store owner confirms the action
//System deletes or marks the product as inactive/delisted

//System confirms the action and updates the product listing accordingly

//Store owner cancels the confirmation
//System takes no action and returns to the product listing

//Product has pending orders at time of deletion
//System warns the store owner and prevents deletion until orders are resolved; delist is still permitted

const withdrawProduct = async (req,ans) =>
{
    try{
        const{ productId } = req.params
        const{ action }=req.body //body is the extra detail not in url

        //does product exist?
        const product = await prisma.product.findUnique({
            where:{id: parseInt(productId)}
        })

        if(!product)
        {
            return ans.status(404).json({message: "Product not found "})
        }

        if(action==="delete")
        {
            //checking if pending orders
            const pendingOrders= await prisma.orderItem.findFirst({
                where:{
                    productId:parseInt(productId),
                    order:{
                        status:"pending"
                    }
                }
            })

            if(pendingOrders)
            {
                return ans.status(400).json({
                    message:"Cannot delete product with pending orders. You can delist it instead.:>"
                })
            }

            await prisma.product.update(
            {
                where:{id: parseInt(productId)},
                data:{isDeleted:true}
            })
   
            return ans.json({message:"Product deleted succesfully",product }) //ans.json() is how to send data to frontend
        }

        if(action==="delist")
        {
            //no need to check for pending orders aab

            await prisma.product.update(
            {
                where:{id: parseInt(productId)},
                data:{isWithdrawn:true}
            })
   
            return ans.json({message:"Product delisted succesfully",product }) //ans.json() is how to send data to frontend
        }
       
        //if neither delist or delete:
        return ans.status(400).json({message:"Invalid action.Use delete or delist"})
        }
        catch(error)
        {
            ans.status(500).json({message:"something went wrong error",error}) //500 is standard server error
        }
    


}

module.exports = {withdrawProduct} //making this func public for toher files to access
