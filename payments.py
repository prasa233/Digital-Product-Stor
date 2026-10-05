import stripe

from ..config import settings
import os

from dotenv import load_dotenv

load_dotenv()
os.getenv("STRIPE_SECRET_KEY")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request
)
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    User,
    Order,
    OrderItem,
    Payment,
    Cart,
    OrderStatus
)
from ..dependencies import get_current_user


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-checkout-session")
def create_checkout_session(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(
        Cart.user_id == user.id
    ).first()

    if not cart or not cart.items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    total = sum(
        item.product.price * item.quantity
        for item in cart.items
    )

    order = Order(
        user_id=user.id,
        total_amount=total,
        status=OrderStatus.PENDING
    )

    db.add(order)
    db.flush()

    line_items = []

    for item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product.id,
            product_name=item.product.name,
            unit_price=item.product.price,
            quantity=item.quantity
        )

        db.add(order_item)

        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": item.product.name
                },
                "unit_amount": int(
                    item.product.price * 100
                )
            },
            "quantity": item.quantity
        })

    payment = Payment(
        order_id=order.id,
        amount=total,
        status=OrderStatus.PENDING
    )

    db.add(payment)

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            customer_email=user.email,
            client_reference_id=str(order.id),
            metadata={
                "order_id": str(order.id),
                "user_id": str(user.id)
            },
            success_url=(
                f"{settings.FRONTEND_URL}"
                "/orders?payment=success"
            ),
            cancel_url=(
                f"{settings.FRONTEND_URL}"
                "/cart?payment=cancelled"
            )
        )

        order.stripe_session_id = session.id

        db.commit()

        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "order_id": order.id
        }

    except stripe.error.StripeError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Stripe payment error"
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    payload = await request.body()

    signature = request.headers.get(
        "stripe-signature"
    )

    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid Stripe webhook"
        )

    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]

        order_id = session.get(
            "metadata",
            {}
        ).get("order_id")

        order = db.query(Order).filter(
            Order.id == int(order_id)
        ).first()

        if order:
            order.status = OrderStatus.PAID

            if order.payment:
                order.payment.status = OrderStatus.PAID
                order.payment.stripe_payment_intent_id = (
                    session.get("payment_intent")
                )

            cart = db.query(Cart).filter(
                Cart.user_id == order.user_id
            ).first()

            if cart:
                for item in cart.items:
                    db.delete(item)

            db.commit()

    elif event_type == "checkout.session.expired":
        session = event["data"]["object"]

        order_id = session.get(
            "metadata",
            {}
        ).get("order_id")

        if order_id:
            order = db.query(Order).filter(
                Order.id == int(order_id)
            ).first()

            if order:
                order.status = OrderStatus.CANCELLED

                if order.payment:
                    order.payment.status = (
                        OrderStatus.CANCELLED
                    )

                db.commit()

    return {"received": True}