// src/pages/Cart.js
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Keranjang Kosong 🛒</h2>
        <p>Belum ada produk di keranjangmu.</p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "12px 30px",
            backgroundColor: "#1a1a2e",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Lanjut Belanja
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px" }}>🛒 Keranjang Belanja</h1>

      {cartItems.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            marginBottom: "15px",
            alignItems: "center",
          }}
        >
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />

          <div style={{ flex: 1 }}>
            <h3>{item.name}</h3>
            <p style={{ color: "#666" }}>
              Rp {item.price.toLocaleString("id-ID")}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              style={{
                padding: "5px 12px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              -
            </button>
            <span
              style={{
                fontWeight: "bold",
                minWidth: "30px",
                textAlign: "center",
              }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              style={{
                padding: "5px 12px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>

          <div style={{ textAlign: "right", minWidth: "120px" }}>
            <p style={{ fontWeight: "bold" }}>
              Rp {(item.price * item.quantity).toLocaleString("id-ID")}
            </p>
            <button
              onClick={() => removeFromCart(item.id)}
              style={{
                color: "#e94560",
                border: "none",
                background: "none",
                cursor: "pointer",
                marginTop: "5px",
              }}
            >
              Hapus
            </button>
          </div>
        </div>
      ))}

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          textAlign: "right",
        }}
      >
        <h2>Total: Rp {totalPrice.toLocaleString("id-ID")}</h2>
        <Link
          to="/checkout"
          style={{
            display: "inline-block",
            marginTop: "15px",
            padding: "15px 40px",
            backgroundColor: "#e94560",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Checkout →
        </Link>
      </div>
    </div>
  );
}

export default Cart;
