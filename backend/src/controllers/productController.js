
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

//the usecase withdraw product listing 


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

const viewLowStockAlerts = async (req, ans) => {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { lt: 10 } } // lt mean less than 10
    })

    if(products.length === 0) {
      return ans.status(200).json({ message: "No low stock products" })
    }

    return ans.json({ message: "Low stock products", products: products })

  } catch(error) {
    ans.status(500).json({ message: "something went wrong", error })
  }
}

const addProduct = async (req, res) => {
    const { name, price, category, brand, stock, storeId } = req.body;
    
    try {
        // Validation
        if (!name || !price || !category || !stock) {
            return res.status(400).json({ 
                message: "Missing required fields: name, price, category, stock" 
            });
        }
        
        const product = await prisma.Product.create({
            data: {
                name,
                price: parseFloat(price),
                category,
                brand: brand || "",
                stock: parseInt(stock),
                storeId: parseInt(storeId),
                rating: 0,
                salesCount: 0,
                
                isDeleted: false,
                isWithdrawn: false
            }
        });
        
        return res.status(201).json({ 
            message: "Product added successfully", 
            product 
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error adding product",
            error: error.message
        });
    }
};

const editProduct = async (req, res) => {
    const { productId } = req.params;
    const updates = req.body;
    
    try {
        // Check if product exists
        const product = await prisma.Product.findUnique({
            where: { id: parseInt(productId) }
        });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        
        if (updates.price) updates.price = parseFloat(updates.price);
        if (updates.stock) updates.stock = parseInt(updates.stock);
        
        const updated = await prisma.Product.update({
            where: { id: parseInt(productId) },
            data: updates
        });
        
        return res.json({ 
            message: "Product updated successfully", 
            product: updated 
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error updating product",
            error: error.message
        });
    }
};


// Sorted Products 
const sortProducts = async (req, res) => {
    try {
        const { sortBy, order } = req.query; // read the sort option
        const sortOptions = {
            price: 'price',
            rating: 'rating',
            popularity: 'salesCount'
        }
        if (!sortOptions[sortBy])
        {
            return res.status(400).json({ message: "Invalid sort option. Use 'price', 'rating', or 'popularity'." });
        }
        const products = await prisma.product.findMany({
            where: { isDeleted: false, isWithdrawn: false },
            orderBy: { [sortOptions[sortBy]]: order === 'desc' ? 'desc' : 'asc' }
        });
        res.status(200).json({ products });

    }
    catch(error)
    { return res.status(500).json({message: "Error updating product",error: error.message});}
};


// Get product details
const getProductDetails = async (req, res) => {
 try{
    const {productId} = req.params  // product id for which details are needed

    const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
        include: {reviews: { orderBy: { createdAt: 'desc' } } // include reviews of the product 
        }
    })

    if(!product)  // incase product not exist 
    {return res.status(404).jason ({message: "Product not found"})}

    if(product.isDeleted || product.isWithdrawn) // incase product deleted or withdrawn
    {return res.status(404).jason ({message: "Product not available"})}
      
    
    res.status(200).json(product)
 }
 catch(error){
   return  res.status(500).json({message: "Error fetching product details", error: error.message})
 }


};

//uc5: Browse Products
const browseProducts = async (req, res) => {
  try {
    const { category, storeId } = req.query

    const filters = { isDeleted: false, isWithdrawn: false }

    if (category) filters.category = category
    if (storeId) filters.storeId = parseInt(storeId)

    const products = await prisma.product.findMany({
      where: filters
    })

    if (products.length === 0) {
      return res.status(200).json({ message: "No products available" })
    }

    res.status(200).json({ count: products.length, products })

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

//uc 6 Search Products
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query

    if (!keyword) {
      return res.status(400).json({ message: "Please enter a search keyword" })
    }

    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
        isWithdrawn: false,
        OR: [
          { name: { contains: keyword } },
          { category: { contains: keyword } },
          { brand: { contains: keyword } }
        ]
      }
    })

    if (products.length === 0) {
      return res.status(200).json({ message: "No results found for your search" })
    }

    res.status(200).json({ count: products.length, products })

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

//uc7 filter products
const filterProducts = async (req, res) => {
  try {
    const { minPrice, maxPrice, brand, rating, category } = req.query

    const filters = { isDeleted: false, isWithdrawn: false }

    if (category) filters.category = category
    if (brand) filters.brand = brand
    if (rating) filters.rating = { gte: parseFloat(rating) }
    if (minPrice || maxPrice) {
      filters.price = {}
      if (minPrice) filters.price.gte = parseFloat(minPrice)
      if (maxPrice) filters.price.lte = parseFloat(maxPrice)
    }

    const products = await prisma.product.findMany({
      where: filters
    })

    if (products.length === 0) {
      return res.status(200).json({ message: "No products match your selected filters" })
    }

    res.status(200).json({ count: products.length, products })

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

module.exports = { withdrawProduct, compareProducts, updateStockQuantity, viewLowStockAlerts, addProduct, editProduct, sortProducts, getProductDetails, browseProducts, searchProducts, filterProducts }

