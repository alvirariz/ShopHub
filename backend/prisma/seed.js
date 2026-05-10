const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed perfectly categorized products with Pakistani brands...");

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shophub.com' },
    update: { password: hashedPassword },
    create: {
      name: 'System Admin',
      email: 'admin@shophub.com',
      password: hashedPassword,
      role: 'admin',
    }
  });

  // 2. Create 10 Store Owners
  const storeOwners = [];
  for (let i = 1; i <= 10; i++) {
    const owner = await prisma.user.upsert({
      where: { email: `owner${i}@shophub.com` },
      update: { password: hashedPassword, role: 'storeOwner' },
      create: {
        name: `Shop Owner ${i}`,
        email: `owner${i}@shophub.com`,
        password: hashedPassword,
        role: 'storeOwner',
      }
    });
    storeOwners.push(owner);
  }

  // 3. Create 9 Customers
  const customers = [];
  for (let i = 1; i <= 9; i++) {
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@shophub.com` },
      update: { password: hashedPassword, role: 'customer' },
      create: {
        name: `Customer ${i}`,
        email: `customer${i}@shophub.com`,
        password: hashedPassword,
        role: 'customer',
      }
    });
    customers.push(customer);
  }

  const allUsers = [admin, ...storeOwners, ...customers];

  // 4. Create Store Applications for Store Owners
  for (let i = 0; i < storeOwners.length; i++) {
    const owner = storeOwners[i];
    const existingApp = await prisma.storeApplication.findFirst({ where: { ownerId: owner.id } });
    if (!existingApp) {
      await prisma.storeApplication.create({
        data: {
          ownerId: owner.id,
          storeName: `Premium Store ${i + 1}`,
          businessType: 'Retail',
          address: `Store Location ${i + 1}`,
          documents: 'https://example.com/verification.pdf',
          status: 'approved'
        }
      });
    }
  }

  // 5. Fetch Products from DummyJSON
  console.log("Fetching products from DummyJSON API...");
  const response = await fetch('https://dummyjson.com/products?limit=0');
  const data = await response.json();
  const apiProducts = data.products;

  // Category mapping to exact UI strings
  const categoryMapping = {
    'smartphones': 'Electronics',
    'laptops': 'Electronics',
    'mobile-accessories': 'Electronics',
    'tablets': 'Electronics',
    
    'mens-shirts': 'Clothing',
    'womens-dresses': 'Clothing',
    'tops': 'Clothing',
    'mens-shoes': 'Clothing',
    'womens-shoes': 'Clothing',
    'mens-watches': 'Clothing',
    'womens-watches': 'Clothing',
    'womens-bags': 'Clothing',
    'womens-jewellery': 'Clothing',
    'sunglasses': 'Clothing',

    'furniture': 'Home',
    'home-decoration': 'Home',
    'kitchen-accessories': 'Home',
    'lighting': 'Home',
    'groceries': 'Home', // Fallback to ensure Home has enough items

    'beauty': 'Beauty',
    'fragrances': 'Beauty',
    'skin-care': 'Beauty',

    'sports-accessories': 'Sports',
    'motorcycle': 'Sports',
    'automotive': 'Sports',
  };

  // Authentic Pakistani Brands Mapping
  const pakBrands = {
    "Electronics": ['Dawlance', 'PEL', 'Orient', 'Haier', 'Audionic', 'Infinix', 'Tecno', 'EcoStar'],
    "Clothing": ['Khaadi', 'Sapphire', 'J.', 'Sana Safinaz', 'Gul Ahmed', 'Outfitters', 'Breakout', 'Maria B.'],
    "Home": ['Habitt', 'ChenOne', 'Interwood', 'Bareeze Home', 'Ideas Home', 'Gul Ahmed Home'],
    "Beauty": ['Saeed Ghani', 'Luscious Cosmetics', 'Musarrat Misbah', 'Rivaj UK', 'Kashees', 'J. Fragrances', 'Asim Jofa Beauty'],
    "Sports": ['CA Sports', 'MB Malik', 'Ihsan Sports', 'Talon Sports', 'Forward Sports']
  };

  let categorizedProducts = {
    "Electronics": [],
    "Clothing": [],
    "Home": [],
    "Beauty": [],
    "Sports": []
  };

  for (const p of apiProducts) {
    const targetCat = categoryMapping[p.category];
    if (targetCat) {
      categorizedProducts[targetCat].push(p);
    }
  }

  // Ensure Sports has awesome items (DummyJSON might lack sports sometimes)
  if (categorizedProducts["Sports"].length < 5) {
    categorizedProducts["Sports"].push(
      { title: "Pro Cricket Bat", description: "High-grade English willow cricket bat for professional matches.", price: 150, stock: 20, thumbnail: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=800&q=80", rating: 4.8 },
      { title: "Premium Match Football", description: "FIFA approved match football with seamless surface.", price: 40, stock: 50, thumbnail: "https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=800&q=80", rating: 4.5 },
      { title: "Tennis Racket Carbon Pro", description: "Lightweight carbon fiber tennis racket.", price: 120, stock: 15, thumbnail: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80", rating: 4.6 },
      { title: "Field Hockey Stick", description: "Composite field hockey stick for excellent control.", price: 80, stock: 25, thumbnail: "https://images.unsplash.com/photo-1589801258579-18e091f4ca26?auto=format&fit=crop&w=800&q=80", rating: 4.4 },
      { title: "Boxing Gloves 12oz", description: "Premium leather boxing gloves for sparring and training.", price: 60, stock: 30, thumbnail: "https://images.unsplash.com/photo-1549719386-74dfc47db431?auto=format&fit=crop&w=800&q=80", rating: 4.7 },
      { title: "Badminton Racket Set", description: "Set of 2 lightweight badminton rackets with shuttlecocks.", price: 35, stock: 40, thumbnail: "https://images.unsplash.com/photo-1621570074981-ee6a0145c8b5?auto=format&fit=crop&w=800&q=80", rating: 4.3 },
      { title: "Yoga Mat 8mm", description: "Non-slip thick yoga mat for comfortable workouts.", price: 25, stock: 100, thumbnail: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80", rating: 4.9 },
      { title: "Adjustable Dumbbell Set", description: "20kg adjustable dumbbell set for home gym.", price: 90, stock: 10, thumbnail: "https://images.unsplash.com/photo-1586401700832-612b7a956d79?auto=format&fit=crop&w=800&q=80", rating: 4.8 },
      { title: "Jump Rope Pro", description: "Speed jump rope with adjustable length.", price: 15, stock: 150, thumbnail: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=800&q=80", rating: 4.5 },
      { title: "Volleyball Indoor/Outdoor", description: "Official size and weight volleyball.", price: 30, stock: 45, thumbnail: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80", rating: 4.4 }
    );
  }

  const createdProducts = [];
  let productIndex = 0;
  
  for (const cat of Object.keys(categorizedProducts)) {
    const items = categorizedProducts[cat].slice(0, 30); // Balanced limits
    for (const p of items) {
      const brandsList = pakBrands[cat];
      const randomBrand = brandsList[Math.floor(Math.random() * brandsList.length)];
      const storeOwnerId = storeOwners[productIndex % storeOwners.length].id;
      productIndex++;
      
      const priceInPKR = p.price ? Math.round(p.price * 280) : Math.round(Math.random() * 5000 + 1000);
      
      const titleWithoutBrand = p.title.replace(new RegExp(p.brand, 'gi'), '').trim() || p.title;

      const existingProduct = await prisma.product.findFirst({ where: { name: titleWithoutBrand } });
      if (!existingProduct) {
        const prod = await prisma.product.create({
          data: {
            name: titleWithoutBrand,
            description: (p.description || "Premium quality product from Pakistan.").substring(0, 500),
            category: cat,
            brand: randomBrand,
            price: priceInPKR,
            stock: p.stock || 50,
            imageUrl: p.thumbnail || p.images?.[0] || "https://via.placeholder.com/800",
            storeId: storeOwnerId,
            rating: p.rating || (4 + Math.random()),
            salesCount: Math.floor(Math.random() * 200)
          }
        });
        createdProducts.push(prod);
      } else {
        createdProducts.push(existingProduct);
      }
    }
  }

  console.log(`Successfully seeded ${createdProducts.length} accurate products matching UI categories and Pakistani Brands!`);

  // 6. Create Realistic Orders
  const orderStatuses = ['pending', 'delivered', 'cancelled'];
  const shippingMethods = ['standard', 'express', 'overnight'];
  const createdOrders = [];
  
  for (let i = 0; i < 20; i++) {
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const order = await prisma.order.create({
      data: {
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        customerId: randomCustomer.id,
        shippingAddress: `House ${Math.floor(Math.random()*100)}, Street ${Math.floor(Math.random()*20)}, Lahore, Pakistan`,
        shippingMethod: shippingMethods[Math.floor(Math.random() * shippingMethods.length)],
        total: Math.floor(Math.random() * 20000) + 5000,
      }
    });
    createdOrders.push(order);
  }

  // 7. Order Items
  for (const order of createdOrders) {
    for (let j = 0; j < 3; j++) {
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: randomProduct.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: randomProduct.price,
        }
      });
    }
  }

  // 8. Carts
  for (const user of customers) {
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        isDeleted: false,
      }
    });

    for (let j = 0; j < 3; j++) {
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      await prisma.cartItem.create({
        data: {
          quantity: Math.floor(Math.random() * 2) + 1,
          cartId: cart.id,
          productId: randomProduct.id,
        }
      });
    }
  }

  // 9. Notifications
  for (const user of allUsers) {
    await prisma.notification.create({
      data: {
        message: "Welcome to ShopHub! Explore our newest Pakistani collections.",
        type: "system",
        isRead: false,
        userId: user.id,
      }
    });
  }

  // 10. Wishlists
  for (let i = 0; i < 5; i++) {
    const customer = customers[i];
    await prisma.wishlist.upsert({
      where: { userId: customer.id },
      update: {},
      create: {
        userId: customer.id,
        items: {
          create: [
            { productId: createdProducts[Math.floor(Math.random() * createdProducts.length)].id },
            { productId: createdProducts[Math.floor(Math.random() * createdProducts.length)].id }
          ]
        }
      }
    });
  }

  // 11. Reviews
  for (let i = 0; i < 40; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
    await prisma.review.create({
      data: {
        customerId: customer.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
        title: "Zabardast!",
        body: "Original Pakistani brand product. Delivery was on time and quality is amazing. Highly recommended!",
      }
    });
  }

  // 12. Product Views
  for (let i = 0; i < 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
    await prisma.productView.create({
      data: {
        productId: product.id,
        customerId: customer.id,
      }
    });
  }

  console.log("Database successfully seeded with perfectly mapped Pakistani brands and UI categories!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });