import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const categories = ["Books", "Electronics", "Cycles", "Furniture", "Clothing", "Hostel items", "Other"];
const conditions = ["New", "Like new", "Good", "Fair"];
const fieldClass = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-white";

export default function SellItem() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Books",
    condition: "Good",
    location: "",
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (images.length < 1 || images.length > 4) {
      setError("Choose between 1 and 4 photos.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    images.forEach((image) => data.append("images", image));

    setBusy(true);
    try {
      await api.post("/listings", data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not publish the listing. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="max-w-xl mx-auto px-4 py-10 text-gray-500">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Sell an item</h1>
        <p className="text-gray-600">
          Please <Link to="/login" className="text-indigo-600">log in</Link> or{" "}
          <Link to="/register" className="text-indigo-600">create an account</Link> to list a book.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Sell an item</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Book or item title"
          required
          className={fieldClass}
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          rows={3}
          className={fieldClass}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Price (Rs)"
          required
          className={fieldClass}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={fieldClass}
        >
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <select
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
          className={fieldClass}
        >
          {conditions.map((condition) => <option key={condition}>{condition}</option>)}
        </select>
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Campus or location"
          className={fieldClass}
        />
        <div>
          <label htmlFor="listing-images" className="block text-sm font-medium mb-1">Photos (1–4, up to 5 MB each)</label>
          <input
            id="listing-images"
            type="file"
            accept="image/*"
            multiple
            required
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full text-sm"
          />
        </div>
        {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={busy}
          className="w-full py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Publishing..." : "Publish listing"}
        </button>
      </form>
    </div>
  );
}
