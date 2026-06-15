import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { Product, Promotion } from "@/types/customer";
import type { FavoriteCategory } from "../utils";
import AccountEmptyState from "./AccountEmptyState";
import { promotionCodeText, promotionDateText } from "./accountUtils";

export type FavoriteProductNotice = {
  category: FavoriteCategory;
  products: Product[];
};

type NoticeItem =
  | { type: "notice"; data: FavoriteProductNotice }
  | { type: "promo"; data: Promotion };

const PAGE_SIZE = 5;

const AccountNoticeList = ({
  favoriteNotices,
  loading,
  promotions,
}: {
  favoriteNotices: FavoriteProductNotice[];
  loading: boolean;
  promotions: Promotion[];
}) => {
  const [page, setPage] = useState(1);

  if (loading) return <AccountEmptyState title="Đang tải thông báo" text="Vui lòng chờ trong giây lát." />;
  if (!promotions.length && !favoriteNotices.length) {
    return (
      <AccountEmptyState
        title="Chưa có thông báo mới"
        text="Khi có mã giảm giá hoặc sản phẩm thuộc danh mục bạn yêu thích, thông báo sẽ hiển thị tại đây."
      />
    );
  }

  const allItems: NoticeItem[] = [
    ...favoriteNotices.map((n) => ({ type: "notice" as const, data: n })),
    ...promotions.map((p) => ({ type: "promo" as const, data: p })),
  ];
  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = allItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mt-6">
      <div className="grid gap-4">
        {pageItems.map((item) =>
          item.type === "notice" ? (
            <article className="rounded-lg border border-red-100 bg-red-50/70 p-5" key={item.data.category.key}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-red-700">Danh mục yêu thích</p>
                  <h2 className="mt-2 text-lg font-black text-slate-950">
                    Có sản phẩm thuộc danh mục {item.data.category.tenDanhMuc}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Hiện có {item.data.products.length} sản phẩm trong danh mục bạn đã yêu thích.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.data.products.slice(0, 3).map((product) => (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-red-100" key={product.maSanPham}>
                        {product.tenSanPham}
                      </span>
                    ))}
                  </div>
                </div>
                <Link className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-black text-white" to="/san-pham">
                  Xem sản phẩm
                </Link>
              </div>
            </article>
          ) : (
            <article className="rounded-lg border border-sky-100 bg-sky-50/70 p-5" key={item.data.maKhuyenMai}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-[#075f83]">Mã giảm giá mới</p>
                  <h2 className="mt-2 text-lg font-black text-slate-950">{item.data.tenKhuyenMai}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Mã khuyến mãi giảm {Number(item.data.phanTramGiam || 0)}% chỉ áp dụng cho các sản phẩm được gắn mã này.
                  </p>
                  {item.data.sanPhamApDung ? (
                    <p className="mt-2 text-sm font-semibold text-slate-600">Sản phẩm áp dụng: {item.data.sanPhamApDung}</p>
                  ) : null}
                  <p className="mt-2 text-sm font-semibold text-slate-500">Hạn dùng: {promotionDateText(item.data)}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-[#075f83] ring-1 ring-sky-100">
                    <span className="text-slate-500">Mã khuyến mãi</span>
                    <span>{promotionCodeText(item.data)}</span>
                  </div>
                </div>
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                  -{Number(item.data.phanTramGiam || 0)}%
                </span>
              </div>
            </article>
          )
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            disabled={safePage === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} /> Trước
          </button>
          <span className="text-sm font-semibold text-slate-500">
            Trang {safePage} / {totalPages}
          </span>
          <button
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Tiếp <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountNoticeList;
