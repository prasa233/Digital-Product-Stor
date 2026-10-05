import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";


export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] =
    useState(null);

  const [quantity, setQuantity] =
    useState(1);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch(() => {
        toast.error(
          "Product not found"
        );
      });
  }, [id]);

  async function addToCart() {
    try {
      await api.post(
        "/cart/items",
        {
          product_id: Number(id),
          quantity,
        }
      );

      toast.success(
        "Product added to cart"
      );

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Unable to add product"
      );
    }
  }

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>

      <p>{product.description}</p>

      <h2>
        ${product.price.toFixed(2)}
      </h2>

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) =>
          setQuantity(
            Number(e.target.value)
          )
        }
      />

      <button onClick={addToCart}>
        Add to Cart
      </button>
    </div>
  );
}