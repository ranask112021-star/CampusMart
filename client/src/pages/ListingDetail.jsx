import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import useCart from "../context/useCart";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { listingIds, addItem } = useCart();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/listings/${id}`)
      .then((res) => setItem(res.data))
      .catch((err) => setError(err.response?.data?.message || "Listing nahi mili"));
  }, [id]);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!item) return <p className="p-6 text-gray-500">Loading...</p>;

  const isOwner = user && item.seller?._id === user.id;
  const inCart = listingIds.includes(item._id);
  const images = item.images || [];

  const markSold = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/listings/${id}`, { status: "sold" });
      setItem({ ...item, status: data.status });
    } catch (err) {
      setError(err.response?.data?.message || "Update nahi hua");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Yeh listing delete kar dein?")) return;
    setBusy(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Delete nahi hua");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8">
      <div>
        <div className="h-80 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
          {images[active] ? (
            <img src={images[active].url} alt={item.title} className="h-full w-full object-contain" />
          ) : (
            <span className="text-gray-400">No photo</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.map((img, i) => (
              <img
                key={img.url}
                src={img.url}
                alt=""
                onClick={() => setActive(i)}
                className={`h-16 w-16 object-cover rounded-lg border cursor-pointer ${
                  i === active ? "border-indigo-600" : "border-gray-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <p className="text-3xl font-bold text-indigo-600 mt-2">Rs {item.price}</p>
        <div className="flex gap-2 mt-3 text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded">{item.category}</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{item.condition}</span>
          {item.status === "sold" && <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Sold</span>}
        </div>
        <p className="text-sm text-gray-600 mt-4 whitespace-pre-line">{item.description || "Description nahi di gayi."}</p>
        <p className="text-sm text-gray-500 mt-3">Pickup: {item.location || "Campus"}</p>

        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg text-sm">
          <p className="font-semibold">{item.seller?.name}</p>
          <p className="text-gray-500">{item.seller?.college || "College not set"}</p>
        </div>

        <div className="mt-5 flex gap-3">
          {isOwner ? (
            <>
              {item.status !== "sold" && (
                <button
                  onClick={markSold}
                  disabled={busy}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-60"
                >
                  Mark as sold
                </button>
              )}
              <button
                onClick={remove}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                Delete
              </button>
            </>
          ) : item.status === "sold" ? (
            <p className="text-gray-500">Yeh item bik chuka hai.</p>
          ) : user ? (
            <>
              <button
                type="button"
                onClick={() => addItem(item._id)}
                disabled={inCart}
                className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
              >
                {inCart ? "Added to cart" : "Add to cart"}
              </button>
              <button
                type="button"
                onClick={() => {
                  addItem(item._id);
                  navigate("/checkout");
                }}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Buy now
              </button>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              Login to buy
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}