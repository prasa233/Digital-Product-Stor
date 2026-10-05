import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";


export default function Orders() {
  const [orders, setOrders] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  async function loadOrders() {
    try {
      const response =
        await api.get(
          `/orders?page=${page}&limit=5`
        );

      setOrders(
        response.data.items
      );

      setTotalPages(
        response.data.total_pages
      );

    } catch {
      toast.error(
        "Unable to load orders"
      );
    }
  }

  useEffect(() => {
    loadOrders();
  }, [page]);

  return (
    <div>
      <h1>My Orders</h1>

      {orders.map((order) => (
        <div
          className="order-card"
          key={order.id}
        >
          <h3>
            Order #{order.id}
          </h3>

          <p>
            Total: $
            {order.total_amount.toFixed(2)}
          </p>

          <p>
            Status: {order.status}
          </p>

          {order.items.map(
            (item) => (
              <div
                key={item.product_id}
              >
                {item.product_name} ×{" "}
                {item.quantity}
              </div>
            )
          )}
        </div>
      ))}

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() =>
            setPage(page - 1)
          }
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={
            page === totalPages
          }
          onClick={() =>
            setPage(page + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}