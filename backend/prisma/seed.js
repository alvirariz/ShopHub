const { PrismaClient } = require('@prisma/client') // require means import prisma client talks to our db
const { faker } = require('@faker-js/faker') // faker lib to generate fake data

const prisma = new PrismaClient() // this creates a connection now through prisma we can create update read etc

async function main() {

  // create fake users
  for (let i = 0; i < 10; i++) {
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email() + i + Date.now(), // UNIQUE or we riot
        password: faker.internet.password(),
        role: faker.helpers.arrayElement(["customer", "storeOwner"]),
      }
    })
  }

  const users = await prisma.user.findMany()
  const userIds = users.map(u => u.id)

  for (let i = 0; i < 10; i++) {
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

  const products = await prisma.product.findMany()
  const productIds = products.map(p => p.id)

  // added shipping address, methods, total
  const createdOrders = []
  for (let i = 0; i < 5; i++) {
    const order = await prisma.order.create({
      data: {
        status: faker.helpers.arrayElement(['pending', 'delivered', 'cancelled']),
        customerId: faker.helpers.arrayElement(userIds),
        shippingAddress: faker.location.streetAddress(),
        shippingMethod: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
        total: parseFloat(faker.commerce.price({min: 50, max: 1000})),
      }
    })
    createdOrders.push(order)
  }

  const orderIds = createdOrders.map(o => o.id)

  for (let i = 0; i < 5; i++) {
    await prisma.orderItem.create({
      data: {
        //id autoincrements in schema.prisma
        orderId: faker.helpers.arrayElement(orderIds),
        productId: faker.helpers.arrayElement(productIds),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: parseFloat(faker.commerce.price({min: 5, max: 500})), // added data for new field price
      }
    })
  }

  for (const user of users) {
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {}, // do nothing if exists
      create: {
        userId: user.id,
        isDeleted: false,
      }
    })

    for (let j = 0; j < faker.number.int({ min: 1, max: 4 }); j++) {
      await prisma.cartItem.create({
        data: {
          quantity: faker.number.int({ min: 1, max: 10 }),
          cartId: cart.id,
          productId: faker.helpers.arrayElement(productIds),
        }
      })
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
        type: faker.helpers.arrayElement(['order', 'product', 'system', 'admin']),
        isRead: faker.datatype.boolean(),
        createdAt: faker.date.recent(),
        userId: users[i].id,
      }
    })
  }

  const shuffledUsers = faker.helpers.shuffle([...userIds])
  for (let i = 0; i < 2; i++) {
    await prisma.wishlist.upsert({
      where: { userId: shuffledUsers[i] },
      update: {},
      create: {
        userId: shuffledUsers[i],
        items: {
          create: faker.helpers.arrayElements(productIds, 3).map(productId => ({ productId }))
        }
      }
    })
  }


  // store applicationns for store owners waiting for admin review
const owners = await prisma.user.findMany({ where: { role: 'storeOwner' } });

if (owners.length > 0) 
{
  for (const owner of owners) 
  {
    await prisma.storeApplication.create(
    {
      data: {
        ownerId: owner.id,
        storeName: faker.company.name(), 
        businessType: faker.helpers.arrayElement(['Electronics', 'Fashion', 'Home Decor', 'Groceries']),
        address: faker.location.streetAddress() + ", " + faker.location.city(),
        documents: faker.internet.url() + "/verification.pdf",
        status: "pending" 
      }
    }
    );
  }

}
  // added data for reviews with diff ratings and products
  for (let i = 0; i < 10; i++) {
    await prisma.review.create({
      data: {
        customerId: faker.helpers.arrayElement(users).id,
        productId: faker.helpers.arrayElement(products).id,
        rating: faker.number.int({ min: 1, max: 5 }),
        title: faker.lorem.words(2),
        body: faker.lorem.sentence(),
      }
    })
  }

const allProducts = await prisma.product.findMany()
await prisma.productView.createMany({
  data: Array.from({ length: 30 }, () => ({
    productId: faker.helpers.arrayElement(allProducts).id,
    customerId: faker.number.int({ min: 1, max: 10 }),
    viewedAt: faker.date.recent({ days: 30 })
  }))
})


  console.log("Database seeded with fake data successfully!");
}


main()
  .catch(console.error) // if something goes wrong will print error in terminal
  .finally(() => prisma.$disconnect()) //good practice after done close the prisma connection