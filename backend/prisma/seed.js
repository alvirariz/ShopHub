const { PrismaClient } = require('@prisma/client') // require means import prisma client talks to our db
const { faker } = require('@faker-js/faker') // faker lib to generate fake data

const prisma = new PrismaClient() // this creates a connection now through prisma we can create update read etc

async function main() {
  for (let i = 0; i < 10; i++) {
    await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 1, max: 100 }),
        storeId: faker.number.int({ min: 1, max: 3 }),
      }
    })
  }

  // added shipping address, methods, total 
  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        status: faker.helpers.arrayElement(['pending', 'delivered', 'cancelled']),
        customerId: faker.number.int({ min: 1, max: 10 }),
        shippingAddress: faker.location.streetAddress(), 
        shippingMethod: faker.helpers.arrayElement(['standard', 'express', 'overnight']), 
        total: parseFloat(faker.commerce.price({min:50, max:1000})), 
      }
    })
  }

  for(let i = 0 ; i<5 ;i++)
  {
    await prisma.orderItem.create({
        data:
        {
            //id autoincremensts in schema.prisma
            orderId: faker.number.int({min:1,max:5}),
            productId:faker.number.int({ min: 1, max: 10}),
            quantity: faker.number.int({ min: 1, max: 5 }),
            price: parseFloat(faker.commerce.price({min: 5, max:500})), // added data for new field price 

        }

    })

  }

    for (let i = 0; i < 5; i++) {
        const cart = await prisma.cart.create({
            data: {
                userId:    i + 1,
                isDeleted: false,
            }
        });

        for (let j = 0; j < faker.number.int({ min: 1, max: 4 }); j++) {
            await prisma.cartItem.create({
                data: {
                    quantity:  faker.number.int({ min: 1, max: 10 }),
                    cartId:    cart.id,
                    productId: faker.number.int({ min: 1, max: 10 }), // assumes 10 products already created 
                }
            });
        }
    }

    for (let i = 0; i < 10; i++) {
    await prisma.Notification.create({
      data: {
        message: faker.helpers.arrayElement([
        "Your order has been placed",
        "Your order has been shipped",
        "New product added",
        "System maintenance scheduled"
        ]),
        type:faker.helpers.arrayElement(['order', 'product', 'system', 'admin']),
        isRead: faker.datatype.boolean(),
        createdAt: faker.date.recent(),
        
        userId: faker.number.int({min:1,max: 5}),
      }
    })
  }



await prisma.wishlist.create({
  data:{ userId:1,
    wishlistItems:{ create:[{productId:1 }, {productId:3 }, {productId:5}]}
  }
})
  
await prisma.wishlist.create({
  data:{ userId:2,
    wishlistItems:{ create:[{productId:2 }, {productId:4 }, {productId:6}]}
  }
})

    // added data for reviews with diff ratings and products
    const reviews = [
      {customerId: 1, productId: 1, rating: 5, title: "Great product!", body: "I loved it! Highly recommend."},
      { customerId: 2, productId: 2,  rating: 4, title: 'Very Good',       body: 'Good quality, fast delivery.' },
      { customerId: 3, productId: 3,  rating: 3, title: 'Average',         body: 'It was okay, nothing special.' },
      { customerId: 4, productId: 4,  rating: 5, title: 'Love it!',        body: 'Exceeded my expectations.' },
      { customerId: 5, productId: 5,  rating: 2, title: 'Disappointing',   body: 'Did not match the description.' },
      { customerId: 1, productId: 6,  rating: 4, title: 'Good buy',        body: 'Worth the price.' },
      { customerId: 2, productId: 7,  rating: 5, title: 'Perfect!',        body: 'Exactly what I needed.' },
      { customerId: 3, productId: 8,  rating: 1, title: 'Terrible',        body: 'Broke after one use.' },
      { customerId: 4, productId: 9,  rating: 3, title: 'Decent',          body: 'Nothing to complain about.' },
      { customerId: 5, productId: 10, rating: 4, title: 'Pretty good',     body: 'Would recommend to others.' },
    ]

    for (const review of reviews){
      await prisma.review.create({
        data: review
      })
    }
    
    console.log("Database seeded with fake data successfully!");
}


main()
  .catch(console.error) // if soemthing goes wrong will print error in terminal
  .finally(() => prisma.$disconnect()) //good pratcice after done close the prisma connection
  
