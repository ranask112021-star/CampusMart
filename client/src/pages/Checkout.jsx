import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import useCart from "../context/useCart";
import demoBooks from "../data/demoBooks";
import demoListings from "../data/demoListings";

const demoItems = [...demoBooks, ...demoListings];

const initialAddress = {
  recipientName: "",
  phone: "",
  addressLine: "",
  locality: "",
  landmark: "",
  campus: "",
  city: "",
  state: "",
  postalCode: "",
};

export default function Checkout() {
  const { listingIds, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orderPlaced = useRef(false);
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("deliveryAddress") || "null");
      return {
        ...initialAddress,
        ...saved,
        recipientName: saved?.recipientName || user?.name || "",
      };
    } catch (error) {
      console.error("Could not load the saved delivery address.", error);
      return { ...initialAddress, recipientName: user?.name || "" };
    }
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!listingIds.length && !orderPlaced.current) {
      navigate("/cart", { replace: true });
      return () => {
        active = false;
      };
    }
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
        if (active) setError(err.response?.data?.message || "Could not load the items in your cart.");
      });
    return () => {
      active = false;
    };
  }, [listingIds, navigate]);

  const onChange = (event) => {
    setAddress({ ...address, [event.target.name]: event.target.value });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      localStorage.setItem("deliveryAddress", JSON.stringify(address));
      const demoIds = listingIds.filter((id) => id.startsWith("demo-"));
      let order;
      if (demoIds.length) {
        if (demoIds.length !== listingIds.length) {
          setError("Place sample items and real listings in separate orders.");
          return;
        }
        order = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          items: items.map(({ _id, title, price, images }) => ({
            listing: _id,
            title,
            price,
            image: images?.[0]?.url || "",
            status: "placed",
          })),
          deliveryAddress: address,
          paymentMethod: "cash_on_delivery",
          isDemo: true,
        };
        const savedOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]");
        localStorage.setItem("demoOrders", JSON.stringify([order, ...savedOrders]));
      } else {
        const { data } = await api.post("/orders", { listingIds, deliveryAddress: address });
        order = data;
      }
      orderPlaced.current = true;
      clearCart();
      navigate(`/receipt/${order._id || order.id}`, { replace: true, state: { order } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not place your order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const fieldClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[1fr_0.8fr]">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Delivery address</h1>
        <p className="mt-1 text-sm text-gray-500">Enter the address where your order should be delivered.</p>
        <form onSubmit={onSubmit} className="mt-5 space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Full name
              <input autoComplete="name" name="recipientName" value={address.recipientName} onChange={onChange} required maxLength={80} className={`${fieldClass} mt-1`} />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Mobile number
              <input autoComplete="tel" name="phone" type="tel" value={address.phone} onChange={onChange} required maxLength={20} placeholder="e.g. 98765 43210" className={`${fieldClass} mt-1`} />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Flat, house no., building, street
            <input autoComplete="street-address" name="addressLine" value={address.addressLine} onChange={onChange} required minLength={5} maxLength={200} className={`${fieldClass} mt-1`} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Area / locality
              <input autoComplete="address-level3" name="locality" value={address.locality} onChange={onChange} required maxLength={100} className={`${fieldClass} mt-1`} />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Landmark (optional)
              <input name="landmark" value={address.landmark} onChange={onChange} maxLength={100} className={`${fieldClass} mt-1`} />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Campus / hostel (optional)
            <input name="campus" value={address.campus} onChange={onChange} maxLength={100} className={`${fieldClass} mt-1`} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">
              Town / city
              <input autoComplete="address-level2" name="city" value={address.city} onChange={onChange} required maxLength={80} className={`${fieldClass} mt-1`} />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              State
              <input autoComplete="address-level1" name="state" value={address.state} onChange={onChange} required maxLength={80} className={`${fieldClass} mt-1`} />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              PIN code
              <input autoComplete="postal-code" name="postalCode" value={address.postalCode} onChange={onChange} required maxLength={12} className={`${fieldClass} mt-1`} />
            </label>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="font-semibold text-indigo-900">Payment: Cash on Delivery</p>
            <p className="mt-1 text-sm text-indigo-800">
              Pay the seller when the order is delivered. No online payment is collected.
              {items.some((item) => item.isDemo) && " Sample items create a local demo order only; no seller receives it."}
            </p>
          </div>
          {items.some((item) => item.isDemo) && items.some((item) => !item.isDemo) && (
            <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Place sample items and real listings in separate orders.
            </p>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy || !items.length || (items.some((item) => item.isDemo) && items.some((item) => !item.isDemo))} className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {busy ? "Placing order..." : "Place order"}
          </button>
        </form>
      </section>

      <aside>
        <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
        <div className="mt-5 space-y-3 rounded-xl border border-gray-200 bg-white p-5">
          {items.map((item) => (
            <div key={item._id} className="flex justify-between gap-4 text-sm">
              <span className="text-gray-600">{item.title}</span>
              <span className="font-semibold text-gray-900">Rs {item.price}</span>
            </div>
          ))}
          {items.length > 0 && (
            <div className="flex justify-between border-t pt-3 font-bold text-gray-900">
              <span>Total due on delivery</span><span>Rs {total}</span>
            </div>
          )}
          <Link to="/cart" className="inline-block pt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Back to cart
          </Link>
        </div>
      </aside>
    </main>
  );
}
