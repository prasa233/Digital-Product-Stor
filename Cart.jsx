import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";


export default function Cart() {
  const [cart, setCart] =
    useState(null);

  async function loadCart() {
    try {
      const response =
        await api.get("/cart");

      setCart(response.data);

    } catch {
      toast.error(
        "Unable to load cart"
      );
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function remove(id) {
    try {
      await api.delete(
        `/cart/items/${id}`
      );

      toast.success(
        "Product removed"
      );

      loadCart();

    } catch {
      toast.error(
        "Unable to remove product"
      );
    }
  }

  async function checkout() {
    if (!cart?.items?.length) {
      toast.error(
        "Your cart is empty"
      );
      return;
    }

    try {
      const response = await api.post(
        "/payments/create-checkout-session"
      );

      window.location.href =
        response.data.checkout_url;

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Payment failed"
      );
    }
  }

  if (!cart) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Cart</h1>

      {cart.items.map((item) => (
        <div
          className="cart-item"
          key={item.id}
        >
          <span>
            {item.product_name}
          </span>

          <span>
            {item.quantity} × $
            {item.price.toFixed(2)}
          </span>

          <button
            onClick={() =>
              remove(item.id)
            }
          >
            Remove
          </button>
        </div>
      ))}

      <h2>
        Total: ${cart.total.toFixed(2)}
      </h2>

      <button onClick={checkout}>
        Checkout
      </button>
    </div>
  );
}