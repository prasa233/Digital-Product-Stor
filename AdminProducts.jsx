import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";


export default function AdminProducts() {
  const [products, setProducts] =
    useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  async function load() {
    const response =
      await api.get(
        "/products?page=1&limit=100"
      );

    setProducts(
      response.data.items
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function createProduct(e) {
    e.preventDefault();

    try {
      await api.post(
        "/admin/products",
        {
          ...form,
          price: Number(form.price),
        }
      );

      toast.success(
        "Product created"
      );

      setForm({
        name: "",
        description: "",
        price: "",
      });

      load();

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Unable to create product"
      );
    }
  }

  async function deleteProduct(id) {
    try {
      await api.delete(
        `/admin/products/${id}`
      );

      toast.success(
        "Product deleted"
      );

      load();

    } catch {
      toast.error(
        "Unable to delete product"
      );
    }
  }

  return (
    <div>
      <h1>Admin Products</h1>

      <form
        onSubmit={createProduct}
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
        />

        <button>
          Create Product
        </button>
      </form>

      {products.map(
        (product) => (
          <div
            key={product.id}
            className="product-card"
          >
            <strong>
              {product.name}
            </strong>

            <span>
              ${product.price}
            </span>

            <button
              onClick={() =>
                deleteProduct(
                  product.id
                )
              }
            >
              Delete
            </button>
          </div>
        )
      )}
    </div>
  );
}