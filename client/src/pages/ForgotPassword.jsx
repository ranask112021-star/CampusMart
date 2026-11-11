import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Could not request a password reset. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Forgot password?</h1>
      <p className="mb-6 text-sm leading-6 text-gray-600">
        Enter the email address on your account. In local development, the reset link appears in the server console.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2"
        />
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Requesting..." : "Send reset link"}
        </button>
      </form>
      <Link to="/login" className="mt-5 inline-block text-sm font-medium text-indigo-600">
        Back to login
      </Link>
    </main>
  );
}
