import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", college: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-white";

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={onChange} placeholder="Full name" required className={field} />
        <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email" required className={field} />
        <input name="college" value={form.college} onChange={onChange} placeholder="College" className={field} />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          className={field}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={busy}
          className="w-full py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Please wait..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600">
          Log in
        </Link>
      </p>
    </div>
  );
}