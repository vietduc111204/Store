import { Heart, ShoppingCart, Star } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import type { Product } from "@/types/customer";
import { discountPercent, finalPrice, formatMoney, hasFavoriteCategory, productPromotionDateText, toggleFavoriteCategory } from "../utils";

type ProductReview = {
  accountKey?: string;
  rating: number;
};

const CUSTOMER_REVIEWS_KEY = "smarthome-product-reviews";

const readCustomerReviews = (productId: number): ProductReview[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CUSTOMER_REVIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Array.isArray(parsed[productId]) ? parsed[productId].filter((review: ProductReview) => review.accountKey) : [];
  } catch {
    return [];
  }
};

const formatSoldCount = (value?: number | null) => {
  const count = Number(value) || 0;
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  return String(count);
};

export const ProductCard = ({ onAdd, product, compact = false }: { onAdd: (product: Product) => void; product: Product; index: number; compact?: boolean }) => {
  const [favorite, setFavorite] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useEffect(() => setFavorite(hasFavoriteCategory(product)), [product]);
  useEffect(() => setReviews(readCustomerReviews(product.maSanPham)), [product.maSanPham]);

  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
    : 0;
  const soldCount = Number(product.soLuongDaBan) || 0;
  const discount = discountPercent(product);

  const toggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const result = toggleFavoriteCategory(product);
    setFavorite(result.active);
    toast.success(result.active
      ? `Đã theo dõi danh mục ${result.category.tenDanhMuc}`
      : `Đã bỏ theo dõi danh mục ${result.category.tenDanhMuc}`);
  };

  return (
    <article className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
      <Link aria-label={`Xem chi tiết ${product.tenSanPham}`} className="absolute inset-0 z-10" to={`/san-pham/${product.maSanPham}`} />
      <div className={compact ? "relative aspect-[4/3] overflow-hidden" : "relative aspect-square overflow-hidden"}>
          <button
            className={favorite ? "absolute right-4 top-4 z-20 rounded-full bg-red-50 p-2 text-red-600 shadow ring-1 ring-red-100" : "absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-slate-600 shadow"}
            onClick={toggleFavorite}
            title="Theo dõi danh mục"
            type="button"
          >
            <Heart fill={favorite ? "currentColor" : "none"} size={20} />
          </button>
          {discount ? (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase text-white shadow">
              Đang giảm giá -{discount}%
            </span>
          ) : null}
          {product.anh ? (
            <img alt={product.tenSanPham} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product.anh} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">
              Chưa có ảnh
            </div>
          )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-black uppercase text-slate-500">
          <span>{product.tenDanhMuc || "SmartHome"}</span>
          <span className="flex shrink-0 items-center gap-1 text-amber-700">
            <Star size={14} fill={reviews.length ? "currentColor" : "none"} />
            {averageRating ? averageRating.toFixed(1) : "0.0"}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-[48px] font-bold leading-6 text-slate-950 group-hover:text-[#075f83]">{product.tenSanPham}</h3>
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{reviews.length} đánh giá</span>
          <span>Đã bán {formatSoldCount(soldCount)}</span>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <p className="text-2xl font-black text-[#075f83]">{formatMoney(finalPrice(product))}</p>
          {discount ? <p className="pb-1 text-sm text-slate-400 line-through">{formatMoney(product.gia)}</p> : null}
        </div>
        {discount ? <p className="mt-2 text-xs font-bold text-red-700">Khuyến mãi: {productPromotionDateText(product)}</p> : null}
        <button className="relative z-20 mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0879a8] px-4 py-3 font-black text-white shadow-sm hover:bg-[#075f83]" onClick={() => onAdd(product)}>
          <ShoppingCart size={20} />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
};


