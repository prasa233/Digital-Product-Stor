from math import ceil

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_admin_user
from ..models import (
    User,
    Product,
    Order,
    OrderItem,
    OrderStatus
)
from ..schemas import ProductCreate


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.post("/products", status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    product = Product(**data.model_dump())

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.put("/products/{product_id}")
def update_product(
    product_id: int,
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    for key, value in data.model_dump().items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.is_active = False

    db.commit()

    return {"message": "Product deleted"}


@router.get("/stats")
def statistics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    total_products = db.query(Product).filter(
        Product.is_active == True
    ).count()

    total_orders = db.query(Order).count()

    paid_orders = db.query(Order).filter(
        Order.status == OrderStatus.PAID
    ).count()

    revenue = db.query(
        func.coalesce(
            func.sum(Order.total_amount),
            0
        )
    ).filter(
        Order.status == OrderStatus.PAID
    ).scalar()

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "paid_orders": paid_orders,
        "total_revenue": float(revenue)
    }


@router.get("/reports/most-purchased")
def most_purchased(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    rows = (
        db.query(
            OrderItem.product_id,
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("quantity")
        )
        .join(Order)
        .filter(Order.status == OrderStatus.PAID)
        .group_by(
            OrderItem.product_id,
            OrderItem.product_name
        )
        .order_by(
            func.sum(OrderItem.quantity).desc()
        )
        .all()
    )

    return [
        {
            "product_id": row.product_id,
            "product_name": row.product_name,
            "quantity": row.quantity
        }
        for row in rows
    ]


@router.get("/reports/never-purchased")
def never_purchased(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    rows = (
        db.query(Product)
        .outerjoin(
            OrderItem,
            Product.id == OrderItem.product_id
        )
        .filter(OrderItem.id == None)
        .all()
    )

    return rows