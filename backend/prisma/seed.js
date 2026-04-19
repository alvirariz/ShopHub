const {PrismaClient} = require('@prisma/client');
const {faker} = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {

    // fake products for cart 
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

    console.log("Database seeded with fake data successfully!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });