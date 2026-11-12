import { useState } from "react";
import CartContext from "./CartContext";

const readCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch (error) {
    console.error("Could not read the saved cart.", error);
    return [];
  }
};

export default function CartProvider({ children }) {
  const [listingIds, setListingIds] = useState(readCart);

  const save = (nextIds) => {
    localStorage.setItem("cart", JSON.stringify(nextIds));
    setListingIds(nextIds);
  };

  const addItem = (id) => {
    if (!listingIds.includes(id)) save([...listingIds, id]);
  };

  const removeItem = (id) => save(listingIds.filter((itemId) => itemId !== id));
  const clearCart = () => save([]);

  return (
    <CartContext.Provider value={{ listingIds, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
