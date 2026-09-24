"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";

type CartItem = { productId: string; quantity: 1; product: Product };

type ProductActionsProps = {
  product: Product;
};

export default function ProductActions({ product }: ProductActionsProps) {
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    if (!product.is_available) return;
    const stored = JSON.parse(localStorage.getItem("misi-cart") ?? "[]") as CartItem[];
    if (!stored.some((item) => item.productId === product.id)) {
      localStorage.setItem("misi-cart", JSON.stringify([...stored, { productId: product.id, quantity: 1, product }]));
    }
    setAdded(true);
  };

  return <div className="product-actions"><button className="button button-dark product-add-button" disabled={!product.is_available || added} onClick={addToCart}>{!product.is_available ? "Нема на залиха" : added ? "Додадено ✓" : "Додај во кошничка"}</button>{added && <p className="product-added-message">Парчето е додадено во твојата кошничка.</p>}</div>;
}
