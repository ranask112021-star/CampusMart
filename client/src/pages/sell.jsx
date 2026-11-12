import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const categories = ["Books", "Electronics", "Cycles", "Furniture", "Clothing", "Hostel items", "Other"];
const conditions = ["New", "Like new", "Good", "Fair"];

export default function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "Books",
    condition: "Good",
    location: "",
    description: "",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFiles = (e) => {
    const picked = Array.from(e.target.files).slice(0, 4);
    setFiles(picked);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (files.length === 0) {
      setError("Kam se kam 1 photo daalo");
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      files.forEach((f) => data.append("images", f));
      const res = await api.post("/listings", data);
      navigate(`/listing/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Listing nahi ban payi, dobara try karo");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-white";

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sell an item</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={onChange} placeholder="Title" required className={field} />
        <input
          name="price"
          type="number"
          min="0"
          value={form.price}
          onChange={onChange}
          placeholder="Price (Rs)"
          required
          className={field}
        />
        <div className="grid grid-cols-2 gap-3">
          <select name="category" value={form.category} onChange={onChange} className={field}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select name="condition" value={form.condition} onChange={onChange} className={field}>
            {conditions.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <input
          name="location"
          value={form.location}
          onChange={onChange}
          placeholder="Pickup location (e.g. Hostel B)"
          className={field}
        />
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Description"
          rows={4}
          className={field}
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">Photos (max 4)</label>
          <input type="file" accept="image/*" multiple onChange={onFiles} className="text-sm" />
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((src) => (
                <img key={src} src={src} alt="preview" className="h-20 w-20 object-cover rounded-lg border" />
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={busy}
          className="w-full py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Uploading..." : "Post listing"}
        </button>
      </form>
    </div>
  );
}