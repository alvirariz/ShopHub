const { PrismaClient } = require('@prisma/client')
const { faker } = require('@faker-js/faker')

const prisma = new PrismaClient()

async function main() {

  for (let i = 0; i < 10; i++) {
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email() + i + Date.now(),
        password: faker.internet.password(),
        role: faker.helpers.arrayElement(["customer", "storeOwner"]),
      }
    })
  }

  const users = await prisma.user.findMany()
  const userIds = users.map(u => u.id)

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

  const products = await prisma.product.findMany()
  const productIds = products.map(p => p.id)

  const createdOrders = []
  for (let i = 0; i < 5; i++) {
    const order = await prisma.order.create({
      data: {
        status: faker.helpers.arrayElement(['pending', 'delivered', 'cancelled']),
        customerId: faker.helpers.arrayElement(userIds),
        shippingAddress: faker.location.streetAddress(),
        shippingMethod: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
        total: parseFloat(faker.commerce.price({ min: 50, max: 1000 })),
      }
    })
    createdOrders.push(order)
  }

  const orderIds = createdOrders.map(o => o.id)

  for (let i = 0; i < 5; i++) {
    await prisma.orderItem.create({
      data: {
        orderId: faker.helpers.arrayElement(orderIds),
        productId: faker.helpers.arrayElement(productIds),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
      }
    })
  }

  for (const user of users) {
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
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

  console.log("Database seeded with fake data successfully!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())