# Digital Product Store

A full-stack digital product e-commerce application built using **FastAPI, React Vite, PostgreSQL, SQLAlchemy, JWT Authentication, and Stripe Checkout**.

The application supports user authentication, product management, search and pagination, shopping cart management, orders, Stripe test payments, Stripe webhooks, admin functionality, sales reports, toast notifications, and automated backend testing.

## Technology Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* JWT Authentication
* Pytest
* Stripe Python SDK

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* React Toastify

### Payment

* Stripe Checkout
* Stripe Webhooks
* Stripe Test Mode

---

## Features

### Authentication

* User registration
* User login
* JWT authentication
* Protected APIs
* Current user/profile API
* Password hashing
* Duplicate email validation
* Invalid login handling

### Product Management

* Create product
* Update product
* Delete product
* Get product by ID
* Product listing
* Product search
* Pagination
* Admin-only product management

Example:

```text
GET /products?page=1&limit=10&search=python
```

Example response:

```json
{
  "items": [],
  "page": 1,
  "limit": 10,
  "total": 25,
  "total_pages": 3
}
```

### Cart Management

* Add products to cart
* Update quantity
* Remove products
* Clear cart
* View cart
* Calculate cart total
* User-specific cart access

### Stripe Payments

The payment flow is:

```text
React Cart
    ↓
FastAPI
    ↓
Stripe Checkout
    ↓
Customer Payment
    ↓
Stripe Webhook
    ↓
Update Payment
    ↓
Update Order
```

Payment statuses:

```text
PENDING
PAID
FAILED
CANCELLED
```

The frontend success page is not trusted to mark an order as paid. Payment status is updated through the Stripe webhook.

### Orders

* View user orders
* View order details
* View payment status
* Order pagination
* User-specific order authorization

Example:

```text
GET /orders?page=1&limit=5
```

### Admin

Administrators can:

* Create products
* Edit products
* Delete products
* View orders
* View sales statistics

Dashboard statistics include:

* Total Products
* Total Orders
* Paid Orders
* Total Revenue

### Reports

The backend includes SQL-based reports such as:

* Total revenue
* Most purchased products
* Number of orders per user
* Products that have never been purchased

### Notifications

React Toastify is used for user notifications.

Examples:

```text
Product added to cart
Product removed
Login successful
Payment successful
Invalid credentials
Payment failed
Something went wrong
```

Browser `alert()` is not used.

---

# Database Design

The application uses PostgreSQL with SQLAlchemy.

Main tables:

```text
users
products
carts
cart_items
orders
order_items
payments
```

Relationships:

```text
User
 ├── Cart
 │    └── CartItem
 │          └── Product
 │
 └── Orders
      └── OrderItems
            └── Product
      └── Payment
```

---

# Project Structure

```text
Digital Product Stor/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── dependencies.py
│   │   ├── seed.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── products.py
│   │   │   ├── cart.py
│   │   │   ├── orders.py
│   │   │   ├── payments.py
│   │   │   └── admin.py
│   │   └── services/
│   │       └── stripe_service.py
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_api.py
│   │
│   ├── .env
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── App.jsx
│
└── README.md
```

---

# Backend Setup

## 1. Navigate to backend

Windows:

```cmd
cd "C:\Users\petaprasanth\Downloads\Digital Product Stor\backend"
```

## 2. Create virtual environment

```cmd
python -m venv venv
```

Activate:

```cmd
venv\Scripts\activate
```

## 3. Install dependencies

```cmd
pip install -r requirements.txt
```

If dependencies are not yet installed:

```cmd
pip install fastapi uvicorn sqlalchemy psycopg[binary] pydantic pydantic-settings python-jose[cryptography] pwdlib python-multipart stripe pytest httpx
```

## 4. Configure PostgreSQL

Create a PostgreSQL database named:

```text
digital_store
```

Configure the database URL in `.env`.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/digital_store
```

---

# Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/digital_store

SECRET_KEY=change-this-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

FRONTEND_URL=http://localhost:5173
```

Never commit the real `.env` file.

---

# `.env.example`

The repository should contain:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/digital_store

SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

FRONTEND_URL=http://localhost:5173
```

---

# Run Backend

From the `backend` directory:

```cmd
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

# Frontend Setup

Navigate to the frontend directory:

```cmd
cd ..\frontend
```

Install packages:

```cmd
npm install
```

Run development server:

```cmd
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Frontend Pages

The application provides:

```text
/login
/register
/products
/products/:id
/cart
/orders
/admin/products
/admin/orders
```

---

# Stripe Test Mode

Stripe is configured using test-mode credentials.

Required environment variables:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

The application creates a Stripe Checkout Session from the cart.

Payment status is updated from Stripe webhook events.

Example flow:

```text
Cart
 ↓
Create Checkout Session
 ↓
Stripe Checkout
 ↓
Payment
 ↓
Webhook
 ↓
Payment Status
 ↓
Order Status
```

For local webhook testing, configure Stripe CLI to forward events to:

```text
http://127.0.0.1:8000/payments/webhook
```

---

# API Examples

## Authentication

```text
POST /auth/register
POST /auth/login
GET /users/me
```

## Products

```text
POST /products
GET /products
GET /products/{id}
PUT /products/{id}
DELETE /products/{id}
```

Pagination:

```text
GET /products?page=1&limit=10&search=python
```

## Cart

```text
GET /cart
POST /cart/items
PUT /cart/items/{item_id}
DELETE /cart/items/{item_id}
DELETE /cart
```

## Payments

```text
POST /payments/create-checkout-session
POST /payments/webhook
```

## Orders

```text
GET /orders?page=1&limit=5
GET /orders/{order_id}
```

## Admin

```text
GET /admin/products
GET /admin/orders
GET /admin/stats
```

---

# Testing

Backend tests are implemented using Pytest.

Run:

```cmd
cd backend
pytest -v
```

Tests cover:

* User registration
* User login
* Invalid login
* Product creation
* Product listing
* Product pagination
* Cart operations
* Order/payment functionality
* Unauthorized access

---

# Validation and Error Handling

The API handles:

* Duplicate email
* Invalid login
* Invalid product
* Invalid quantity
* Empty cart checkout
* Unauthorized access
* Invalid order access
* Stripe errors
* Invalid Stripe webhook signatures

HTTP status codes include:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
40
```
