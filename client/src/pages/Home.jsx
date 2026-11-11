import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import demoBooks from "../data/demoBooks";
import demoListings from "../data/demoListings";

const categories = ["All", "Books", "Electronics", "Cycles", "Furniture", "Clothing", "Hostel items", "Other"];

export default function Home() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (q.trim()) params.q = q.trim();
        if (category !== "All") params.category = category;
        const { data } = await api.get("/listings", { params, signal: controller.signal });
        const query = q.trim().toLowerCase();
        const localListings = [...demoBooks, ...demoListings].filter((item) => {
          const matchesCategory = category === "All" || item.category === category;
          const matchesSearch = item.title.toLowerCase().includes(query);
          return matchesCategory && matchesSearch;
        });
        setItems([...data.listings, ...localListings]);
        setTotal(data.total + localListings.length);
      } catch {
        if (!controller.signal.aborted) {
          setError("Could not load listings. Please check that the server is running.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, category]);

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 text-white">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-4 -top-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Your campus, your marketplace
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Good finds.
              <span className="block text-indigo-200">Great campus prices.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100/85 sm:text-lg">
              Discover books and everyday essentials from your campus community.
              Buy what you need, sell what you no longer do.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/sell"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-900 shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                Sell an item <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#listings"
                className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse listings
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-indigo-950/20 backdrop-blur-sm sm:p-5">
            <label htmlFor="market-search" className="mb-3 block text-sm font-medium text-indigo-50">
              What are you looking for?
            </label>
            <div className="flex gap-2 rounded-xl bg-white p-2 shadow-lg">
              <span className="flex items-center pl-2 text-gray-400" aria-hidden="true">⌕</span>
              <input
                id="market-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search books, cycles, laptops..."
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="rounded-lg px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
              <span className="text-indigo-100/80">Available to explore</span>
              <span className="font-semibold text-white">{loading ? "…" : `${total} items`}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="listings" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">The campus edit</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Find your next great find
            </h2>
            <p className="mt-2 text-sm text-gray-500">Browse student essentials, all in one place.</p>
          </div>
          {!loading && (
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="text-gray-900">{total}</span> {total === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                category === c
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="aspect-[4/3] animate-pulse bg-gray-100" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
        ) : !error ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600" aria-hidden="true">
              ◇
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No listings found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Try a different search or category, or be the first to list something for your campus.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {(q || category !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setCategory("All");
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear filters
                </button>
              )}
              <Link to="/sell" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                List an item
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}