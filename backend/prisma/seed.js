const { PrismaClient } = require('@prisma/client') // require means import prisma client talks to our db
const { faker } = require('@faker-js/faker') // faker lib to generate fake data

const prisma = new PrismaClient() // this creates a connection now through prisma we can create update read etc

async function main() {
  for (let i = 0; i < 200; i++) {
    await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 1, max: 100 }),
        storeId: faker.number.int({ min: 1, max: 3 }),

        category: faker.helpers.arrayElement(["electronics", "clothing", "books", "home"]),
        brand: faker.helpers.arrayElement(["apple", "nike", "samsung", "generic"]),
        
        rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
        salesCount: faker.number.int({ min: 0, max: 500 })
      }
    })
  }

  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        status: faker.helpers.arrayElement(['pending', 'delivered', 'cancelled']),
        customerId: faker.number.int({ min: 1, max: 10 }),
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
    console.log("Database seeded with fake data successfully!");
}


main()
  .catch(console.error) // if soemthing goes wrong will print error in terminal
  .finally(() => prisma.$disconnect()) //good pratcice after done close the prisma connection
  
