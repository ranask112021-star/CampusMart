import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useCart from "../context/useCart";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { listingIds } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/[0.03] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" aria-label="CampusMart home" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 shadow-lg shadow-indigo-600/20 transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-indigo-600/30">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-8 w-8">
              <path d="M12.5 19.5h23l2.2 20.2H10.3l2.2-20.2Z" fill="white" fillOpacity=".98" />
              <path d="M18 20v-4.1a6 6 0 0 1 12 0V20" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
              <path d="m15.7 12.2 8.3-4 8.3 4-8.3 4-8.3-4Z" fill="#FDE68A" />
              <path d="M19.2 14.2v3.2c2.8 1.8 6.8 1.8 9.6 0v-3.2" stroke="#FDE68A" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M24 24v10" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
              <path d="M19 30.5h10" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="absolute -bottom-3 -right-3 h-7 w-7 rounded-full bg-white/15" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[19px] font-extrabold tracking-tight text-slate-900">
              Campus<span className="text-indigo-600">Mart</span>
            </span>
            <span className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.19em] text-slate-400">
              Campus marketplace
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm sm:gap-2">
          <Link to="/cart" className="rounded-xl px-2.5 py-2 font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 sm:px-3">
            <span className="hidden sm:inline">Cart</span>
            <span className="sm:hidden" aria-label="Cart">Bag</span>
            <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700">
              {listingIds.length}
            </span>
          </Link>
          {user ? (
            <>
              <span className="hidden max-w-28 truncate text-slate-500 lg:inline">Hi, {user.name}</span>
              <Link to="/orders" className="rounded-xl px-2.5 py-2 font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 sm:px-3">
                Orders
              </Link>
              <Link to="/sell" className="rounded-xl bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 sm:px-4">
                <span className="hidden sm:inline">Sell an item</span>
                <span className="sm:hidden">Sell</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 px-2.5 py-2 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:px-3"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-2.5 py-2 font-semibold text-slate-600 transition hover:bg-slate-100 sm:px-3">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 sm:px-4"
              >
                Join free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}