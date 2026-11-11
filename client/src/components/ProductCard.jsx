export default function ProductCard({ item }) {
  const image = item.images?.[0]?.url;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-950/5">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50/70 p-3">
        {image ? (
          <img
            src={image}
            alt={item.title}
            loading="lazy"
            className={`h-full w-full transition duration-300 group-hover:scale-105 ${
              item.isDemo && item.category === "Books" ? "object-contain" : "object-cover"
            }`}
          />
        ) : (
          <span className="text-sm text-gray-400">No photo available</span>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm backdrop-blur">
          {item.category}
        </span>
        {item.isDemo && (
          <span className="absolute bottom-3 right-3 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
            Demo · estimated price
          </span>
        )}
      </div>
      <div className="p-3.5 sm:p-4">
        <p className="truncate text-sm font-semibold text-gray-900 sm:text-base" title={item.title}>{item.title}</p>
        <p className="mt-1 truncate text-xs text-gray-500">{item.condition || "Good condition"} · {item.location || "Campus"}</p>
        {item.imageCredit && item.imageSource && (
          <p className="mt-1 truncate text-[10px] text-gray-400">
            Photo:{" "}
            <a href={item.imageSource} target="_blank" rel="noreferrer" className="underline decoration-gray-300 underline-offset-2 hover:text-indigo-600">
              {item.imageCredit.split(" · ")[0]}
            </a>
            {item.imageLicenseUrl && (
              <>
                {" · "}
                <a href={item.imageLicenseUrl} target="_blank" rel="noreferrer" className="underline decoration-gray-300 underline-offset-2 hover:text-indigo-600">
                  {item.imageCredit.split(" · ")[1]}
                </a>
              </>
            )}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <p className="text-base font-bold text-indigo-700">Rs {item.price}</p>
          {item.isDemo ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Sample listing
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Available
            </span>
          )}
        </div>
      </div>
    </article>
  );
}