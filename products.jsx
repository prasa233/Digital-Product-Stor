import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";


export default function Products() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  async function loadProducts() {
    try {
      const response = await api.get(
        `/products?page=${page}&limit=6&search=${search}`
      );

      setProducts(response.data.items);
      setTotalPages(response.data.total_pages);

    } catch {
      toast.error(
        "Unable to load products"
      );
    }
  }

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  return (
    <div>
      <h1>Digital Products</h1>

      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div className="product-grid">
        {products.map((product) => (
          <div
            className="product-card"
            key={product.id}
          >
            <h2>{product.name}</h2>

            <p>{product.description}</p>

            <strong>
              ${product.price.toFixed(2)}
            </strong>

            <Link
              to={`/products/${product.id}`}
            >
              View Product
            </Link>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() =>
            setPage((p) => p - 1)
          }
        >
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((number) => (
          <button
            key={number}
            className={
              page === number
                ? "active"
                : ""
            }
            onClick={() =>
              setPage(number)
            }
          >
            {number}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() =>
            setPage((p) => p + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}