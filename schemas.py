from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=2)
    price: float = Field(gt=0)
    image_url: Optional[str] = None


class ProductResponse(ProductCreate):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=100)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0, le=100)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: float
    quantity: int
    subtotal: float


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total: float


class PaginatedProducts(BaseModel):
    items: list[ProductResponse]
    page: int
    limit: int
    total: int
    total_pages: int


class OrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    unit_price: float
    quantity: int


class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    created_at: str
    items: list[OrderItemResponse]


class PaginatedOrders(BaseModel):
    items: list[OrderResponse]
    page: int
    limit: int
    total: int
    total_pages: int