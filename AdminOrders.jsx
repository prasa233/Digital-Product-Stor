import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";


export default function AdminOrders() {
  const [stats, setStats] =
    useState(null);

  useEffect(() => {
    api.get("/admin/stats")
      .then((response) => {
        setStats(response.data);
      })
      .catch(() => {
        toast.error(
          "Unable to load statistics"
        );
      });
  }, []);

  if (!stats) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div>
          <h3>Total Products</h3>
          <strong>
            {stats.total_products}
          </strong>
        </div>

        <div>
          <h3>Total Orders</h3>
          <strong>
            {stats.total_orders}
          </strong>
        </div>

        <div>
          <h3>Paid Orders</h3>
          <strong>
            {stats.paid_orders}
          </strong>
        </div>

        <div>
          <h3>Total Revenue</h3>
          <strong>
            ${stats.total_revenue}
          </strong>
        </div>
      </div>
    </div>
  );
}