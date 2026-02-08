# Giftiy - Gift Shop Platform
A full-stack e-commerce platform for personalized gift stores. Users can browse and purchase gifts, while store owners can create their own "tents" (stores) to sell products.

## Features
hi
- 🎁 **Multi-Store Platform**: Users can create their own gift stores
- 🛍️ **Product Categories**: Chocolates, Flowers, Mystery Boxes, Custom Gifts
- 🛒 **Shopping Cart**: Persistent cart with customization options
- 💳 **Payment Integration**: Stripe and Cash on Delivery
- ⭐ **Reviews**: Product review and rating system
- 🔐 **Authentication**: JWT-based user authentication
- 📱 **Responsive Design**: Modern, mobile-friendly UI with glassmorphism effects

## Tech Stack

### Backend
- Node.js & Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Stripe Payment Integration

### Frontend
- React 18
- Vite
- React Router
- Axios
- Modern CSS with CSS Variables

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/giftiy"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="your-stripe-key"
```

5. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

5. Start the frontend development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Project Structure

```
Giftiy/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── tent.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── payment.routes.js
│   │   │   └── review.routes.js
│   │   └── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── CartDrawer.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Products.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── TentManagement.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tents (Stores)
- `GET /api/tents` - Get all tents
- `GET /api/tents/:id` - Get tent by ID
- `POST /api/tents` - Create tent (auth required)
- `PUT /api/tents/:id` - Update tent (owner only)
- `DELETE /api/tents/:id` - Delete tent (owner only)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (tent owner only)
- `PUT /api/products/:id` - Update product (tent owner only)
- `DELETE /api/products/:id` - Delete product (tent owner only)

### Orders
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status (tent owner only)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/cod` - Create COD payment

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review (auth required)
- `PUT /api/reviews/:id` - Update review (author only)
- `DELETE /api/reviews/:id` - Delete review (author only)

## Design System

The application uses a modern design system with:
- **Dark Theme**: Premium dark color palette
- **Glassmorphism**: Frosted glass effects
- **Gradients**: Vibrant color gradients
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first approach

## License

MIT
