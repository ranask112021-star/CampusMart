import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../api";

const addressText = (address = {}) =>
  [
    address.addressLine,
    address.locality,
    address.landmark && `Near ${address.landmark}`,
    address.campus,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

export default function OrderReceipt() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(() => {
    const navigationOrder = location.state?.order;
    if (navigationOrder?._id === orderId || navigationOrder?.id === orderId) return navigationOrder;
    if (/^[a-f\d]{24}$/i.test(orderId)) return null;
    try {
      const demoOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]");
      return Array.isArray(demoOrders) ? demoOrders.find((entry) => entry.id === orderId) || null : null;
    } catch (loadError) {
      console.error("Could not read the saved receipt.", loadError);
      return null;
    }
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (order && (order._id === orderId || order.id === orderId)) return undefined;
    if (!/^[a-f\d]{24}$/i.test(orderId)) return undefined;

    api.get(`/orders/${orderId}`)
      .then(({ data }) => {
        if (active) setOrder(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Could not load the receipt.");
      });

    return () => {
      active = false;
    };
  }, [order, orderId, location.state]);

  const orderMatchesRoute = order && (order._id === orderId || order.id === orderId);
  const receiptError = error || (!orderMatchesRoute && !/^[a-f\d]{24}$/i.test(orderId) ? "Receipt not found." : "");
  if (receiptError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{receiptError}</p>
        <Link to="/orders" className="mt-4 inline-block text-sm font-semibold text-indigo-600">Go to orders</Link>
      </main>
    );
  }
  if (!orderMatchesRoute) return <p className="p-8 text-center text-gray-500">Loading receipt...</p>;

  const id = order._id || order.id;
  const total = order.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="font-semibold text-emerald-700">Order placed successfully</p>
        <button type="button" onClick={() => window.print()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          Print / Save receipt
        </button>
      </div>
      <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="flex flex-wrap justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">CampusMart</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Order receipt</h1>
          </div>
          <div className="text-left text-sm sm:text-right">
            <p className="font-semibold text-gray-900">Order #{id.slice(-8).toUpperCase()}</p>
            <p className="mt-1 text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </header>

        {order.isDemo && (
          <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Demo receipt only. No seller was notified and no delivery or payment will take place.
          </p>
        )}

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Deliver to</h2>
            <p className="mt-2 font-semibold text-gray-900">{order.deliveryAddress.recipientName}</p>
            <p className="mt-1 text-sm text-gray-600">{order.deliveryAddress.phone}</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">{addressText(order.deliveryAddress)}</p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Payment</h2>
            <p className="mt-2 font-semibold text-gray-900">Cash on delivery</p>
            <p className="mt-1 text-sm text-gray-600">Payment status: {order.paymentStatus === "paid" ? "Paid" : "Pending"}</p>
            <p className="mt-1 text-sm text-gray-600">Delivery status: {order.items.map((item) => item.status).join(", ")}</p>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Items</h2>
          <div className="mt-3 divide-y border-y border-gray-200">
            {order.items.map((item) => (
              <div key={item.listing} className="flex items-center gap-3 py-3">
                {item.image && <img src={item.image} alt="" className="h-14 w-14 rounded-lg bg-gray-50 object-contain" />}
                <p className="min-w-0 flex-1 font-medium text-gray-800">{item.title}</p>
                <p className="font-semibold text-gray-900">Rs {item.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-lg font-bold text-gray-900">
            <span>Total due on delivery</span><span>Rs {total}</span>
          </div>
        </section>
      </article>
      <div className="mt-5 flex gap-3 print:hidden">
        <Link to="/orders" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Track order</Link>
        <Link to="/" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Continue browsing</Link>
      </div>
    </main>
  );
}
