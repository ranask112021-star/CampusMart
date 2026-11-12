import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import useCart from "../context/useCart";
import demoBooks from "../data/demoBooks";
import demoListings from "../data/demoListings";

const demoItems = [...demoBooks, ...demoListings];

export default function Cart() {
  const { listingIds, removeItem } = useCart();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const demos = listingIds
      .map((id) => demoItems.find((item) => item._id === id))
      .filter(Boolean);
    const realIds = listingIds.filter((id) => !id.startsWith("demo-"));
    Promise.all(realIds.map((id) => api.get(`/listings/${id}`)))
      .then((responses) => {
        if (active) {
          setItems([...demos, ...responses.map((response) => response.data)].sort(
            (a, b) => listingIds.indexOf(a._id) - listingIds.indexOf(b._id)
          ));
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Could not load your cart.");
      })
    return () => {
      active = false;
    };
  }, [listingIds]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!listingIds.length ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link to="/" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Browse listings
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 divide-y rounded-xl border border-gray-200 bg-white">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 p-4">
                {item.images?.[0]?.url && (
                  <img src={item.images[0].url} alt={item.title} className="h-20 w-20 rounded-lg bg-gray-50 object-contain" />
                )}
                <div className="min-w-0 flex-1">
                  {item.isDemo ? (
                    <p className="font-semibold text-gray-900">{item.title}</p>
                  ) : (
                    <Link to={`/listing/${item._id}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                      {item.title}
                    </Link>
                  )}
                  <p className="mt-1 text-sm text-gray-500">{item.category} · {item.location || "Campus"}</p>
                  <p className="mt-1 font-bold text-indigo-600">Rs {item.price}</p>
                  {item.isDemo && <p className="mt-1 text-xs text-amber-700">Sample item · local demo checkout only</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item._id)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5">
            <div>
              <p className="text-sm text-gray-500">Cart total</p>
              <p className="text-xl font-bold text-gray-900">Rs {total}</p>
              <p className="mt-1 text-xs text-gray-500">Cash on delivery · no online payment is collected</p>
            </div>
            <Link to="/checkout" className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              Continue to checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
