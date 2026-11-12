import { Link, useNavigate } from "react-router-dom";
import useCart from "../context/useCart";

export default function ProductCard({ item }) {
  const image = item.images?.[0]?.url;
  const { listingIds, addItem } = useCart();
  const navigate = useNavigate();
  const inCart = listingIds.includes(item._id);

  const buyNow = () => {
    addItem(item._id);
    navigate("/checkout");
  };

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md">
      {item.isDemo ? (
        <div className="relative flex h-44 items-center justify-center bg-gray-100">
          <img src={image} alt={item.title} className="h-full w-full object-contain" />
          <span className="absolute bottom-2 right-2 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
            Demo · estimated price
          </span>
        </div>
      ) : (
        <Link to={`/listing/${item._id}`} className="block">
          <div className="flex h-44 items-center justify-center bg-gray-100">
            {image ? (
              <img src={image} alt={item.title} className="h-full w-full object-contain" />
            ) : (
              <span className="text-sm text-gray-400">No photo</span>
            )}
          </div>
        </Link>
      )}
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-gray-800" title={item.title}>
          {item.isDemo ? item.title : <Link to={`/listing/${item._id}`}>{item.title}</Link>}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {item.category} · {item.location || "Campus"}
        </p>
        {item.isDemo && item.imageCredit && item.imageSource && (
          <p className="mt-1 truncate text-[10px] text-gray-400">
            Photo:{" "}
            <a href={item.imageSource} target="_blank" rel="noreferrer" className="underline">
              {item.imageCredit.split(" · ")[0]}
            </a>
            {item.imageLicenseUrl && (
              <>
                {" · "}
                <a href={item.imageLicenseUrl} target="_blank" rel="noreferrer" className="underline">
                  {item.imageCredit.split(" · ")[1]}
                </a>
              </>
            )}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="font-bold text-indigo-600">Rs {item.price}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addItem(item._id)}
              disabled={inCart}
              className="rounded-lg border border-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-default disabled:border-emerald-600 disabled:text-emerald-700"
            >
              {inCart ? "Added" : "Add to cart"}
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
