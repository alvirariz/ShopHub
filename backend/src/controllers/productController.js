
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

        if(action==="delete") //== for valus only and === for values and type
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

          const updated =  await prisma.product.update(
            {
                where:{id: parseInt(productId)},
                data:{isDeleted:true}
            })
   
            return ans.json({message:"Product deleted succesfully",product:updated }) //ans.json() is how to send data to frontend
        }

        if(action==="delist")
        {
            //no need to check for pending orders aab

           const updated = await prisma.product.update(
            {
                where:{id: parseInt(productId)},
                data:{isWithdrawn:true}
            })
   
            return ans.json({message:"Product delisted succesfully",product:updated }) //ans.json() is how to send data to frontend
        }
       
        //if neither delist or delete:
        return ans.status(400).json({message:"Invalid action.Use delete or delist"})
        }
        catch(error)
        {
            ans.status(500).json({message:"something went wrong error",error}) //500 is standard server error
        }
    


}


const updateStockQuantity = async (req,ans) =>
{
try
{
        const { productId } = req.params   // which product
    const { stock } = req.body         // the new stock number

    //does product exist?
    const product = await prisma.product.findUnique({
            where:{id: parseInt(productId)}
        })
    
    if(!product)
    {
        return ans.status(400).json({message: "Product not found "})
    }

     if (isNaN(stock))
    {
        return ans.status(400).json({ message: "Stock must be a number" })
    }

    if (stock<0 )
    {
        return ans.status(400).json({message: " stock cannot be negative "})
    }
   
    
        const updated =  await prisma.product.update(
            {
                where:{id: parseInt(productId)},
                data:{stock: stock} // tryint t set there product id set stock = req.body
            })
        return ans.json({ message: "Stock updated successfully", product: updated })
    
    
}

     catch(error)
        {
            ans.status(500).json({message:"something went wrong error",error}) //500 is standard server error
        }
    

}




// compare products 
const compareProducts = async (req,res) => {
    try{
        const {ids} = req.query // productIds to compare
        if (!ids) return res.status(400).json({ message: 'No product IDs provided' });

        const productIds = ids.split(',').map(id => parseInt(id));

        const products = await prisma.product.findMany({
            where:{id:{in:productIds}, isDeleted: false, isWithdrawn: false}
        });

        res.status(200).json({count: products.length, products});
    }
    catch(error){
        res.status(500).json({message:"Error comparing products",error});
    }
}

module.exports = {withdrawProduct, compareProducts,updateStockQuantity} //making this func public for toher files to access
