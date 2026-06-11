import { Grid2X2, LayoutList, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import type { Category, Product } from "@/types/customer";
import { discountPercent, finalPrice, formatMoney } from "../utils";
import { EmptyState } from "../components/EmptyState";
import { ProductCard } from "../components/ProductCard";

const PRODUCTS_PER_PAGE = 6;

export const ProductListView = ({ categories, onAdd, products }: { categories: Category[]; onAdd: (product: Product) => void; products: Product[] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const discountOnly = searchParams.get("discount") === "1";
  const [categoryId, setCategoryId] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [grid, setGrid] = useState(true);
  const [page, setPage] = useState(1);
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setPage(1);
  }, [searchParams]);
  const filtered = useMemo(() => products.filter((product) => {
    const matchQuery = product.tenSanPham.toLowerCase().includes(query.toLowerCase());
    const matchCategory = categoryId === "all" || String(product.maDanhMuc) === categoryId;
    const matchDiscount = !discountOnly || discountPercent(product) > 0;
    return matchQuery && matchCategory && matchDiscount && finalPrice(product) <= maxPrice;
  }), [categoryId, discountOnly, maxPrice, products, query]);
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageProducts = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-lg bg-white p-6 ring-1 ring-slate-200">
        <h2 className="mb-6 text-sm font-black uppercase tracking-wide text-slate-500">Danh mục</h2>
        <FilterOption checked={categoryId === "all"} label="Tất cả sản phẩm" onChange={() => { setCategoryId("all"); resetPage(); }} />
        {categories.map((category) => <FilterOption checked={categoryId === String(category.maDanhMuc)} key={category.maDanhMuc} label={category.tenDanhMuc} onChange={() => { setCategoryId(String(category.maDanhMuc)); resetPage(); }} />)}
        <h2 className="mb-4 mt-8 text-sm font-black uppercase tracking-wide text-slate-500">Khoảng giá</h2>
        <input className="w-full accent-[#0879a8]" max={10000000} min={0} onChange={(event) => { setMaxPrice(Number(event.target.value)); resetPage(); }} step={100000} type="range" value={maxPrice} />
        <div className="mt-3 flex justify-between text-sm font-semibold text-slate-700"><span>0đ</span><span>{formatMoney(maxPrice)}</span></div>
        <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-100 px-4 py-4 font-bold text-slate-600" onClick={() => { setCategoryId("all"); setQuery(""); setSearchParams({}); setMaxPrice(10000000); resetPage(); }}>
          <SlidersHorizontal size={18} />
          Xóa bộ lọc
        </button>
      </aside>
      <main>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Trang chủ <span className="mx-2">›</span> Sản phẩm</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{discountOnly ? "Sản phẩm đang giảm giá" : "Tất cả thiết bị thông minh"}</h1>
            {discountOnly ? <p className="mt-2 text-sm font-semibold text-[#075f83]">Khuyến mãi mùa hè - các sản phẩm đang có ưu đãi.</p> : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-white p-1 ring-1 ring-slate-200">
              <button className={grid ? "rounded-md bg-sky-50 p-3 text-[#075f83]" : "p-3 text-slate-500"} onClick={() => setGrid(true)}><Grid2X2 size={20} /></button>
              <button className={!grid ? "rounded-md bg-sky-50 p-3 text-[#075f83]" : "p-3 text-slate-500"} onClick={() => setGrid(false)}><LayoutList size={20} /></button>
            </div>
          </div>
          <label className="flex w-full items-center rounded-full bg-white px-5 py-3.5 text-base text-slate-600 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-[#0879a8]/30 lg:max-w-md">
            <Search size={18} />
            <input
              className="ml-3 min-w-0 flex-1 font-semibold outline-none placeholder:text-slate-400"
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                setSearchParams({
                  ...(value.trim() ? { q: value } : {}),
                  ...(discountOnly ? { discount: "1" } : {}),
                });
                resetPage();
              }}
              placeholder="Tìm sản phẩm..."
              value={query}
            />
          </label>
        </div>
        <div className={grid ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-5"}>
          {pageProducts.map((product, index) => <ProductCard compact={!grid} index={(currentPage - 1) * PRODUCTS_PER_PAGE + index} key={product.maSanPham} onAdd={onAdd} product={product} />)}
        </div>
        {filtered.length === 0 ? <EmptyState text="Không tìm thấy sản phẩm phù hợp." /> : null}
        {totalPages > 1 ? (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                className={pageNumber === currentPage ? "rounded-lg bg-[#0879a8] px-4 py-3 font-bold text-white" : "rounded-lg bg-white px-4 py-3 font-bold text-slate-700 ring-1 ring-slate-200"}
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
};

const FilterOption = ({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) => (
  <label className="mb-4 flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
    <input checked={checked} className="size-4 accent-[#0879a8]" onChange={onChange} type="checkbox" />
    {label}
  </label>
);


