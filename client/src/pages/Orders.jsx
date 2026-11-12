import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const stages = ["placed", "confirmed", "dispatched", "delivered"];
const stageLabels = {
  placed: "Placed",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [sellingOrders, setSellingOrders] = useState([]);
  const [error, setError] = useState("");
  const [busyItem, setBusyItem] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const [buyerResponse, sellerResponse] = await Promise.all([
        api.get("/orders"),
        api.get("/orders/selling"),
      ]);
      const demoOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]");
      if (!Array.isArray(demoOrders)) throw new Error("Saved demo orders are invalid.");
      setOrders([...demoOrders, ...buyerResponse.data]);
      setSellingOrders(sellerResponse.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load orders.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/orders"), api.get("/orders/selling")])
      .then(([buyerResponse, sellerResponse]) => {
        if (active) {
          const demoOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]");
          if (!Array.isArray(demoOrders)) throw new Error("Saved demo orders are invalid.");
          setOrders([...demoOrders, ...buyerResponse.data]);
          setSellingOrders(sellerResponse.data);
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Could not load orders.");
      });
    return () => {
      active = false;
    };
  }, []);

  const updateStatus = async (orderId, listingId, status) => {
    const key = `${orderId}:${listingId}`;
    setBusyItem(key);
    setError("");
    try {
      await api.put(`/orders/${orderId}/items/${listingId}/status`, { status });
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update order status.");
    } finally {
      setBusyItem("");
    }
  };

  const renderOrder = (order, mode) => {
    const orderId = order._id || order.id;
    return (
    <article key={`${mode}-${orderId}`} className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900">Order {orderId.slice(-8).toUpperCase()}</h3>
          <p className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          {mode === "selling" && <p className="mt-1 text-sm text-gray-600">Buyer: {order.buyer?.name}</p>}
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          Cash on Delivery · Payment pending
        </span>
      </div>
      {order.isDemo && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Sample checkout only. No seller was notified and no delivery will take place.
        </p>
      )}
      {mode === "buying" && (
        <Link to={`/receipt/${orderId}`} state={{ order }} className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          View receipt
        </Link>
      )}
      <div className="mt-4 divide-y">
        {order.items.map((item) => {
          const currentIndex = stages.indexOf(item.status);
          const key = `${orderId}:${item.listing}`;
          const nextSellerStatus = item.status === "placed" ? "confirmed" : item.status === "confirmed" ? "dispatched" : null;
          const canConfirmDelivery = !order.isDemo && mode === "buying" && item.status === "dispatched";
          return (
            <div key={item.listing} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                {item.image && <img src={item.image} alt="" className="h-14 w-14 rounded-lg bg-gray-50 object-contain" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-indigo-600">Rs {item.price}</p>
                </div>
                {mode === "buying" && <p className="text-xs text-gray-500">Seller: {item.seller?.name}</p>}
              </div>
              <ol className="mt-4 grid grid-cols-4 gap-1">
                {stages.map((stage, index) => (
                  <li key={stage} className={`border-t-2 pt-2 text-[10px] sm:text-xs ${index <= currentIndex ? "border-indigo-600 font-semibold text-indigo-700" : "border-gray-200 text-gray-400"}`}>
                    {stageLabels[stage]}
                  </li>
                ))}
              </ol>
              {!order.isDemo && mode === "selling" && nextSellerStatus && (
                <button
                  type="button"
                  disabled={busyItem === key}
                  onClick={() => updateStatus(orderId, item.listing, nextSellerStatus)}
                  className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {busyItem === key ? "Updating..." : nextSellerStatus === "confirmed" ? "Confirm order" : "Mark as dispatched"}
                </button>
              )}
              {canConfirmDelivery && (
                <button
                  type="button"
                  disabled={busyItem === key}
                  onClick={() => updateStatus(orderId, item.listing, "delivered")}
                  className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {busyItem === key ? "Updating..." : "Confirm delivery"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        <p className="font-semibold text-gray-800">Delivery address</p>
        <p>{order.deliveryAddress.recipientName} · {order.deliveryAddress.phone}</p>
        <p>{[order.deliveryAddress.addressLine, order.deliveryAddress.locality, order.deliveryAddress.landmark, order.deliveryAddress.campus, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.postalCode].filter(Boolean).join(", ")}</p>
      </div>
    </article>
    );
  };

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Orders & tracking</h1>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">My purchases</h2>
        {orders.length ? <div className="space-y-4">{orders.map((order) => renderOrder(order, "buying"))}</div> : <p className="rounded-lg bg-white p-5 text-sm text-gray-500">You have not placed any orders yet.</p>}
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Orders for my listings</h2>
        {sellingOrders.length ? <div className="space-y-4">{sellingOrders.map((order) => renderOrder(order, "selling"))}</div> : <p className="rounded-lg bg-white p-5 text-sm text-gray-500">No one has ordered your listings yet.</p>}
      </section>
    </main>
  );
}
