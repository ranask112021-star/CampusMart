import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login", { state: { message: "Your password has been reset. Please log in." } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset your password. Request a new link and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Set a new password</h1>
      <p className="mb-6 text-sm text-gray-600">Choose a password with at least 6 characters.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          minLength={6}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          minLength={6}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2"
        />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Updating..." : "Reset password"}
        </button>
      </form>
      <Link to="/login" className="mt-5 inline-block text-sm font-medium text-indigo-600">
        Back to login
      </Link>
    </main>
  );
}
