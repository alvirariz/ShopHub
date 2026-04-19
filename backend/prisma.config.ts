import "dotenv/config"; // //loads env file
// env file contains db pass and connection string
import { defineConfig } from "prisma/config"; 

export default defineConfig({  // to run any npx prisma command 
  schema: "prisma/schema.prisma", // tels primsa where to foind schema file
  migrations: {
    path: "prisma/migrations", //tells prisma where to store migration files
    // Migrations-> history of all the changes made to your database tables
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env["DATABASE_URL"], // tells prisma how to connect to prisma
    // by going in .env file where database url= my db pass and login
  },
});