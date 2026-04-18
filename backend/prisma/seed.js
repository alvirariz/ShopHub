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

  console.log("Database seeded with fake data successfully!") // just prints message in terminal to show it worked
}

main()
  .catch(console.error) // if soemthing goes wrong will print error in terminal
  .finally(() => prisma.$disconnect()) //good pratcice after done close the prisma connection