# ShopHub

A full-stack e-commerce platform with three distinct experiences in one app: a **customer storefront**, a **store owner dashboard**, and an **admin control panel**. Built with React, Node.js/Express, Prisma, and Microsoft SQL Server.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![License](https://img.shields.io/badge/license-ISC-blue)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Roles & Access Control](#roles--access-control)
- [Screenshots](#screenshots)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## Overview

ShopHub is a multi-tenant marketplace where customers browse and buy products, store owners manage their own catalogue and orders, and platform admins oversee users and store applications. The frontend is a single React SPA that renders a different layout depending on the logged-in user's role, communicating with a REST API backed by SQL Server via Prisma.

---

## Features

### Customer
- Browse, search, sort, and filter products by category, price, and rating
- Product detail pages with reviews and ratings
- Side-by-side product comparison
- Wishlist management
- Persistent shopping cart with guest-cart merge on login
- Multi-step checkout (Shipping → Payment) with order confirmation
- Order history and order tracking
- In-app notifications
- Onboarding preference questionnaire (categories, budget, brands) that drives a personalised **For You** recommendations feed

### Store Owner
- Dashboard with revenue, order, and stock summaries
- Add, edit, withdraw, and delete products (with image upload)
- Inventory management with low-stock alerts
- Incoming order management and status updates
- Sales report with revenue, top-selling products, and customer insights

### Admin
- Platform-wide metrics (users, orders, products, revenue) with activity and revenue charts
- User directory with search, suspend, and reactivate actions
- Store owner application review and approval/rejection workflow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Tailwind CSS, Recharts, Axios, Lucide Icons |
| Backend | Node.js, Express 5 |
| ORM / Database | Prisma 5, Microsoft SQL Server |
| Auth | JSON Web Tokens (jsonwebtoken), bcrypt / bcryptjs |
| File Uploads | Multer |
| Dev Tooling | Nodemon |

---

## Project Structure

```
ShopHub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Data model (SQL Server)
│   │   ├── migrations/            # Prisma migration history
│   │   └── seed.js                # Seeds users, products, orders, reviews, etc.
│   ├── src/
│   │   ├── controllers/           # Business logic per domain
│   │   ├── routes/                # Express route definitions
│   │   ├── middleware/            # JWT auth + role-based access control
│   │   └── index.js               # App entry point
│   └── uploads/                   # Uploaded product images (served statically)
└── frontend/
    ├── public/
    └── src/
        ├── components/            # Shared UI (sidebars, dialogs, toasts, compare tray)
        ├── contexts/              # Auth and Compare React contexts
        ├── pages/
        │   ├── Auth/              # Login & registration (customer / store owner)
        │   ├── Customer/          # Storefront pages
        │   ├── StoreOwner/        # Store owner dashboard pages
        │   └── Admin/             # Admin dashboard pages
        ├── services/              # Axios service modules per API resource
        └── App.js                 # Route definitions and role-protected layouts
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A running [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server) instance (local, Docker, or Azure SQL)
- npm

---

## Setup & Installation

Clone the repository and install dependencies for both backend and frontend:

```bash
git clone https://github.com/alvirariz/ShopHub.git
cd ShopHub

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside `backend/` with the following keys:

```env
# Connection string for your SQL Server instance
DATABASE_URL="sqlserver://localhost:1433;database=shophub;user=sa;password=YourPassword;trustServerCertificate=true"

# Secret used to sign JSON Web Tokens — use a long, random string
JWT_SECRET="your-long-random-secret"

# Port the API server listens on (defaults to 3000 if omitted)
PORT=3000
```

> The frontend proxies API calls to `http://localhost:3000` via the `proxy` field in `frontend/package.json`. No separate `.env` is required for the frontend.

---

## Database Setup

From the `backend/` directory (with `DATABASE_URL` set):

```bash
# Apply existing migrations
npx prisma migrate deploy

# Generate the Prisma client
npx prisma generate

# (Optional) Seed with demo data
npx prisma db seed
```

> The seed script fetches real product data from [DummyJSON](https://dummyjson.com/) at seed time — an internet connection is required. Products are re-branded with Pakistani retail brands and PKR pricing. The script also generates demo orders, carts, wishlists, reviews, notifications, and store applications.

---

## Running the App

**Backend** (from `backend/`):

```bash
npm run dev    # nodemon — auto-restarts on file changes
# or
npm start      # plain node
```

The API will be available at `http://localhost:3000`. A health check is at `GET /`.

**Frontend** (from `frontend/`, in a separate terminal):

```bash
npm start
```

The React app runs at `http://localhost:3001` and proxies API requests to the backend.

---

## Demo Accounts

After running the seed script, the following accounts are available (all share the same password):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@shophub.com` | `password123` |
| Store Owner | `owner1@shophub.com` … `owner10@shophub.com` | `password123` |
| Customer | `customer1@shophub.com` … `customer9@shophub.com` | `password123` |

Admin and store owner accounts are pre-approved, so you can log in and explore each role immediately.

---

## API Reference

All endpoints are mounted under `/api`. Authenticated routes expect the header:

```
Authorization: Bearer <token>
```

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register-customer` | Public | Register a new customer |
| POST | `/register-store-owner` | Public | Submit a store owner application |
| POST | `/login` | Public | Log in and receive a JWT |
| POST | `/logout` | Authenticated | Log out |

### Products — `/api/products`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/browse` | Public | Browse products |
| GET | `/search` | Public | Search products |
| GET | `/filter` | Public | Filter by category / price / rating |
| GET | `/filter-options` | Public | Get available categories & brands |
| GET | `/compare` | Public | Compare multiple products |
| GET | `/low-stock` | Store Owner | View low-stock alerts |
| GET | `/:productId` | Public | Get product details |
| GET | `/` | Public | Sorted product listing |
| POST | `/` | Store Owner | Add a new product (multipart, image upload) |
| PUT | `/:productId` | Store Owner | Edit a product |
| PUT | `/:productId/withdraw` | Store Owner | Withdraw a product listing |
| PUT | `/:productId/stock` | Store Owner | Update stock quantity |

### Cart — `/api/cart`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Guest / Public | Add item to cart |
| PATCH | `/item/:id` | Guest / Public | Update item quantity |
| DELETE | `/item/:id` | Guest / Public | Remove item |
| GET | `/:userId` | Customer | View saved cart |
| POST | `/merge` | Customer | Merge guest cart after login |

### Orders — `/api/orders`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/checkout` | Customer | Place an order |
| GET | `/history/:userId` | Customer | View order history |
| GET | `/track/:orderId` | Customer | Track order status |
| PUT | `/:orderId/cancel` | Customer | Cancel an order |
| GET | `/view` | Store Owner | View incoming orders |
| GET | `/:orderId` | Store Owner | View order details |
| PUT | `/:orderId/status` | Store Owner | Update order status |

### Wishlist — `/api/wishlist`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/:userId` | Customer | View wishlist |
| POST | `/` | Customer | Add product to wishlist |
| DELETE | `/item/:productId` | Customer | Remove product from wishlist |

### Reviews — `/api/reviews`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/:productId` | Public | Get reviews for a product |
| POST | `/` | Customer | Write a review |

### Notifications — `/api/notifications`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/:userId` | Authenticated | Get a user's notifications |
| PATCH | `/:notifId/read` | Authenticated | Mark a notification as read |

### Preferences — `/api/preferences`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/:userId` | Customer | Save onboarding preferences |
| GET | `/:userId/recommendations` | Customer | Get personalised recommendations |

### Store Owner — `/api/storeowner`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/sales` | Store Owner | Sales report |
| GET | `/insights` | Store Owner | Customer insights |

### Admin — `/api/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/metrics` | Admin | Platform-wide metrics |
| GET | `/users` | Admin | Search / list user accounts |
| GET | `/users/:userId` | Admin | Get a user's details |
| PATCH | `/users/:userId/status` | Admin | Suspend / reactivate a user |
| GET | `/applications` | Admin | List pending store applications |
| GET | `/applications/:applicationId` | Admin | Get application details |
| PATCH | `/applications/:applicationId` | Admin | Approve / reject a store application |

---

## Data Model

Key entities defined in `backend/prisma/schema.prisma`:

| Entity | Description |
|---|---|
| **User** | id, name, email, hashed password, role (`customer` / `storeOwner` / `admin`), active/suspended flags |
| **Product** | Belongs to a store via `storeId`; includes category, brand, price, stock, rating, and soft-delete/withdraw flags |
| **Cart / CartItem** | One cart per user with line items |
| **Order / OrderItem** | Order header plus line items, shipping details, and status |
| **Wishlist / WishlistItem** | One wishlist per user |
| **Review** | Customer ratings and written reviews per product |
| **Notification** | Per-user messages with type and read state |
| **UserPreference** | Onboarding answers (categories, budget) stored as JSON; drives the recommendations feed |
| **StoreApplication** | Store owner registration request awaiting admin approval |
| **ProductView** | Tracks which products a customer has viewed; used for recommendations |

---

## Roles & Access Control

Access is enforced server-side via two middleware layers:

1. **`authenticate`** — verifies the JWT, loads the user from the database, and rejects inactive or suspended accounts.
2. **`authorize(...roles)`** (and shorthands `isCustomer`, `isStoreOwner`, `isAdmin`) — restricts a route to one or more roles.

On the frontend, `App.js` defines three route trees — the default storefront layout, `/store-owner/*`, and `/admin/*` — each wrapped in a `ProtectedRoute` that checks the role stored in `localStorage` and redirects unauthorised users to the login page.

---


| Screen | Description |
|---|---|
| Browse Products | Full product grid with filter panel (category, price range, rating, availability) |
| For You Page | Personalised recommendations based on onboarding preferences |
| Shopping Cart | Line items with quantity controls and checkout button |
| Checkout | Two-step flow: Shipping Details → Payment Method |
| Order History | Per-order breakdown with tracking |
| Notifications | In-app notification feed with mark-as-read |
| Store Owner Dashboard | Revenue, orders, and stock summary cards + recent orders table |
| Manage Products | Product list with edit, withdraw, and delete actions |
| Inventory Management | Low-stock table with inline stock update |
| Incoming Orders | Order table with status dropdown for fulfillment |
| Sales & Insights | Revenue metrics, sales breakdown, and customer insights |
| Admin Platform Monitor | Platform-wide metrics, revenue chart, and recent transactions |
| Admin Manage Users | User directory with suspend / reactivate actions |
| Admin Store Applications | Application review and approve / reject workflow |

---

## Documentation

Project planning and specification documents from earlier development phases:

- [Project Phase 1](https://docs.google.com/document/d/1-Q2iscK9Ft3H8cIYkomEG7kcJppwxSDTQzcXMucHKYA/edit?tab=t.0)
- [Project Phase 1.1 — Planning](https://docs.google.com/document/d/1N5EbcWLECxntO-RlZxZkgP8CF3qBxtDo0ZJGXDbyR5Y/edit?tab=t.0)
- [Project Phase 2](https://docs.google.com/document/d/19SzXhBAe1ty-RFnJL1yqD-_QgGGNl8NW_51ADmdk_dE/edit?tab=t.0)

---

## Contributing

This project is currently developed as part of a Software Design & Architecture (SDA) course assignment. Issues and pull requests are welcome — please open an issue describing the change before submitting a PR.
